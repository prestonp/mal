var types = require('./types');

var ns = {
  '+': function(a, b) { return a + b; },
  '-': function(a, b) { return a - b; },
  '*': function(a, b) { return a * b; },
  '/': function(a, b) { return parseInt(a / b); },

  'list': function() {
            return new types.List(Array.prototype.slice.call(arguments));
          },

  'list?': function(list) {
            return list && list.constructor === types.List;
           },

  'empty?': function(list) {
              return list && list.constructor === types.List && !list.value.length;
            },
  'PI': Math.pi
};

module.exports = ns;
