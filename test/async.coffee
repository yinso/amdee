{assert} = require 'chai'
async = require '../src/async'
fs = require 'fs'
path = require 'path'
_ = require 'underscore'

# process for Each.
# take the existing files
describe 'fold Test', () ->

  fileHelper = (file, result, next) ->
    if not file.match /^\./
      next null, result.concat [file]
    else
      next result

  it 'should ...', (done) ->
    fs.readdir __dirname, (err, files) ->
      if err
        done err
      else
        async.fold files, fileHelper, [], (err, results) ->
          assert.equal _.filter(results, (file) -> file.match /^\./), 0
          done err

