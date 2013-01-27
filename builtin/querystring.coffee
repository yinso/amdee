###
# querystring interface compatible with node
###

combineKVS = (kvs) ->
  out = {}
  for kv in kvs
    if not kv
      continue
    if out[kv[0]]
      if out[kv[0]] instanceof Array
        out[kv[0]].push kv[1]
      else
        out[kv[0]] = [ out[kv[0]], kv[1]]
    else
      out[kv[0]] = kv[1]
  out

parse = (qs, sep = '&', eq = '=') ->
  parseKV = (kv) ->
    if kv
      (module.exports.unescape(str) for str in kv.split(eq))
    else
      null
  parseQuery = (qs) ->
    combineKVS(parseKV(kv) for kv in qs.split(sep))
  if qs == '' or qs == '?'
    {}
  else
    parseQuery(if qs[0] == '?' then qs.substring(1) else qs)

stringify = (obj, sep = '&', eq = '=') ->
  # we are dealing with one level of nesting; i.e. the val will either be an array or a string
  encode = (key, val) ->
    (module.exports.escape(str) for str in [key, val]).join(eq)
  
  kvs = []
  for key, val of obj
    if val instanceof Array
      kvs = kvs.concat (encode(key, v) for v in val)
    else
      kvs.push encode(key, val)
  kvs.join sep

module.exports =
  parse: parse
  escape: encodeURIComponent
  unescape: decodeURIComponent
  stringify: stringify
