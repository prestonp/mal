var fs = require('fs');
var types = require('./types');
var printer = require('./printer');
var reader = require('./reader');

function _print(print, print_readably, delimiter) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var output = args.map(function(arg) {
      return printer.pr_str(arg, print_readably);
    }).join(delimiter);
    if (print) {
      console.log(output);
      return null;
    } else {
      return output;
    }
  }
};

var ns = {
  '+': function(a, b) { return a + b; },
  '-': function(a, b) { return a - b; },
  '*': function(a, b) { return a * b; },
  '/': function(a, b) { return parseInt(a / b); },

  '=': function(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      var matches = true;
      for (var i = 0, len = a.length; i < len; i++) {
        matches = matches && ns['='](a[i], b[i]);
      }
      return matches;
    } else {
      return a === b;
    }
  },

  '>': function(a, b) { return a > b; },
  '>=': function(a, b) { return a >= b; },
  '<': function(a, b) { return a < b; },
  '<=': function(a, b) { return a <= b; },

  'list':
  function() {
    return Array.prototype.slice.call(arguments);
  },

  'list?': Array.isArray,

  'empty?':
  function(list) {
    return ns['list?'](list) && !list.length;
  },

  'count':
  function(list) {
    if (list === null) {
      return 0;
    } else if (!ns['list?']) {
      throw new Error('count expects a list');
    } else {
      return list.length;
    }
  },

  'PI': Math.PI,

  // string printing
  'pr-str':   _print(false, true, ' '),
  'str':      _print(false, false, ''),
  'prn':      _print(true, true, ' '),
  'println':  _print(true, false, ' '),

  'read-string': reader.read_str,
  'slurp': function(filename) {
    var contents = fs.readFileSync(filename, { encoding: 'utf8' });
    return contents;
  },

  'cons': function(pre, list) {
    return [pre].concat(list);
  },

  'concat': function() {
    var args = Array.prototype.slice.call(arguments);
    if ( args.length && Array.isArray(args[0]) ) {
      return args[0].concat.apply(args[0], args.slice(1));
    } else {
      return [];
    }
  },

  'is_pair?': function(val) {
    return Array.isArray(val) && !!val.length;
  }
};

module.exports = ns;
