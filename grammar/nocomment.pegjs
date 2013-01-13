start
  = token*

EOF
  = !.

token
  = string
  / comment
  / regex
  / require_exp
  / source_char

line_term
  = "\r\n"
  / "\r"
  / "\n"
  / "\u2028" // line separator
  / "\u2029" // paragraph separator

regex
  = "/" chars:regex_char+ "/" { return '/' + chars.join('') + '/'; }

regex_char
  = "\\/" / [^/]

comment
  = singleline_comment
  / multiline_comment

singleline_comment
  = "//" chars:singleline_comment_char* { return {comment: "//" + chars.join('') } }
  / "#" chars:singleline_comment_char* { return {comment: "#" + chars.join('') } }

singleline_comment_char
  = [^\r\n\u2028\u2029]

multiline_comment
  = "/*" chars:multiline_comment_char* "*/" { return { comment: "/*" + chars.join('') + "*/" } }

multiline_comment_char
  = "*" !"/" 
  / [^*]

string
  = singlequote_string
  / doublequote_string

singlequote_char
  = "\\" seq:source_char { return "\\"+seq; }
  / !("'" / "\\" / line_term) char_:source_char { return char_; }

singlequote_string
  = parts:("'" singlequote_char* "'") { return "'" + parts[1].join('') + "'" }

doublequote_char
  = "\\" seq:source_char { return "\\" + seq; }
  / !('"' / "\\" / line_term) char_:source_char { return char_; }

doublequote_string
  = parts:('"' doublequote_char* '"') { return '"' + parts[1].join('') + '"' }

rspec_string
  = "'" chars:singlequote_char* "'" { return chars.join(''); }
  / '"' chars:doublequote_char* '"' { return chars.join(''); }

require_exp
  = "require" whitespace* "("? whitespace* spec:rspec_string whitespace* ")"?  { return { require: spec } }

whitespace
  = [ \r\n\t]

source_char
  = .
