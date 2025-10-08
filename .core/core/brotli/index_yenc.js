var unbrotli = require("./unbrotli");

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

import loadedJs from "!!yenc-loader!@build/brotli/main.br";

let rawJs = loadedJs;

let yencDecode = require("./yencDecode").decode;

window._compressedAssets = window._compressedAssets || [];
window._compressedAssets.push(
	yencDecode(rawJs).then(function (base64Data) {
		return decompressString(base64Data);
	}).then(function (code) {
		console.log(code);
		window.eval(code);
	})
);

function callStart() {
	if (!window.app || !window.app.callOnLoad) {
		setTimeout(callStart, 100);
		return;
	}

	app.callOnLoad();
}

window.addEventListener("load", function () {
	callStart();
});
