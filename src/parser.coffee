{EventEmitter} = require 'events'
fs = require 'fs'
path = require 'path'
resolve = require 'resolve'
noComment = require '../lib/nocomment'
coffee = require 'coffee-script'

scriptName = (filePath) ->
  console.log "// scriptName: ", filePath
  path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath))).replace(/[\\\/]+/g, '_')

# object to represent the dependency of scripts (i.e. require-spec)
class ScriptDependency
  constructor: (rspec, filePath) ->
    @rspec = rspec
    @relative = @isRelative(rspec) or false # if it's not relative then it's external.
    @fullPath = if @relative then @resolvePath(filePath) else @rspec
    @core = resolve.isCore(rspec) or false
  isRelative: (rspec) ->
    rspec.match /^\.\.?\// or false
  resolvePath: (filePath) ->
    resolve.sync @rspec, basedir: path.dirname(filePath), extensions: ['.js', '.coffee']
  isExternal: () ->
    @rspec == @fullPath
  serialize: () ->
    if not @relative
      "require('#{@rspec}')"
    else
      # we need a way to represent the name.
      # basically this ought to be independent of the script
      # the easiest way is to be based on the script name...
      # just do not want it to be *that* long...
      "#{scriptName(@fullPath)}"
      
# object to represent the parsed scripts; holds string and dependencies in an array that can
# can be read-back out...
class ParsedScript extends EventEmitter
  constructor: (filePath) ->
    @filePath = filePath
    @output = [] # holds the parsed output that can be serialized back.
  formatParsed: (parsed) ->
    temp = []
    for obj in parsed
      if typeof(obj) == 'string'
        temp.push obj
      else
        if temp.length > 0
          @output.push temp.join('')
          temp = []
        if obj.require
          @addDependency obj.require
    if temp.length > 0
      @output.push temp.join('')
  addDependency: (rspec) ->
    depend =  new ScriptDependency(rspec, @filePath)
    @output.push depend
    @emit 'require', depend
  serialize: () ->
    output = for item in @output
      if item instanceof ScriptDependency
        item.serialize()
      else
        item
    """
// #{@filePath}
var #{scriptName(@filePath)} = (function() {
  var module = { exports: {} };
  #{output.join('')}
  return module.exports;
})()
"""

# object to hold all of the parsed script in ordered dependencies
class ModuleParser
  constructor: () ->
    @scripts = {} # scripts are indexed here if parsed
    @orderedScripts = [] # as each scripts are parsed they are unshifted here (i.e. this tells us the order by which they ought to be printed)
    @depends = [] # push & pop the dependencies for parsing.
    @externals = {} # externals are treated separately and only indexed.
  parse: (filePath, cb) ->
    filePath = path.resolve filePath
    fs.readFile filePath, (err, data) =>
      if err
        cb err
      else
        try
          script = @addScript filePath, data.toString()
          @parseDependencies cb
        catch e
          cb e
  parseDependencies: (cb) ->
    if @depends.length > 0
      depend = @depends.pop()
      @parse depend.fullPath, cb
    else
      cb null, @
  addScript: (filePath, data) ->
    data = if path.extname(filePath) == '.coffee' then coffee.compile(data) else data
    parsed = noComment.parse data
    script = new ParsedScript filePath
    @scripts[filePath] = script
    @orderedScripts.unshift script
    script.on 'require', (require) =>
      @addDependency require
    script.formatParsed parsed
    script
  addDependency: (depend) ->
    if depend.relative and not @scripts[depend.fullPath]
      @depends.push depend
    else if not @externals[depend.fullPath]
      @externals[depend.fullPath] = depend
  serialize: () ->
    scripts = (script.serialize() for script in @orderedScripts).join('\n\n')
    externals = ("'#{key}'" for key, val of @externals)
    # return the last script name...
    exportName = scriptName(@orderedScripts[@orderedScripts.length - 1].filePath)
    """
define(['require', 'exports', 'module', #{externals}], function(require, exports, module) {
  #{scripts}
  return #{exportName};
});
"""

module.exports =
  parseFile: (filePath, cb) ->
    parser = new ModuleParser()
    parser.parse filePath, cb
