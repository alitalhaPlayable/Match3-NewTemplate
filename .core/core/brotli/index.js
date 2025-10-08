window._pfTimeDebug && window._pfTimeDebug("brotli started");
const unbrotli = require("./unbrotli");

function decompress(e, n) {
	return unbrotli(_base64ToArrayBuffer(e));
}

function _base64ToArrayBuffer(e) {
	for (var n = window.atob(e), r = n.length, o = new Uint8Array(r), t = 0; t < r; t++) o[t] = n.charCodeAt(t);
	return o;
}

function decompressString(r) {
	return new Promise(function (e, n) {
		e(new TextDecoder("utf-8").decode(decompress(r)));
	});
}

let rawJs = require("@build/brotli/main.br");
rawJs = rawJs.default || rawJs;
rawJs = rawJs.slice(13);

//var rawJs = require('!!url-loader!../br/luna.br');

window._compressedAssets = window._compressedAssets || [];
window._compressedAssets.push(
	decompressString(rawJs).then(function (code) {
		window._pfTimeDebug && window._pfTimeDebug("brotli ended");
		window.eval(code);
		window._pfTimeDebug && window._pfTimeDebug("eval run (eval is evil)");
	})
);

function callStart() {
	if (!window.app || !window.app.callOnLoad) {
		setTimeout(callStart, 100);
		return;
	}

	window._pfTimeDebug && window._pfTimeDebug("start called from brotli");
	app.callOnLoad();
}

window.addEventListener("DOMContentLoaded", function () {
	callStart();
});
setTimeout(() => {
	callStart();
}, 1000);
