var types = require('./types');

var Env = function(outer, binds, exprs) {
  this.data = {};
  this.outer = outer;

  binds = binds || new types.List([]);
  exprs = exprs || new types.List([]);

  if (binds.value.length !== exprs.value.length)
    throw new Error('env binds and exprs must have matching lengths');

  for (var i = 0; i < binds.value.length; i++) {
    this.set(binds.value[i], exprs.value[i]);
  }
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
