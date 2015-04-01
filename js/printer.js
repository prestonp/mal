var types = require('./types');

var pr_str = function(ast, print_readably) {
  switch(ast.constructor) {
    case types.Symbol:
      return ast.value;
    case types.String:
      return print_readably ?
        ast.value
          .replace(/\\"/g, '\"')
          .replace(/\\n/g, '\n') :
        ast.value;
    case types.Number:
      return ast.value.toString();
    case types.Boolean:
      return ast.value;
    case types.Nil:
      return ast.value;
    case types.List:
      return '(' + ast.value.map(pr_str).join(' ') + ')';
    
    default:
      return ast;
  }
};

// exposed fns
module.exports = {
  pr_str: pr_str
};
