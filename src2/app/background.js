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
			if (message.event == 'data') {
				var proc = Kancolle.set(message);
				
				for (var i = 0; i < proc.length; i++) {
					this.port2.postMessage(proc[i]);
				}
				return;
			}
			this.port2.postMessage(message);
		}.bind(this));
		
		Kancolle.start(function(proc) {
			for (var i = 0; i < proc.length; i++) {
				this.port2.postMessage(proc[i]);
			}
		}.bind(this));
	}.bind(this));
}.bind(Background);

onload = Background.main;