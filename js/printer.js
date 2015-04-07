var types = require('./types');

var pr_str = function(ast, print_readably) {
  if (ast instanceof types.Symbol) {
    return ast.value;
  } else if (typeof ast === 'function')  {
    return '#<function>';
  } else if (ast === null) {
    return 'nil';
  } else if (Array.isArray(ast)) {
    return '(' + ast.map(pr_str).join(' ') + ')';
  } else if (typeof ast === 'string') {
    return print_readably ?
      ast.replace(/\\"/g, '\"')
         .replace(/\\n/g, '\n') :
      ast;
  } else {
    return ast.toString();
  }
};

// exposed fns
module.exports = {
  pr_str: pr_str
};
