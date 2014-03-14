var Proxy = function() {
	this.socketAssign = { };
	this.serverSocketId = -1;
};

heir.inherit(Proxy, EventEmitter);

Proxy.prototype.start = function() {
	Util.log('[Proxy] Initializing...');
	
	chrome.sockets.tcpServer.create({}, ProxyCallbacks.server.create.bind(this));
	
	chrome.sockets.tcpServer.onAccept.addListener(ProxyCallbacks.server.onAccept.bind(this));
	
	chrome.sockets.tcp.onReceiveError.addListener(ProxyCallbacks.tcp.onReceiveError.bind(this));
	chrome.sockets.tcp.onReceive.addListener(ProxyCallbacks.tcp.onReceive.bind(this));
};

Proxy.prototype.stop = function() {
	// TODO
};
