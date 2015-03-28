var readline = require('./readline');
var reader = require('./reader');
var printer = require('./printer');

var READ = reader.read_str;
var EVAL = function(a) {  return a; };
var PRINT = printer.pr_str;
var rep = function(input) {
  return PRINT(EVAL(READ(input)));
};

while(1) {
  var line = readline.readline('user> ');
  console.log(rep(line));
}
