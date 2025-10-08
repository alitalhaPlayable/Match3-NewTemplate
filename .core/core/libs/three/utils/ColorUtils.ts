export function hexToRgba(hexInput: string, range: number = 1, type: "object" | "array" = "object") {
	// Remove the hash at the start if it's there
	const hex = hexInput.replace(/^#/, "");

	// Parse the r, g, b values
	let r;
	let g;
	let b;
	let a = 255; // Default alpha value is 255 (fully opaque)

	if (hex.length === 6) {
		// If it's a 6-character hex code (without alpha)
		r = parseInt(hex.substring(0, 2), 16);
		g = parseInt(hex.substring(2, 4), 16);
		b = parseInt(hex.substring(4, 6), 16);
	} else if (hex.length === 8) {
		// If it's an 8-character hex code (with alpha)
		r = parseInt(hex.substring(0, 2), 16);
		g = parseInt(hex.substring(2, 4), 16);
		b = parseInt(hex.substring(4, 6), 16);
		a = parseInt(hex.substring(6, 8), 16);
	} else {
		throw new Error("Invalid hex color format");
	}

	// Scale the values based on the range parameter
	const scale = (value: number) => Math.round((value / 255) * range);

	if (type === "array") {
		return [scale(r), scale(g), scale(b), scale(a)];
	}

	return {
		r: scale(r),
		g: scale(g),
		b: scale(b),
		a: scale(a),
	};
}
