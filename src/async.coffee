
fold = (ary, iterator, initial, callback) ->
  # the goal is to capture the results from each iteration
  # and then invoke the final callback @ the end.
  # we'll assume that the iterator will automatically return result (i.e. it's not making another call?
  # but it can be async itself...
  # so how to hook togehter a bunch of async calls?
  # we can build it up so that way it calls itself recursively...
  # obviously the only problem with this approach is
  helper = (ary2, result) ->
    console.log {forEach: ary2, interim: result}
    if ary2.length == 0
      callback null, result
    else
      val = ary2.shift()
      iterator val, result, (err, result) ->
        if err
          callback err
        else
          helper ary2, result
  helper ary, initial

forEach = (ary, iterator, callback) ->
  helper = (ary2, result) ->
    if ary2.length == 0
      callback null # no result.
    else
      val = ary2.shift()
      iterator val, (err, result) ->
        if err
          callback err # immediately...
        else # don't really care about the previous result? possibly...
          helper ary2, result
  helper ary, null

first = (ary, iterator, callback) ->
  helper = (ary2, interim) ->
    if ary2.length == 0 # no results - error
      callback null, interim
    else
      val = ary2.shift()
      iterator val, (err, result) ->
        if err
          callback err
        else
          if result
            callback err, result
          else
            helper ary2, interim
  helper ary, null

module.exports =
  fold: fold
  forEach: forEach
  first: first