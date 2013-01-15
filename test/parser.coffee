{assert} = require 'chai'
{resolve} = require '../src/resolve'
{parseFile} = require '../src/parser'
fs = require 'fs'
path = require 'path'

# use this test to parse the example/main and compare against the final result.
describe 'resolve Test', () ->
  selfPath = __filename
  it 'should resolve to .coffee', (done) ->
    process.chdir path.join __dirname, '..'
    parseFile 'example/main', (err, parsed) ->
      if err
        done err
      else
        try
          output = parsed.serialize()
          fs.readFile 'example/output.js', (err, buffer) ->
            if err
              done err
            else
              assert.equal output, buffer.toString()
              done()
        catch e
          done err
