PackageMap = require '../src/package'
path = require 'path'
fs = require 'fs'
assert = require 'assert'


describe 'generate script', () ->
  it 'can generate script successfully', (done) ->
    sourcePath = path.join(__dirname, '../example')
    targetPath = path.join(__dirname, '../example/target.js')
    # we'll need to save it to a file now...
    PackageMap.loadPackage sourcePath, targetPath, false, (err, map) ->
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





