// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Creates an archive "box" of one or more npm packages and their dependencies.

"use strict";

var boxxer = require("./npmboxxer.js");

var argv = require("optimist")
	.string([
		"proxy",
		"https-proxy"
	])
	.boolean(["v","verbose","s","silent"])
	.options("t", {
		alias: "target",
		default: null
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
	console.log("  -t, --target          Specify the target .npmbox file to write.");
	console.log("  --proxy=<url>         npm --proxy switch.");
	console.log("  --https-proxy=<url>   npm --https-proxy switch.");
	console.log("");
	process.exit(0);
}

var options = {
	verbose: argv.v || argv.verbose || false,
	silent: argv.s || argv.silent || false,
	target: argv.t || argv.target || null,
	proxy: argv.proxy || null,
	"https-proxy": argv["https-proxy"] || null
};

var sources = args;

var complete = function(err) {
	if (err) console.log("\nERROR: ",err,"\n\nnpmbox halted.");
	process.reallyExit(err?1:0);
};

sources = sources.filter(function(source){
	return !!source;
});
if (sources && sources.length>0) {
	if (!options.silent) console.log("\nBoxing "+sources.join(", ")+"...");
	boxxer.box(sources,options,complete);
}
else complete();
