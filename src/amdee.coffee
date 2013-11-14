###
# amdee
#
# entry module for converting CommonJS module format into AMD format.
# 
###

fs = require 'fs'
path = require 'path'
_ = require 'underscore'
async = require './async'
util = require 'util'

{parseFile} = require './parser'
path = require 'path'
async = require 'async'
Watcher = require './watcher'
resolve = require './resolve'

watcher = new Watcher()

isDirectory = (filePath) ->
  fs.lstatSync(filePath).isDirectory()

isPackage = (filePath) ->
  fs.existsSync "#{filePath}/package.json"

readPackageJSON = (filePath) ->
  JSON.parse(fs.readFileSync "#{filePath}/package.json", "utf8")

normalizeTarget = (target, source) ->
  console.log 'normalizeTarget', target, source
  if (isDirectory(target))
    sourceName = path.basename(source, path.extname(source)) + ".js"
    path.join target, sourceName
  else
    target

copy = (src, dest, cb) ->
  fs.stat dest, (err, stat) ->
    if err
      fs.stat src, (err, stat) ->
        if err
          cb err
        else
          source = fs.createReadStream(src)
          target = fs.createWriteStream dest
          util.pump source, target, cb
    else
      cb new Error("file_exists: #{dest}")

entry = (opts) ->
  {source, target, obj, nothing, watch, requirejs} = opts

  toBeProcessed = (externals, amdeeSpec) ->
    result = []
    core = false
    skipped = amdeeSpec?.skip or []
    for name, script of externals
      if not _.contains(skipped, script.name)
        if script.core
          if not core
            core = true
            result.push script
        else
          result.push script
    result

  handleExternals = (externals, amdeeSpec, targetDir) ->
    console.log 'External Scripts', externals
    externals = toBeProcessed(externals, amdeeSpec)
    console.log 'External Scripts', externals
    # we should continue down the list
    scriptHelper = (script, next) ->
      if script.core # this is a core script - we should just copy from
        helper path.join(__dirname, '../builtin/main.coffee'), path.join(targetDir, 'builtin.js'), { skipped: [] }
      else
        resolve.resolve script.name, {dir: script.basePath}, (err, res) ->
          console.log 'resolvePath', script, err, res

          packagePath = path.join(script.rootPath, 'node_modules', script.name)
          if isDirectory(packagePath)
            packageHelper packagePath, targetDir
          else
            console.error "NOT_A_PACKAGE", script.name

    for script in externals
      scriptHelper script

  helper = (source, target, amdeeSpec, cb) ->
    parseFile source, {requirejs: requirejs}, (err, parsed) ->
      if err
        console.log 'ERROR'
        console.log err
      else if target
        fs.writeFile target, parsed.serialize(), (err) ->
          if err
            console.log 'ERROR\n', err
          else
            console.log "Saved to #{target}"
            console.log "Process Externals..."
            # we should go through the externals and see which ones we should be parsing...
            handleExternals parsed.externals, amdeeSpec, path.dirname(target)
      else if not nothing
        console.log if obj then parsed else parsed.serialize()

      if watch
        # but there are nothing to watch... that's why it existed.
        # so even when there is an error we should at least watch ourselves...
        files = if parsed.ordered.length > 0
          (script.fullPath for script in parsed.ordered)
        else
          [ parsed.script.fullPath ]
        watcher.watch files, ({event, file}) -> entry opts

  packageHelper = (source, target) ->
    if (isPackage(source))
      packageSpec = readPackageJSON source
      if not packageSpec.main and not packageSpec.amdee
        console.error "ERROR:package.json_lack_main", source, packageSpec
      else if packageSpec.amdee?.main
        source = path.join source, packageSpec.amdee.main
        target = normalizeTarget(target, source)
        helper source, target, packageSpec.amdee
      else
        source = path.join source, packageSpec.main
        target = normalizeTarget(target, source)
        helper source, target, { skip: [] }
    else
      console.error "ERROR", "source_not_a_package: #{source}"

  if (isDirectory(source))
    packageHelper source, target
  else
    helper source

# compiling a bunch of files @ once...
compile = (source, target, opts, cb) ->
  parseFile source, opts, (err, parsed) ->
    if err
      cb err, null
    else
      fs.writeFile target, parsed.serialize(), (err) ->
        if err
          cb err, null
        else
          cb null, parsed

compileAndWatch = (targets, opts) ->
  watchHelper = (source, target, watcher, parsed) ->
    files = if parsed.ordered.length > 0
      (script.fullPath for script in parsed.ordered)
    else
      [ parsed.script.fullPath ]
    watcher.watch files, ({event, file}) -> helper source, target, watcher
  helper = (source, target, watcher) ->
    compile source, target, opts, (err, parsed) ->
      if err
        console.error "COMPILE ERROR: #{source}"
        console.error err
      else
        watchHelper source, target, watcher, parsed
  for {source, target, watcher} in targets
    helper source, target, watcher

monitor = ({files, requirejs}) ->
  targets = for {source, target} in files
    source: source
    target: target
    watcher: new Watcher()
  compileAndWatch targets, {requirejs: requirejs}

module.exports =
  run: entry
  monitor: monitor