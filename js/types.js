var types = {

  Symbol: function(symbol) {
    this.value = symbol;
  },

  List: function(list) {
    this.value = list;
  },

  Vector: function() {
    this.value = [];
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

  MalFn: function(ast, params, env, fn) {
    this.ast = ast;
    this.params = params;
    this.env = env;
    this.fn = fn;
  }
};

types.Vector.prototype.push = function(item) {
  return this.value.push(item);
};

module.exports = types;
