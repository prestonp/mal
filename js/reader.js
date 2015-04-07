var types = require('./types');

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
  switch (reader.peek()) {
    case ')':
      throw new Error('unexpected )');
    case '(':
      return read_list(reader);
    default:
      return read_atom(reader);
  }
};

var read_str = function(str) {
  var reader = new Reader(tokenize(str));
  return read_form(reader);
};

// the make a lisp guide didn't explicitly
// say this but read_atom must read the next
// token, not PEEK.
var read_atom = function(reader) {
  var token = reader.next();
  if ( /^\d+$/.test(token) )
    return parseInt(token);
  else if ( /^nil$/.test(token) )
    return null;
  else if ( /^true$/.test(token) )
    return true;
  else if ( /^false$/.test(token) )
    return false;
  else if ( token.charAt(0) === '"' )
    return token.slice(1, token.length-1);
  else
    return new types.Symbol(token);
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
  var token = reader.next();
  var list = [];
  if ( token !== '(' )
    throw new Error('expected (');
  while( (token = reader.peek()) !== ')') {
    if (!token) {
      throw new Error('expected ), got eof');
    }
    list.push(read_form(reader));
  }
  reader.next();
  return list;
};

// expose fns
module.exports = {
  read_str: read_str
};
