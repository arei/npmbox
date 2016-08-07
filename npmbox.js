// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Creates an archive "box" of an npm package and its dependencies.

"use strict";

var boxxer = require("./npmboxxer.js");
var utils = require("./utils.js");

var argv = require("optimist")
	.boolean(["v","verbose","s","silent"])
	.options("p", {
		alias: "path",
		default: process.cwd()
	})
	.options("t", {
		alias: "target",
		default: "box"
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
	console.log("  -t, --target          Specify the target output name in case of multiple packages")
	console.log("");
	process.exit(0);
}

var options = {
	verbose: argv.v || argv.verbose || false,
	silent: argv.s || argv.silent || false,
	path: argv.p || argv.path || false,
	target: argv.t || argv.target || false,
};

var sources = args;
var multiple = false;
var initial = true;
var errorCount = 0;

var complete = function() {
	if (!options.silent) console.log("\nCompleted");

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
	boxxer.cleanup(function(){
		boxNext();
	});
};

var boxNext = function() {
	var source = sources.shift();
	if (!source) return complete();
	var part = boxxer.boxPart.Single;

	if (multiple) {
		if (initial) part = boxxer.boxPart.Initial;
		else if (sources.length == 0) part = boxxer.boxPart.Final;
		else part = boxxer.boxPart.Transient;
	}

	boxExecute(source,part);
	initial = false;
};

var boxExecute = function(source,part) {
	if (!options.silent) console.log("\nBoxing "+source+"...");
	boxxer.box(source,part,options,boxDone);
};

sources = sources.filter(function(source){
	return !!source;
});

if (sources && sources.length>0) {
	multiple = sources.length>1;
	boxNext();
}
else complete();
