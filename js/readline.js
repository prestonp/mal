// Copied directly from mal js implementation with personal annotations
var RL_LIB = "libreadline";
var HISTORY_FILE = require('path').join(process.env.HOME, '.mal-history');

var ffi = require('ffi'),
    fs = require('fs');

var rllib = ffi.Library(RL_LIB, {
    'readline':    [ 'string', [ 'string' ] ],
    'add_history': [ 'int',    [ 'string' ] ]});

var loaded = false;

exports.readline = function(prompt) {
    prompt = prompt || "user> ";

    if (!loaded) {
        // Read history file into mem
        loaded = true;
        var lines = [];
        if (fs.existsSync(HISTORY_FILE)) {
            lines = fs.readFileSync(HISTORY_FILE).toString().split("\n");
        }
        // Max of 2000 lines (grab last 2000 lines)
        lines = lines.slice(Math.max(lines.length - 2000, 0));
        lines.forEach(function(line) {
          rllib.add_history(line);
        });
    }

    // read next line (blocking)
    // calling on the ffi lib handles all of the cool
    // stuff like tab completion and line history
    var line = rllib.readline(prompt);
    if (line) {
        rllib.add_history(line);
        try {
            fs.appendFileSync(HISTORY_FILE, line + "\n");
        } catch (exc) {
            // ignored
        }
    }

    return line;
};
var readline = exports;
