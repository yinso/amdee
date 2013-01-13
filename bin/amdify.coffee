#!/usr/bin/env coffee
fs = require 'fs'
path = require 'path'
resolve = require 'resolve'
mkdirp = require 'mkdirp'
_ = require 'underscore'
argv = require('optimist')
  .demand(['source','target'])
  .usage('Usage: amdify -source <source_module_dir> -target <target_output_dir>')
  .argv
noComment = require './lib/nocomment'

requireRegex = new RegExp "require\\s*\\(\\s*[\"\']([^\\)]+)[\"\']\\s*\\)", "g"

capitalize = (s) ->
  s.charAt(0).toUpperCase() + s.slice(1)

pascalCase = (str, delim) ->
  # first split by delim
  (capitalize(s) for s in str.split delim).join('_')

class Package
  constructor: (dir) -> # by default we are passing in a directory path (i.e. not a file path)
    @path = dir
    try
      @json = JSON.parse fs.readFileSync("#{@path}/package.json")
      @json.version ?= '0.0.0'
      @json.name ?= path.basename @path
    catch e
      throw "JSON.parse failed: #{e}"
  # normalize takes in a file path instead of a directory path to save the caller
  # from having to determine the location of package.json
  @normalize: (file) ->
    dir = path.dirname file
    try
      stat = fs.statSync("#{dir}/package.json")
      new Package dir
    catch e
      @normalize dir

# stores the file <-> name mapping.
class ModuleMap
  constructor: (baseDir) ->
    @baseDir = baseDir
    @paths = {}
    @names = {}
    @count = 0
  setFile: (relPath) ->
    # need to determine the additions against the baseDir.
    # how to do so?
    #relPath = fullPath.slice @baseDir.length
    fullPath = path.join @baseDir, relPath
    #console.log "ModuleMap.setFile #{file} => #{relPath}"
    if @paths[relPath]
      @paths[relPath]
    else
      spec = { type: 'relative', path: relPath , fullPath: fullPath, name: @newName(relPath) , deps: []}
      @add spec
      spec
  add: (spec) ->
    @paths[spec.path] = spec
    @names[spec.name] = spec
  addDependency: (file, spec) ->
    if !@paths[file]
      throw "unknown module #{file}"
    #@paths[file].deps[spec.path] = spec
    @paths[file].deps.push spec.path
  newName: (relPath) ->
    # replace any dot with _
    pascalCase(relPath.replace(/\./g, '_'), '/')
  unparsed: () ->
    result = []
    for path, spec of @paths
      #console.log "spec #{spec.path} is #{if spec.data then 'parsed' else 'unparsed'}"
      #console.log "spec: #{spec.path} deps: [#{spec.deps}]"
      if !spec.data
        result.push spec
    console.log "unparsed: #{JSON.stringify(result)}"
    result
  specLevel: (spec) ->
    console.log "helper(#{spec.path})"
    helper = (spec, innerSpec, level) =>
      console.log "helper(#{spec.path}, #{innerSpec.path}, #{level})"
      if level != 0 and spec.path == innerSpec.path # recursion - stop.
        throw "circular depdency on #{spec.path}"
      else if innerSpec.deps.length == 0
        level
      else
        Math.max.apply(this, (helper(spec, @paths[path], level+1) for path in innerSpec.deps))
    spec.level = helper spec, spec, 0
    console.log "helper(#{spec.path} => #{spec.level})"
  sort: () ->
    console.log "ModuleMap.sort #{JSON.stringify(path for path, spec of @paths)}"
    results = []
    for path, spec of @paths
        results.push spec
    try
      for spec in results
        @specLevel spec
      results.sort (spec1, spec2) ->
        spec1.level > spec2.level
    catch e
      console.error "circular dependency - stop sorting by dependency: #{e}"
      results

# strip out the comments.
parse = (data) ->
  stripFilter = (obj) ->
    typeof(obj) == 'string' or obj.string
  parsed = noComment.parse(data).filter(stripFilter)
  output = parsed.join('')
  output.replace /\n\n+/gm, '\n'

