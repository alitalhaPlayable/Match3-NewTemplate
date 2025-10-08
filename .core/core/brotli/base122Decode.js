// A base-122 decoder meant to run inside an HTML page on page load.
//
// To use, copy the decode.min.js file in a <script> tag inside the encoded HTML page. To minify the
// decoder again (if changes are made), use uglifyjs, or use the command provided in this package:
// npm run-script minify

    // Given an HTML element with a data-b122 (and optional data-b122m) attribute, sets the src
    // to a blob URL of the represented data.
    function decode(strData, mime = 'image/jpeg') {
        
        var kIllegals = [
            0 // null
            , 10 // newline                
            , 13 // carriage return
            , 34 // double quote
            , 38 // ampersand
            , 92 // backslash
        ]
        // 1.75 = 14 / 8, which is the worse case amount of encoded data per char.
        , decoded = new Uint8Array(1.75 * strData.length | 0) // | 0 is a terse way to round down
        , decodedIndex = 0
        , curByte = 0
        , bitOfByte = 0
        ;

        function push7(byte) {
            byte <<= 1;
            // Align this byte to offset for current byte.
            curByte |= (byte >>> bitOfByte);
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
                if (illegalIndex != 7) push7(kIllegals[illegalIndex]);
                // Always push the rest.
                push7(c & 127);
            } else {
                // One byte characters can be pushed directly.
                push7(c);
            }
        }
        
        
        // Convert Uint8Array to base64 using browser-compatible method
        function _arrayBufferToBase64(buffer) {
            var binary = "";
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }
        
        var b64 = _arrayBufferToBase64(decoded.buffer);
        return b64;
        
    }

    export {decode};