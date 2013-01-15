# comments will be parsed out
# require './foo' will be parsed out
Baz = require './test/baz'
Foo = require './foo'

class Main
  constructor: () ->
    @foo = new Foo()
    @baz = new Baz()
  runFoo: (obj) ->
    @foo.run obj
  runBaz: (obj) ->
    @baz.run obj
  run: (obj) ->
    foo: @runFoo(obj)
    baz: @runBaz(obj)

module.exports = Main
  