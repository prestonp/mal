var readline = require('./readline');
var reader = require('./reader');
var printer = require('./printer');
var types = require('./types');
var repl_env = require('./repl_env');

var READ = reader.read_str;
var EVAL = function(ast, env) {
  if ( ast.constructor === types.List ) {
    var evaluated = eval_ast(ast, env);
    var fn = evaluated[0];
    var args = evaluated.slice(1);
    return fn.apply(null, args);
  } else {
    return eval_ast(ast, env);
  }
};
var PRINT = printer.pr_str;
var rep = function(input) {
  return PRINT(EVAL(READ(input), repl_env), true);
};

var eval_ast = function(ast, env) {
  switch(ast.constructor) {
    case types.Symbol:
      if ( !env[ast.value] )
        throw new Error('No symbol found', ast.value);
      return env[ast.value];
    case types.List:
      return ast.value.map(function(malType) {
        return EVAL(malType, env);
      });
    default:
      return ast.value;
  }
};

while(1) {
  var line = readline.readline('user> ');
  try {
    console.log(rep(line));
  } catch(e) {
    console.log(e);
  }
}
