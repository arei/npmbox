// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Extracts an .npmbox file and installs the contained package.

"use strict";

var unbox = require("./npmboxxer.js").unbox;
var utils = require("./utils");

var argv = require("optimist")
	.string([
		"C","prefix"
	])
	.boolean([
		"v","verbose",
		"s","silent",
		"g","global",
		"S","save",
		"D","save-dev",
		"O","save-optional",
		"B","save-bundle",
		"E","save-exact"
	]).argv;

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
	console.log("  -C, -prefix          npm --prefix switch.");
	console.log("  -S, -save            npm --save switch.");
	console.log("  -D, -save-dev        npm --save-dev swtich.");
	console.log("  -O, -save-optional   npm --save-optional swtich.");
	console.log("  -B, -save-bundle     npm --save-bundle swtich.");
	console.log("  -E, -save-exact      npm --save-exact swtich.");
	console.log("");
	process.exit(0);
}

var options = {
	verbose: argv.v || argv.verbose || false,
	silent: argv.s || argv.silent || false,
	global: argv.g || argv.global || false,
	save: argv.S || argv.save || false,
	"save-dev": argv.D || argv["save-dev"] || false,
	"save-optional": argv.O || argv["save-optional"] || false,
	"save-bundle": argv.B || argv["save-bundle"] || false,
	"save-exact": argv.E || argv["save-exact"] || false
};
if (argv.C || argv.prefix) options.prefix = argv.C || argv.prefix;

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
	if (!options.silent) console.log("\nUnboxing "+source+"...");
	unbox(source,options,unboxDone);
};

sources = sources.filter(function(source){
	return !!source;
});

if (sources && sources.length>0) unboxNext();
else complete();

