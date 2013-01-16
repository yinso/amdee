{assert} = require 'chai'
{resolve} = require '../src/resolve'
{parseFile} = require '../src/parser'
fs = require 'fs'
path = require 'path'

# use this test to parse the example/main and compare against the final result.

parseAndCompare = (source, target, requirejs, done) ->
  process.chdir path.join __dirname, '..'
  parseFile source, {requirejs: requirejs}, (err, parsed) ->
    if err
      done err
    else
      try
        output = parsed.serialize()
        fs.readFile target, (err, buffer) ->
          if err
            done err
          else
            assert.equal output, buffer.toString()
            done()
      catch e
        done err

requireJS =
  paths:
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min'
    'jquery.livequery': 'https://raw.github.com/brandonaaron/livequery/master/jquery.livequery'
    'jquery.address': 'https://raw.github.com/bzlib/jquery-address/master/src/jquery.address'
    'jquery.form': 'http://malsup.github.com/jquery.form'
    'jquery.autosize': 'http://www.jacklmoore.com/autosize/jquery.autosize'
    template: '/views/template'
    underscore: 'http://underscorejs.org/underscore'
    handlebars: 'http://cloud.github.com/downloads/wycats/handlebars.js/handlebars.runtime-1.0.rc.1'
  shim:
    jquery:
      deps: []
      exports: 'jQuery'
    'jquery.livequery': ['jquery']
    'jquery.address': ['jquery']
    'jquery.form': ['jquery']
    'jquery.autosize': ['jquery']
    template: ['handlebars']
    underscore:
      deps: []
      exports: '_'
    handlebars:
      deps: []
      exports: 'Handlebars'

describe 'resolve Test', () ->
  selfPath = __filename

  it 'should resolve to .coffee', (done) ->
    parseAndCompare './example/main.coffee', './example/output.js', null, done
  it 'should resolve to .coffee', (done) ->
    parseAndCompare './example/main.coffee', './example/require.js', requireJS, done
