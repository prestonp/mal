var readline = require('./readline');
var reader = require('./reader');
var printer = require('./printer');

var READ = reader.read_str;
var EVAL = function(a) {  return a; };
var PRINT = printer.pr_str;
var rep = function(input) {
  return PRINT(EVAL(READ(input)), true);
};

while(1) {
  var line = readline.readline('user> ');
  try {
    console.log(rep(line));
  } catch(e) {
    console.log(e);
  }
}
