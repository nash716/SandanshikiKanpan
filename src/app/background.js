chrome.app.runtime.onLaunched.addListener(function() {
	var proxy = new Proxy().start();
	
	var port = chrome.runtime.connect(EXTENSION_ID);
});
