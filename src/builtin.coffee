###
# holds the definition of what's builtin and what's not.
# the key are the list of builtin libraries
# the value (true|false) defines whether or not the library is supported in client-side.
###

builtins =
  assert: true
  buffer: false
  child_process: false
  crypto: true
  dns: false
  domain: false
  events: true
  fs: false
  http: false
  https: false
  net: false
  os: false
  path: true
  punycode: false
  querystring: true
  readline: false
  stream: false
  string_decoder: false
  module: false
  tls: false
  udp: false
  url: true
  util: true
  vm: false
  zlib: false

module.exports = builtins
