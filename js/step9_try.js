var readline = require('./readline');
var reader = require('./reader');
var printer = require('./printer');
var types = require('./types');
var Env = require('./env');

// base environment
var repl_env = new Env(null);

var core = require('./core');

for (var key in core) {
  repl_env.set(key, core[key]);
}

repl_env.set('eval', function(ast) {
  return EVAL(ast, repl_env);
});

function quasiquote(ast) {
  if (ast instanceof types.Vector)
    ast = ast.value;

  if (!(core['is_pair?'])(ast)) {
    return [new types.Symbol('quote'), ast];
  } else if (ast[0].value === 'unquote') {
    return ast[1];
  } else if ( (core['is_pair?'])(ast[0]) && ast[0][0].value === 'splice-unquote') {
    return [new types.Symbol('concat'), ast[0][1], quasiquote(ast.slice(1))];
  } else {
    return [new types.Symbol('cons'), quasiquote(ast[0]), quasiquote(ast.slice(1))];
  }
}

function is_macro_call(ast, env) {
  if ( Array.isArray(ast) && ast.length && ast[0] instanceof types.Symbol) {
    var fn;
    try {
      fn = env.get(ast[0].value);
    } catch(e) {
      return false;
    }
    return fn instanceof types.MalFn && fn.is_macro;
  }
  return false;
}

function macroexpand(ast, env) {
  while(is_macro_call(ast, env)) {
    var malFn = env.get(ast[0].value);
    ast = malFn.fn.apply(null, ast.slice(1));
  }
  return ast;
}

var READ = reader.read_str;
var EVAL = function(ast, env) {
  while(true) {
    if ( Array.isArray(ast) && ast.length ) {
      // macro expansion
      ast = macroexpand(ast, env);
      if ( !Array.isArray(ast) ) return ast;
      // switch special forms
      if (ast[0].value === 'def!') {
        return env.set(ast[1].value, EVAL(ast[2], env));
      } else if (ast[0].value === 'defmacro!') {
        var malFn = EVAL(ast[2], env);
        malFn.is_macro = true;
        return env.set(ast[1].value, malFn);
      } else if (ast[0].value === 'macroexpand') {
        return macroexpand(ast[1], env);
      } else if (ast[0].value === 'let*') {
        // format is (let* <list> <ast>)
        var letEnv = new Env(env);
        var bindings = ast[1];
        if (bindings instanceof types.Vector)
          bindings = bindings.value;
        for (var i=0; i<bindings.length; i+=2) {
          letEnv.set(bindings[i].value, EVAL(bindings[i+1], letEnv));
        }
        env = letEnv;
        ast = ast[2];
      } else if (ast[0].value === 'do') {
        eval_ast(ast.slice(1, -1), env);
        ast = ast.slice(-1);
      } else if (ast[0].value === 'if') {
        var condition = EVAL(ast[1], env);
        if (condition !== null && condition !== false ) {
          ast = ast[2];  // truthy
        } else if (ast[3]) {
          ast = ast[3];  // falsy
        } else {
          return null;   // missing else ast
        }
      } else if (ast[0].value === 'try*') {
        var a = ast[1];

        try {
          ast = EVAL(a, env);
        } catch (e) {
          var catch_form = ast[2];
          if (catch_form[0].value !== 'catch*')
            throw new Error('Missing catch*');
          var b = catch_form[1];
          var c = catch_form[2];
          if ( e instanceof Error ) e = e.message;

          // ensure the env expr is a regular mal type
          var catch_env = new Env(env, [b.value], [e]);
          ast = EVAL(c, catch_env);
        }
      } else if (ast[0].value === 'fn*') {
        var params = [];

        // parse params
        if (Array.isArray(ast[1])) {
          // specified params as a vector
          params = ast[1].map(function(param) {
            return param.value;
          });
        } else if (ast[1] instanceof types.Vector) {
          params = ast[1].value.map(function(param) {
            return param.value;
          });
        } else {
          throw new Error('Expected list or vector function signature');
        }

        var fn = function() {
          var args = Array.prototype.slice.call(arguments);
          var closure_env = new Env(env, params, args);
          return EVAL(ast.slice(-1), closure_env);
        };

        // new mal function representation for tco
        return new types.MalFn(ast.slice(-1), params, env, fn);
      } else if (ast[0].value === 'quote') {
        return ast[1];
      } else if (ast[0].value === 'quasiquote') {
        ast = quasiquote(ast[1]);
      } else {
        var evaluated = eval_ast(ast, env);
        var fn = evaluated[0];
        var args = evaluated.slice(1);

        if (fn instanceof types.MalFn) {
          ast = fn.ast[0];
          env = new Env(fn.env, fn.params, args);
        } else if (typeof fn === 'function'){
          return fn.apply(fn, args);
        } else {
          return fn;
        }
      }
    } else {
      return eval_ast(ast, env);
    }
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
  } else if (ast instanceof types.Vector) {
    ast.value = ast.value.map(function(sub_ast){
      return EVAL(sub_ast, env);
    });
    return ast;
  } else if (ast === null) {
    return null;
  } else if (typeof ast === 'object') {
    var result = Object.keys(ast).reduce(function(obj, key) {
      obj[key] = EVAL(ast[key], env);
      return obj;
    }, {});
    return result;
  } else {
    return ast;
  }
};

// implement not in mal
rep('(def! not (fn* (a) (if a false true)))');

// implement load-file in mal
rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) ")") ) )))');

// implement cond
rep("(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list 'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw \"odd number of forms to cond\")) (cons 'cond (rest (rest xs)))))))");

// implement or
rep("(defmacro! or (fn* (& xs) (if (empty? xs) nil (if (= 1 (count xs)) (first xs) `(let* (or_FIXME ~(first xs)) (if or_FIXME or_FIXME (or ~@(rest xs))))))))");

// run commandline files
var args = process.argv;
if ( args && args.length > 2 ) {
  repl_env.set('*ARGV*', args.slice(3));
  rep('(load-file "$1")'.replace('$1', args[2]));
  process.exit();
}

while(1) {
  var line = readline.readline('user> ');
  try {
    console.log(rep(line));
  } catch(e) {
    if (e.message !== '#COMMENT' && e.stack) console.log(e.stack);
  }
}
