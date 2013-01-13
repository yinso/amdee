{EventEmitter} = require 'events'
fs = require 'fs'
noComment = require '../lib/nocomment'

stripFilter = (obj) ->
  typeof(obj) == 'string' or obj.string

class ScriptParser extends EventEmitter
  constructor: () ->
  parseFile: (filePath, cb) ->
    fs.readFile filePath, (err, data) =>
      if err
        cb err
      else
        try
          parsed = noComment.parse(data.toString())#.filter(stripFilter)
          cb null, @formatParsed(parsed)
        catch e
          cb e
  formatParsed: (parsed) ->
    # combine the characters and output a string. if coming across object - leave them along.
    result = []
    temp = []
    for obj in parsed
      if typeof(obj) == 'string'
        temp.push obj
      else # we are done combining.
        if temp.length > 0
          result.push temp.join('')
          temp = []
        result.push obj
    if temp.length > 0
      result.push temp.join('')
    result

module.exports = ScriptParser
