var DEBUG_MODE = true;
var EXTENSION_ID = 'aekcocjibheiolokknkcbmidmcklgmaa';

// prototype 拡張

ArrayBuffer.prototype.getString = function(callback) {
	var blob = new Blob([ this ]),
	    reader = new FileReader();
	
	reader.onload = function(e) {
		callback(e.target.result);
	};
	
	reader.readAsText(blob);
};

String.prototype.getArrayBuffer = function(callback) {
	var blob = new Blob([ this ]),
	    reader = new FileReader();
	
	reader.onload = function(e) {
		callback(e.target.result);
	};
	
	reader.readAsArrayBuffer(blob);
};

// Util

var Util = { };

Util.parseUrl = function(str) {
	var a = document.createElement('a');
	
	a.href = str;
	
	return {
		fullUrl: str,
		protocol: a.protocol,
		host: a.hostname,
		port: a.port || 80,
		query: a.search,
		pathname: a.pathname,
		fullPath: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [undefined ,'/'])[1],
	};
};

Util.log = function() {
	if (DEBUG_MODE) {
		console.log.apply(console, arguments);
	}
};

Util.error = function(str) {
	return function() {
		Util.log(str);
		Util.log.apply(null, arguments);
	}
}