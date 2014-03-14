var proxy, port;

chrome.app.runtime.onLaunched.addListener(function() {
	proxy = new Proxy();
	proxy.start();
	
	port = chrome.runtime.connect(EXTENSION_ID);
});
