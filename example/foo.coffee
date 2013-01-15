_ = require 'underscore' # external module
assert = require 'assert' # core module

Bar = require './test/bar'

class Foo extends Bar
  type: 'Foo'

module.exports = Foo
