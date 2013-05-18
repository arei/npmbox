/*  npmbox - Glen R. Goodwin (@areinet)
	
	Creates an archive "box" of an npm package and its dependencies.

*/
(function(){
	var box = require("./npmboxxer.js").box;

	var args = process.argv;
	if (args.length>0 && (args[0]==="node" || args[0]==="node.exe")) args.shift();
	if (args.length>0 && /npmbpx\.js$/.test(args[0])) args.shift();
	if (args.length>0 && /npmbox[\/\\]bin[\/\\]npmbox$/.test(args[0])) args.shift();
	if (args.length<1 || args[0].toLowerCase()==="--help") {
		console.log("npmbox - Create an archive for offline installation of the given package.");
		console.log("");
		console.log("npmbox --help");
		console.log("npmbox <package>");
		console.log("npmbox <package> <package>...");
		process.exit(0);
	}

	args.forEach(function(source){
		box(source);
		console.log("");
	});

})();