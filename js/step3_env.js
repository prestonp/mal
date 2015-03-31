var readline = require('./readline');
var reader = require('./reader');
var printer = require('./printer');
var types = require('./types');
var Env = require('./env');

// base environment
var repl_env = new Env(new types.Nil());
 
// functions
repl_env.set(new types.Symbol('+'), function(a, b) { return a+b; });
repl_env.set(new types.Symbol('-'), function(a, b) { return a-b; });
repl_env.set(new types.Symbol('*'), function(a, b) { return a*b; });
repl_env.set(new types.Symbol('/'), function(a, b) { return parseInt(a/b); });

// constants
repl_env.set(new types.Symbol('PI'), Math.PI);

var READ = reader.read_str;
var EVAL = function(ast, env) {
  if ( ast.constructor === types.List ) {
    var list = ast.value;
    if (list[0].constructor === types.Symbol && list[0].value === 'def!') {
      return env.set(list[1], eval_ast(list[2], env));
    } else if (list[0].constructor === types.Symbol && list[0].value === 'let*') {
      var newEnv = new Env(env);
    } else {
      var evaluated = eval_ast(ast, env);
      var fn = evaluated[0];
      var args = evaluated.slice(1);
      return fn.apply(null, args);
    }
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
      return env.get(ast);
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
