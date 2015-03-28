var types = require('./types');

var pr_str = function(ast) {
  switch(ast.constructor) {
    case types.Symbol:
      return ast.value;
    case types.Number:
      return ast.value.toString();
    case types.List:
      return '(' + ast.value.map(pr_str).join(' ') + ')';
    default:
      throw new Error('Unexpected type', ast);
  }
};

// exposed fns
module.exports = {
  pr_str: pr_str
};
