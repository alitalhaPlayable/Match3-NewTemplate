var unbrotli = require("./unbrotli");

const getBase122Data = (base122) => {
	if (!base122.startsWith("___base122___")) {
		return base122;
	}
	let src = base122.slice(13);

	const parts = src.split("___");
	const mimeType = parts.shift();
	const encodedData = parts.join("___");

	return encodedData;
};

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

import loadedJs from "!!../../config/webpack/base122-loader!@build/brotli/main.br";

// let rawJs = loadedJs.slice(13);
let rawJs = getBase122Data(loadedJs);

let base122Decode = require("./base122Decode").decode;
rawJs = base122Decode(rawJs);

window._compressedAssets = window._compressedAssets || [];
window._compressedAssets.push(
	decompressString(rawJs).then(function (code) {
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
