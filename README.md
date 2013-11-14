# Amdee

## Overview

Amdee is a command-line tool for converting Node style packages into client-side scripts that cooperates with (requireJS)[http://www.requirejs.org].

Amdee by default works with the boundary of the package; i.e. each package is converted into its own AMD script.

This approach has the following advantage

* Respect the scope of the package - no need to worry about conflicting names across packages
* Leveraging CDN for popular reusable packages - for scripts such as jQuery or Underscore, you will not end up including them in your script

Amdee by default provides many NodeJS module shims for client-side as well.

Amdee will convert a script, along with its relative dependencies within a package, into a single javascript file.  All of the relative dependencies will be resolved to pure javascript variable, i.e., 

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

The config object for requireJS can be passed into the `requirejs` attribute of the `amdee.run` function, which is further described below.

Installation
---------

    $ npm install -g amdee

Usage
-----

On Command line:

    $ amdee --source <module_file> --target <output_file>

In Node program (below is written in coffee-script with expressjs)

    express = require 'express'
    amdee = require 'amdee'
    app = express()

    app.configure ->
      # ...
      amdee.run
        source: './client/main.coffee'
        target: './public/js/main.js'
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

Ensure your main.coffee to include the needed dependencies the usual way.

    $ = require 'jquery'
    require 'jquery.address' # plugin does not return object
    require 'jquery.livequery'
    
    # add relative dependencies within the module
    
    # ... your code ...

Any relative dependencies will be resolved into the same file, whereas the external dependencies will be loaded as separate scripts.

License
======

Amdee is released under [MIT License](http://opensource.org/licenses/MIT).


Node Core Modules
=============


* Buffer - not available in browser
* child_process - not available
* cluster - not available in browser
* crypto - not available
* dns - not available
* domain - not available
* EventEmitter - available
* fs - not available
* globals
  * process - might not make sense
  * console - certainly needed
  * require - yes definitely needed
  * __filename
  * __dirname
  * module
  * exports
  * setTimeout 
  * clearTimeout
  * setInterval
  * clearInterval
* http - not sure if make sense, but partial request & response do
* https - same thing
* net - same thing
* os - might not make sense either.
* path - some of the capabilities make sense; but not sure all of
  it...
* process - not sure...
* punycode - don't even know what this does...
* querstring - available
* readline - not available
* console - yes
* stream - not available
* string_decoder - not available
* ssl - not available
* udp - not available
* url - yes
* util - yes
* vm - not avialable
* zlib - not available
