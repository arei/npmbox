(function(){
	var npm = require("npm");
	var fs = require("fs");
	var path = require("path");
	var targz = require("tar.gz");
	var rmdir = require("rmdir");

	var cwd = process.cwd();
	var cache = path.resolve(".npmbox-cache");
	var work = path.resolve(".npmbox-work");

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

	var box = function(source) {
		var target = path.resolve(source+".npmbox");

		if (!fs.existsSync(cache)) fs.mkdirSync(cache);
		if (!fs.existsSync(work)) fs.mkdirSync(work);
		
		console.log("Downloading package "+source+"...");
		npm.load({
			cache: cache,
			prefix: work,
			global: true,
			optional: true,
			force: true,
			loglevel: "silent"
		},function(err){
			if (err) {
				console.log("\nUnable to load npm");
				exit(100);
			}
			npm.commands.install([source],function(err){
				if (err) {
					console.log("\nnpm Error: "+err);					
					exit(101);
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

	var unbox = function(source) {
		var target = source.replace(/\.npmbox$/,"");

		console.log("Unboxing "+source);
		if (!fs.existsSync(cache)) fs.mkdirSync(cache);

		new targz().extract(source,".",function(err){
			if (err) {
				console.log("Error reading "+source);
				exit(200);
			}
			console.log("Installing "+target);
			npm.load({
				cache: cache,
				'no-registry': true,
				global: false,
				optional: true,
				force: true,
				loglevel: "silent"
			},function(err){
				if (err) {
					console.log("\nUnable to load npm");
					exit(201);
				}
				npm.commands.install([target],function(err){
					if (err) {
						console.log("\nUnable to install "+source+" from "+target);
						exit(202);
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