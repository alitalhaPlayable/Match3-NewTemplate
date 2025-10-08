module.exports = async function yencLoader(source) {
    // Dynamic import for ES module compatibility
    const yenc = await import('simple-yenc');
    
    // Read the file content as buffer
    const buffer = Buffer.from(source);
    
    // Encode the buffer using yEnc
    const encoded = yenc.encode(buffer);
    
    // Add prefix similar to base122 (___yenc___)
    const prefixedEncoded = '___yenc___' + encoded;
    
    // Properly escape the string to avoid octal literals and other issues
    // This is more efficient than base64 encoding
    const escaped = prefixedEncoded
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/"/g, '\\"')    // Escape quotes
        .replace(/\n/g, '\\n')   // Escape newlines
        .replace(/\r/g, '\\r')   // Escape carriage returns
        .replace(/\t/g, '\\t')   // Escape tabs
        .replace(/[\x00-\x1F]/g, function(match) {
            // Escape control characters as hex to avoid octal literals
            return '\\x' + match.charCodeAt(0).toString(16).padStart(2, '0');
        });
    
    // Return the encoded string as a JavaScript module
    return `module.exports = "${escaped}";`;
};
