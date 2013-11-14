fs = require 'fs'
_ = require 'underscore'

class Watcher
  constructor: () ->
    @inner = {}
  mapHelper: (interim, file) ->
    interim[file] = file
    interim
  watchHelper: (filePath, onChange) ->
    console.log "[watch:add] #{filePath}"
    @inner[filePath] = fs.watch filePath, (evt, fileName) =>
      console.log "[watch:#{evt}] #{filePath}"
      onChange {event: evt, file: filePath}
  watch: (filePaths, onChange) ->
    fileMap = _.foldl filePaths, @mapHelper, {}
    @removeWatchByMap fileMap
    for filePath in filePaths
      if not @inner[filePath]
        @watchHelper filePath, onChange
  removeWatchByMap: (fileMap) ->
    for file, watcher of @inner
      if not fileMap[file]
        watcher.close()
        delete @inner[file]

module.exports = Watcher
