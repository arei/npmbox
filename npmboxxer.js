// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Shared code for npmbox/npmunbox

"use strict";

(function(){
	var npm = require("npm");
	var fs = require("fs");
	var path = require("path");
	var targz = require("tar.gz");
	var rimraf = require("rimraf");
	var is = require("is");
	var npa = require("npm-package-arg");

	var cwd = process.cwd();
	var work = path.resolve(cwd,".npmbox.work");
	var cache = path.resolve(cwd,".npmbox.cache");

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
		cleanCache(function(){
			cleanWork(function(){
				callback();
			});
		});
	};

	var tarCreate = function(source,target,callback) {
		new targz().compress(source,target,callback);
	};

	var tarExtract = function(source,target,callback) {
		new targz().extract(source,target,callback);
	};

	var npmInit = function(options,callback) {
		npm.load(options,callback);
	};

	var npmInstall = function(source,callback) {
		if (!is.array(source)) source = [source];

		var cl = console.log;
		console.log = function() {};
		npm.commands.install(source,function() {
			console.log = cl;
			callback.apply(this,arguments);
		});
	};

	var npmDependencies = function(packageName,options,callback) {
		if (!packageName) return callback(null);

		var checked = {};
		var results = {};
		var pending = [];

		var done = function(packageName) {
			pending = pending.filter(function(p){
				return p!==packageName;
			});
			if (pending.length>0) return;

			var deps = Object.keys(results);
			deps = deps.sort();

			callback(null,deps);
		};

		var lookupPackageDependencies = function(packageInfo) {
			var children = [];
			if (packageInfo.dependencies) {
				Object.keys(packageInfo.dependencies).forEach(function(key){
					var value = packageInfo.dependencies[key];
					if (key && value) children.push(key+"@"+value);
				});
			}
			if (packageInfo.optionalDependencies) {
				Object.keys(packageInfo.optionalDependencies).forEach(function(key){
					var value = packageInfo.optionalDependencies[key];
					if (key && value) children.push(key+"@"+value);
				});
			}
			// if (packageInfo.devDependencies) {
			// 	Object.keys(packageInfo.devDependencies).forEach(function(key){
			// 		var value = packageInfo.devDependencies[key];
			// 		if (key && value) children.push(key+"@"+value);
			// 	});
			// }

			children.forEach(function(childPackageName){
				lookup(childPackageName);
			});
		};

		var lookup = function(packageName) {
			if (checked[packageName]) return;

			pending.push(packageName);
			checked[packageName] = true;

			var args = [packageName];

			if (!options.silent) console.log("  Querying "+packageName);

			var packageType = npa(packageName).type;

			if(packageType==="git" || packageType==="hosted") {
				npm.commands.cache.add(packageName,null,null,false,function(err, packageInfo) {
					if (err) return callback(err);
					lookupPackageDependencies(packageInfo);

					done(packageName);
				});
			}
			else {
				npm.commands.view(args,true,function(err,deps){
					if (err && err.statusCode && err.statusCode===404) return done(packageName);
					if (err) return callback(err);
					if (!deps) return callback("Package '"+packageName+"' was not found in npm.");

					var found = Object.keys(deps).slice(-1)[0]; // we want the last entry.
					if (found) {
						var fullname = packageName.split(/@/g)[0] || packageName;
						fullname += "@"+found;
						results[fullname] = true;

						lookupPackageDependencies(deps[found]);
					}

					done(packageName);
				});
			}
		};

		lookup(packageName);
	};

	var npmDownload = function(packageNames,options,callback) {
		if (!packageNames) return callback(null);
		if (!is.array(packageNames)) packageNames = [packageNames];

		var pending = [].concat(packageNames);

		var done = function(packageName) {
			pending = pending.filter(function(p){
				return p!==packageName;
			});
			if (pending.length>0) return;
			callback(null,packageNames);
		};

		var populate = function(packageName) {
			if (!options.silent) console.log("  Downloading "+packageName);

			//npm.commands.cache.add(name,ver,where,scrub,cb)
			npm.commands.cache.add(packageName,null,null,false,function(err){
				if (err) return callback("Error occurred downloading '"+packageName+"' to cache.");
				done(packageName);
			});

		};

		packageNames.forEach(function(packageName){
			populate(packageName);
		});
	};



	var box = function(source,options,callback) {
		var target;

		if (fs.existsSync(target)) {
			callback("An .npmbox file already exist with this name.  Please remove it and try again.");
			return;
		}

		if (fs.existsSync(cache)) {
			callback("An .npmbox.cache folder already exist and might conflict.  Please remove it first or work from a different directory.");
			return;
		}
		fs.mkdirSync(cache);

		var done = function(err) {
			var args = arguments;
			cleanAll(function(){
				if (!err && !options.silent) console.log("  Done.");
				callback.apply(null,args);
			});
		};

		var pack = function() {
			if (!options.silent) console.log("  Packing "+target+"...");

			tarCreate(cache,target,function(err){
				if (err) return done(err);
				done();
			});
		};

		var stack = function(deps) {
			npmDownload(deps,options,function(err){
				if (err) return done(err);
				pack(deps);
			});
		};

		var rack = function() {
			npmDependencies(source,options,function(err,deps){
				if (err) return done(err);
				stack(deps);
			});
		};

		var setTarget = function (packageName) {
			target = path.resolve(packageName+".npmbox");
			if (fs.existsSync(target)) {
				return done("An .npmbox file already exist with this name.  Please remove it and try again.");
			}
			rack();
		};

		var extractPackageName = function() {
			var packageType;
			try {
				packageType = npa(source).type;
			}
			catch(e) {
				return done(e);
			}

			if(packageType==="git" || packageType==="hosted") {
				console.log("  Cloning "+source);
				npm.commands.cache.add(source,null,null,false,function(err, packageInfo) {
					if (err) return done(err);
					if(packageInfo && packageInfo.name) return setTarget(packageInfo.name);
					return done("Package has no name");
				});
			}
			else {
				setTarget(source);
			}
		};

		var init = function() {
			var npmoptions = {
				cache: cache,
				prefix: work,
				global: true,
				optional: true,
				force: true,
				progress: false,
				color: false,
				"ignore-scripts": true,
				loglevel: options && options.verbose ? "http" : "silent"
			};

			npmInit(npmoptions,function(err){
				if (err) return done(err);
				extractPackageName();
			});
		};

		init();
	};

	var unbox = function(source,options,callback) {
		var target = source.replace(/\.npmbox$/,"");
		if (!fs.existsSync(source)) {
			source = path.resolve(options.path,source+".npmbox");
			if (!fs.existsSync(source)) {
				callback("No .npmbox file found: "+source);
				return;
			}
		}

		if (!fs.existsSync(cache)) fs.mkdirSync(cache);

		var done = function(err) {
			if (!options.silent) console.log("  Done.");
			cleanAll(function(){
				callback(err);
			});
		};

		var install = function() {
			if (!options.silent) console.log("  Installing...");

			var packageName = path.basename(target);

			npmInstall(packageName,function(err){
				if (err) return done(err);
				done();
			});

		};

		var unpack = function() {
			if (!options.silent) console.log("  Unpacking...");

			tarExtract(source,".",function(err){
				if (err) return done(err);
				install();
			});
		};

		var init = function () {
			options.cache = cache;
			options.loglevel = options.verbose ? "verbose" : "silent";
			options.progress = false;
			options.color = false;
			options.loglevel = "silent";
			options["ignore-scripts"] = true;
			options["cache-min"] = 99999;
			options["fetch-retries"] = 0;
			options["fetch-retry-factor"] = 0;
			options["fetch-retry-mintimeout"] = 1;
			options["fetch-retry-maxtimeout"] = 2;

			npmInit(options,function(err){
				if (err) return done(err);
				unpack();
			});
		};

		init();
	};

	module.exports = {
		box: box,
		unbox: unbox
	};

})();
