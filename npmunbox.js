/*  npmunbox - Glen R. Goodwin (@areinet)
	
	Extracts an .npmbox file and installs the contained package.

*/
(function(){
	var unbox = require("./npmboxxer.js").unbox;

	var args = process.argv;
	if (args.length>0 && (args[0]==="node" || args[0]==="node.exe")) args.shift();
	if (args.length>0 && /npmunbox\.js$/.test(args[0])) args.shift();
	if (args.length>0 && /npmbox[\/\\]bin[\/\\]npmunbox$/.test(args[0])) args.shift();
	if (args.length<1 || args[0].toLowerCase()==="--help") {
		console.log("npmunbox - Extracts an .npmbox file and installs the contained package.");
		console.log("");
		console.log("npmunbox --help");
		console.log("npmunbox <npmbox-file>");
		console.log("npmunbox <npmbox-file> <npmbox-file>...");
		process.exit(0);
	}

	args.forEach(function(source){
		unbox(source);
		console.log("");
	});
	
})();