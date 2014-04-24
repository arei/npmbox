// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Extracts an .npmbox file and installs the contained package.
(function(){
	var unbox = require("./npmboxxer.js").unbox;

	var argv = require("optimist")
		.boolean(["v","verbose","g","global"])
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
		console.log("  -g, -global          Installs package globally as if --global was passed to npm.");
		console.log("");
		process.exit(0);
	}

	var options = {
		verbose: argv.v || argv.verbose || false,
		global: argv.g || argv.global || false
	};

	var sources = args;
	var targets = [];
	var errors = [];

	var complete = function() {
		if (targets && targets.length>0) {
			console.log("npmunbox installed...");
			targets.forEach(function(target){
				console.log("  "+target);
			});
			console.log("");
		}

		if (errors && errors.length>0) {
			console.log("npmunbox had the following errors...");
			errors.forEach(function(error){
				console.log("  "+error);
			});
			console.log("");
		}

		process.reallyExit(errors.length);
	};

	var unboxDone = function(err,target) {
		if (err) errors.push(err);
		else targets.push(target);
		unboxNext();
	};

	var unboxNext = function() {
		var source = sources.shift();
		if (!source) complete();

		unboxExecute(source);
	};

	var unboxExecute = function(source) {
		unbox(source,options,unboxDone);
	}

	sources = sources.filter(function(source){
		return !!source;
	});

	if (sources && sources.length>0) unboxNext();
	else complete();
})();