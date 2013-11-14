PackageMap = require './package'

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
