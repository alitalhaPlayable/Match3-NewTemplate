let unbrotli = require("../../../../brotli/unbrotli.js");
unbrotli = unbrotli.default || unbrotli;

function decompress(e, n) {
	return unbrotli(_base64ToArrayBuffer(e));
}

function _base64ToArrayBuffer(e) {
	let decoded = window.atob(e);
	let len = decoded.length;
	let arr = new Uint8Array(len);

	for (let i = 0; i < len; i++) {
		arr[i] = decoded.charCodeAt(i);
	}

	return arr;
}

function decompressString(str) {
	return new Promise(function (resolve, reject) {
		resolve(new TextDecoder("utf-8").decode(decompress(str)));
	});
}

function decompressArrayBuffer(arr) {
	return new Promise(function (resolve, reject) {
		resolve(decompress(arr).buffer);
	});
}

function _arrayBufferToBase64(buffer) {
	let binary = "";
	let bytes = new Uint8Array(buffer);
	let len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

function loadBrotliModel(md, loader, callback) {
	let gltfBr = md.gltf;
	let binBr = md.bin;
	let textures = md.textures;

	gltfBr = gltfBr.slice(13);
	if (binBr) {
		binBr = binBr.slice(13);
	}

	let gltf;
	let bin;

	decompressString(gltfBr).then(function (_gltf) {
		gltf = _gltf;
		modelCompressed();
	});

	if (binBr) {
		decompressArrayBuffer(binBr).then(function (blob) {
			bin = "data:application/octet-stream;base64," + _arrayBufferToBase64(blob);
			modelCompressed();
		});
	} else {
		bin = "none";
		modelCompressed();
	}

	function modelCompressed() {
		if (bin === undefined || gltf === undefined) return;

		if (bin !== "none") {
			gltf = gltf.replace("scene.bin", bin);
		}

		// for (let tex in textures) {
		// 	gltf = gltf.replace(tex, textures[tex]);
		// }
		// for (let tex in textures) {
		// 	let regex = new RegExp(tex.name, "g");
		// 	gltf = gltf.replace(regex, textures[tex]);
		// }

		textures.forEach((tex) => {
			let regex = new RegExp(tex.name, "g");
			gltf = gltf.replace(regex, tex.uri);
		});

		loader.parse(gltf, "", (gltf) => {
			callback(gltf);
		});
	}
}

export { loadBrotliModel };
