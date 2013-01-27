###
# node path API
###


dirname = (path) ->
  # special cases.
  if path == '' or path == '..'
    '.'
  else if path == p.sep
    p.sep
  else
    segments = path.split p.sep
    segments.pop()
    segments.join p.sep

endsWith = (s, suffix) ->
  if suffix == ''
    -1
  else
    s.indexOf(suffix, s.length - suffix.length)

basename = (path, ext = '') ->
  if path == ''
    undefined
  else if path == p.sep or path == '.' or path == '..' or path == '../'
    path
  else
    segments = path.split p.sep
    last = segments.pop()
    if last == ''
      last = segments.pop()
    index = endsWith last, ext 
    if index != -1
      last.substring(0, endsWith(last, ext))
    else
      last

extname = (path) ->
  base = basename path
  # get the last ext.
  match = base.match /\.[^\.]+$/
  if match
    match[0]
  else
    ''

module.exports = p =
  sep: '/' # make this platform (i.e. browser) dependent?
  dirname: dirname
  basename: basename
  extname: extname

