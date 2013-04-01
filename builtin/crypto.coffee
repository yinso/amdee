# browser version of randomBytes

randomBytes = (size, cb) ->
  res = if window?.crypto?.getRandomBytes
    windowCryptoRandomBytes size
  else # fallback on Math.random.
    mathRandomBytes size
  ifAsync res, cb

ifAsync = (res, cb) ->
  if cb
    cb res
  else
    res

mathRandomBytes = (size) ->
  ary = new Array size
  for i in [0...size] by 1
    if (i & 0x03) == 0
      r = Math.random() * 0x100000000;
    ary[i] = r >>> ((i & 0x03) << 3) & 0xff
  ary
     
windowCryptoRandomBytes = (size) ->
  ary = new UInt8Array(size)
  window.crypto.getRandomBytes ary
  ary

module.exports =
  randomBytes: randomBytes