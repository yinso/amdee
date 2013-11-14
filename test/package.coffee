PackageMap = require '../src/package'
path = require 'path'
fs = require 'fs'
assert = require 'assert'


describe 'generate script', () ->
  it 'can generate script successfully', (done) ->

    PackageMap.loadScript path.join(__dirname, '../example'), (err, map) ->
      if err
        done err
      else
        fs.readFile path.join(__dirname, '../example/output.js'), 'utf8', (err, data) ->
          if err
            done err
          else
            try
              assert.deepEqual map.serialize(), data
              done null
            catch e
              done e





