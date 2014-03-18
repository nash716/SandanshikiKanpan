// bind 地獄へようこそ

var ProxyCallbacks = {
	server: { },
	tcp: { 
		remote: { },
		local: { }
	}
};

ProxyCallbacks.server.create = function(createInfo) {
	Util.log('[Proxy] Creating server...');
	
	this.serverSocketId = createInfo.socketId;
	
	chrome.sockets.tcpServer.listen(this.serverSocketId, '127.0.0.1', 8549, ProxyCallbacks.server.listen.bind(this));
};

ProxyCallbacks.server.listen = function(result) {
	Util.log('[Proxy] Listening...');
	
	if (result < 0) {
		throw new Error();
	}
	
	chrome.sockets.tcpServer.setPaused(this.serverSocketId, false);
};

ProxyCallbacks.server.onAccept = function(info) {
	// リクエストが来た！！！！！
	Util.log('[Proxy] Request coming...');
	
	var assign = new SocketAssign();
	assign.clientId = info.clientSocketId;
	this.socketAssign[info.clientSocketId] = assign;
	
	chrome.sockets.tcp.setPaused(info.clientSocketId, false);
};

ProxyCallbacks.tcp.onReceiveError = function(info) {
	// TODO
	Util.log('[Proxy] Receive Error!!!');
	
	var flag = false, // false: Data from local, true: Data from remote
	    clientId = -1;
	
	for (var key in this.socketAssign) {
		if (this.socketAssign[key].remoteId == info.socketId) {
			flag = true;
			clientId = this.socketAssign[key].clientId;
			break;
		}
	}
	
	if (!this.socketAssign[key].isCompleted) {
		ProxyCallbacks.tcp.remote.checkData.bind(this)(flag ? clientId : info.socketId, true);
	}
};

ProxyCallbacks.tcp.onReceive = function(info) {
	Util.log('[Proxy] Data Received!');
	
	var flag = false, // false: Data from local, true: Data from remote
	    clientId = -1;
	
	for (var key in this.socketAssign) {
		if (this.socketAssign[key].remoteId == info.socketId) {
			flag = true;
			clientId = this.socketAssign[key].clientId;
			break;
		}
	}
	
	if (flag) {
		ProxyCallbacks.tcp.remote.process.bind(this)(info, clientId);
	} else {
		ProxyCallbacks.tcp.local.process.bind(this)(info);
	}
};

ProxyCallbacks.tcp.remote.process = function(info, clientId) {
	Util.log('[Proxy] Data was came from REMOTE!');
	
	this.socketAssign[clientId].remote.data.push(new Data(new Date() * 1, info.data));
	
	chrome.sockets.tcp.send(clientId, info.data, function(sendInfo) {
		// TODO error code
		this.socketAssign[clientId].remote.bytesSent += sendInfo.bytesSent;
		Util.log('[REMOTE] Content-Length: %d, bytesSent: %d', this.socketAssign[clientId].remote.contentLength, this.socketAssign[clientId].remote.bytesSent);
		
		ProxyCallbacks.tcp.remote.checkData.bind(this)(clientId);
	}.bind(this));
	
	info.data.slice(0, 100).getString(function(text) { // 受信したデータが HTTP ヘッダの最初だった！！！！ときの処理
		if (text.indexOf('HTTP/1.') == 0) {
			info.data.getString(function(text) {
				var headers = text.split('\r\n');
				
				for (var i = 0; i < headers.length; i++) {
					if (headers[i].indexOf('Content-Length') == 0) {
						//this.socketAssign[clientId].remote.bytesSent -= info.data.byteLength;
						this.socketAssign[clientId].remote.contentLength = parseInt(headers[i].split(' ')[1]) || -1;
						
						this.socketAssign[clientId].trigger('response-parsed', [ clientId ]);
					}
				}
			}.bind(this));
		}
		
		var lines = text.split('\r\n');
		
		if (parseInt(lines[0], 16).toString(16).length == lines[0].length) { // 最初の行が16進数だった！（Content-Length）
			this.socketAssign[clientId].remote.contentLength = parseInt(lines[0], 16);
			this.socketAssign[clientId].trigger('response-parsed', [ clientId ]);
		}
	}.bind(this));
	
	// TODO
	Util.log(this.socketAssign[clientId].url.fullPath);
};

