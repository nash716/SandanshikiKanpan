var proxy, port;

chrome.app.runtime.onLaunched.addListener(function() {
	proxy = new Proxy();
	proxy.start();
	
	for (var i = 0; i < Constants.HOOK_URL.length; i++) {
		proxy.on(Constants.HOOK_URL[i], function(clientId) {
			if (this.socketAssign[clientId].isPosted) return;
			
			var dataArr = [ ];
			
			for (var j = 0; j < this.socketAssign[clientId].remote.data.length; j++) {
				dataArr.push(this.socketAssign[clientId].remote.data[j].value);
			}
			
			var blob = new Blob(dataArr),
			    reader = new FileReader();
			
			reader.onload = function(e) {
				var json = e.target.result.split('\r\n\r\n')[1];
				
				//if (!this.socketAssign[clientId].remote.contentLengthByHeader && this.socketAssign[clientId].remote.contentLength != -1) {
				if (json.split('\r\n').length > 2) {
					json = json.split('\r\n')[1];
				}
				
				port.postMessage({
					event: 'data',
					path: this.socketAssign[clientId].url.fullPath,
					json: JSON.parse(json.substring('svdata='.length))
				});
				
				this.socketAssign[clientId].isPosted = true;
			}.bind(this);
			
			reader.readAsText(blob);
		}.bind(proxy));
	}
	
	port = chrome.runtime.connect(EXTENSION_ID);
});
