var Browser = {
	port: null,
	forceExit: false
};

Browser.main = function() {
	// ウィンドウが開いたとき、表示領域が各プラットフォームの枠の分だけ狭くなっているのでぴったりにする
	
	var nextWidth = 1100 + (1100 - window.innerWidth),
	    nextHeight = 510 + (510 - window.innerHeight);
	
	window.resizeTo(nextWidth, nextHeight);
	
	// tipsy
	
	$('#header > div').tipsy({ gravity: 'w' });
	$('.quest-tooltip').tipsy({ gravity: 'e' });
	$('.kanmusu-tooltip').tipsy({ gravity: 'e', html: true });
	$('#kantai2').tipsy({ gravity: 'e', html: true });
	$('#kantai3').tipsy({ gravity: 'e', html: true });
	$('#kantai4').tipsy({ gravity: 'e', html: true });
	
	// click
	
	$('#screenshot').click(this.takeScreenshot);
	$('#reload').click(this.reload);
	
	// background page と通信
	
	this.port = chrome.runtime.connect();
	
	this.port.onMessage.addListener(function(message) {
		switch(message.event) {
			case 'change':
				this.setValue(message);
				break;
			default:
				break;
		}
	}.bind(this));
	
	this.port.onDisconnect.addListener(function() {
		window.alert('問題が発生しました。三段式甲板を終了します。');
		this.forceExit = true;
		window.close();
	}.bind(this));
}.bind(Browser);

Browser.setValue = function(message) {
	switch(message.type) {
		case 'label':
			$('#' + message.target).text(message.value);
			break;
		case 'color':
			$('#' + message.target).css('background-color', message.value);
			break;
		case 'width':
			$('#' + message.target).css('width', message.value + 'px');
			break;
		case 'tooltip':
			$('#' + message.target).attr('original-title', message.value);
		default:
			break;
	}
}.bind(Browser);

Browser.takeScreenshot = function() {
	chrome.tabs.captureVisibleTab({
		format: 'png'
	}, function(dataUrl) {
		this.port.postMessage({
			event: 'screenshot',
			value: dataUrl
		});
	}.bind(this));
}.bind(Browser);

Browser.reload = function() {
	if (confirm('本当にリロードしますか？')) $('iframe').get(0).src = $('iframe').get(0).src;
}.bind(Browser);

Browser.unload = function() {
	return this.forceExit ? undefined : 'この画面を閉じると艦これが終了されます。';
}.bind(Browser);

onload = Browser.main;
onbeforeunload = Browser.unload;