var port, port2; // port: proxy <-> background page, port2: background page <-> extension window (window.html)

var config = {
	mode: 'pac_script',
	pacScript: {
		data: 'function FindProxyForURL(url, host) {\n' +
		      '  var regexp = /\\/kcsapi\\/api_/;' +
		      '  if (regexp.test(url)) {\n' +
		      '    return "PROXY localhost:8549";\n' +
		      '  }' +
		      '  return "DIRECT";\n' +
		      '}'
	}
};

chrome.proxy.settings.set({
	value: config,
	scope: 'regular'
}, function() {});

chrome.runtime.onConnectExternal.addListener(function(p) {
	port = p;
	
	chrome.windows.create({
		type: 'popup',
		url: '../browser/window.html',
		width: 1100,
		height: 480
	});
	
	port.onMessage.addListener(function(message) {
		if (message.event == 'data') {
			Kancolle.set(message);
			return;
		}
		port2.postMessage(message);
	});
});

chrome.runtime.onConnect.addListener(function(p) {
	port2 = p;
});