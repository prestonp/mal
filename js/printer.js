var types = require('./types');

var pr_str = function(ast, print_readably) {
  if (ast instanceof types.Symbol) {
    return ast.value;
  } else if (typeof ast === 'function' || ast instanceof types.MalFn)  {
    return '#<function>';
  } else if (ast === null) {
    return 'nil';
  } else if (Array.isArray(ast)) {
    return '(' + ast.map(function(sub_ast) {
      return pr_str(sub_ast, print_readably);
    }).join(' ') + ')';
  } else if (ast instanceof types.Vector) {
    return '[' + ast.value.map(function(sub_ast) {
      return pr_str(sub_ast, print_readably);
    }).join(' ') + ']';
  } else if (typeof ast === 'string' && /^:/.test(ast)) {
    return ast; // keyword
  } else if (typeof ast === 'string') {
    // regular-ass strings
    return print_readably ? '"' +
      ast.replace(/\\/g, '\\\\')
         .replace(/"/g, '\\"')
         .replace(/\n/g, '\\n') + '"' :
      ast;
  } else if (typeof ast === 'object') {
    var contents = Object.keys(ast).map(function(key) {
      return pr_str(key, print_readably) + ' ' + pr_str(ast[key], print_readably);
    });
    return '{' + contents.join(' ') + '}';
  } else {
    return ast.toString();
  }
};

// exposed fns
module.exports = {
  pr_str: pr_str
};
