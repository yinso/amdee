_ = require 'underscore' # external module
assert = require 'assert' # core module
async = require 'async'
class Baz
  type: 'Baz'
  constructor: () ->
  run: (obj) ->
    assert.ok obj
    _.extend obj, {ok: true, type: @type}

module.exports = Baz
