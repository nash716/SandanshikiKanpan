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
	
	chrome.sockets.tcp.send(clientId, info.data, Util.error('[Proxy] Sent data to LOCAL!'));
	
	// TODO
	Util.log(this.socketAssign[clientId].url.fullPath);
};

ProxyCallbacks.tcp.local.process = function(info) {
	Util.log('[Proxy] Data was came from LOCAL!');
	
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
				}
			}
			
			headers.join('\r\n').getArrayBuffer(function(arraybuffer) {
				this.socketAssign[info.socketId].data = arraybuffer;
				
				chrome.sockets.tcp.create({}, function(createInfo) {
					ProxyCallbacks.tcp.remote.create.bind(this)(createInfo, info.socketId);
				}.bind(this));
			}.bind(this));
		} else {
			// TODO: setTimeout はお粗末なのでそのうちどうにかする
			setTimeout(function() {
				chrome.sockets.tcp.send(this.socketAssign[info.socketId].remoteId, info.data, Util.error('[Proxy][POST] Sent data to REMOTE!'));
				chrome.sockets.tcp.setPaused(this.socketAssign[info.socketId].remoteId, false);
			}.bind(this), 100);
		}
	}.bind(this));
};

ProxyCallbacks.tcp.remote.create = function(createInfo, clientId) {
	Util.log('[Proxy] Creating TCP Connection...');
	
	var assign = this.socketAssign[clientId];
	
	assign.remoteId = createInfo.socketId;
	
	chrome.sockets.tcp.connect(createInfo.socketId, assign.url.host, assign.url.port, function(result) {
		ProxyCallbacks.tcp.remote.connect.bind(this)(result, clientId);
	}.bind(this));
};

ProxyCallbacks.tcp.remote.connect = function(result, clientId) {
	Util.log('[Proxy] Connecting to REMOTE!');
	
	if (result < 0) {
		throw new Error();
	}
	
	chrome.sockets.tcp.send(this.socketAssign[clientId].remoteId, this.socketAssign[clientId].data, function(sendInfo) {
		//this.socketAssign[clientId].data = null;
	}.bind(this));
	chrome.sockets.tcp.setPaused(this.socketAssign[clientId].remoteId, false);
};