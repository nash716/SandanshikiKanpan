onload = main;

function main() {
	document.getElementById('select-folder').onclick = function() {
		chrome.fileSystem.chooseEntry({
			type: 'openDirectory',
			accepts: [
				{ extensions: [ 'png' ] }
			]
		}, function(entry) {
			chrome.storage.local.set({
				retainId: chrome.fileSystem.retainEntry(entry)
			}, function() {
				window.callback();
				window.close();
			});
		});
	};
}