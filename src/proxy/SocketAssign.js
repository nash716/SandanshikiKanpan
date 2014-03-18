var SocketAssign = function() {
	this.clientId = -1;
	this.remoteId = -1;
	this.isCompleted = false;
	this.isProcessing = false;
	this.url = null;
	this.remote = {
		contentLength: -1,
		contentLengthByHeader: false,
		bytesSent: 0,
		data: [ ] // （今のところ）HTTP ヘッダを含めたすべてのデータが入ってる
	};
	this.client = {
		contentLength: -1,
		bytesSent: 0,
		data: [ ] // （今のところ）POST データだけが入ってる
	};
};

heir.inherit(SocketAssign, EventEmitter);

SocketAssign.prototype.destroy = function() {
	chrome.sockets.tcp.disconnect(this.clientId);
	chrome.sockets.tcp.disconnect(this.remoteId);
	
	for (var i = 0; i < this.remote.data.length; i++) {
		this.remote.data[i].value = null;
	}
	
	for (var i = 0; i < this.client.data.length; i++) {
		this.client.data[i].value = null;
	}
};
