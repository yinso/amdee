{EventEmitter} = require 'events'
fs = require 'fs'
path = require 'path'
noComment = require '../lib/nocomment'
coffee = require 'coffee-script'
resolve = require './resolve'
_ = require 'underscore'
async = require './async'

scriptName = (filePath) ->
  path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath))).replace(/[\\\/]+/g, '_')

class ScriptSpec
  # we need to be able to normalize the script name as well...
  # i.e. the script ought to have a name that's based on a top level entry point...
  # cwd? let's do that for now.
  constructor: (rspec, basePath, rootPath = process.cwd()) -> # rootPath is something that's 
    @relative = @isRelative(rspec) or false
    @isExternal = not @relative
    @rspec = rspec
    @basePath = basePath
    @rootPath = rootPath
    @core = resolve.isCore(rspec) or false
    if @isExternal
      @name = @rspec
      @fullPath = @rspec
    else
      @name = path.relative @rootPath, path.resolve(@basePath, @rspec)
    # by the type things are constructed we'll have a normalized name to work with - this is great...
  # this is needed because we need to resolve the relative file spec that does not end in particular sets of extensions.
  resolve: (cb) ->
    if not @relative
      cb null, @rspec
    else
      resolve.resolve @rspec, {dir: @basePath, extensions: ['.coffee', '.js']}, (err, fullPath) =>
        if err
          cb err
        else
          @fullPath = fullPath
          cb null, @fullPath
  isRelative: (rspec) ->
    (rspec.match(/^\.\.?\//) != null) or false
  serializeRequire: () ->
    if not @relative
      "require('#{@rspec}')"
    else
      "#{scriptName(@name)}" # just show the name for now.

class ParsedScript extends ScriptSpec
  constructor: (args...) ->
    super args...
    @output = [] # holds the parsed output that can be serialized back.
    @depends = [] # a list of dependencies.
  resolveParse: (moduleMap, cb) ->
    @resolve (err, fullPath) =>
      if err
        cb err
      else
        @parse moduleMap, cb
  parse: (moduleMap, cb) ->
    console.log {parse: @fullPath}
    filePath = path.resolve @fullPath
    fs.readFile filePath, (err, data) =>
      if err
        cb err
      else
        try
          @parseData filePath, data.toString(), moduleMap
          @parseDependencies moduleMap, cb
        catch e
          cb e
  parseDependencies: (moduleMap, cb) -> # this tree structure all of the sudden does not work... hmm...
    console.log {parseDependencies: @fullPath, depends: @depends}
    resolveDepend = (depend, next) =>
      if moduleMap.hasScriptByScript depend
        next null, depend
      else if depend.isExternal
        try
          moduleMap.addScript depend
          next null, depend
        catch e
          next e
      else # this is the only place that we'll need to resolve fully...
        depend.resolve (err, fullPath) =>
          if err
            next err, depend
          else
            # at this time we can add it.
            try
              depend.parse moduleMap, (err, result) ->
                moduleMap.addScript depend
                next err, result
            catch e
              console.log {error: e}
              next e, depend
    async.forEach @depends, resolveDepend, cb
  parseData: (filePath, data, moduleMap) ->
    data = if path.extname(filePath) == '.coffee' then coffee.compile(data) else data
    @formatParsed noComment.parse(data), moduleMap
  formatParsed: (parsed, moduleMap) ->
    temp = []
    for obj in parsed
      if typeof(obj) == 'string'
        temp.push obj
      else
        if temp.length > 0
          @output.push temp.join('')
          temp = []
        if obj.require
          @addDependency obj.require, moduleMap
    if temp.length > 0
      @output.push temp.join('')
  addDependency: (rspec, moduleMap) -> # this is an interesting one... because when I add dependency we haven't resolve the data yet?
    # will a script already exist when we add them? the answer would be no if we are doing LIFO
    # we'll need to know whether or not this is a rspec... ought to be a quick test...
    depend = moduleMap.hasScriptByRSpec rspec, path.dirname(@fullPath)
    if not depend
      depend = new ParsedScript rspec, path.dirname(@fullPath)
    @output.push depend
    @depends.push depend
  serialize: () ->
    output = for item in @output
      if item instanceof ScriptSpec 
        item.serializeRequire()
      else
        item
    """

// #{@fullPath}
var #{scriptName(@name)} = (function() {
  var module = { exports: {} }; // do not use exports only
  #{output.join('')}
  return module.exports;
})();

"""

# moving the resolution into the scriptMap? that'll be interesting...
# only script map holds

# now we have a normalized name that's based on process.cwd()
# so when adding file we'll have to 
class ScriptMap
  constructor: (rootPath = process.cwd()) ->
    @scripts = {}
    @ordered = []
    @externals = {}
    @rootPath = rootPath
  resolveRSpec: (rspec, filePath) ->
    path.relative @rootPath, path.resolve(path.dirname(filePath), rspec)
  isRelative: (rspec) ->
    (rspec.match(/^\.\.?\//) != null) or false
  hasScriptByRSpec: (rspec, filePath) ->
    if @isRelative rspec
      @hasScriptByName @resolveRSpec(rspec, filePath)
    else
      @externals[rspec]
  scriptPath: (fullPath) ->
    path.join path.dirname(fullPath), path.basename(fullPath, path.extname(fullPath))
  hasScriptByName: (name) ->
    @script[name]
  hasScriptByScript: (script) ->
    @scripts[script.name]
  addScript: (script) ->
    if not @hasScriptByScript(script)
      @scripts[script.name] = script
    if script.relative
      @ordered.push script
    else
      @externals[script.name] = script
  parse: (filePath, cb) ->
    basePath = process.cwd()
    relPath = path.relative basePath, filePath
    @script = new ParsedScript "./#{relPath}", basePath
    @script.resolveParse @, (err, result) =>
      if err
        cb err
      else
        @addScript @script
        cb null, result
  serialize: () ->
    scripts = (script.serialize() for script in @ordered).join('')
    depends = ['require','exports','module'].concat (key for key, val of @externals)
    externals = ("'#{val}'" for val in depends)
    # return the last script name...
    exportName = scriptName @script.name
    """
define([#{externals}], function(#{depends}) {

#{scripts}

  return #{exportName};
});

"""


module.exports =
  parseFile: (filePath, cb) ->
    parser = new ScriptMap()
    parser.parse filePath, (err, lastScript) ->
      cb null, parser
