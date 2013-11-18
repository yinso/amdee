###

  New Design

  We'll read off of package.json to determine what needs to be compiled.

  {name: <start_path_of_the_script>, skip: [<a_list_of_external_modules_not_to_process>]

  If we are given a single script path, we'll need to figure out the starting point of the path (from a module perspective).

  resolveModuleRoot(path) ->

  resolveModuleRoot('events') => amdee/builtin/main.coffee

  resolveModuleRoot('jquery') => _BASEDIR/node_modules/jquery

  steps

  1 - load the script
  2 - parse the script to return a list of script steps.
###

fs = require 'fs'
path = require 'path'
parser = require '../lib/nocomment'
resolve = require './resolve'
coffeeScript = require 'coffee-script'
_ = require 'underscore'
{EventEmitter} = require 'events'


class FilePathWatcher extends EventEmitter
  constructor: (@filePath, @dirPath = path.dirname(@filePath)) ->
  on: (event, eventListener) ->
    super event, eventListener
    if not @dir
      @dir = fs.watch @dirPath, @onDirChange
      @refresh()
  refresh: (stat = null) ->
    if stat
      @stat = stat
    else
      fs.stat @filePath, (err, stat) =>
        if err
          @emit 'change', {type: 'delete', path: @filePath}
        else
          @stat = stat
          console.log 'Watch.file', @filePath, @stat.ino, @stat.size
  onDirChange: (evt, fileName) =>
    if evt == 'rename' # test to see if we end up with a different inode object
      fs.stat @filePath, (err, stat) =>
        if err
          @emit 'change', {type: 'delete', path: @filePath}
        else
          if @statDiffer @stat, stat
            @refresh stat
            @emit 'change', {type: 'change', path: @filePath}
  statDiffer: (oldStat, newStat) ->
    oldStat.ino != newStat.ino or oldStat.size != newStat.size
  close: () ->
    @removeAllListeners()
    @dir.close()

class Script extends EventEmitter
  constructor: (@filePath, @data, @depends, @toWatch, @map) ->
    @name = path.join(path.dirname(@filePath), path.basename(@filePath, path.extname(@filePath)))
    if @toWatch
      @startWatch()
  destroy: () ->
    @stopWatch()
  startWatch: () ->
    @watcher = new FilePathWatcher path.join(@map.basePath, @filePath)
    @watcher.on 'change', @onWatch
  stopWatch: () ->
    if @watcher
      @watcher.close()
  onWatch: ({type, path}) =>
    if type == 'change'
      process.nextTick () =>
        console.log '------ CHANGE ------', path
        @emit 'fileChange', @
  reload: (@data, @depends) ->
  scriptName: (name = @name) ->
    "___" + name.toUpperCase().split('/').join('_').split('.').join('_') + "___"
  serialize: () ->
    buffer = []
    for item in @data
      if typeof(item) == 'string'
        buffer.push item
      else if item.require
        if item.external
          if item.core
            buffer.push "require('builtin').#{item.require}"
          else
            buffer.push "require('#{item.require}')"
        else # we should lookup
          buffer.push @scriptName(item.require)

    """
// #{@name}
var #{@scriptName(@name)} = (function(module) {
  #{buffer.join('')}
  return module.exports;
})({exports: {}});

"""

class PackageMap extends EventEmitter
  @loadPackage: (filePath, targetPath, toWatch, config, cb) ->
    if arguments.length == 4
      cb = arguments[3]
      config = null
    requireJS = config?.requireJS or null
    resolve.resolveModulePath filePath, (err, basePath) =>
      if err
        cb err
      else
        map = new @ basePath, toWatch
        console.log 'loadPackage', filePath, targetPath
        map.initialize filePath, targetPath, (err, res) ->
          if requireJS
            map.requireJS = requireJS
          console.log "******* PROCESS *******", map.name
          console.log "base Path = ", map.basePath
          console.log "main script = ", map.mainPath
          console.log "skipped modules", map.skipped
          console.log "requireJS config? ", if not map.requireJS then 'none' else JSON.stringify(map.requireJS, null, 2)
          console.log ""
          console.log "Process files..."
          console.log ""
          if err
            cb err
          else
            map.loadScripts cb
  @loadAndSavePackage: (filePath, targetPath, toWatch, cb) ->
    @loadPackage filePath, targetPath, toWatch, (err, map) ->
      if err
        cb err
      else
        map.savePackage (err, actualPath) ->
          if err
            cb err
          else
            cb null, map, actualPath
  @loadAndSavePackageRecursive: (filePath, targetPath, toWatch, cb) ->
    iterHelper = (module, next) =>
      module.savePackage (err, res) =>
        if err
          cb err
        else
          console.log "saved to ", res
          console.log ''
          module.loadExternalPackages iterHelper, (err, module) =>
            if err
              cb err
            else
              next null, module
    @loadAndSavePackage filePath, targetPath, toWatch, (err, map) =>
      if err
        cb err
      else
        map.loadExternalPackages iterHelper, cb

  constructor: (@basePath, @toWatch = false) ->
    @name = path.basename @basePath
    @scripts = {} # these are the files to be added to a single package.
    @depends = [] # a list of scripts that are not yet processed.
    @externals = []
    @loadedModules = {}
  initialize: (filePath, targetPath, cb) ->
    @normalizeTargetPath targetPath, (err, res) =>
      if err
        return cb err
      resolve.readPackageJSON @basePath, (err, res) =>
        if err
          cb err
        else
          if res.amdee?.main or res.main
            @mainPath = path.relative(@basePath, path.join(@basePath, (res.amdee?.main or res.main)))
          @skipped = res.amdee?.skip or []
          @requireJS = res.amdee?.requireJS or null
          fs.stat filePath, (err, res) =>
            if err
              cb err
            else if res.isDirectory()
              if not @mainPath
                cb new Error("package.json missing amdee.main and main; file is a directory")
              else
                cb null
            else # this is a file.
              @mainPath = path.relative(@basePath, filePath)
              cb null
  loadScripts: (cb) ->
    nextHelper = (spec) =>
      if spec
        console.log "load required script:", spec, "..."
        @loadScriptBySpec spec, (err, res) =>
          if err
            cb err
          else
            nextHelper @hasUnprocessedSpec()
      else # no more spec.
        console.log "no more relative require specs."
        @orderedScripts = @dependencySort()
        cb null, @
    # we'll start from @mainPath.
    console.log "load main script:", @mainPath, "..."
    @loadScript @mainPath, (err, res) =>
      if err
        cb err
      else
        @mainScript = res
        nextHelper @hasUnprocessedSpec()
  hasUnprocessedSpec: () ->
    # go through the spec and see one is not yet processed.
    for rspec in @depends
      if not @scripts.hasOwnProperty(rspec)
        return rspec
    null
  loadScriptBySpec: (spec, cb) ->
    coffeePath = spec + ".coffee"
    jsPath = spec + ".js"
    fs.stat path.join(@basePath, coffeePath), (err, stat) =>
      if err
        fs.stat path.join(@basePath, jsPath), (err, stat) =>
          if err
            cb err
          else
            @loadScript jsPath, cb
      else
        @loadScript coffeePath, cb
  loadScript: (filePath, cb) ->
    if path.extname(filePath) == ''
      @loadScriptBySpec filePath, cb
    else
      # the filePath is a relative path...!!!
      fs.readFile path.join(@basePath, filePath), 'utf8', (err, data) =>
        if err
          cb err
        else
          try
            script = @parseScript filePath, data
            cb null, script
          catch e
            cb e
  reloadScript: (script, cb) ->
    fs.readFile path.join(@basePath, script.filePath), 'utf8', (err, data) =>
      if err
        cb err
      else
        try
          script = @parseScript script.filePath, data, script
          cb null, script
        catch e
          cb e
  parseScript: (filePath, data, script = null) ->
    data =
      if path.extname(filePath) == '.coffee'
        coffeeScript.compile(data)
      else
        data
    parsed = parser.parse(data)
    temp = []
    output = []
    depends = []
    for obj in parsed
      if typeof(obj) == 'string'
        temp.push obj
      else
        if temp.length > 0
          output.push temp.join('')
          temp = []
        if obj.require
          output.push @addDependency obj.require, filePath, depends
    if temp.length > 0
      output.push temp.join('')
    if script
      script.reload output, depends
      script
    else
      @bindScript new Script filePath, output, depends, @toWatch, @
  bindScript: (script) ->
    @scripts[script.name] = script
    script.on 'fileChange', @reload
    script
  reload: (script) =>
    cb = (err, res) =>
      if err
        @emit 'reloadError', err
      else # we are good to go.
        @savePackage (err, res) =>
          if err
            @emit 'reloadSaveError', err
          else
            console.log "Reload Successful."
            @emit 'reloadSaveSuccess'
    nextHelper = (spec) =>
      if spec
        console.log "load required script:", spec, "..."
        @loadScriptBySpec spec, (err, res) =>
          if err
            cb err
          else
            nextHelper @hasUnprocessedSpec()
      else # no more spec.
        console.log "no more relative require specs."
        @orderedScripts = @dependencySort()
        cb null, @
    console.log "RELOAD", script.filePath, "..."
    @reloadScript script, (err, script) =>
      if err
        @emit 'error', err
      else
        nextHelper @hasUnprocessedSpec()
      # we'll have to determine the
  addDependency: (rspec, filePath, depends) ->
    # this dependency will require us to figure out
    if resolve.isRelative(rspec)
      # we should normalize the spec.
      normalized = resolve.normalize rspec, filePath, @basePath
      if not _.contains @depends, normalized
        @depends.push normalized
      if not _.contains depends, normalized
        depends.push normalized
      {require: normalized, relative: true}
    else
      isCore = resolve.isCore(rspec)
      if isCore and not _.contains @externals, 'builtin'
        @externals.push 'builtin'
      else if not isCore and not _.contains @externals, rspec
        @externals.push rspec
      {require: rspec, external: true, core: isCore}
  dependencySort: () -> # topological sort of the dependency
    map = @
    helper = (script, order) ->
      for depend in script.depends
        if not map.scripts.hasOwnProperty(depend)
          throw new Error("invalid_dependency: #{depend}")
        helper map.scripts[depend], order
      if not _.contains order, script
        order.push script
      order
    helper @mainScript, []
  getExternalModules: () ->
    result = []
    hasBuiltin = false
    for script in @externals
      if resolve.isCore(script)
        if not hasBuiltin
          result.push 'builtin'
          hasBuiltIn = true
      else
        result.push script
    result
  serializeRequireJS: () ->
    if @requireJS
      """
require.config(#{JSON.stringify(@requireJS, null, 2)});
"""
    else
      ''
  serialize: () ->
    scripts = (script.serialize() for script in @orderedScripts).join('')
    baseDepends = ['require']
    depends = [].concat baseDepends, @externals # @getExternalModules()
    externals = ("'#{val}'" for val in depends)
    # return the last script name...
    exportName = @mainScript.scriptName()
    requireJS = @serializeRequireJS()
    """
#{requireJS}
define([#{externals}], function(#{baseDepends}) {

#{scripts}

  return #{exportName};
});

"""
  normalizeTargetPath: (targetPath, cb) ->
    console.log "normalizeTargetPath", targetPath
    fs.stat targetPath, (err, stat) =>
      if err # file doesn't exist... that's ok.
        @targetPath = targetPath
      else if stat.isDirectory()
        @targetPath = path.join targetPath, path.basename(@name + ".js")
      else if stat.isFile()
        @targetPath = targetPath
      cb null, @
  savePackage: (cb) ->
    fs.writeFile @targetPath, @serialize(), 'utf8', (err) =>
      if err
        cb err
      else
        cb null, @targetPath
  haUnprocessedPackages: () ->
    for spec in @externals
      if not @loadedModules.hasOwnProperty(spec)
        return spec
    return null
  loadExternalPackages: (iterHelper, cb) ->
    helper = (spec) =>
      if spec
        if not _.contains(@skipped, spec)
          @loadExternalPackage spec, (err, module) =>
            if err
              cb err
            else
              iterHelper module, (err, res) =>
                if err
                  cb err
                else
                  helper @haUnprocessedPackages()
        else # the spec is skipped.
          console.log "External Module #{spec} skipped as defined by package.json."
          helper @hasUnprocessedSpec()
      else # no more spec.
        console.log "No more unprocessed external modules."
        cb null, @
    helper @haUnprocessedPackages()

  loadExternalPackage: (spec, cb) ->
    console.log 'loadExternalPackage', spec
    self = @
    if spec == 'builtin' # this is a special spec.
      filePath = path.join __dirname, '../builtin'
      targetPath = path.join path.dirname(@targetPath), 'builtin.js'
      PackageMap.loadPackage filePath, targetPath, @toWatch, (err, module) ->
        if err
          cb err
        else
          self.loadedModules[spec] = module
          cb null, module
    else
      console.log 'resolveModuleRule', spec, @basePath
      resolve.resolveModuleRoot spec, @basePath, (err, modulePath) =>
        console.log 'resolveModuleRule', err, modulePath
        if err
          cb err
        else
          targetPath = path.join path.dirname(@targetPath), "#{spec}.js"
          PackageMap.loadPackage modulePath, targetPath, @toWatch, (err, module) ->
            if err
              cb err
            else
              module.skipped = self.skipped
              self.loadedModules[spec] = module
              cb null, module

module.exports = PackageMap
