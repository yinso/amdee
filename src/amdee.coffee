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

{parseFile} = require './parser'
path = require 'path'
async = require 'async'
Watcher = require './watcher'

watcher = new Watcher()

entry = (opts) ->
  {source, target, obj, nothing, watch, requirejs} = opts
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

# this is just going to be purely asynchronous without chaining them together.
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