var SocketAssign = function() {
	this.clientId = -1;
	this.remoteId = -1;
	this.isCompleted = false;
	this.url = null;
	this.remote = {
		contentLength: -1,
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