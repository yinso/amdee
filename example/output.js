
define(['require','builtin','underscore','async','coffee-script'], function(require) {

// lib/async
var ___LIB_ASYNC___ = (function(module) {
  
(function() {
  var first, fold, forEach;

  fold = function(ary, iterator, initial, callback) {
    var helper;
    helper = function(ary2, result) {
      var val;
      console.log({
        forEach: ary2,
        interim: result
      });
      if (ary2.length === 0) {
        return callback(null, result);
      } else {
        val = ary2.shift();
        return iterator(val, result, function(err, result) {
          if (err) {
            return callback(err);
          } else {
            return helper(ary2, result);
          }
        });
      }
    };
    return helper(ary, initial);
  };

  forEach = function(ary, iterator, callback) {
    var helper;
    helper = function(ary2, result) {
      var val;
      if (ary2.length === 0) {
        return callback(null);
      } else {
        val = ary2.shift();
        return iterator(val, function(err, result) {
          if (err) {
            return callback(err);
          } else {
            return helper(ary2, result);
          }
        });
      }
    };
    return helper(ary, null);
  };

  first = function(ary, iterator, callback) {
    var helper;
    helper = function(ary2, interim) {
      var val;
      if (ary2.length === 0) {
        return callback(null, interim);
      } else {
        val = ary2.shift();
        return iterator(val, function(err, result) {
          if (err) {
            return callback(err);
          } else {
            if (result) {
              return callback(err, result);
            } else {
              return helper(ary2, interim);
            }
          }
        });
      }
    };
    return helper(ary, null);
  };

  module.exports = {
    fold: fold,
    forEach: forEach,
    first: first
  };

}).call(this);

  return module.exports;
})({exports: {}});
// lib/nocomment
var ___LIB_NOCOMMENT___ = (function(module) {
  module.exports = (function(){
  
  
  function quote(s) {
    
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    
      .replace(/\x08/g, '\\b') 
      .replace(/\t/g, '\\t')   
      .replace(/\n/g, '\\n')   
      .replace(/\f/g, '\\f')   
      .replace(/\r/g, '\\r')   
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "EOF": parse_EOF,
        "token": parse_token,
        "line_term": parse_line_term,
        "regex": parse_regex,
        "regex_char": parse_regex_char,
        "comment": parse_comment,
        "singleline_comment": parse_singleline_comment,
        "singleline_comment_char": parse_singleline_comment_char,
        "multiline_comment": parse_multiline_comment,
        "multiline_comment_char": parse_multiline_comment_char,
        "string": parse_string,
        "singlequote_char": parse_singlequote_char,
        "singlequote_string": parse_singlequote_string,
        "doublequote_char": parse_doublequote_char,
        "doublequote_string": parse_doublequote_string,
        "rspec_string": parse_rspec_string,
        "require_exp": parse_require_exp,
        "whitespace": parse_whitespace,
        "source_char": parse_source_char
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var result0, result1;
        
        result0 = [];
        result1 = parse_token();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_token();
        }
        return result0;
      }
      
      function parse_EOF() {
        var result0;
        var pos0;
        
        pos0 = pos;
        reportFailures++;
        if (input.length > pos) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("any character");
          }
        }
        reportFailures--;
        if (result0 === null) {
          result0 = "";
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_token() {
        var result0;
        
        result0 = parse_string();
        if (result0 === null) {
          result0 = parse_comment();
          if (result0 === null) {
            result0 = parse_regex();
            if (result0 === null) {
              result0 = parse_require_exp();
              if (result0 === null) {
                result0 = parse_source_char();
              }
            }
          }
        }
        return result0;
      }
      
      function parse_line_term() {
        var result0;
        
        if (input.substr(pos, 2) === "\r\n") {
          result0 = "\r\n";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\r\\n\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 13) {
            result0 = "\r";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\r\"");
            }
          }
          if (result0 === null) {
            if (input.charCodeAt(pos) === 10) {
              result0 = "\n";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\n\"");
              }
            }
            if (result0 === null) {
              if (input.charCodeAt(pos) === 8232) {
                result0 = "\u2028";
                pos++;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\u2028\"");
                }
              }
              if (result0 === null) {
                if (input.charCodeAt(pos) === 8233) {
                  result0 = "\u2029";
                  pos++;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"\\u2029\"");
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_regex() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 47) {
          result0 = "/";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"/\"");
          }
        }
        if (result0 !== null) {
          result2 = parse_regex_char();
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_regex_char();
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 47) {
              result2 = "/";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"/\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return '/' + chars.join('') + '/'; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_regex_char() {
        var result0;
        
        if (input.substr(pos, 2) === "\\/") {
          result0 = "\\/";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\/\"");
          }
        }
        if (result0 === null) {
          if (/^[^\/]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[^\\/]");
            }
          }
        }
        return result0;
      }
      
      function parse_comment() {
        var result0;
        
        result0 = parse_singleline_comment();
        if (result0 === null) {
          result0 = parse_multiline_comment();
        }
        return result0;
      }
      
      function parse_singleline_comment() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "//") {
          result0 = "//";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"//\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_singleline_comment_char();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_singleline_comment_char();
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return {comment: "//" + chars.join('') } })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 35) {
            result0 = "#";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"#\"");
            }
          }
          if (result0 !== null) {
            result1 = [];
            result2 = parse_singleline_comment_char();
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_singleline_comment_char();
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, chars) { return {comment: "#" + chars.join('') } })(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_singleline_comment_char() {
        var result0;
        
        if (/^[^\r\n\u2028\u2029]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[^\\r\\n\\u2028\\u2029]");
          }
        }
        return result0;
      }
      
      function parse_multiline_comment() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "/*") {
          result0 = "/*";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"/*\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_multiline_comment_char();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_multiline_comment_char();
          }
          if (result1 !== null) {
            if (input.substr(pos, 2) === "*/") {
              result2 = "*/";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"*/\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return { comment: "/*" + chars.join('') + "*/" } })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_multiline_comment_char() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 42) {
          result0 = "*";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"*\"");
          }
        }
        if (result0 !== null) {
          pos1 = pos;
          reportFailures++;
          if (input.charCodeAt(pos) === 47) {
            result1 = "/";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"/\"");
            }
          }
          reportFailures--;
          if (result1 === null) {
            result1 = "";
          } else {
            result1 = null;
            pos = pos1;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        if (result0 === null) {
          if (/^[^*]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[^*]");
            }
          }
        }
        return result0;
      }
      
      function parse_string() {
        var result0;
        
        result0 = parse_singlequote_string();
        if (result0 === null) {
          result0 = parse_doublequote_string();
        }
        return result0;
      }
      
      function parse_singlequote_char() {
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 92) {
          result0 = "\\";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_source_char();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, seq) { return "\\"+seq; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          pos2 = pos;
          reportFailures++;
          if (input.charCodeAt(pos) === 39) {
            result0 = "'";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"'\"");
            }
          }
          if (result0 === null) {
            if (input.charCodeAt(pos) === 92) {
              result0 = "\\";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\\\"");
              }
            }
            if (result0 === null) {
              result0 = parse_line_term();
            }
          }
          reportFailures--;
          if (result0 === null) {
            result0 = "";
          } else {
            result0 = null;
            pos = pos2;
          }
          if (result0 !== null) {
            result1 = parse_source_char();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, char_) { return char_; })(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_singlequote_string() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_singlequote_char();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_singlequote_char();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 39) {
              result2 = "'";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"'\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, parts) { return "'" + parts[1].join('') + "'" })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_doublequote_char() {
        var result0, result1;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 92) {
          result0 = "\\";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\\\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_source_char();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, seq) { return "\\" + seq; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          pos2 = pos;
          reportFailures++;
          if (input.charCodeAt(pos) === 34) {
            result0 = "\"";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\"\"");
            }
          }
          if (result0 === null) {
            if (input.charCodeAt(pos) === 92) {
              result0 = "\\";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\\\"");
              }
            }
            if (result0 === null) {
              result0 = parse_line_term();
            }
          }
          reportFailures--;
          if (result0 === null) {
            result0 = "";
          } else {
            result0 = null;
            pos = pos2;
          }
          if (result0 !== null) {
            result1 = parse_source_char();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, char_) { return char_; })(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_doublequote_string() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 34) {
          result0 = "\"";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_doublequote_char();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_doublequote_char();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 34) {
              result2 = "\"";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, parts) { return '"' + parts[1].join('') + '"' })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_rspec_string() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_singlequote_char();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_singlequote_char();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 39) {
              result2 = "'";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"'\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return chars.join(''); })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 34) {
            result0 = "\"";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\"\"");
            }
          }
          if (result0 !== null) {
            result1 = [];
            result2 = parse_doublequote_char();
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_doublequote_char();
            }
            if (result1 !== null) {
              if (input.charCodeAt(pos) === 34) {
                result2 = "\"";
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\\"\"");
                }
              }
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, chars) { return chars.join(''); })(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_require_exp() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 7) === "require") {
          result0 = "require";
          pos += 7;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"require\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_whitespace();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_whitespace();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 40) {
              result2 = "(";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"(\"");
              }
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = [];
              result4 = parse_whitespace();
              while (result4 !== null) {
                result3.push(result4);
                result4 = parse_whitespace();
              }
              if (result3 !== null) {
                result4 = parse_rspec_string();
                if (result4 !== null) {
                  result5 = [];
                  result6 = parse_whitespace();
                  while (result6 !== null) {
                    result5.push(result6);
                    result6 = parse_whitespace();
                  }
                  if (result5 !== null) {
                    if (input.charCodeAt(pos) === 41) {
                      result6 = ")";
                      pos++;
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\")\"");
                      }
                    }
                    result6 = result6 !== null ? result6 : "";
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, spec) { return { require: spec } })(pos0, result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_whitespace() {
        var result0;
        
        if (/^[ \r\n\t]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\r\\n\\t]");
          }
        }
        return result0;
      }
      
      function parse_source_char() {
        var result0;
        
        if (input.length > pos) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("any character");
          }
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    
    toSource: function() { return this._source; }
  };
  
  
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();

  return module.exports;
})({exports: {}});
// lib/builtin
var ___LIB_BUILTIN___ = (function(module) {
  




(function() {
  var builtins;

  builtins = {
    assert: true,
    buffer: false,
    child_process: false,
    crypto: true,
    dns: false,
    domain: false,
    events: true,
    fs: false,
    http: false,
    https: false,
    net: false,
    os: false,
    path: true,
    punycode: false,
    querystring: true,
    readline: false,
    stream: false,
    string_decoder: false,
    tls: false,
    udp: false,
    url: true,
    util: true,
    vm: false,
    zlib: false
  };

  module.exports = builtins;

}).call(this);

  return module.exports;
})({exports: {}});
// lib/resolve
var ___LIB_RESOLVE___ = (function(module) {
  
(function() {
  var builtins, externalModuleRoot, fs, isCore, isCoreSupported, isRelative, normalize, path, readPackageJSON, relativeRoot, resolveModulePath, resolveModuleRoot, resolvePakcageJson;

  path = require('builtin').path;

  fs = require('builtin').fs;

  builtins = ___LIB_BUILTIN___;

  fs = require('builtin').fs;

  path = require('builtin').path;

  builtins = ___LIB_BUILTIN___;

  isRelative = function(module) {
    return module.indexOf('.') === 0;
  };

  relativeRoot = function(filePath, cb) {
    var packageHelper;
    packageHelper = function(dirPath) {
      return fs.stat(path.join(dirPath, "package.json"), function(err, stat) {
        if (err) {
          return relativeRoot(path.dirname(dirPath), cb);
        } else {
          return cb(null, dirPath);
        }
      });
    };
    return fs.stat(filePath, function(err, res) {
      if (err) {
        return cb(err);
      } else if (res.isFile()) {
        return relativeRoot(path.dirname(filePath), cb);
      } else {
        return packageHelper(filePath);
      }
    });
  };

  externalModuleRoot = function(module, filePath, cb) {
    return relativeRoot(filePath, function(err, rootPath) {
      var modulePath;
      if (err) {
        return cb(err);
      } else {
        modulePath = path.join(rootPath, 'node_modules', module);
        return fs.stat(modulePath, function(err, stat) {
          if (err) {
            return cb(err);
          } else {
            return cb(null, modulePath);
          }
        });
      }
    });
  };

  resolveModuleRoot = function(module, filePath, cb) {
    if (isRelative(module)) {
      return relativeRoot(filePath, cb);
    } else if (builtins.hasOwnProperty(module)) {
      return cb(null, path.join(__dirname, "../builtin"));
    } else {
      return externalModuleRoot(module, filePath, cb);
    }
  };

  resolveModulePath = function(filePath, cb) {
    return resolvePakcageJson(filePath, function(err, res) {
      if (err) {
        return cb(err);
      } else {
        return cb(null, path.dirname(res));
      }
    });
  };

  resolvePakcageJson = function(filePath, cb) {
    return fs.stat(filePath, function(err, res) {
      var pjsonPath;
      if (err) {
        return cb(err);
      } else if (res.isFile()) {
        return resolvePakcageJson(path.dirname(filePath), cb);
      } else {
        pjsonPath = path.join(filePath, "package.json");
        return fs.stat(pjsonPath, function(err, res) {
          if (err) {
            return resolvePakcageJson(path.dirname(filePath), cb);
          } else {
            return cb(null, pjsonPath);
          }
        });
      }
    });
  };

  readPackageJSON = function(filePath, cb) {
    return resolvePakcageJson(filePath, function(err, res) {
      if (err) {
        return cb(err);
      } else {
        return fs.readFile(res, 'utf8', function(err, res) {
          if (err) {
            return cb(err);
          } else {
            try {
              return cb(null, JSON.parse(res));
            } catch (e) {
              return cb(e);
            }
          }
        });
      }
    });
  };

  normalize = function(rspec, filePath, basePath) {
    var relative;
    if (isRelative(rspec)) {
      relative = path.resolve(path.join(basePath, path.dirname(filePath)), rspec);
      return path.relative(basePath, relative);
    } else {
      return rspec;
    }
  };

  isCore = function(rspec) {
    return builtins[rspec] != null;
  };

  isCoreSupported = function(rspec) {
    return builtins[rspec] === true;
  };

  module.exports = {
    isCore: isCore,
    isCoreSupported: isCoreSupported,
    resolveModuleRoot: resolveModuleRoot,
    isRelative: isRelative,
    resolveModulePath: resolveModulePath,
    resolvePackageJSON: resolvePakcageJson,
    readPackageJSON: readPackageJSON,
    normalize: normalize
  };

}).call(this);

  return module.exports;
})({exports: {}});
// lib/parser
var ___LIB_PARSER___ = (function(module) {
  
(function() {
  var EventEmitter, ParsedScript, ScriptMap, ScriptSpec, async, coffee, extensions, fs, noComment, normalizePath, path, resolve, scriptName, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  EventEmitter = require('builtin').events.EventEmitter;

  fs = require('builtin').fs;

  path = require('builtin').path;

  noComment = ___LIB_NOCOMMENT___;

  coffee = require('coffee-script');

  resolve = ___LIB_RESOLVE___;

  _ = require('underscore');

  async = ___LIB_ASYNC___;

  scriptName = function(filePath) {
    return path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath))).replace(/[\-\\\/\.]+/g, '_');
  };

  


  ScriptSpec = (function() {

    function ScriptSpec(rspec, basePath, rootPath) {
      if (rootPath == null) {
        rootPath = process.cwd();
      }
      this.relative = this.isRelative(rspec) || false;
      this.isExternal = !this.relative;
      this.rspec = rspec;
      this.basePath = basePath;
      this.rootPath = rootPath;
      this.core = resolve.isCore(rspec) || false;
      if (this.core && (!resolve.isCoreSupported(rspec))) {
        throw new Error("unsupported_builtin_module: '" + rspec + "'");
      }
      if (this.isExternal) {
        this.name = this.rspec;
        this.fullPath = this.rspec;
      } else {
        this.name = path.relative(this.rootPath, path.resolve(this.basePath, this.rspec));
      }
    }

    ScriptSpec.prototype.resolve = function(cb) {
      var _this = this;
      if (!this.relative) {
        return cb(null, this.rspec);
      } else {
        return resolve.resolve(this.rspec, {
          dir: this.basePath,
          extensions: ['.coffee', '.js']
        }, function(err, fullPath) {
          if (err) {
            return cb(err);
          } else {
            _this.fullPath = fullPath;
            return cb(null, _this.fullPath);
          }
        });
      }
    };

    ScriptSpec.prototype.isRelative = function(rspec) {
      return (rspec.match(/^\.\.?\//) !== null) || false;
    };

    ScriptSpec.prototype.serializeRequire = function() {
      if (this.core) {
        return "require('builtin')." + this.rspec;
      } else if (!this.relative) {
        return "require('" + this.rspec + "')";
      } else {
        return "" + (scriptName(this.name));
      }
    };

    return ScriptSpec;

  })();

  ParsedScript = (function(_super) {

    __extends(ParsedScript, _super);

    function ParsedScript() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ParsedScript.__super__.constructor.apply(this, args);
      this.output = [];
      this.depends = [];
    }

    ParsedScript.prototype.resolveParse = function(moduleMap, cb) {
      var _this = this;
      return this.resolve(function(err, fullPath) {
        if (err) {
          return cb(err);
        } else {
          return _this.parse(moduleMap, cb);
        }
      });
    };

    ParsedScript.prototype.parse = function(moduleMap, cb) {
      var filePath,
        _this = this;
      filePath = path.resolve(this.fullPath);
      return fs.readFile(filePath, function(err, data) {
        if (err) {
          return cb(err);
        } else {
          try {
            _this.parseData(filePath, data.toString(), moduleMap);
            return _this.parseDependencies(moduleMap, cb);
          } catch (e) {
            return cb({
              error: e,
              file: _this.fullPath
            });
          }
        }
      });
    };

    ParsedScript.prototype.parseDependencies = function(moduleMap, cb) {
      var resolveDepend,
        _this = this;
      resolveDepend = function(depend, next) {
        if (moduleMap.hasScriptByScript(depend)) {
          return next(null, depend);
        } else if (depend.isExternal) {
          try {
            moduleMap.addScript(depend);
            return next(null, depend);
          } catch (e) {
            return next(e);
          }
        } else {
          return depend.resolve(function(err, fullPath) {
            if (err) {
              return next(err, depend);
            } else {
              try {
                return depend.parse(moduleMap, function(err, result) {
                  moduleMap.addScript(depend);
                  return next(err, result);
                });
              } catch (e) {
                console.log({
                  error: e
                });
                return next(e, depend);
              }
            }
          });
        }
      };
      return async.forEach(this.depends, resolveDepend, cb);
    };

    ParsedScript.prototype.parseData = function(filePath, data, moduleMap) {
      data = path.extname(filePath) === '.coffee' ? coffee.compile(data) : data;
      return this.formatParsed(noComment.parse(data), moduleMap);
    };

    ParsedScript.prototype.formatParsed = function(parsed, moduleMap) {
      var obj, temp, _i, _len;
      temp = [];
      for (_i = 0, _len = parsed.length; _i < _len; _i++) {
        obj = parsed[_i];
        if (typeof obj === 'string') {
          temp.push(obj);
        } else {
          if (temp.length > 0) {
            this.output.push(temp.join(''));
            temp = [];
          }
          if (obj.require) {
            this.addDependency(obj.require, moduleMap);
          }
        }
      }
      if (temp.length > 0) {
        return this.output.push(temp.join(''));
      }
    };

    ParsedScript.prototype.addDependency = function(rspec, moduleMap) {
      var depend;
      depend = moduleMap.hasScriptByRSpec(rspec, path.dirname(this.fullPath));
      if (!depend) {
        depend = new ParsedScript(rspec, path.dirname(this.fullPath));
      }
      this.output.push(depend);
      return this.depends.push(depend);
    };

    ParsedScript.prototype.serialize = function() {
      var item, output;
      output = (function() {
        var _i, _len, _ref, _results;
        _ref = this.output;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item instanceof ScriptSpec) {
            _results.push(item.serializeRequire());
          } else {
            _results.push(item);
          }
        }
        return _results;
      }).call(this);
      return "\n// " + this.fullPath + "\nvar " + (scriptName(this.name)) + " = (function(module) {\n  " + (output.join('')) + "\n  return module.exports;\n})({exports: {}});\n";
    };

    return ParsedScript;

  })(ScriptSpec);

  ScriptMap = (function() {

    function ScriptMap(options) {
      var requirejs, rootPath;
      if (options == null) {
        options = {};
      }
      rootPath = options.rootPath, requirejs = options.requirejs;
      this.scripts = {};
      this.ordered = [];
      this.externals = {};
      this.rootPath = rootPath || process.cwd();
      this.requirejs = requirejs;
    }

    ScriptMap.prototype.resolveRSpec = function(rspec, filePath) {
      return path.relative(this.rootPath, path.resolve(path.dirname(filePath), rspec));
    };

    ScriptMap.prototype.isRelative = function(rspec) {
      return (rspec.match(/^\.\.?\//) !== null) || false;
    };

    ScriptMap.prototype.hasScriptByRSpec = function(rspec, filePath) {
      if (this.isRelative(rspec)) {
        return this.hasScriptByName(this.resolveRSpec(rspec, filePath));
      } else {
        return this.externals[rspec];
      }
    };

    ScriptMap.prototype.scriptPath = function(fullPath) {
      return path.join(path.dirname(fullPath), path.basename(fullPath, path.extname(fullPath)));
    };

    ScriptMap.prototype.hasScriptByName = function(name) {
      return this.script[name];
    };

    ScriptMap.prototype.hasScriptByScript = function(script) {
      return this.scripts[script.name];
    };

    ScriptMap.prototype.addScript = function(script) {
      if (!this.hasScriptByScript(script)) {
        this.scripts[script.name] = script;
      }
      if (script.relative) {
        return this.ordered.push(script);
      } else {
        return this.externals[script.name] = script;
      }
    };

    ScriptMap.prototype.parse = function(filePath, cb) {
      var basePath, relPath,
        _this = this;
      basePath = process.cwd();
      relPath = path.relative(basePath, filePath);
      this.script = new ParsedScript("./" + relPath, basePath);
      return this.script.resolveParse(this, function(err, result) {
        if (err) {
          return cb(err);
        } else {
          _this.addScript(_this.script);
          return cb(null, result);
        }
      });
    };

    ScriptMap.prototype.serializeRequireJS = function() {
      if (this.requirejs) {
        return "require.config(" + (JSON.stringify(this.requirejs)) + ");";
      } else {
        return '';
      }
    };

    ScriptMap.prototype.getExternalModules = function() {
      var hasBuiltin, key, result, script, _ref;
      result = [];
      hasBuiltin = false;
      _ref = this.externals;
      for (key in _ref) {
        script = _ref[key];
        if (script.core) {
          if (!hasBuiltin) {
            result.push('builtin');
            hasBuiltin = true;
          }
        } else {
          result.push(key);
        }
      }
      return result;
    };

    ScriptMap.prototype.serialize = function() {
      var baseDepends, depends, exportName, externals, requireJS, script, scripts, val;
      scripts = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.ordered;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          script = _ref[_i];
          _results.push(script.serialize());
        }
        return _results;
      }).call(this)).join('');
      baseDepends = ['require'];
      depends = [].concat(baseDepends, this.getExternalModules());
      externals = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = depends.length; _i < _len; _i++) {
          val = depends[_i];
          _results.push("'" + val + "'");
        }
        return _results;
      })();
      exportName = scriptName(this.script.name);
      requireJS = this.serializeRequireJS();
      return "" + requireJS + "\ndefine([" + externals + "], function(" + baseDepends + ") {\n\n" + scripts + "\n\n  return " + exportName + ";\n});\n";
    };

    return ScriptMap;

  })();

  extensions = ['.coffee', '.js'];

  normalizePath = function(filePath) {
    var match;
    match = filePath.match(/(\.[^\.\/\\]+)$/);
    if (match) {
      if (_.find(extensions, function(ext) {
        return ext === match[0];
      })) {
        return path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
      } else {
        return filePath;
      }
    } else {
      return filePath;
    }
  };

  module.exports = {
    parseFile: function(filePath, options, cb) {
      var normalized, parser;
      parser = new ScriptMap(options);
      normalized = normalizePath(filePath);
      return parser.parse(normalized, function(err, lastScript) {
        return cb(err, parser);
      });
    }
  };

}).call(this);

  return module.exports;
})({exports: {}});
// lib/watcher
var ___LIB_WATCHER___ = (function(module) {
  
(function() {
  var Watcher, fs, _;

  fs = require('builtin').fs;

  _ = require('underscore');

  Watcher = (function() {

    function Watcher() {
      this.inner = {};
    }

    Watcher.prototype.mapHelper = function(interim, file) {
      interim[file] = file;
      return interim;
    };

    Watcher.prototype.watchHelper = function(filePath, onChange) {
      var _this = this;
      console.log("[watch:add] " + filePath);
      return this.inner[filePath] = fs.watch(filePath, function(evt, fileName) {
        console.log("[watch:" + evt + "] " + filePath);
        return onChange({
          event: evt,
          file: filePath
        });
      });
    };

    Watcher.prototype.watch = function(filePaths, onChange) {
      var fileMap, filePath, _i, _len, _results;
      fileMap = _.foldl(filePaths, this.mapHelper, {});
      this.removeWatchByMap(fileMap);
      _results = [];
      for (_i = 0, _len = filePaths.length; _i < _len; _i++) {
        filePath = filePaths[_i];
        if (!this.inner[filePath]) {
          _results.push(this.watchHelper(filePath, onChange));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Watcher.prototype.removeWatchByMap = function(fileMap) {
      var file, watcher, _ref, _results;
      _ref = this.inner;
      _results = [];
      for (file in _ref) {
        watcher = _ref[file];
        if (!fileMap[file]) {
          watcher.close();
          _results.push(delete this.inner[file]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Watcher;

  })();

  module.exports = Watcher;

}).call(this);

  return module.exports;
})({exports: {}});
// lib/amdee
var ___LIB_AMDEE___ = (function(module) {
  




(function() {
  var Watcher, async, compile, compileAndWatch, copy, entry, fs, isDirectory, isPackage, monitor, normalizeTarget, parseFile, path, readPackageJSON, resolve, util, watcher, _;

  fs = require('builtin').fs;

  path = require('builtin').path;

  _ = require('underscore');

  async = ___LIB_ASYNC___;

  util = require('builtin').util;

  parseFile = ___LIB_PARSER___.parseFile;

  path = require('builtin').path;

  async = require('async');

  Watcher = ___LIB_WATCHER___;

  resolve = ___LIB_RESOLVE___;

  watcher = new Watcher();

  isDirectory = function(filePath) {
    return fs.lstatSync(filePath).isDirectory();
  };

  isPackage = function(filePath) {
    return fs.existsSync("" + filePath + "/package.json");
  };

  readPackageJSON = function(filePath) {
    return JSON.parse(fs.readFileSync("" + filePath + "/package.json", "utf8"));
  };

  normalizeTarget = function(target, source) {
    var sourceName;
    console.log('normalizeTarget', target, source);
    if (isDirectory(target)) {
      sourceName = path.basename(source, path.extname(source)) + ".js";
      return path.join(target, sourceName);
    } else {
      return target;
    }
  };

  copy = function(src, dest, cb) {
    return fs.stat(dest, function(err, stat) {
      if (err) {
        return fs.stat(src, function(err, stat) {
          var source, target;
          if (err) {
            return cb(err);
          } else {
            source = fs.createReadStream(src);
            target = fs.createWriteStream(dest);
            return util.pump(source, target, cb);
          }
        });
      } else {
        return cb(new Error("file_exists: " + dest));
      }
    });
  };

  entry = function(opts) {
    var handleExternals, helper, nothing, obj, packageHelper, requirejs, source, target, toBeProcessed, watch;
    source = opts.source, target = opts.target, obj = opts.obj, nothing = opts.nothing, watch = opts.watch, requirejs = opts.requirejs;
    toBeProcessed = function(externals, amdeeSpec) {
      var core, name, result, script, skipped;
      result = [];
      core = false;
      skipped = (amdeeSpec != null ? amdeeSpec.skip : void 0) || [];
      for (name in externals) {
        script = externals[name];
        if (!_.contains(skipped, script.name)) {
          if (script.core) {
            if (!core) {
              core = true;
              result.push(script);
            }
          } else {
            result.push(script);
          }
        }
      }
      return result;
    };
    handleExternals = function(externals, amdeeSpec, targetDir) {
      var script, scriptHelper, _i, _len, _results;
      console.log('External Scripts', externals);
      externals = toBeProcessed(externals, amdeeSpec);
      console.log('External Scripts', externals);
      scriptHelper = function(script, next) {
        if (script.core) {
          return helper(path.join(__dirname, '../builtin/main.coffee'), path.join(targetDir, 'builtin.js'), {
            skipped: []
          });
        } else {
          return resolve.resolve(script.name, {
            dir: script.basePath
          }, function(err, res) {
            var packagePath;
            console.log('resolvePath', script, err, res);
            packagePath = path.join(script.rootPath, 'node_modules', script.name);
            if (isDirectory(packagePath)) {
              return packageHelper(packagePath, targetDir);
            } else {
              return console.error("NOT_A_PACKAGE", script.name);
            }
          });
        }
      };
      _results = [];
      for (_i = 0, _len = externals.length; _i < _len; _i++) {
        script = externals[_i];
        _results.push(scriptHelper(script));
      }
      return _results;
    };
    helper = function(source, target, amdeeSpec, cb) {
      return parseFile(source, {
        requirejs: requirejs
      }, function(err, parsed) {
        var files, script;
        if (err) {
          console.log('ERROR');
          console.log(err);
        } else if (target) {
          fs.writeFile(target, parsed.serialize(), function(err) {
            if (err) {
              return console.log('ERROR\n', err);
            } else {
              console.log("Saved to " + target);
              console.log("Process Externals...");
              return handleExternals(parsed.externals, amdeeSpec, path.dirname(target));
            }
          });
        } else if (!nothing) {
          console.log(obj ? parsed : parsed.serialize());
        }
        if (watch) {
          files = parsed.ordered.length > 0 ? (function() {
            var _i, _len, _ref, _results;
            _ref = parsed.ordered;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              script = _ref[_i];
              _results.push(script.fullPath);
            }
            return _results;
          })() : [parsed.script.fullPath];
          return watcher.watch(files, function(_arg) {
            var event, file;
            event = _arg.event, file = _arg.file;
            return entry(opts);
          });
        }
      });
    };
    packageHelper = function(source, target) {
      var packageSpec, _ref;
      if (isPackage(source)) {
        packageSpec = readPackageJSON(source);
        if (!packageSpec.main && !packageSpec.amdee) {
          return console.error("ERROR:package.json_lack_main", source, packageSpec);
        } else if ((_ref = packageSpec.amdee) != null ? _ref.main : void 0) {
          source = path.join(source, packageSpec.amdee.main);
          target = normalizeTarget(target, source);
          return helper(source, target, packageSpec.amdee);
        } else {
          source = path.join(source, packageSpec.main);
          target = normalizeTarget(target, source);
          return helper(source, target, {
            skip: []
          });
        }
      } else {
        return console.error("ERROR", "source_not_a_package: " + source);
      }
    };
    if (isDirectory(source)) {
      return packageHelper(source, target);
    } else {
      return helper(source);
    }
  };

  compile = function(source, target, opts, cb) {
    return parseFile(source, opts, function(err, parsed) {
      if (err) {
        return cb(err, null);
      } else {
        return fs.writeFile(target, parsed.serialize(), function(err) {
          if (err) {
            return cb(err, null);
          } else {
            return cb(null, parsed);
          }
        });
      }
    });
  };

  compileAndWatch = function(targets, opts) {
    var helper, source, target, watchHelper, _i, _len, _ref, _results;
    watchHelper = function(source, target, watcher, parsed) {
      var files, script;
      files = parsed.ordered.length > 0 ? (function() {
        var _i, _len, _ref, _results;
        _ref = parsed.ordered;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          script = _ref[_i];
          _results.push(script.fullPath);
        }
        return _results;
      })() : [parsed.script.fullPath];
      return watcher.watch(files, function(_arg) {
        var event, file;
        event = _arg.event, file = _arg.file;
        return helper(source, target, watcher);
      });
    };
    helper = function(source, target, watcher) {
      return compile(source, target, opts, function(err, parsed) {
        if (err) {
          console.error("COMPILE ERROR: " + source);
          return console.error(err);
        } else {
          return watchHelper(source, target, watcher, parsed);
        }
      });
    };
    _results = [];
    for (_i = 0, _len = targets.length; _i < _len; _i++) {
      _ref = targets[_i], source = _ref.source, target = _ref.target, watcher = _ref.watcher;
      _results.push(helper(source, target, watcher));
    }
    return _results;
  };

  monitor = function(_arg) {
    var files, requirejs, source, target, targets;
    files = _arg.files, requirejs = _arg.requirejs;
    targets = (function() {
      var _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        _ref = files[_i], source = _ref.source, target = _ref.target;
        _results.push({
          source: source,
          target: target,
          watcher: new Watcher()
        });
      }
      return _results;
    })();
    return compileAndWatch(targets, {
      requirejs: requirejs
    });
  };

  module.exports = {
    run: entry,
    monitor: monitor
  };

}).call(this);

  return module.exports;
})({exports: {}});


  return ___LIB_AMDEE___;
});
