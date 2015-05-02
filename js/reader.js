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
    case ']':
      throw new Error('unexpected end of list or vector');
    case '(':
    case '[':
      return read_list(reader);
    case '\'':
      reader.next();
      return [new types.Symbol('quote'), read_form(reader)];
    case '`':
      reader.next();
      return [new types.Symbol('quasiquote'), read_form(reader)];
    case '~':
      reader.next();
      return [new types.Symbol('unquote'), read_form(reader)];
    case '~@':
      reader.next();
      return [new types.Symbol('splice-unquote'), read_form(reader)];
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
  else if ( /^:/.test(token) )
    return token;
  else if ( /^nil$/.test(token) )
    return null;
  else if ( /^true$/.test(token) )
    return true;
  else if ( /^false$/.test(token) )
    return false;
  else if ( token.charAt(0) === '"' )
    return token.slice(1, token.length-1)
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n');
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

var delimiters = {
  '(': ')',
  '[': ']'
};

var read_list = function(reader) {
  var token = reader.next();
  var list = [];

  if ( !(token in delimiters) )
    throw new Error('expected ' + token);

  if ( token === '[' )
    list = new types.Vector();

  var closeToken = delimiters[token];
  while( (token = reader.peek()) !== closeToken) {
    if (!token) {
      throw new Error('expected ' + delimiters[token] + ', got eof');
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
