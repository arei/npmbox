// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Shared code for npmbox/npmunbox
(function(){
	var npm = require("npm");
	var fs = require("fs");
	var path = require("path");
	var targz = require("tar.gz");
	var rimraf = require("rimraf");
	var is = require("is");

	var cwd = process.cwd();
	var cache = path.resolve(cwd,".npmbox-cache");
	var work = path.resolve(cwd,".npmbox-work");

	var cleanCache = function(callback) {
		process.chdir(cwd);

		if (fs.existsSync(cache)) rimraf(cache,callback);
		else callback();
	};

	var cleanWork = function(callback) {
		process.chdir(cwd);

		if (fs.existsSync(work)) rimraf(work,callback);
		else callback();
	};

	var cleanAll = function(callback) {
		console.log("\nCleaning Up...");
		cleanCache(function(){
			cleanWork(function(){
				console.log("");
				callback();
			});
		});
	};

	var npmInit = function(options,callback) {
		npm.load(options,callback);
	};

	var npmInstall = function(source,callback) {
		if (!is.array(source)) source = [source];
		npm.commands.install(source,callback);
	};

	var tarCreate = function(source,target,callback) {
		new targz(6,6,false).compress(source,target,callback);
	};

	var tarExtract = function(source,target,callback) {
		new targz().extract(source,target,callback);
	};

	var box = function(source,options,callback) {
		var target = path.resolve(cwd,source+".npmbox");

		if (!fs.existsSync(cache)) fs.mkdirSync(cache);
		if (!fs.existsSync(work)) fs.mkdirSync(work);

		var npmoptions = {
			cache: cache,
			prefix: work,
			global: true,
			optional: true,
			force: true,
			loglevel: options && options.verbose ? "http" : "silent"
		};

		npmInit(npmoptions,function(err){
			if (err) {
				cleanAll(callback.bind(this,"Unable to load npm"));
				return;
			}

			console.log("Downloading package "+source+"...");
			npmInstall(source,function(err){
				if (err) {
					cleanAll(callback.bind(this,"npm Error: "+err));
					return
				}

				console.log("\nCreating archive "+target+"...");
				tarCreate(cache,target,function(err){
				    if(err) {
						cleanAll(callback.bind(this,"Error writing "+target));
				    	return;
				    }

					cleanAll(callback.bind(this,null,target));
				});
			});
		});
	};

	var unbox = function(source,options,callback) {
		var target = source.replace(/\.npmbox$/,"");

		var npmoptions = {
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
		};

		if (!fs.existsSync(source)) {
			source = path.resolve(cwd,source+".npmbox");
			if (!fs.existsSync(source)) {
				callback("Source not found: "+source);
				return;
			}
		}

		if (!fs.existsSync(cache)) fs.mkdirSync(cache);

		console.log("Extracting archive "+target+"...");
		tarExtract(source,".",function(err){
			if (err) {
				cleanAll(callback.bind(this,"Error reading "+source));
				return;
			}

			npmInit(npmoptions,function(err){
				if (err) {
					cleanAll(callback.bind(this,"Unable to load npm"));
					return;
				}

				console.log("Installing "+target+"...");
				npmInstall([target],function(err){
					if (err) {
						cleanAll(callback.bind(this,"Unable to install "+source+" from "+target));
						return;
					}

					cleanAll(callback.bind(this,null,target));
				});
			});
		});
	}

	module.exports = {
		box: box,
		unbox: unbox
	};

})();