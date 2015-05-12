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
  };
}

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
    } else if (a instanceof types.Symbol && b instanceof types.Symbol) {
      return a.value === b.value;
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
    return [pre].concat(list instanceof types.Vector ? list.value : list);
  },

  'concat': function() {
    var args = Array.prototype.slice.call(arguments);

    if ( args.length ){
      // convert arguments to lists
      var head = args[0];
      var rest = args.slice(1).map(function(list) {
        return list instanceof types.Vector ? list.value : list;
      });
      if (Array.isArray(head)) {
        return head.concat.apply(head, rest);
      } else if (head instanceof types.Vector) {
        return head.value.concat.apply(head.value, rest);
      } else {
        throw new Error('concat requires array or vector');
      }
    } else {
      return [];
    }
  },

  'is_pair?': function(val) {
    return Array.isArray(val) && !!val.length;
  },

  'nth': function(list, idx) {
    if (list instanceof types.Vector)
      list = list.value;
    if (idx < 0 || idx >= list.length)
      throw new Error('index out of bounds');
    return list[idx];
  },

  'first': function(list) {
    if (list instanceof types.Vector)
      list = list.value;
    if (!list || !list.length) return null;
    return list[0];
  },

  'rest': function(list) {
    if (list instanceof types.Vector)
      list = list.value;
    return list.slice(1);
  },

  'throw': function(val) {
    // console.log(ns['pr-str'](val)); // useful for debugging
    throw val;
  },

  'apply': function(fn) {
    var args = Array.prototype.slice.call(arguments);
    var last = args[args.length-1];
    if (last instanceof types.Vector) last = last.value;
    args = ns.concat(args.slice(1, -1), last);
    fn = fn instanceof types.MalFn ? fn.fn : fn; // unwrap if MalFn
    return fn.apply(null, args);
  },

  'map': function(fn, list) {
    if (list instanceof types.Vector) list = list.value;
    fn = fn instanceof types.MalFn ? fn.fn : fn; // unwrap if MalFn
    return list.map(fn);
  },

  'nil?': function(val) {
    return val === null;
  },

  'true?': function(val) {
    return val === true;
  },

  'false?': function(val) {
    return val === false;
  },

  'symbol?': function(val) {
    return val instanceof types.Symbol;
  },

  'symbol': function(val) {
    return new types.Symbol(val);
  },

  'keyword?': function(val) {
    return typeof val === 'string' && /^:/.test(val);
  },

  'keyword': function(val) {
    return ':' + val;
  },

  'sequential?': function(val) {
    return Array.isArray(val) || val instanceof types.Vector;
  },

  'vector?': function(val) {
    return val instanceof types.Vector;
  },

  'vector': function() {
    var args = Array.prototype.slice.call(arguments);
    return new types.Vector(args);
  },

  'map?': function(val) {
    return val instanceof types.HashMap;
  },

  'hash-map': function() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length % 2 === 1) throw new Error('hash-map requires even number of args');
    var map = new types.HashMap();
    for (var i=0, len=args.length; i<len; i+=2) {
      map.value[args[i]] = args[i+1];
    }
    return map;
  },

  'assoc': function() {
    // Type checking
    var args = Array.prototype.slice.call(arguments);
    var oldMap = args[0];
    if (!(oldMap instanceof types.HashMap))  throw new Error('assoc requires a map to associate');
    args = args.slice(1);
    if (args.length % 2 === 1) throw new Error('assoc requires pairs of key/vals');

    // Clone map... assoc is immutable
    var map = new types.HashMap();
    map.value = Object.keys(oldMap.value).reduce(function(map, key) {
      map[key] = oldMap.value[key];
      return map;
    }, {});

    // Associate key/val pairs
    for (var i=0, len=args.length; i<len; i+=2) {
      map.value[args[i]] = args[i+1];
    }

    return map;
  }
};

module.exports = ns;
