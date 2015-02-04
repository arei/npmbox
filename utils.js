// npmbox by Glen R. Goodwin (@areinet)
// https://github.com/arei/npmbox.git

// Utility code for npmbox/npmunbox

"use strict";

var is = require("is");

var toArray = function(a) {
	return Array.prototype.slice.call(a);
};
module.exports.toArray = toArray;

var flatten = function(a) {
	if (!is.array(a)) return a;
	a = a && is.array(a) && a.reduce(function(a,x){
		return a.concat(flatten(x));
	},[]);
	return a;
};
module.exports.flatten = flatten;


