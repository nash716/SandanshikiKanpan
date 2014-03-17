// このファイル汚いけど許して

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
	
	port.onMessage.addListener(function(message) {
		console.log(message);
		switch(message.event) {
			case 'screenshot':
				saveScreenshot(message.value);
				break;
			default:
				break;
		}
	});
});

function saveScreenshot(dataUrl) {
	var filename = 'kancolle-' +
		(function() {
			var date = new Date(),
			    ret = '';
			
			ret += date.getFullYear() + '-';
			ret += ('0' + (date.getMonth() + 1)).slice(-2) + '-';
			ret += ('0' + date.getDate()).slice(-2) + '-';
			ret += ('0' + date.getHours()).slice(-2) + '-';
			ret += ('0' + date.getMinutes()).slice(-2) + '-';
			ret += ('0' + date.getSeconds()).slice(-2) + '-';
			ret += ('00' + date.getMilliseconds()).slice(-3);
			
			return ret;
		})() + '.png'
	
	chrome.storage.local.get('retainId', function(items) {
		chrome.fileSystem.isRestorable(items.retainId || '', function(tf) {
			if (tf) {
				makeBlob(filename, dataUrl);
			} else {
				chrome.app.window.create('filesystem/chooser.html', {
					bounds: {
						width: 400,
						height: 200
					}
				}, function(appWindow) {
					appWindow.contentWindow.callback = function() {
						makeBlob(filename, dataUrl);
					};
				});
			}
		});
	});
}

function makeBlob(filename, dataUrl) {
    var arr = dataUrl.split(',');
    
    var data = atob(arr[1]),
	    mime = arr[0].split(':')[1].split(';')[0];

	var u8array = new Uint8Array(data.length);
	
	for (var i = 0; i < data.length; i++) {
		u8array[i] = data.charCodeAt(i);
	}
	
	saveFile(filename, new Blob([ u8array ], { type: mime }));
}

function saveFile(filename, blob) {
	chrome.storage.local.get('retainId', function(items) {
		chrome.fileSystem.restoreEntry(items.retainId, function(entry) {
			entry.getFile(filename, { create: true }, function(fileEntry) {
				fileEntry.createWriter(function(fileWriter) {
					fileWriter.onwriteend = function(e) {
						/* TODO */
					};
					
					fileWriter.onerror = function(e) {
						/* TODO error handling */
					};
					
					fileWriter.write(blob);
				}, function() { /* TODO error handling */ });
			});
		});
	});
}