ProxyCallbacks.tcp.remote.checkData = function(clientId, disconnected) {
	if (disconnected || (this.socketAssign[clientId].remote.contentLength != -1 && this.socketAssign[clientId].remote.bytesSent >= this.socketAssign[clientId].remote.contentLength)) {
		// リモートからのデータをローカルに正常に送り終わった
		// データが必要な時は煮るなり焼くなりする　必要ないときはとっとと消去
		// どちらにせよソケットは閉じてあげましょう
		
		Util.log('[Proxy] COMPLETED!!');
		
		this.socketAssign[clientId].isCompleted = true;
		
		this.trigger(this.socketAssign[clientId].url.fullPath, [ clientId ]);
	}
}

ProxyCallbacks.tcp.local.process = function(info) {
	Util.log('[Proxy] Data was came from LOCAL!');
	
	if (this.socketAssign[info.socketId].getListeners('client-data').length == 0) {
		this.socketAssign[info.socketId].on('client-data', ProxyCallbacks.tcp.remote.send.bind(this));
	}
	
	info.data.getString(function(text) {
		var headers = text.split('\r\n');
		
		var firstLine = headers[0];
		
		if (firstLine.indexOf('GET') == 0 || firstLine.indexOf('POST') == 0 || firstLine.indexOf('HEAD') == 0) {
			var url = firstLine.split(' ')[1];
			
			var parsedUrl = Util.parseUrl(url);
			
			this.socketAssign[info.socketId].url = parsedUrl;
			
			var params = firstLine.split(' ');
			params[1] = parsedUrl.fullPath;
			headers[0] = params.join(' ');
			
			for (var i = 0; i < headers.length; i++) {
				if (headers[i].indexOf('Proxy-Connection') == 0) {
					headers[i] = headers[i].replace('Proxy-Connection', 'Connection');
				} else if (headers[i].indexOf('Content-Length') == 0) {
					this.socketAssign[info.socketId].client.contentLength = parseInt(headers[i].split(' ')[1]) || -1;
				}
			}
			
			headers.join('\r\n').getArrayBuffer(function(arraybuffer) {
				this.socketAssign[info.socketId].data = arraybuffer;
				
				chrome.sockets.tcp.create({}, function(createInfo) {
					ProxyCallbacks.tcp.remote.create.bind(this)(createInfo, info.socketId, arraybuffer);
				}.bind(this));
			}.bind(this));
		} else {
			this.socketAssign[info.socketId].client.data.push(new Data(new Date() * 1, info.data));
		}
	}.bind(this));
};

ProxyCallbacks.tcp.remote.create = function(createInfo, clientId, data) {
	Util.log('[Proxy] Creating TCP Connection...');
	
	var assign = this.socketAssign[clientId];
	
	assign.remoteId = createInfo.socketId;
	
	assign.on('response-parsed', ProxyCallbacks.tcp.remote.checkData.bind(this));
	
	chrome.sockets.tcp.connect(createInfo.socketId, assign.url.host, assign.url.port, function(result) {
		ProxyCallbacks.tcp.remote.connect.bind(this)(result, clientId, data);
	}.bind(this));
};

ProxyCallbacks.tcp.remote.connect = function(result, clientId, data) {
	Util.log('[Proxy] Connecting to REMOTE!');
	
	if (result < 0) {
		throw new Error();
	}
	
	chrome.sockets.tcp.send(this.socketAssign[clientId].remoteId, data, function(sendInfo) {
		//this.socketAssign[clientId].data = null;
		//TODO error code
		
		this.socketAssign[clientId].trigger('client-data', [ clientId ]);
	}.bind(this));
	chrome.sockets.tcp.setPaused(this.socketAssign[clientId].remoteId, false);
};

ProxyCallbacks.tcp.remote.send = function(clientId) {
	Util.log('[Proxy][DATA] Sending data to REMOTE!');
	
	for (var i = 0; i < this.socketAssign[clientId].client.data.length; i++) {
		chrome.sockets.tcp.send(this.socketAssign[clientId].remoteId, this.socketAssign[clientId].client.data[i].value, function(sendInfo) {
			// TODO error code
			this.socketAssign[clientId].client.bytesSent += sendInfo.bytesSent;
			Util.log('Content-Length: %d, bytesSent: %d', this.socketAssign[clientId].client.contentLength, this.socketAssign[clientId].client.bytesSent);
			
			if (this.socketAssign[clientId].client.contentLength == this.socketAssign[clientId].client.bytesSent) {
				// ローカルから来たリクエストをリモートに正常に送り終わった
				// POST データが必要な時は煮るなり焼くなりする　必要ないときはとっとと消去
				
			}
		}.bind(this));
	}
}