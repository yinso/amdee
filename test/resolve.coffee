{assert} = require 'chai'
{resolve} = require '../src/resolve'
fs = require 'fs'
path = require 'path'

describe 'resolve Test', () ->
  selfPath = __filename
  it 'should resolve to .coffee', (done) ->
    resolve path.basename(selfPath, '.coffee'), {dir: __dirname, extensions: ['.coffee', '.js']}, (err, fullPath)->
      assert.equal fullPath, selfPath
      done(err)
