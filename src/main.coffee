PackageMap = require './package'

module.exports.run = (argv) ->
  # because the final target isn't anything defined...
  PackageMap.loadAndSaveScript argv.source, argv.target, (err, map, savedPath) ->
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
