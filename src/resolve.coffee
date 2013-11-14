
# resolve a path based on its relative path & base, as well as checking on extensions.
path = require 'path'
fs = require 'fs'
resolve = require 'resolve'
{first} = require './async'
builtins = require './builtin'

# this is not yet the full blown resolve replacement.
resolvePath = (rspec, {dir, extensions}, cb) ->
  helper = (ext, next) ->
    filePath = path.join dir, rspec + ext
    fs.exists filePath, (exists) ->
      next null, if exists then filePath else null
  first [].concat(extensions or ['.js']), helper, cb



fs = require 'fs'
path = require 'path'
builtins = require './builtin'

isRelative = (module) ->
  module.indexOf('.') == 0

relativeRoot = (filePath, cb) ->
  packageHelper = (dirPath) ->
    fs.stat path.join(dirPath, "package.json"), (err, stat) ->
      if err
        relativeRoot path.dirname(dirPath), cb
      else
        cb null, dirPath
  fs.stat filePath, (err, res) ->
    if err
      cb err
    else if res.isFile()
      relativeRoot path.dirname(filePath), cb
    else # directory...
      packageHelper filePath

externalModuleRoot = (module, filePath, cb) ->
  # let's first get the root of the module.
  relativeRoot filePath, (err, rootPath) ->
    if err
      cb err
    else
      modulePath = path.join rootPath, 'node_modules', module
      fs.stat modulePath, (err, stat) ->
        if err
          cb err
        else
          cb null, modulePath

resolveModuleRoot = (module, filePath, cb) -> # this is the filePath that talks about the module.
  if isRelative(module)
    relativeRoot filePath, cb
  else if builtins.hasOwnProperty(module)
    cb null, path.join __dirname, "../builtin"
  else
    externalModuleRoot module, filePath, cb

resolveModulePath = (filePath, cb) ->
  resolvePakcageJson filePath, (err, res) ->
    if err
      cb err
    else
      cb null, path.dirname(res)

resolvePakcageJson = (filePath, cb) ->
  fs.stat filePath, (err, res) ->
    if err
      cb err
    else if res.isFile()
      resolvePakcageJson path.dirname(filePath), cb
    else
      pjsonPath = path.join filePath, "package.json"
      fs.stat pjsonPath, (err, res) ->
        if err
          resolvePakcageJson path.dirname(filePath), cb
        else
          cb null, pjsonPath

readPackageJSON = (filePath, cb) ->
  resolvePakcageJson filePath, (err, res) ->
    if err
      cb err
    else
      fs.readFile res, 'utf8', (err, res) ->
        if err
          cb err
        else
          try
            cb null, JSON.parse(res)
          catch e
            cb e

normalize = (rspec, filePath, basePath) ->
  if isRelative(rspec)
    relative = path.resolve(path.join(basePath, path.dirname(filePath)), rspec)
    path.relative(basePath, relative)
  else
    rspec

isCore = (rspec) ->
  builtins[rspec]?

isCoreSupported = (rspec) ->
  builtins[rspec] == true


module.exports =
  resolve: resolvePath
  sync: resolve.sync
  isCore: isCore
  isCoreSupported: isCoreSupported
  resolveModuleRoot: resolveModuleRoot
  isRelative: isRelative
  resolveModulePath: resolveModulePath
  resolvePackageJSON: resolvePakcageJson
  readPackageJSON: readPackageJSON
  normalize: normalize

