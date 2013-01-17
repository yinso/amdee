# Amdify

## Overview

Amdify is a command-line tool for converting Node style packages into client-side scripts that cooperates with (requireJS)[http://www.requirejs.org].

Amdify will convert a script, along with its relative dependencies within a package, into a single javascript file.  All of the relative dependencies will be resolved to pure javascript variable, i.e., 

    // main
    var Foo = require('./foo');

will be compiled into something equivalent to the following 

    // foo_module
    
    var foo_module = (function () { /* foo module definition */ })();
    
    // main_module
    var main_module = (function() {
      var Foo = foo_module; // require is parsed out from above
    }); 

External modules will be left along and loaded as separate scripts via AMD mechanism.  For exmaple:

    // require jQuery
    var $ = require('jquery'); // this is an external module.

Will be compiled as following

    define(['jquery'], function(require, exports, module) {
    
        var $ = require('jquery');
    }

And then you can setup the shim for requireJS as following:

    require.config({
        "path": {
            "jquery": "http://..."
        }, 
        "shim": {
            "jquery": {
                "deps": [],
                "exports": "jQuery"
            }
        }
    }); 

The config object for requireJS can be passed into the `requirejs` attribute of the `amdify.run` function, which is further described below.

Installation
---------

    $ npm install -g amdify

Usage
-----

On Command line:

    $ amdify --source <module_file> --target <output_file>

In Node program (below is written in coffee-script with expressjs)

    express = require 'express'
    amdify = require 'amdify'
    app = express()

    app.configure ->
      # ...
      amdify.run
        source: './client/main.coffee'
        target: './public/js/main.js'
        watch: true
        requirejs: # add requireJS's config here; will be written to main.js
          paths:
            jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min'
            'jquery.livequery': 'https://raw.github.com/brandonaaron/livequery/master/jquery.livequery'
            'jquery.address': 'https://raw.github.com/bzlib/jquery-address/master/src/jquery.address'
          shim:
            jquery:
              deps: []
              exports: 'jQuery'
            'jquery.livequery': ['jquery']
            'jquery.address': ['jquery']

The `watch: true` setting will ensure that if main.coffee & its dependencies are changed, `main.js` will be recompiled.

Ensure your main.coffee to include the needed dependencies the usual way.

    $ = require 'jquery'
    require 'jquery.address' # plugin does not return object
    require 'jquery.livequery'
    
    # add relative dependencies within the module
    
    # ... your code ...

Any relative dependencies will be resolved into the same file, whereas the external dependencies will be loaded as separate scripts.

License
======

Amdify is released under [MIT License](http://opensource.org/licenses/MIT).