class Amdifier
  constructor: ({baseDir, outputDir}) ->
    @baseDir = baseDir
    @outputDir = outputDir
    @modules = new ModuleMap(baseDir)
    @cores = {}
    @packages = {}
  resolveModule: (lib, baseDir) ->
    # this should handle all of the recursive file problem? not sure...
    try
      libPath = resolve.sync lib, basedir: baseDir
      if /^\./.test lib # a relative path - this is an internal module
        @modules.setFile path.relative(@baseDir, libPath)
      else if (libPath == lib) # this is result of a core module
        { type: 'core', path: lib }
      else # this is an external module
        pack = Package.normalize libPath
        libRoot = pack.path
        libVersion = pack.json.version
        libName = pack.json.name
        targetLibRoot = "#{@outputDir}/#{libName}/#{libVersion}" # actually we are going to compile them into a single script as well!
        relPath = path.relative libRoot, libPath
        targetPath = "#{targetLibRoot}/#{relPath}"
        resolvedPath = "#{libName}/#{libVersion}/#{relPath}"
        { type: 'external', path: "#{libName}-#{libVersion}.js", sourcePath: libRoot, targetPath: path.join(@outputDir, "#{libName}-#{libVersion}.js") }
    catch e
      # when a module has errored because we cannot resolve it - it's most likely an external module that's not installed.
      # in this case what do we do?
      console.error "unable to resolve lib #{lib}; most likely inside comment block or uninstalled; please handle this module manually"
      { type: 'unknown', path: lib }
  readJSSync: (relPath) ->
    replacement = (whole, lib) =>
      # each path here will have to call a separate function!
      # take the lib & the dir, and then returns a modulePath
      moduleSpec = @resolveModule lib, path.dirname(file)
      if moduleSpec.type == 'relative' # we want to track this particular dependency!
        @modules.addDependency relPath, moduleSpec
        moduleSpec.name
      else
        if !@packages[moduleSpec.path]
          @packages[moduleSpec.path] = moduleSpec
        "require('#{moduleSpec.path}')"
    console.log "parse #{relPath}..."
    file = path.join @baseDir, relPath
    # we are going to do a few things.
    # assingle a single file to a single module name...
    # the module, exports, are equivalent to each other... a single require statement will do something interesting...
    data = parse(fs.readFileSync file, 'utf-8')
    # is removing comments easy? the line below does not do anything apparently... hmm...
    # this is needed because some people love commenting out require, which leaves a broken
    # package... (perhaps the goal is to handle the "download"?) hmm...
    #data.replace /(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, ''
    # function for swapping out the matched require spec.
    data.replace requireRegex, replacement
  moduleTemplate: ({path, name, relPath, data}) ->
    """
// #{name} => #{relPath}
var #{name} = (function(exports) {
  var module = { exports: exports };
  #{data}
  return exports;
})({});

"""
  modulify: (relPath) ->
    console.log "modulify #{relPath}..."
    #relPath = file.slice @baseDir.length
    spec = @modules.setFile relPath
    spec.data = @readJSSync relPath
  getMain: () ->
    @main = @pack.json.amdify?.main or @pack.json.main or "./index.js"
    @main = "#{@main}.js" if not @main.match(/\.js$/)
    fullPath = path.join @baseDir, @main
    console.log "getMain => #{fullPath}; path.exists? = #{path.existsSync(fullPath)}"
    if !path.existsSync(fullPath)
      throw "unknown main file for package #{@pack.json.name} @ #{@baseDir} => please specify"
  convert: () ->
    # we just supply the module path - so the first thing is to identify the lead file...
    @pack = new Package @baseDir
    # see if main exists or not... if it does that's our entry point.
    @getMain()
    file = path.join @baseDir, @main
    console.log "main: #{@main} => #{file}"
    @modulify path.relative(@baseDir, file)
    @recurConvert()
    script = @generateScript()
    filePath = "#{@outputDir}/#{@pack.json.name}-#{@pack.json.version}.js"
    fs.writeFileSync filePath, script
  recurConvert: () ->
    specs = @modules.unparsed()
    if specs.length > 0
      # we need to convert each and every spec.
      for spec in specs
        console.log "convert #{spec.path}"
        @modulify spec.path
      @recurConvert()
    else
      # we are done.
      console.log "done parsing... now determine dependencies..."
  generateScript: () -> # for now pipe to stdout.
    modules = @modules.sort()
    names = (spec.name for spec in modules)
    externals = ("'#{key}'" for key in Object.keys(@packages))
    console.log "order: #{JSON.stringify({name: spec.name, level: spec.level} for spec in modules)}"
    script = (for spec in modules
      @moduleTemplate spec).join("\n")
    """
define(['require', 'exports', 'module', #{externals}], function(require, exports, module) {

#{script}

return #{names[names.length - 1]};
});
"""

runAmdify = (args) ->
  normalizeArgs = (args) ->
    # how to convert the path into an absolute path?
    # for now the following will resolve relative directory but not ones starts with ~
    args.source = path.resolve(__dirname, args.source)
    args.target = path.resolve(__dirname, args.target)
    args
  allPackages = [normalizeArgs(args)]
  runOnce = ({source, target}) ->
    console.log "runOnce: allPackages: #{allPackages.length}"
    converter = new Amdifier baseDir: source, outputDir: target
    converter.convert()
    for name, spec of converter.packages
      if spec.type == 'external' and !path.existsSync(spec.targetPath)
        try
          console.log "depends: #{spec.targetPath} => #{spec.type}"
          allPackages.push { source: spec.sourcePath, target: target }
          console.log "allPackages.push: #{allPackages.length}"
        catch e
          console.log "allPackages.push failed: #{e}"
    console.log "runOnce: allPackages: #{allPackages.length}"
  while allPackages.length > 0
    args = allPackages.pop()
    runOnce args

runAmdify argv
