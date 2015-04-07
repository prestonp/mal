var types = require('./types');

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

  'PI': Math.PI
};

module.exports = ns;
