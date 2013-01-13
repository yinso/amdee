###
# amdify
#
# entry module for converting CommonJS module format into AMD format.
# 
# 
# 
###

fs = require 'fs'
path = require 'path'
_ = require 'underscore'
argv = require('optimist')
  .demand(['source','target'])
  .usage('Usage: amdify -source <source_module_dir> -target <target_output_dir>')
  .argv

###
# we previously have enough capability - now we need to figure out how to refactor the code
# into something a bit more palatable.
#
# basically the design is the following.
#
# the goal is as follows:
#
# 1) convert existing popular modules into AMD format (jQuery, etc) so they are loadable via requirejs
#
# 2) convert npm module into a single script in AMD format; this is especially needed for modules that are not the main entry program.
#
# 3) convert a subset of scripts in an npm module into a set of scripts that are usable in AMD format.  It's unclear at this time whether or not this is something different from 2).
#
# 4) provide common alternative modules to the server-side of node modules.
# 
# For 2) & 3) the goal is to allow code reuse with server-side as much as possible. Part of this means we'll have to change the 'plumbing'; i.e. when requiring 'fs' on the server-side, it's
# going to be converted to a different 'fs' module.
# 
# We'll not focus on 1) as it's external modules, so for now we'll focus on getting 2) to work.
# 
###

###
# process of loading all the files.
# 1 - start from an entry point - either supplied explicitly or reading from package.json
# 2 - from the entry point, load and parse the script to determine where the require spec are
# 3 - the require spec are then being pulled out and "massaged" based on the following rules
#   a) if there are special rules defined for a particular spec, follow those rules
#   b) if the spec is relative, then load it into the same namespace and generate the same script
#   c) if the spec is just a name (external), then we'll utilize requireJS or equivalent to load it.
#
# For b) above it'll be a recursive process to load.
# 
###

# let's start by parsing a single file in async style.

# the output of the parseFile needs to be an
# this is the basic parser... the goal is to then encounter events and throw them out.
# i.e. each spec should causes an event to occur.
# we can build on top of EventEmitter.

{parseFile} = require './parser'

parseFile argv.source, (err, parsed) ->
  if err
    console.log 'ERROR\n', err
  else
    fs.writeFile argv.target, parsed.serialize(), (err) ->
      if err
        console.log 'ERROR\n', err
      else
        console.log 'done.'


