// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Extracts an .npmbox file and installs the contained package.

"use strict";

var boxxer = require("./npmboxxer.js");
var utils = require("./utils");

var argv = require("optimist")
	.string([
		"C","prefix",
		"proxy",
		"https-proxy"
	])
	.boolean([
		"v","verbose",
		"s","silent",
		"g","global",
		"scripts",
		"S","save",
		"D","save-dev",
		"O","save-optional",
		"B","save-bundle",
		"E","save-exact"
	])
	.options("p", {
		alias: "path",
		default: process.cwd()
	})
	.options("i", {
		alias: "install"
	})
	.argv;

var args = argv._;
if (args.length<1 || argv.help) {
	console.log("npmunbox - Extracts one or more .npmbox files and installs the contained package(s).");
	console.log("");
	console.log("Usage: ");
	console.log("");
	console.log("  npmunbox --help");
	console.log("  npmunbox [options] <nmpbox-file> <npmbox-file>...");
	console.log("");
	console.log("Options:");
	console.log("");
	console.log("  -v, --verbose         Shows npm output which is normally hidden.");
	console.log("  -s, --silent          Hide all output.");
	console.log("  -p, --path            Specify the path to a folder from which the .npmbox file(s) will be read.");
	console.log("  -i, --install=<pkg>   Installs the indicated package instead of using the .npmbox manifest.");
	console.log("  --scripts             Enable running of scripts during installation.");
	console.log("  -g, --global          Installs package(s) globally as if --global was passed to npm.");
	console.log("  -C, --prefix          npm --prefix switch.");
	console.log("  -S, --save            npm --save switch.");
	console.log("  -D, --save-dev        npm --save-dev switch.");
	console.log("  -O, --save-optional   npm --save-optional switch.");
	console.log("  -B, --save-bundle     npm --save-bundle switch.");
	console.log("  -E, --save-exact      npm --save-exact switch.");
	console.log("  --proxy=<url>         npm --proxy switch.");
	console.log("  --https-proxy=<url>   npm --https-proxy switch.");
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
	"save-exact": argv.E || argv["save-exact"] || false,
	"ignore-scripts": !argv.scripts,
	path: argv.p || argv.path || false
};
if (argv.C || argv.prefix) options.prefix = argv.C || argv.prefix;
if (argv.proxy) options.proxy = argv.proxy;
if (argv["https-proxy"]) options["https-proxy"] = argv["https-proxy"];

var errorCount = 0;
var sources = args.filter(function(source){
	return !!source;
});

var complete = function() {
	boxxer.cleanup(function(){
		process.reallyExit(errorCount);
	});
};

var reportErrors = function(args) {
	args.forEach(function(arg){
		errorCount += 1;
		console.error(" ",arg);
	});
}

// Handles the case where we pay attention to the manifests inside the box(es).
var unboxFromManifest = function() {
	var unboxDone = function(err) {
		if (err) reportErrors(utils.flatten(utils.toArray(arguments)));
		unboxNext();
	};

	var unboxNext = function() {
		var source = sources.shift();
		if (!source) return complete();

		unboxExecute(source);
	};

	var unboxExecute = function(source) {
		if (!options.silent) console.log("\nUnboxing "+source+"...");
		boxxer.unbox(source,options,unboxDone);
	};

	unboxNext();
}

// Handles the case where we are installing a package listed via the `--install`
// option. This unpacks all the boxes (on top of each other) and then does a
// single `npm install`.
var unboxWithInstallOption = function(pkg) {
	var installDone = function(err) {
		if (err) reportErrors(utils.flatten(utils.toArray(arguments)));
		complete();
	};

	var unpackDone = function(err) {
		if (err) {
			reportErrors(utils.flatten(utils.toArray(arguments)));
			return complete();
		}
		unpackNext();
	};

	var unpackNext = function() {
		var source = sources.shift();
		if (source) unpackExecute(source);
		else {
			boxxer.install(pkg,options,installDone);
		}
	};

	var unpackExecute = function(source) {
		boxxer.unpack(source,options,unpackDone);
	};

	unpackNext();
}

if (sources.length===0) return complete();
else if (argv.install) unboxWithInstallOption(argv.install);
else unboxFromManifest();
