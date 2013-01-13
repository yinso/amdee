
# resolve a path based on its relative path & base, as well as checking on extensions.
path = require 'path'
fs = require 'fs'
resolve = require 'resolve'

# this is not yet the full blown resolve replacement.
resolvePath = (rspec, {dir, extensions}, cb) ->
  helper = (extensions) ->
    if extensions.length == 0
      cb false
    else
      ext = extensions.shift()
      filePath = path.join dir, rspec + ext
      fs.exists filePath, (exists) ->
        if exists
          cb true, filePath
        else
          helper extensions
  # first resolve to the base type...
  helper [].concat(extensions or ['.js'])

module.exports =
  resolve: resolvePath
  sync: resolve.sync
  isCore: resolve.isCore
