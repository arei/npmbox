// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Creates an archive "box" of an npm package and its dependencies.

"use strict";

var box = require("./npmboxxer.js").box;
var utils = require("./utils.js");

var argv = require("optimist")
	.boolean(["v","verbose","s","silent"])
	.options("p", {
		alias: "path",
		default: process.cwd()
	})
	.argv;

var args = argv._;
if (args.length<1 || argv.help) {
	console.log("npmbox - Create an archive for offline installation of the given package.");
	console.log("");
	console.log("Usage: ");
	console.log("");
	console.log("  npmbox --help");
	console.log("  npmbox [options] <package> <package>...");
	console.log("");
	console.log("Options:");
	console.log("");
	console.log("  -v, --verbose         Shows additional output which is normally hidden.");
	console.log("  -s, --silent          Hide all output.");
	console.log("  -p, --path            Specify the path to a folder where the .npmbox file(s) will be written.");
	console.log("");
	process.exit(0);
}

var options = {
	verbose: argv.v || argv.verbose || false,
	silent: argv.s || argv.silent || false,
	path: argv.p || argv.path || false
};

var sources = args;
var errorCount = 0;

var complete = function() {
	process.reallyExit(errorCount);
};

var boxDone = function(err) {
	if (err) {
		var args = utils.flatten(utils.toArray(arguments));
		args.forEach(function(arg){
			errorCount += 1;
			console.error(" ",arg);
		});
	}
	boxNext();
};

var boxNext = function() {
	var source = sources.shift();
	if (!source) complete();

	boxExecute(source);
};

var boxExecute = function(source) {
	if (!options.silent) console.log("\nBoxing "+source+"...");
	box(source,options,boxDone);
};

sources = sources.filter(function(source){
	return !!source;
});

if (sources && sources.length>0) boxNext();
else complete();
