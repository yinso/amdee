

class FauxConsole
  constructor: () ->
    @inner = []
  log: (args...) ->
    @inner.push args

if window and not window.console
  window.console = new FauxConsole()

module.exports = FauxConsole
