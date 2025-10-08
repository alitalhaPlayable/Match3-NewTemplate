class base122Helper {
	static decodeToBase64(strData) {
		if (strData.startsWith("___base122___")) {
			strData = strData.slice(13);
		}

		var kIllegals = [
				0, // null
				10, // newline
				13, // carriage return
				34, // double quote
				38, // ampersand
				92, // backslash
			],
			kShortened = 0b111, // Uses the illegal index to signify the last two-byte char encodes <= 7 bits.
			// 1.75 = 14 / 8, which is the worse case amount of encoded data per char.
			decoded = new Uint8Array((1.75 * strData.length) | 0), // | 0 is a terse way to round down
			decodedIndex = 0,
			curByte = 0,
			bitOfByte = 0;
		function push7(byte) {
			byte <<= 1;
			// Align this byte to offset for current byte.
			curByte |= byte >>> bitOfByte;
			bitOfByte += 7;
			if (bitOfByte >= 8) {
				decoded[decodedIndex++] = curByte;
				bitOfByte -= 8;
				// Now, take the remainder, left shift by what has been taken.
				curByte = (byte << (7 - bitOfByte)) & 255;
			}
		}
		for (var i = 0; i < strData.length; i++) {
			var c = strData.charCodeAt(i);
			// Check if this is a two-byte character.
			if (c > 127) {
				// Note, the charCodeAt will give the codePoint, thus
				// 0b110xxxxx 0b10yyyyyy will give => xxxxxyyyyyy
				var illegalIndex = (c >>> 8) & 7; // 7 = 0b111.
				// We have to first check if this is a shortened two-byte character, i.e. if it only
				// encodes <= 7 bits.
				if (illegalIndex != kShortened) push7(kIllegals[illegalIndex]);
				// Always push the rest.
				push7(c & 127);
			} else {
				// One byte characters can be pushed directly.
				push7(c);
			}
		}

		// Flush remaining bits
		if (bitOfByte > 0) {
			decoded[decodedIndex++] = curByte;
		}

		function _arrayBufferToBase64(buffer) {
			var binary = "";
			var bytes = new Uint8Array(buffer);
			var len = bytes.byteLength;
			for (var i = 0; i < len; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			return window.btoa(binary);
		}

		// Create a properly sized buffer with only the decoded data
		var finalDecoded = new Uint8Array(decodedIndex);
		for (var i = 0; i < decodedIndex; i++) {
			finalDecoded[i] = decoded[i];
		}

		var b64 = _arrayBufferToBase64(finalDecoded.buffer);
		return b64;
	}

	static decode(str, mimetype) {
		let b64 = this.decodeToBase64(str);
		let src = "data:" + mimetype + ";base64," + b64;

		return src;
	}
}

export default base122Helper;
