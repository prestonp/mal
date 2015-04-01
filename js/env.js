var types = require('./types');

var Env = function(outer, binds, exprs) {
  this.data = {};
  this.outer = outer;

  binds = binds || [];
  exprs = exprs || [];

  if (binds.length !== exprs.length)
    throw new Error('env binds and exprs must have matching lengths');

  for (var i = 0; i < binds.length; i++) {
    this.set(binds[i], exprs[i]);
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
    throw new Error(key.value + ' is undefined');
  } else {
    return env.data[key.value];
  }
};

module.exports = Env;
