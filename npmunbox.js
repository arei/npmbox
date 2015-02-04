// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Extracts an .npmbox file and installs the contained package.

"use strict";

var unbox = require("./npmboxxer.js").unbox;
var utils = require("./utils");

var argv = require("optimist")
	.boolean(["v","verbose","g","global","s","silent"])
	.argv;

var args = argv._;
if (args.length<1 || argv.help) {
	console.log("npmunbox - Extracts a .npmbox file and installs the contained package.");
	console.log("");
	console.log("Usage: ");
	console.log("");
	console.log("  npmunbox --help");
	console.log("  npmunbox [options] <nmpbox-file> <npmbox-file>...");
	console.log("");
	console.log("Options:");
	console.log("");
	console.log("  -v, -verbose         Shows npm output which is normally hidden.");
	console.log("  -s, -silent          Shows additional output which is normally hidden.");
	console.log("  -g, -global          Installs package globally as if --global was passed to npm.");
	console.log("");
	process.exit(0);
}

var options = {
	verbose: argv.v || argv.verbose || false,
	silent: argv.s || argv.silent || false,
	global: argv.g || argv.global || false
};

var sources = args;
var errorCount = 0;

var complete = function() {
	process.reallyExit(errorCount);
};

var unboxDone = function(err) {
	if (err) {
		var args = utils.flatten(utils.toArray(arguments));
		args.forEach(function(arg){
			errorCount += 1;
			console.error(" ",arg);
		});
	}
	unboxNext();
};

var unboxNext = function() {
	var source = sources.shift();
	if (!source) complete();

	unboxExecute(source);
};

var unboxExecute = function(source) {
	if (!options.silent) console.log("\nUnboxing "+source);
	unbox(source,options,unboxDone);
};

sources = sources.filter(function(source){
	return !!source;
});

if (sources && sources.length>0) unboxNext();
else complete();

