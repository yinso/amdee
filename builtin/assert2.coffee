# is this really necessary? probably not...
class AssertError extends Error
  constructor: ({message, actual, expected, operator, stackStart}) ->
    super 'AssertError', message
    @actual = actual
    @expected = expected
    @operator = operator
    stackStart ?= fail
    if Error.captureStackTrace
      Error.capturestackTrace @, stackStart

fail = (actual, expected, msg, op, stackStart) ->
  throw new AssertError
    actual: actual
    expected: expected
    message: msg
    operator: op
    stackStart: stackStart

ok = (v, msg) ->
  if !v
    fail v, true, msg, '==', ok

equal = (actual, expected, msg) ->
  if actual != expected
    fail actual, expected, msg, '==', equal

notEqual = (actual, expected, msg) ->
  if actual == expected
    fail actual, expected, msg, '!=', notEqual

_slice = Array.prototype.slice;

_isArguments = (obj) ->
  Object.prototype.toString.call(obj) == '[object Arguments]'


# deepEqual -> comparing to make sure that the object is equivalent of each other.
_deepEqual = (a, b) ->
  if a == b
    true
  else if (a instanceof Date) and (b instanceof Date)
    a.getTime() == b.getTime()
  else if (a instanceof RegExp) and (b instanceof RegExp)
    a.source == b.source and
    a.global == b.global and
    a.multiline == b.multiline and
    a.lastIndex == b.lastIndex and
    a.ignoreCase == b.ignoreCase
  else if (typeof a != 'object') and (typeof b != 'object')
    a == b
  else
    _objEquiv a, b

_objEquiv = (a, b) ->
  if (not a?) or (not b?)
    return false
  if a.prototype != b.prototype
    return false
  if _isArguments(a)
    if not _isArguments(b)
      return false
    else
      return _objEquiv _slice.call(a), _slice.call(b)
  aKeys = null
  bKeys = null
  try
    aKeys = Object.keys(a)
    bKeys = Object.keys(b)
  catch e
    return false
  if aKeys.length != bKeys.length
    return false
  aKeys.sort()
  bKeys.sort()
  for i in [0..aKeys.length - 1]
    if aKeys[i] != bKeys[i]
      return false
  for i in [0..aKeys.length - 1]
    if not _deepEqual(a[aKeys[i]], b[bKeys[i]])
      return false
  true
   
module.exports = ok 

ok.ok = ok
ok.fail = fail
ok.equal = equal
ok.notEqual = notEqual
