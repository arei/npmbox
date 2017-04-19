// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Shared code for npmbox/npmunbox

"use strict";

(function(){
	var npm = require("npm");
	var fs = require("fs");
	var fsx = require("fs-extra");
	var path = require("path");
	var readJson = require("read-package-json");
	var targz = require("tar.gz");
	var tmp = require("tmp");
	var is = require("is");
	var npa = require("npm-package-arg");

	// Tell the `tmp` package to try to delete temporary files even when the
	// process exits with an error.
	tmp.setGracefulCleanup();

	// Make the main temporary directory and two subdirectories for box contents
	// and additional workspace (respectively). `unsafeCleanup` just means that
	// the directory should be removed on process exit even if it's not empty.
	var tmpDir = tmp.dirSync({prefix: "npmbox-", unsafeCleanup: true});
	var cache = path.resolve(tmpDir.name,"cache",".npmbox.cache");
	var work = path.resolve(tmpDir.name,"work");
	fsx.mkdirsSync(cache);
	fsx.mkdirsSync(work);

	// This takes an install target (typically a simple package name, but
	// sometimes a path or a general URL) and converts it into a form that is
	// suitable as a simple filesystem component (name without slashes),
	// including a `.npmbox` suffix.
	var encodeTarget = function(target) {
		return encodeURIComponent(target)+".npmbox";
	};

	// This reverses the action of `encodeTarget()`, and also strips away the
	// directory prefix.
	var decodeTarget = function(encoded) {
		encoded = path.basename(encoded).replace(/\.npmbox$/, "");
		return decodeURIComponent(encoded);
	};

	var cleanAll = function(callback) {
		if (fs.existsSync(tmpDir.name)) fsx.remove(tmpDir.name,callback);
		else callback();
	};

	// Given a key/value pair from a dependency map (e.g. in a `package.json`
	// file), return the dependency name. In the case of an implied name in the
	// value, that is, a usual package dependency (e.g. `"foo": "^1.2"`), this
	// joins the key and value with an `@`. When the value is fully specified,
	// this just returns the value.
	var fixDependency = function(key,value) {
		var parsed = npa(value); // We use npm's own mechanism to decide.
		if (parsed.name===null) return key+"@"+value;
		else return value;
	};

	// Given a dependency map (e.g. from a `package.json` file), return a list
	// of the full dependency names. Returns an empty list if given `null`.
	var listDependencies = function(depMap) {
		var result = [];
		var keys = Object.keys(depMap||{});
		for (var i = 0; i<keys.length; i++) {
			var k = keys[i];
			result.push(fixDependency(k,depMap[k]));
		}
		return result;
	};

	var tarCreate = function(source,target,callback) {
		new targz().compress(source,target,callback);
	};

	var tarExtract = function(source,target,callback) {
		// Unfortunately, the `tar.gz` package at v1.0.2 will sometimes make its
		// callback before it's done extracting all the files, but _later_
		// versions of the package have other bugs that prevent extraction from
		// working at all. What we do here is keep checking the contents of the
		// directory (recursive walk) until they settle.

		var prevSize = -1; // Total size we found on the most recent iteration.

		var checkIfDone = function(err) {
			if (err) return callback(err);

			var totalSize = 0; // Total size of all files in the target dir.
			fsx.walk(target)
				.on("readable",function(){
					for (;;) {
						var item = this.read();
						if (!item) break;
						totalSize += item.stats.isFile() ? item.stats.size : 1;
					}
				})
				.on("end",function(){
					if (totalSize === prevSize) {
						// Contents have not changed in size since the previous
						// iteration. Done!
						callback();
					} else {
						// Contents have changed. Note the new size, delay a
						// moment, and then check again.
						prevSize = totalSize;
						setTimeout(checkIfDone,250);
					}
				})
				.on("error",function(err){
					return callback(err);
				});
		};

		new targz().extract(source,target,checkIfDone);
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

			var packageDetails = npa(packageName);
			var packageType = packageDetails && packageDetails.type || null;

			if(packageType==="git" || packageType==="hosted" || packageType==="local") {
				npm.commands.cache.add(packageName,null,null,false,function(err,packageInfo) {
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
						var fullname = packageDetails && packageDetails.name || packageName;
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
		var done = function(err) {
			cleanAll(function(){
				callback.call(this,err);
			});
		};

		var next = function() {
			source = sources.shift();

			if (!source) pack();
			else if (source.match(/\.json$/)) {
				// `source` names a JSON file, assumed to be in `package.json` format. Read it and extract its
				// dependencies. Add them to the `sources`, and then keep on boxing.
				readJson(source, console.log, function(err, obj){
					if (err) return done(err);
					sources = sources.concat(
						listDependencies(obj.dependencies),
						listDependencies(obj.optionalDependencies),
						listDependencies(obj.bundledDependencies));
					next();
				});
			}
			else extractPackageName();
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
				next();
			});
		};

		var rack = function(packageName) {
			// **Note:** The given `packageName` is the same as the `source` for regular packages (that come from the
			// registry), but in other cases (hosted, git, local) the name is instead constructed to refer to the
			// package by its name and version as stored in the cache.
			var flagfile = path.resolve(cache,encodeTarget(packageName));
			fs.writeFileSync(flagfile,packageName);

			npmDependencies(source,options,function(err,deps){
				if (err) return done(err);
				stack(deps);
			});
		};

		var setTarget = function (packageName) {
			target = path.resolve(packageName+".npmbox");
			if (fs.existsSync(target)) {
				return done("An .npmbox file already exists with this name.  Please remove it and try again.");
			}
		};

		var extractPackageName = function() {
			var packageType;
			try {
				packageType = npa(source).type;
			}
			catch(e) {
				return done(e);
			}

			if (packageType==="git" || packageType==="hosted" || packageType==="local") {
				var doingWhat = (packageType==="local") ? "Copying" : "Cloning";
				console.log("  "+doingWhat+" "+source);
				npm.commands.cache.add(source,null,null,false,function(err,packageInfo) {
					if (err) return done(err);
					if (packageInfo && packageInfo.name && packageInfo.version) {
						if (!target) setTarget(path.basename(packageInfo.name));
						// Because we just want to take the package from the cache when unboxing, instead of referring
						// to the original `source` (which might be a local path or network reference), we instead
						// rewrite it in a form that gets explicitly recognized while unboxing.
						rack("file:"+packageInfo.name+"-"+packageInfo.version+".tgz");
					}
					else {
						return done("Package has no name or no version");
					}
				});
			}
			else {
				if (!target) setTarget(npa(source).escapedName);  // escapedName is necessary to support scoped packages
				rack(source);
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
			if (options.proxy) npmoptions.proxy = options.proxy;
			if (options["https-proxy"]) npmoptions["https-proxy"] = options["https-proxy"];

			npmInit(npmoptions,function(err){
				if (err) return done(err);
				next();
			});
		};

		var target = options.target && path.resolve(options.target) || null;
		if (target) setTarget(target);

		var sources = source && source instanceof Array && source || source && [source] || [];

		init();
	};

	// This _just_ unpacks the indicated box into the working cache directory.
	var unpack = function(source,options,callback) {
		if (!fs.existsSync(source)) {
			source = path.resolve(options.path,source+".npmbox");
			if (!fs.existsSync(source)) {
				callback("No .npmbox file found: "+source);
				return;
			}
		}

		if (!options.silent) console.log("  Unpacking "+source+"...");

		// `dirname` to go up one layer because the top level of the box
		// archive is `.npmbox.cache`.
		tarExtract(source,path.dirname(cache),function(err){
			if (err) {
				// var packageName = path.basename(target);
				if (!options.silent) console.log("An error occurred while unpacking "+source+".");
				if (!options.silent) console.log(source+" was not processed.");
				if (options.verbose) console.log(err);
				return callback(err);
			}
			callback();
		});
	};

	// Initialize npm for unboxing operations.
	var npmInitForUnbox = function(options,callback){
		options.cache = cache;
		options.loglevel = options.verbose ? "verbose" : "silent";
		options.progress = false;
		options.color = false;
		options["cache-min"] = 1000 * 365.25 * 24 * 60 * 60; // a thousand years
		options["fetch-retries"] = 0;
		options["fetch-retry-factor"] = 0;
		options["fetch-retry-mintimeout"] = 1;
		options["fetch-retry-maxtimeout"] = 2;

		npmInit(options,callback);
	};

	// This _just_ installs the given package, using whatever cache has been
	// upacked.
	var installPackage = function(target,options,callback) {
		if (!options.silent) console.log("  Installing "+target+"...");

		if (target.match(/^file:/)) {
			// This is a target that was originally included via a local path or network-based name (URL, git ID).
			// Move the cached package out of the cache before installing, because otherwise `npm` will have trouble
			// figuring out what to do. (It doesn't like being asked to install from cache paths.)
			var parts = target.match(/^file:((.+)-(.+)\.tgz)$/);
			var fullName = parts[1];
			var name = parts[2];
			var version = parts[3];
			target = path.resolve(work,fullName);
			fs.renameSync(path.resolve(cache,name,version,"package.tgz"),target);
			target = "file:"+target;
		}

		npmInstall(target,function(err){
			if (err) {
				if (!options.silent) console.log("An error occurred while installing "+target+".");
				if (!options.silent) console.log(target+" was not installed.");
				if (options.verbose) console.log(err);
				return callback(err);
			}
			callback();
		});
	}

	var unbox = function(source,options,callback) {
		var targets = [];
		var target = null;

		var done = function(err) {
			if (!options.silent) console.log("  Done.");
			cleanAll(function(){
				callback(err);
			});
		};

		var next = function(err) {
			if (err) return done(err);

			target = targets.shift();
			if (!target) return done();

			installPackage(target,options,next);
		};

		var getTargets = function() {
			targets = {};

			fs.readdir(cache,function(err,files){
				if (err) return done(err);

				files.filter(function(file){
					return file.match(/\.npmbox$/);
				}).forEach(function(file){
					file = path.basename(file).replace(/\.npmbox$/,"");
					targets[decodeTarget(file)] = true;
				});

				targets = Object.keys(targets);
				if (targets.length === 0) {
					// This is a legacy `.npmbox` file which instead of having embedded flag files just uses the name of
					// the archive file to determine what to install.
					targets = [path.basename(source).replace(/\.npmbox$/,"")];
				}
				next();
			});
		};

		var doUnpack = function(err) {
			if (err) return done(err);
			unpack(source,options,function(err){
				if (err) return done(err);
				getTargets();
			});
		};

		npmInitForUnbox(options,doUnpack);
	};

	// Installs a single package, assuming that the cache has already been
	// set up. This supports the `--install` option to `npmunbox`.
	var install = function(target,options,callback) {
		var done = function(err) {
			if (!options.silent) console.log("  Done.");
			cleanAll(function(){
				callback(err);
			});
		};

		var doInstall = function(err) {
			if (err) return done(err);
			installPackage(target,options,done);
		};

		npmInitForUnbox(options,doInstall);
	};

	var cleanup = function(callback) {
		cleanAll(function(err){
			callback(err);
		});
	};

	module.exports = {
		box: box,
		unbox: unbox,
		unpack: unpack,
		install: install,
		cleanup: cleanup
	};

})();
