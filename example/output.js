
define(['require','exports','module','underscore','builtin','async','resolve'], function(require,exports,module) {


// /Users/yc/code/amdify/example/test/baz.coffee
var example_test_baz = (function() {
  var module = { exports: {} }; // do not use exports only
  (function() {
  var Baz, assert, async, _;

  _ = require('underscore');

  assert = require('builtin').assert;

  async = require('async');

  Baz = (function() {

    Baz.prototype.type = 'Baz';

    function Baz() {}

    Baz.prototype.run = function(obj) {
      assert.ok(obj);
      return _.extend(obj, {
        ok: true,
        type: this.type
      });
    };

    return Baz;

  })();

  module.exports = Baz;

}).call(this);

  return module.exports;
})();

// /Users/yc/code/amdify/example/test/bar.coffee
var example_test_bar = (function() {
  var module = { exports: {} }; // do not use exports only
  (function() {
  var Bar, Baz, assert, resolve, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  assert = require('builtin').assert;

  Baz = example_test_baz;

  resolve = require('resolve');

  Bar = (function(_super) {

    __extends(Bar, _super);

    function Bar() {
      return Bar.__super__.constructor.apply(this, arguments);
    }

    Bar.prototype.type = 'Bar';

    return Bar;

  })(Baz);

  module.exports = Bar;

}).call(this);

  return module.exports;
})();

// /Users/yc/code/amdify/example/foo.coffee
var example_foo = (function() {
  var module = { exports: {} }; // do not use exports only
  (function() {
  var Bar, Foo, assert, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  assert = require('builtin').assert;

  Bar = example_test_bar;

  Foo = (function(_super) {

    __extends(Foo, _super);

    function Foo() {
      return Foo.__super__.constructor.apply(this, arguments);
    }

    Foo.prototype.type = 'Foo';

    return Foo;

  })(Bar);

  module.exports = Foo;

}).call(this);

  return module.exports;
})();

// /Users/yc/code/amdify/example/main.coffee
var example_main = (function() {
  var module = { exports: {} }; // do not use exports only
  (function() {
  var Baz, Foo, Main;

  Baz = example_test_baz;

  Foo = example_foo;

  Main = (function() {

    function Main() {
      this.foo = new Foo();
      this.baz = new Baz();
    }

    Main.prototype.runFoo = function(obj) {
      return this.foo.run(obj);
    };

    Main.prototype.runBaz = function(obj) {
      return this.baz.run(obj);
    };

    Main.prototype.run = function(obj) {
      return {
        foo: this.runFoo(obj),
        baz: this.runBaz(obj)
      };
    };

    return Main;

  })();

  module.exports = Main;

}).call(this);

  return module.exports;
})();


  return example_main;
});
