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
  this.data[key] = val;
  return val;
};

Env.prototype.find = function(key) {
  if (this.data.hasOwnProperty(key)) {
    return this;
  } else if (this.outer !== null) {
    return this.outer.find(key);
  } else {
    return null;
  }
};

Env.prototype.get = function(key) {
  var env = this.find(key);
  if (env === null) {
    throw new Error(key + ' is undefined');
  } else {
    return env.data[key];
  }
};

module.exports = Env;
