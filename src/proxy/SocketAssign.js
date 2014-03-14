var SocketAssign = function() {
	this.clientId = -1;
	this.remoteId = -1;
	this.isCompleted = false;
	this.url = null;
	this.remote = {
		contentLength: -1,
		bytesSent: 0,
		data: [ ]
	};
	this.client = {
		contentLength: -1,
		bytesSent: 0,
		data: [ ]
	};
};

heir.inherit(SocketAssign, EventEmitter);