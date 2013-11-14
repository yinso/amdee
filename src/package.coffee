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

# a script *is* always a

class Script
  constructor: (@filePath, @data, @depends, @map) ->
    @name = path.join(path.dirname(@filePath), path.basename(@filePath, path.extname(@filePath)))
  scriptName: (name = @name) ->
    "___" + name.toUpperCase().split('/').join('_') + "___"
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

class PackageMap
  @loadScript: (filePath, requirejs, cb) ->
    if arguments.length == 2
      cb = arguments[1]
      requirejs = null
    resolve.resolveModulePath filePath, (err, basePath) =>
      if err
        cb err
      else
        map = new @ basePath
        map.initialize filePath, (err, res) ->
          if requirejs
            map.requireJS = requirejs
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
  @loadAndSaveScript: (filePath, targetPath, cb) ->
    @loadScript filePath, (err, map) ->
      if err
        cb err
      else
        map.saveToPath targetPath, (err, actualPath) ->
          if err
            cb err
          else
            cb null, map, actualPath

  constructor: (@basePath) ->
    @name = path.basename @basePath
    @scripts = {} # these are the files to be added to a single package.
    @depends = [] # a list of scripts that are not yet processed.
    @externals = []
    @loadedModules = {}
  initialize: (filePath, cb) ->
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
        console.log "no more require specs."
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
  parseScript: (filePath, data) ->
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
    script = new Script filePath, output, depends, @
    @scripts[script.name] = script
    script
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
  saveToPath: (targetPath, cb) ->
    fs.stat targetPath, (err, stat) =>
      if err # not exist... that's okay.
        fs.writeFile targetPath, @serialize(), 'utf8', (err) =>
          if err
            cb err
          else
            cb err, targetPath
      else if stat.isDirectory() # this is where we should
        # we'll get the name of the file to b
        filePath = path.join(targetPath, path.basename(@name + ".js"))
        fs.writeFile filePath, @serialize(), 'utf8', (err) =>
          if err
            cb err
          else
            cb null, filePath
      else # file exists... we'll overwrite it...
        fs.writeFile targetPath, @serialize(), 'utf8', (err) =>
          if err
            cb err
          else
            cb err, targetPath
  saveToPathWithName: (targetPath, cb) ->
    # if it's a file - we'll use its path.
    fs.stat targetPath, (err, stat) =>
      if err # file not exist... do we walk backwards? we should...
        @saveToPathWithName path.dirname(targetPath), cb
      else if stat.isDirectory()
        @saveToPath targetPath, cb
      else
        @saveToPath path.dirname(targetPath), cb
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
    self = @
    if spec == 'builtin' # this is a special spec.
      filePath = path.join __dirname, '../builtin'
      PackageMap.loadScript filePath, (err, module) ->
        if err
          cb err
        else
          self.loadedModules[spec] = module
          cb null, module
    else
      resolve.resolveModuleRoot spec, @basePath, (err, modulePath) =>
        if err
          cb err
        else
          PackageMap.loadScript modulePath, (err, module) ->
            if err
              cb err
            else
              self.loadedModules[spec] = module
              cb null, module

module.exports = PackageMap
