var readline = require('./readline');
var reader = require('./reader');
var printer = require('./printer');
var types = require('./types');
var Env = require('./env');

// base environment
var repl_env = new Env(null);

var core = require('./core');

for(key in core) {
  repl_env.set(key, core[key]);
}

var READ = reader.read_str;
var EVAL = function(ast, env) {
  if ( Array.isArray(ast) ) {
    if (ast[0].value === 'def!') {
      return env.set(ast[1].value, EVAL(ast[2], env));
    } else if (ast[0].value === 'let*') {
      // format is (let* <list> <ast>)
      var letEnv = new Env(env);
      var bindings = ast[1];
      for (var i=0; i<bindings.length; i+=2) {
        letEnv.set(bindings[i].value, EVAL(bindings[i+1], letEnv));
      }
      // interpret second param with the new env
      return EVAL(ast[2], letEnv);
    } else if (ast[0].value === 'do') {
      var rest = ast.slice(1);
      var rest_eval = eval_ast(rest, env);
      return rest_eval[rest_eval.length-1];
    } else if (ast[0].value === 'if') {
      var condition = EVAL(ast[1], env);
      if (condition !== null && condition !== false ) {
        return EVAL(ast[2], env);  // truthy
      } else if (ast[3]) {
        return EVAL(ast[3], env);  // falsy
      } else {
        return null;               // missing else ast
      }
    } else if (ast[0].value === 'fn*') {
      return function() {
        var binds = [];
        // parse bound parameters

        if (Array.isArray(ast[1])) { // (list) -> bindings
          binds = ast[1].map(function(binding) { return binding.value; });
        } else if (ast[1].value !== '[') {
            throw new Error('Expected [ in function declaration');
        } else {
          var i = 2;
          while(ast[i].value !== ']') {
            binds.push(ast[i++].value);
          }
        }
        var args = Array.prototype.slice.call(arguments);
        var closure_env = new Env(env, binds, args);

        // evaluate function body with new closure env
        return EVAL(ast[ast.length-1], closure_env);
      }
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
  if ( input.trim() === 'exit') process.exit();
  return PRINT(EVAL(READ(input), repl_env), true);
};

var eval_ast = function(ast, env) {
  if (ast instanceof types.Symbol) {
    return env.get(ast.value);
  } else if (Array.isArray(ast)) {
    return ast.map(function(sub_ast){
      return EVAL(sub_ast, env);
    });
  } else {
    return ast;
  }
};

// implement not in mal
rep('(def! not (fn* (a) (if a false true)))');

while(1) {
  var line = readline.readline('user> ');
  try {
    console.log(rep(line));
  } catch(e) {
    console.log(e.stack);
  }
}
