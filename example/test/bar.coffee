_ = require 'underscore' # external module
assert = require 'assert' # core module
Baz = require './baz'
resolve = require 'resolve'

class Bar extends Baz
  type: 'Bar'

module.exports = Bar
