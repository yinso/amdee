fs = require 'fs'
_ = require 'underscore'

# we also want to have the ability to watch for the files to change...
# because we have a list of the files that should be watched once we've done the parsing

# should I pass in a callback? might be easier..
class Watcher
  constructor: () ->
    @inner = {}
  mapHelper: (interim, file) ->
    interim[file] = file
    interim
  watchHelper: (filePath, onChange) ->
    console.log "[watch:add] #{filePath}"
    @inner[filePath] = fs.watch filePath, (evt, fileName) =>
      console.log "[watch:#{evt}] #{filePath}" # why did it trigger twice?
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
