var readline = require('./readline');

var READ = function(a) {  return a; };
var EVAL = function(a) {  return a; };
var PRINT = function(a) {  return a; };
var rep = function(input) {
  return PRINT(EVAL(READ(input)));
};

while(1) {
  console.log(readline.readline('user> '));
}
