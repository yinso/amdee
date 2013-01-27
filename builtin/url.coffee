
urlParse = (url) ->
  parser = document.createElement('a')
  parser.href = url
  parser

urlFormat = ({protocol, auth, hostname, port, host, pathname, search, query, hash}) ->
  a = document.createElement('a')
  if protocol
    a.protocol = protocol
  if auth
    a.auth = auth
  if not host and hostname
    a.hostname = hostname
  if not host and port
    a.port = port
  if host
    a.host = host
  if pathname
    a.pathname = pathname
  if query and not search
    a.query = query
  if search
    a.search = search
  if hash
    a.hash = hash
  a.href

# implement resolve probably should involve path...

module.exports =
  parse: urlParse
  format: urlFormat
  