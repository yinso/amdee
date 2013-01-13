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
resolve = require 'resolve'
mkdirp = require 'mkdirp'
_ = require 'underscore'
argv = require('optimist')
  .demand(['source','target'])
  .usage('Usage: amdify -source <source_module_dir> -target <target_output_dir>')
  .argv

noComment = require '../lib/nocomment'

