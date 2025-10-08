// A yEnc decoder for brotli compressed files
// Uses simple-yenc library for decoding

async function decode(escapedString) {
    try {
        // Dynamic import for ES module compatibility
        const yenc = await import('simple-yenc');
        
        // The string is already properly escaped by the loader, so we can use it directly
        // Remove the prefix (___yenc___)
        const encodedData = escapedString.slice(10); // Remove "___yenc___"
        
        // Decode yEnc data to get the original binary data
        const decodedData = yenc.decode(encodedData);
        
        // Convert to base64 for compatibility with existing brotli decompression
        function _arrayBufferToBase64(buffer) {
            var binary = "";
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }
        
        return _arrayBufferToBase64(decodedData.buffer);
    } catch (error) {
        console.error('yEnc decode error:', error);
        throw error;
    }
}

export {decode};
