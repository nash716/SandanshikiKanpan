chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('../browser/window.html', {
		'bounds': {
			'width': 800,
			'height': 480
		}
	});
});

new Proxy().start();