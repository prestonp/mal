var Reader = function(tokens, position) {
  this.tokens = tokens || [];
  this.position = position || 0;
};

Reader.prototype.next = function() {
  return this.tokens[this.position++];
};

Reader.prototype.peek = function() {
  return this.tokens[this.position];
};

var read_form = function(reader) {
  var val;
  switch (reader.peek()) {
    case '(': 
      val = read_list(reader); 
      break;
    default:
      val = read_atom(reader);
      break;
  }

  return val;
};

var read_str = function(str) {
  var reader = new Reader(tokenize(str));
  return read_form(reader);
};

var read_atom = function(reader) {
  return reader.peek();
};

var tokenize = function(str) {
  var malRegex = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"|;.*|[^\s\[\]{}('"`,;)]*)/g;
  var match;
  var tokens = [];
  do {
    match = malRegex.exec(str);
    if (match[1]) tokens.push(match[1]);
  } while(match[1]);

  return tokens;
};

var read_list = function(reader) {
  var match;
  var list = [];
  do {
    match = read_form(reader);
    list.push(match);
  } while( match != ')'); 
  return list;
};
module.exports = read_str;
