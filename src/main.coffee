PackageMap = require './package'
fs = require 'fs'
path = require 'path'

module.exports.run = (argv) ->
  if not argv.recursive
    PackageMap.loadAndSavePackage argv.source, argv.target, argv.watch, (err, map) ->
      if err
        console.error "ERROR", err
      else
        console.log "#{map.name} saved to #{map.targetPath}"
  else
    PackageMap.loadAndSavePackageRecursive argv.source, argv.target, argv.watch, (err, map) ->
      if err
        console.error "ERROR", err
      else
        console.log "#{map.name} saved to #{map.targetPath}"
        requireJSPath = path.join(path.dirname(map.targetPath), "require.js")
        requireJSSource = path.join __dirname, "../lib/require.js"
        fs.stat requireJSPath, (err, stat) ->
          if err # file not exist...
            fs.readFile requireJSSource, 'utf8', (err, data) ->
              if err
                console.error "error copying requireJS to #{requireJSPath}", err
              else
                fs.writeFile requireJSPath, data, 'utf8', (err) ->
                  if err
                    console.error "error copying requireJS to #{requireJSPath}", err
                  else
                    console.log "requireJS copied to #{requireJSPath}."
          else if stat.isDirectory()
            console.error "#{requireJSPath} is a directory instead of a javascript file."
          else # file exist - do nothing.
            console.log "#{requireJSPath} exists"


  ###
  # because the final target isn't anything defined...
  PackageMap.loadAndSavePackage argv.source, argv.target, (err, map, savedPath) ->
    if err
      console.error 'ERROR', err
    else
      console.log "#{map.name} saved to #{savedPath}"
      if argv.recursive
        iterHelper = (module, next) ->
          if err
            next err
          else
            module.saveToPathWithName argv.target, (err, res) ->
              if err
                next err
              else
                console.log "saved to ", res
                console.log ''
                next null, module
        map.loadExternalPackages iterHelper, (err, res) ->
          if err
            console.error "ERROR", err
          else
            console.log "Done."
  ###
