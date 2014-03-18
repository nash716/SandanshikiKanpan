var Proxy = function() {
	this.socketAssign = { };
	this.serverSocketId = -1;
	this.isRunning = false;
};

heir.inherit(Proxy, EventEmitter);

Proxy.prototype.start = function() {
	if (this.isRunning) return;
	
	Util.log('[Proxy] Initializing...');
	
	chrome.sockets.tcpServer.create({}, ProxyCallbacks.server.create.bind(this));
	
	chrome.sockets.tcpServer.onAccept.addListener(ProxyCallbacks.server.onAccept.bind(this));
	
	chrome.sockets.tcp.onReceiveError.addListener(ProxyCallbacks.tcp.onReceiveError.bind(this));
	chrome.sockets.tcp.onReceive.addListener(ProxyCallbacks.tcp.onReceive.bind(this));
	
	this.isRunning = true;
};

Proxy.prototype.stop = function() {
	if (!this.isRunning) return;
	
	chrome.sockets.tcpServer.onAccept.removeListener(ProxyCallbacks.server.onAccept.bind(this));
	chrome.sockets.tcpServer.disconnect(this.serverSocketId);
	
	for (var key in this.socketAssign) {
		this.socketAssign[key].destroy();
	}
	
	this.serverSocketId = -1;
	this.socketAssign = { };
	this.isRunning = false;
};
