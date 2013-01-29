qs = require './querystring'

urlParse = (url, parseQueryString = true, slashesDenoteHost = false) ->
  parsed = document.createElement('a')
  if slashesDenoteHost and url.match(/^\/\//)
    url = "http:#{url}"
  parsed.href = url
  if parseQueryString
    parsed.query = qs.parse(parsed.search)
  parsed

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
  