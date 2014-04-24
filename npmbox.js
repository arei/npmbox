// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Creates an archive "box" of an npm package and its dependencies.
(function(){
	var box = require("./npmboxxer.js").box;

	var argv = require("optimist")
		.boolean(["v","verbose"])
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
		console.log("  -v, -verbose         Shows npm output which is normally hidden.");
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
			console.log("npmbox created...");
			targets.forEach(function(target){
				console.log("  "+target);
			});
			console.log("");
		}

		if (errors && errors.length>0) {
			console.log("npmbox had the following errors...");
			errors.forEach(function(error){
				console.log("  "+error);
			});
			console.log("");
		}

		process.reallyExit(errors.length);
	};

	var boxDone = function(err,target) {
		if (err) errors.push(err);
		else targets.push(target);
		boxNext();
	};

	var boxNext = function() {
		var source = sources.shift();
		if (!source) complete();

		boxExecute(source);
	};

	var boxExecute = function(source) {
		box(source,options,boxDone);
	}

	sources = sources.filter(function(source){
		return !!source;
	});

	if (sources && sources.length>0) boxNext();
	else complete();
})();