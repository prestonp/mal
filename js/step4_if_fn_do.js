var readline = require('./readline');
var reader = require('./reader');
var printer = require('./printer');
var types = require('./types');
var Env = require('./env');

// base environment
var repl_env = new Env(new types.Nil());

var core = require('./core');

for(key in core) {
  repl_env.set(new types.Symbol(key), core[key]);
}

// constants
repl_env.set(new types.Symbol('PI'), Math.PI);

var READ = reader.read_str;
var EVAL = function(ast, env) {
  if ( ast.constructor === types.List ) {
    var list = ast.value;
    if (list[0].constructor === types.Symbol && list[0].value === 'def!') {
      return env.set(list[1], EVAL(list[2], env));
    } else if (list[0].constructor === types.Symbol && list[0].value === 'let*') {
      // format is (let* <list> <ast>)
      var letEnv = new Env(env);
      var bindings = list[1].value;
      for (var i=0; i<bindings.length; i+=2) {
        letEnv.set(bindings[i], EVAL(bindings[i+1], letEnv));
      }
      // interpret second param with the new env
      return EVAL(list[2], letEnv);
    } else if (list[0].constructor === types.Symbol && list[0].value === 'do') {
      var rest = new types.List(list.slice(1));
      var rest_eval = eval_ast(rest, env);
      return rest_eval[rest_eval.length-1];
    } else if (list[0].constructor === types.Symbol && list[0].value === 'if') {
      var condition = EVAL(list[1], env);
      if (condition !== "nil" && condition !== false ) {
        return EVAL(list[2], env);  // truthy
      } else if (list[3]) {
        return EVAL(list[3], env);  // falsy
      } else {
        return new types.Nil();     // missing else ast
      }
    } else if (list[0].constructor === types.Symbol && list[0].value === 'fn*') {
      return function() {
        var binds = [];

        // parse bound parameters
        if (list[1].value !== '[') {
          throw new Error('Expected [ in function declaration');
        }
        var i = 2;
        while(list[i].value !== ']')
          binds.push(list[i++]);

        var args = Array.prototype.slice.call(arguments);
        var closure_env = new Env(env, binds, args);

        // evaluate function body with new closure env
        return EVAL(list[i+1], closure_env);
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
    console.log(e.stack);
  }
}
