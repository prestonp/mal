var types = {
  HashMap: function() {
    this.value = {};
  },

  Symbol: function(symbol) {
    this.value = symbol;
  },

  Vector: function(values) {
    this.value = Array.isArray(values) ? values : [];
  },

  Number: function(num) {
    this.value = parseInt(num);
  },

  Float: function(float) {
    this.value = parseFloat(float);
  },

  String: function(str) {
    this.value = str;
  },

  Nil: function() {
    this.value = 'nil';
  },

  Boolean: function(bool) {
    this.value = !!bool;
  },

  MalFn: function(ast, params, env, fn, is_macro) {
    this.ast = ast;
    this.params = params;
    this.env = env;
    this.fn = fn;
    this.is_macro = is_macro || false;
  },

  Exception: function(err) {
    this.value = err;
  }
};

types.Vector.prototype.push = function(item) {
  return this.value.push(item);
};

module.exports = types;
