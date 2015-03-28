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
  }
};

module.exports = types;
