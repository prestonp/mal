var types = {

  Symbol: function(symbol) {
    this.value = symbol;
  },

  List: function(list) {
    this.value = list;
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
  }
};

module.exports = types;
