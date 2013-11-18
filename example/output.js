
define(['require','builtin','coffee-script','underscore'], function(require) {

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
    module: false,
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
    return module.indexOf('.') === 0 || module.indexOf('/') === 0;
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
    console.log('externalModuleRoot', module, filePath);
    return relativeRoot(filePath, function(err, rootPath) {
      console.log('relativeRoot', rootPath);
      if (err) {
        return cb(err);
      } else {
        return readPackageJSON(rootPath, function(err, json) {
          var modulePath;
          console.log('packageJSON', err, json);
          if (err) {
            return cb(err);
          } else if (json.name === module) {
            return cb(null, rootPath);
          } else {
            modulePath = path.join(rootPath, 'node_modules', module);
            return fs.stat(modulePath, function(err, stat) {
              if (err) {
                return externalModuleRoot(module, path.dirname(rootPath), cb);
              } else {
                return cb(null, modulePath);
              }
            });
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
// lib/package
var ___LIB_PACKAGE___ = (function(module) {
  




(function() {
  var EventEmitter, FilePathWatcher, PackageMap, Script, coffeeScript, fs, parser, path, resolve, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('builtin').fs;

  path = require('builtin').path;

  parser = ___LIB_NOCOMMENT___;

  resolve = ___LIB_RESOLVE___;

  coffeeScript = require('coffee-script');

  _ = require('underscore');

  EventEmitter = require('builtin').events.EventEmitter;

  FilePathWatcher = (function(_super) {

    __extends(FilePathWatcher, _super);

    function FilePathWatcher(filePath, dirPath) {
      this.filePath = filePath;
      this.dirPath = dirPath != null ? dirPath : path.dirname(this.filePath);
      this.onDirChange = __bind(this.onDirChange, this);

    }

    FilePathWatcher.prototype.on = function(event, eventListener) {
      FilePathWatcher.__super__.on.call(this, event, eventListener);
      if (!this.dir) {
        this.dir = fs.watch(this.dirPath, this.onDirChange);
        return this.refresh();
      }
    };

    FilePathWatcher.prototype.refresh = function(stat) {
      var _this = this;
      if (stat == null) {
        stat = null;
      }
      if (stat) {
        return this.stat = stat;
      } else {
        return fs.stat(this.filePath, function(err, stat) {
          if (err) {
            return _this.emit('change', {
              type: 'delete',
              path: _this.filePath
            });
          } else {
            _this.stat = stat;
            return console.log('Watch.file', _this.filePath, _this.stat.ino, _this.stat.size);
          }
        });
      }
    };

    FilePathWatcher.prototype.onDirChange = function(evt, fileName) {
      var _this = this;
      if (evt === 'rename') {
        return fs.stat(this.filePath, function(err, stat) {
          if (err) {
            return _this.emit('change', {
              type: 'delete',
              path: _this.filePath
            });
          } else {
            if (_this.statDiffer(_this.stat, stat)) {
              _this.refresh(stat);
              return _this.emit('change', {
                type: 'change',
                path: _this.filePath
              });
            }
          }
        });
      }
    };

    FilePathWatcher.prototype.statDiffer = function(oldStat, newStat) {
      return oldStat.ino !== newStat.ino || oldStat.size !== newStat.size;
    };

    FilePathWatcher.prototype.close = function() {
      this.removeAllListeners();
      return this.dir.close();
    };

    return FilePathWatcher;

  })(EventEmitter);

  Script = (function(_super) {

    __extends(Script, _super);

    function Script(filePath, data, depends, toWatch, map) {
      this.filePath = filePath;
      this.data = data;
      this.depends = depends;
      this.toWatch = toWatch;
      this.map = map;
      this.onWatch = __bind(this.onWatch, this);

      this.name = path.join(path.dirname(this.filePath), path.basename(this.filePath, path.extname(this.filePath)));
      if (this.toWatch) {
        this.startWatch();
      }
    }

    Script.prototype.destroy = function() {
      return this.stopWatch();
    };

    Script.prototype.startWatch = function() {
      this.watcher = new FilePathWatcher(path.join(this.map.basePath, this.filePath));
      return this.watcher.on('change', this.onWatch);
    };

    Script.prototype.stopWatch = function() {
      if (this.watcher) {
        return this.watcher.close();
      }
    };

    Script.prototype.onWatch = function(_arg) {
      var path, type,
        _this = this;
      type = _arg.type, path = _arg.path;
      if (type === 'change') {
        return process.nextTick(function() {
          console.log('------ CHANGE ------', path);
          return _this.emit('fileChange', _this);
        });
      }
    };

    Script.prototype.reload = function(data, depends) {
      this.data = data;
      this.depends = depends;
    };

    Script.prototype.scriptName = function(name) {
      if (name == null) {
        name = this.name;
      }
      return "___" + name.toUpperCase().split('/').join('_').split('.').join('_').split('-').join('_') + "___";
    };

    Script.prototype.serialize = function() {
      var buffer, item, _i, _len, _ref;
      buffer = [];
      _ref = this.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (typeof item === 'string') {
          buffer.push(item);
        } else if (item.require) {
          if (item.external) {
            if (item.core) {
              buffer.push("require('builtin')." + item.require);
            } else {
              buffer.push("require('" + item.require + "')");
            }
          } else {
            buffer.push(this.scriptName(item.require));
          }
        }
      }
      return "// " + this.name + "\nvar " + (this.scriptName(this.name)) + " = (function(module) {\n  " + (buffer.join('')) + "\n  return module.exports;\n})({exports: {}});\n";
    };

    return Script;

  })(EventEmitter);

  PackageMap = (function(_super) {

    __extends(PackageMap, _super);

    PackageMap.loadPackage = function(filePath, targetPath, toWatch, config, cb) {
      var requireJS,
        _this = this;
      if (arguments.length === 4) {
        cb = arguments[3];
        config = null;
      }
      requireJS = (config != null ? config.requireJS : void 0) || null;
      return resolve.resolveModulePath(filePath, function(err, basePath) {
        var map;
        if (err) {
          return cb(err);
        } else {
          map = new _this(basePath, toWatch);
          console.log('loadPackage', filePath, targetPath);
          return map.initialize(filePath, targetPath, function(err, res) {
            if (requireJS) {
              map.requireJS = requireJS;
            }
            console.log("******* PROCESS *******", map.name);
            console.log("base Path = ", map.basePath);
            console.log("main script = ", map.mainPath);
            console.log("skipped modules", map.skipped);
            console.log("requireJS config? ", !map.requireJS ? 'none' : JSON.stringify(map.requireJS, null, 2));
            console.log("");
            console.log("Process files...");
            console.log("");
            if (err) {
              return cb(err);
            } else {
              return map.loadScripts(cb);
            }
          });
        }
      });
    };

    PackageMap.loadAndSavePackage = function(filePath, targetPath, toWatch, cb) {
      return this.loadPackage(filePath, targetPath, toWatch, function(err, map) {
        if (err) {
          return cb(err);
        } else {
          return map.savePackage(function(err, actualPath) {
            if (err) {
              return cb(err);
            } else {
              return cb(null, map, actualPath);
            }
          });
        }
      });
    };

    PackageMap.loadAndSavePackageRecursive = function(filePath, targetPath, toWatch, cb) {
      var iterHelper,
        _this = this;
      iterHelper = function(module, next) {
        return module.savePackage(function(err, res) {
          if (err) {
            return cb(err);
          } else {
            console.log("saved to ", res);
            console.log('');
            return module.loadExternalPackages(iterHelper, function(err, module) {
              if (err) {
                return cb(err);
              } else {
                return next(null, module);
              }
            });
          }
        });
      };
      return this.loadAndSavePackage(filePath, targetPath, toWatch, function(err, map) {
        if (err) {
          return cb(err);
        } else {
          return map.loadExternalPackages(iterHelper, cb);
        }
      });
    };

    function PackageMap(basePath, toWatch) {
      this.basePath = basePath;
      this.toWatch = toWatch != null ? toWatch : false;
      this.reload = __bind(this.reload, this);

      this.name = path.basename(this.basePath);
      this.scripts = {};
      this.depends = [];
      this.externals = [];
      this.loadedModules = {};
    }

    PackageMap.prototype.initialize = function(filePath, targetPath, cb) {
      var _this = this;
      return this.normalizeTargetPath(targetPath, function(err, res) {
        if (err) {
          return cb(err);
        }
        return resolve.readPackageJSON(_this.basePath, function(err, res) {
          var _ref, _ref1, _ref2, _ref3;
          if (err) {
            return cb(err);
          } else {
            if (((_ref = res.amdee) != null ? _ref.main : void 0) || res.main) {
              _this.mainPath = path.relative(_this.basePath, path.join(_this.basePath, ((_ref1 = res.amdee) != null ? _ref1.main : void 0) || res.main));
            }
            _this.skipped = ((_ref2 = res.amdee) != null ? _ref2.skip : void 0) || [];
            _this.requireJS = ((_ref3 = res.amdee) != null ? _ref3.requireJS : void 0) || null;
            return fs.stat(filePath, function(err, res) {
              if (err) {
                return cb(err);
              } else if (res.isDirectory()) {
                if (!_this.mainPath) {
                  return cb(new Error("package.json missing amdee.main and main; file is a directory"));
                } else {
                  return cb(null);
                }
              } else {
                _this.mainPath = path.relative(_this.basePath, filePath);
                return cb(null);
              }
            });
          }
        });
      });
    };

    PackageMap.prototype.loadScripts = function(cb) {
      var nextHelper,
        _this = this;
      nextHelper = function(spec) {
        if (spec) {
          console.log("load required script:", spec, "...");
          return _this.loadScriptBySpec(spec, function(err, res) {
            if (err) {
              return cb(err);
            } else {
              return nextHelper(_this.hasUnprocessedSpec());
            }
          });
        } else {
          console.log("no more relative require specs.");
          _this.orderedScripts = _this.dependencySort();
          return cb(null, _this);
        }
      };
      console.log("load main script:", this.mainPath, "...");
      return this.loadScript(this.mainPath, function(err, res) {
        if (err) {
          return cb(err);
        } else {
          _this.mainScript = res;
          return nextHelper(_this.hasUnprocessedSpec());
        }
      });
    };

    PackageMap.prototype.hasUnprocessedSpec = function() {
      var rspec, _i, _len, _ref;
      _ref = this.depends;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rspec = _ref[_i];
        if (!this.scripts.hasOwnProperty(rspec)) {
          return rspec;
        }
      }
      return null;
    };

    PackageMap.prototype.loadScriptBySpec = function(spec, cb) {
      var coffeePath, jsPath,
        _this = this;
      coffeePath = spec + ".coffee";
      jsPath = spec + ".js";
      return fs.stat(path.join(this.basePath, coffeePath), function(err, stat) {
        if (err) {
          return fs.stat(path.join(_this.basePath, jsPath), function(err, stat) {
            if (err) {
              return cb(err);
            } else {
              return _this.loadScript(jsPath, cb);
            }
          });
        } else {
          return _this.loadScript(coffeePath, cb);
        }
      });
    };

    PackageMap.prototype.loadScript = function(filePath, cb) {
      var _this = this;
      if (path.extname(filePath) === '') {
        return this.loadScriptBySpec(filePath, cb);
      } else {
        return fs.readFile(path.join(this.basePath, filePath), 'utf8', function(err, data) {
          var script;
          if (err) {
            return cb(err);
          } else {
            try {
              script = _this.parseScript(filePath, data);
              return cb(null, script);
            } catch (e) {
              return cb(e);
            }
          }
        });
      }
    };

    PackageMap.prototype.reloadScript = function(script, cb) {
      var _this = this;
      return fs.readFile(path.join(this.basePath, script.filePath), 'utf8', function(err, data) {
        if (err) {
          return cb(err);
        } else {
          try {
            script = _this.parseScript(script.filePath, data, script);
            return cb(null, script);
          } catch (e) {
            return cb(e);
          }
        }
      });
    };

    PackageMap.prototype.parseScript = function(filePath, data, script) {
      var depends, obj, output, parsed, temp, _i, _len;
      if (script == null) {
        script = null;
      }
      data = path.extname(filePath) === '.coffee' ? coffeeScript.compile(data) : data;
      parsed = parser.parse(data);
      temp = [];
      output = [];
      depends = [];
      for (_i = 0, _len = parsed.length; _i < _len; _i++) {
        obj = parsed[_i];
        if (typeof obj === 'string') {
          temp.push(obj);
        } else {
          if (temp.length > 0) {
            output.push(temp.join(''));
            temp = [];
          }
          if (obj.require) {
            output.push(this.addDependency(obj.require, filePath, depends));
          }
        }
      }
      if (temp.length > 0) {
        output.push(temp.join(''));
      }
      if (script) {
        script.reload(output, depends);
        return script;
      } else {
        return this.bindScript(new Script(filePath, output, depends, this.toWatch, this));
      }
    };

    PackageMap.prototype.bindScript = function(script) {
      this.scripts[script.name] = script;
      script.on('fileChange', this.reload);
      return script;
    };

    PackageMap.prototype.reload = function(script) {
      var cb, nextHelper,
        _this = this;
      cb = function(err, res) {
        if (err) {
          return _this.emit('reloadError', err);
        } else {
          return _this.savePackage(function(err, res) {
            if (err) {
              return _this.emit('reloadSaveError', err);
            } else {
              console.log("Reload Successful.");
              return _this.emit('reloadSaveSuccess');
            }
          });
        }
      };
      nextHelper = function(spec) {
        if (spec) {
          console.log("load required script:", spec, "...");
          return _this.loadScriptBySpec(spec, function(err, res) {
            if (err) {
              return cb(err);
            } else {
              return nextHelper(_this.hasUnprocessedSpec());
            }
          });
        } else {
          console.log("no more relative require specs.");
          _this.orderedScripts = _this.dependencySort();
          return cb(null, _this);
        }
      };
      console.log("RELOAD", script.filePath, "...");
      return this.reloadScript(script, function(err, script) {
        if (err) {
          return _this.emit('error', err);
        } else {
          return nextHelper(_this.hasUnprocessedSpec());
        }
      });
    };

    PackageMap.prototype.addDependency = function(rspec, filePath, depends) {
      var isCore, normalized;
      if (resolve.isRelative(rspec)) {
        normalized = resolve.normalize(rspec, filePath, this.basePath);
        if (!_.contains(this.depends, normalized)) {
          this.depends.push(normalized);
        }
        if (!_.contains(depends, normalized)) {
          depends.push(normalized);
        }
        return {
          require: normalized,
          relative: true
        };
      } else {
        isCore = resolve.isCore(rspec);
        if (isCore && !_.contains(this.externals, 'builtin')) {
          this.externals.push('builtin');
        } else if (!isCore && !_.contains(this.externals, rspec)) {
          this.externals.push(rspec);
        }
        return {
          require: rspec,
          external: true,
          core: isCore
        };
      }
    };

    PackageMap.prototype.dependencySort = function() {
      var helper, map;
      map = this;
      helper = function(script, order) {
        var depend, _i, _len, _ref;
        _ref = script.depends;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          depend = _ref[_i];
          if (!map.scripts.hasOwnProperty(depend)) {
            throw new Error("invalid_dependency: " + depend);
          }
          helper(map.scripts[depend], order);
        }
        if (!_.contains(order, script)) {
          order.push(script);
        }
        return order;
      };
      return helper(this.mainScript, []);
    };

    PackageMap.prototype.getExternalModules = function() {
      var hasBuiltIn, hasBuiltin, result, script, _i, _len, _ref;
      result = [];
      hasBuiltin = false;
      _ref = this.externals;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        script = _ref[_i];
        if (resolve.isCore(script)) {
          if (!hasBuiltin) {
            result.push('builtin');
            hasBuiltIn = true;
          }
        } else {
          result.push(script);
        }
      }
      return result;
    };

    PackageMap.prototype.serializeRequireJS = function() {
      if (this.requireJS) {
        return "require.config(" + (JSON.stringify(this.requireJS, null, 2)) + ");";
      } else {
        return '';
      }
    };

    PackageMap.prototype.serialize = function() {
      var baseDepends, depends, exportName, externals, requireJS, script, scripts, val;
      scripts = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.orderedScripts;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          script = _ref[_i];
          _results.push(script.serialize());
        }
        return _results;
      }).call(this)).join('');
      baseDepends = ['require'];
      depends = [].concat(baseDepends, this.externals);
      externals = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = depends.length; _i < _len; _i++) {
          val = depends[_i];
          _results.push("'" + val + "'");
        }
        return _results;
      })();
      exportName = this.mainScript.scriptName();
      requireJS = this.serializeRequireJS();
      return "" + requireJS + "\ndefine([" + externals + "], function(" + baseDepends + ") {\n\n" + scripts + "\n\n  return " + exportName + ";\n});\n";
    };

    PackageMap.prototype.normalizeTargetPath = function(targetPath, cb) {
      var _this = this;
      console.log("normalizeTargetPath", targetPath);
      return fs.stat(targetPath, function(err, stat) {
        if (err) {
          _this.targetPath = targetPath;
        } else if (stat.isDirectory()) {
          _this.targetPath = path.join(targetPath, path.basename(_this.name + ".js"));
        } else if (stat.isFile()) {
          _this.targetPath = targetPath;
        }
        return cb(null, _this);
      });
    };

    PackageMap.prototype.savePackage = function(cb) {
      var _this = this;
      return fs.writeFile(this.targetPath, this.serialize(), 'utf8', function(err) {
        if (err) {
          return cb(err);
        } else {
          return cb(null, _this.targetPath);
        }
      });
    };

    PackageMap.prototype.haUnprocessedPackages = function() {
      var spec, _i, _len, _ref;
      _ref = this.externals;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spec = _ref[_i];
        if (!this.loadedModules.hasOwnProperty(spec)) {
          return spec;
        }
      }
      return null;
    };

    PackageMap.prototype.loadExternalPackages = function(iterHelper, cb) {
      var helper,
        _this = this;
      helper = function(spec) {
        if (spec) {
          if (!_.contains(_this.skipped, spec)) {
            return _this.loadExternalPackage(spec, function(err, module) {
              if (err) {
                return cb(err);
              } else {
                return iterHelper(module, function(err, res) {
                  if (err) {
                    return cb(err);
                  } else {
                    return helper(_this.haUnprocessedPackages());
                  }
                });
              }
            });
          } else {
            console.log("External Module " + spec + " skipped as defined by package.json.");
            return helper(_this.hasUnprocessedSpec());
          }
        } else {
          console.log("No more unprocessed external modules.");
          return cb(null, _this);
        }
      };
      return helper(this.haUnprocessedPackages());
    };

    PackageMap.prototype.loadExternalPackage = function(spec, cb) {
      var filePath, self, targetPath,
        _this = this;
      console.log('loadExternalPackage', spec);
      self = this;
      if (spec === 'builtin') {
        filePath = path.join(__dirname, '../builtin');
        targetPath = path.join(path.dirname(this.targetPath), 'builtin.js');
        return PackageMap.loadPackage(filePath, targetPath, this.toWatch, function(err, module) {
          if (err) {
            return cb(err);
          } else {
            self.loadedModules[spec] = module;
            return cb(null, module);
          }
        });
      } else {
        console.log('resolveModuleRule', spec, this.basePath);
        return resolve.resolveModuleRoot(spec, this.basePath, function(err, modulePath) {
          console.log('resolveModuleRule', err, modulePath);
          if (err) {
            return cb(err);
          } else {
            targetPath = path.join(path.dirname(_this.targetPath), "" + spec + ".js");
            return PackageMap.loadPackage(modulePath, targetPath, _this.toWatch, function(err, module) {
              if (err) {
                return cb(err);
              } else {
                module.skipped = self.skipped;
                self.loadedModules[spec] = module;
                return cb(null, module);
              }
            });
          }
        });
      }
    };

    return PackageMap;

  })(EventEmitter);

  module.exports = PackageMap;

}).call(this);

  return module.exports;
})({exports: {}});
// lib/main
var ___LIB_MAIN___ = (function(module) {
  
(function() {
  var PackageMap, fs, path;

  PackageMap = ___LIB_PACKAGE___;

  fs = require('builtin').fs;

  path = require('builtin').path;

  module.exports.run = function(argv) {
    if (!argv.recursive) {
      return PackageMap.loadAndSavePackage(argv.source, argv.target, argv.watch, function(err, map) {
        if (err) {
          return console.error("ERROR", err);
        } else {
          return console.log("" + map.name + " saved to " + map.targetPath);
        }
      });
    } else {
      return PackageMap.loadAndSavePackageRecursive(argv.source, argv.target, argv.watch, function(err, map) {
        var requireJSPath, requireJSSource;
        if (err) {
          return console.error("ERROR", err);
        } else {
          console.log("" + map.name + " saved to " + map.targetPath);
          requireJSPath = path.join(path.dirname(map.targetPath), "require.js");
          requireJSSource = path.join(__dirname, "../lib/require.js");
          return fs.stat(requireJSPath, function(err, stat) {
            if (err) {
              return fs.readFile(requireJSSource, 'utf8', function(err, data) {
                if (err) {
                  return console.error("error copying requireJS to " + requireJSPath, err);
                } else {
                  return fs.writeFile(requireJSPath, data, 'utf8', function(err) {
                    if (err) {
                      return console.error("error copying requireJS to " + requireJSPath, err);
                    } else {
                      return console.log("requireJS copied to " + requireJSPath + ".");
                    }
                  });
                }
              });
            } else if (stat.isDirectory()) {
              return console.error("" + requireJSPath + " is a directory instead of a javascript file.");
            } else {
              return console.log("" + requireJSPath + " exists");
            }
          });
        }
      });
    }
    

  };

}).call(this);

  return module.exports;
})({exports: {}});


  return ___LIB_MAIN___;
});
