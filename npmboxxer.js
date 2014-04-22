// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Shared code for npmbox/npmunbox
(function(){
	var npm = require("npm");
	var fs = require("fs");
	var path = require("path");
	var targz = require("tar.gz");
	var rmdir = require("rmdir");

	var cwd = process.cwd();
	var cache = path.resolve(cwd,".npmbox-cache");
	var work = path.resolve(cwd,".npmbox-work");

	var cleanCache = function(cb) {
		if (fs.existsSync(cache)) rmdir(cache,cb);
		else cb();
	}

	var cleanWork = function(cb) {
		if (fs.existsSync(work)) rmdir(work,cb);
		else cb();
	}

	var exit = function(code) {
		process.chdir(cwd);
		cleanCache(function(){
			cleanWork(function(){
				process.exit(code);
			});
		});
	};

	var box = function(source,options) {
		var target = path.resolve(cwd,source+".npmbox");

		if (!fs.existsSync(cache)) fs.mkdirSync(cache);
		if (!fs.existsSync(work)) fs.mkdirSync(work);

		console.log("Downloading package "+source+"...");
		npm.load({
			cache: cache,
			prefix: work,
			global: true,
			optional: true,
			force: true,
			loglevel: options.verbose ? "http" : "silent"
		},function(err){
			if (err) {
				console.log("\nUnable to load npm");
				exit(100);
				return;
			}
			npm.commands.install([source],function(err){
				if (err) {
					console.log("\nnpm Error: "+err);
					exit(101);
					return;
				}

				console.log("\nCreating archive "+target+"...");
				new targz(6,6,false).compress(cache,target,function(err){
				    if(err) {
				    	console.log("\nError writing "+target);
				    	exit(102);
				    }

					console.log("\nCleaning up...");

					exit(0);
				});

			});
		});
	};

	var unbox = function(source,options) {
		var target = source.replace(/\.npmbox$/,"");

		if (!fs.existsSync(source)) {
			source = path.resolve(cwd,source+".npmbox");
			if (!fs.existsSync(source)) {
				console.log("Source not found: "+source);
				exit(203);
				return;
			}
		}

		console.log("Unboxing "+source);
		if (!fs.existsSync(cache)) fs.mkdirSync(cache);

		new targz().extract(source,".",function(err){
			if (err) {
				console.log("Error reading "+source);
				exit(200);
				return;
			}
			console.log("Installing "+target);
			npm.load({
				cache: cache,
				'no-registry': true,
				global: options.global ? true : false,
				optional: true,
				force: false,
				'fetch-retries': 0,
				'fetch-retry-factor': 0,
				'fetch-retry-mintimeout': 1,
				'fetch-retry-maxtimeout': 2,
				loglevel: options.verbose ? "http" : "silent"
			},function(err){
				if (err) {
					console.log("\nUnable to load npm");
					exit(201);
					return;
				}
				npm.commands.install([target],function(err){
					if (err) {
						console.log("\nUnable to install "+source+" from "+target);
						exit(202);
						return;
					}

					console.log("\nInstalled "+target+".");
					exit(0);
				});
			});
		});
	}

	module.exports = {
		box: box,
		unbox: unbox
	};

})();