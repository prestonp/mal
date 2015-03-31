var types = require('./types');

var Env = function(outer) {
  this.data = {};
  this.outer = outer;
};

Env.prototype.set = function(key, val) {
  this.data[key.value] = val;
  return val;
};

Env.prototype.find = function(key) {
  if (this.data.hasOwnProperty(key.value)) {
    return this;
  } else if (this.outer.constructor !== types.Nil) {
    return this.outer.find(key);
  } else {
    return new types.Nil();
  }
};

Env.prototype.get = function(key) {
  var env = this.find(key);
  if (env.constructor === types.Nil) {
    throw new Error('Not found:', key.value);
  } else {
    return env.data[key.value];
  }
};

module.exports = Env;
