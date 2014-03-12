var config = {
	mode: 'pac_script',
	pacScript: {
		data: 'function FindProxyForURL(url, host) {\n' +
		      '  var regexp = /\\/kcsapi\\/api_/;' +
		      '  if (regexp.test(url)) {\n' +
		      '    return "PROXY localhost:8549";\n' +
		      '  }' +
		      '  return "DIRECT";\n' +
		      '}'
	}
};

chrome.proxy.settings.set({
	value: config,
	scope: 'regular'
}, function() {});