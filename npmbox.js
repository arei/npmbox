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

	args.forEach(function(source){
		if (!!source.match(/^\-/)) return;

		box(source,options);

		console.log("");
	});

})();