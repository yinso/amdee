{EventEmitter} = require 'events'
fs = require 'fs'
noComment = require '../lib/nocomment'

stripFilter = (obj) ->
  typeof(obj) == 'string' or obj.string

# it's the job of the higher level parser to subscribe to the script parser event.
# parser.on 'require', (spec) -> # do stuff...
# the event-based approach has one defect... we don't know when we are done parsing...
# the key is that we need to be able to know when we are done.
# so gotta think about that a bit... maybe async comes in handy?
class ScriptParser extends EventEmitter
  constructor: () ->
    @on 'require', (evt) ->
      console.log "require: ", evt
  parseFile: (filePath, cb) ->
    fs.readFile filePath, (err, data) =>
      if err
        cb err
      else
        try
          parsed = noComment.parse(data.toString())#.filter(stripFilter)
          cb null, @formatParsed(parsed, filePath)
        catch e
          cb e
  formatParsed: (parsed, filePath) ->
    result = []
    temp = []
    for obj in parsed
      if typeof(obj) == 'string'
        temp.push obj
      else
        if temp.length > 0
          result.push temp.join('')
          temp = []
        if not obj.comment # ignore comments.
          result.push obj
        if obj.require # this is a require spec.
          @emit 'require', require: obj.require, path: filePath
    if temp.length > 0
      result.push temp.join('')
    result

module.exports = ScriptParser
