var Background = {
	port: null, // proxy <-> background page
	port2: null // background page <-> extension window (window.html)
};

Background.main = function() {
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
		this.port = p;
		
		chrome.windows.create({
			type: 'popup',
			url: '../browser/window.html',
			width: 1100,
			height: 510
		});
		
		this.port.onMessage.addListener(function(message) {
			this.handleMessage(IncomingPort.PORT1, message);
		}.bind(this));
		
		this.port.onDisconnect.addListener(function() {
			this.port2.disconnect();
		}.bind(this));
		
		Kancolle.start(function(proc) {
			for (var i = 0; i < proc.length; i++) {
				this.port2.postMessage(proc[i]);
			}
		}.bind(this));
	}.bind(this));

	chrome.runtime.onConnect.addListener(function(p) {
		this.port2 = p;
		
		this.port2.onMessage.addListener(function(message) {
			this.handleMessage(IncomingPort.PORT2, message);
		}.bind(this));
		
		this.port2.onDisconnect.addListener(function() {
			this.port.disconnect();
		}.bind(this));
	}.bind(this));
}.bind(Background);

Background.handleMessage = function(port, message) {
	if (port == IncomingPort.PORT1) {
		switch (message.event) {
			case 'data':
				var proc = Kancolle.set(message);
				
				for (var i = 0; i < proc.length; i++) {
					this.port2.postMessage(proc[i]);
				}
				break;
			default:
				this.port2.postMessage(message);
				break;
		}
	} else {
		switch (message.event) {
			case 'screenshot':
				this.handleScreenshot(message.value);
				break;
			default:
				break;
		}
	}
}.bind(Background);

Background.handleScreenshot = function(dataUrl) {
	var canvas = document.createElement('canvas');
	
	canvas.width = 800;
	canvas.height = 480;
	
	var context = canvas.getContext('2d');
	
	var image = new Image();
	
	image.src = dataUrl;
	
	image.onload = function() {
		context.drawImage(image, 0, 30, 800, 480, 0, 0, 800, 480);
		
		this.port.postMessage({
			event: 'screenshot',
			value: canvas.toDataURL()
		});
	}.bind(this);
}.bind(Background);

onload = Background.main;