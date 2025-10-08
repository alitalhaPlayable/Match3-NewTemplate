/* eslint-disable complexity */
import { createFilter } from "vite";
import fs from "fs";
import { Buffer } from "buffer";
import path from "path";
const base122 = require("./vite/base122");

// Using base122 encoder from external module

function base64Plugin(options = {}) {
	const filter = createFilter(options.include, options.exclude);

	// Load project configuration to check encoding setting
	let projectConfig;
	try {
		projectConfig = require("../../projectConfig.json");
	} catch (e) {
		projectConfig = { generalSettings: { encoding: "normal" } };
	}

	const useBase122 = projectConfig.generalSettings?.encoding === "base122";

	return {
		name: "base64-plugin",
		async transform(code, id) {
			if (!filter(id)) return;

			const extname = path.extname(id).toLowerCase();
			if (extname === ".br") {
				const filePath = path.resolve(id);

				if (useBase122) {
					const fileBuffer = fs.readFileSync(filePath);
					let encoded = Buffer.from(base122.encode(fileBuffer), "utf8");
					const mimeType = ""; // Brotli files don't have a specific MIME type
					let final = "___base122___" + mimeType + "___" + encoded.toString("utf-8");
					return `export default "${final}";`;
				} else {
					// Use base64 encoding
					const fileContent = fs.readFileSync(filePath, {
						encoding: "base64",
					});
					const mimeType = ""; // Adjust the MIME type as needed

					// Debug: Log base64 size for comparison
					console.log(`Base64 Debug - File: ${path.basename(filePath)}`);
					console.log(`  Original size: ${fs.readFileSync(filePath).length} bytes`);
					console.log(`  Base64 size: ${fileContent.length} chars`);
					console.log(`  Final JS size: ${fileContent.length + 30} chars (with data: prefix)`);

					return `export default "data:${mimeType};base64,${fileContent}";`;
				}
			} else if (extname === ".png" || extname === ".jpg" || extname === ".jpeg" || extname === ".gif" || extname === ".webp") {
				const filePath = path.resolve(id);

				if (useBase122) {
					const fileBuffer = fs.readFileSync(filePath);
					let encoded = Buffer.from(base122.encode(fileBuffer), "utf8");
					const mimeType =
						extname === ".png" ? "image/png" : extname === ".jpg" || extname === ".jpeg" ? "image/jpeg" : extname === ".gif" ? "image/gif" : extname === ".webp" ? "image/webp" : "";
					let final = "___base122___" + mimeType + "___" + encoded.toString("utf-8");
					return `export default "${final}";`;
				} else {
					// Use base64 encoding
					const fileContent = fs.readFileSync(filePath, {
						encoding: "base64",
					});
					const mimeType =
						extname === ".png" ? "image/png" : extname === ".jpg" || extname === ".jpeg" ? "image/jpeg" : extname === ".gif" ? "image/gif" : extname === ".webp" ? "image/webp" : ""; // Adjust the MIME type as needed
					return `export default "data:${mimeType};base64,${fileContent}";`;
				}
			} else if (extname === ".mp3" || extname === ".m4a") {
				const filePath = path.resolve(id);

				if (useBase122) {
					const fileBuffer = fs.readFileSync(filePath);
					let encoded = Buffer.from(base122.encode(fileBuffer), "utf8");
					const mimeType = extname === ".mp3" ? "audio/mpeg" : extname === ".m4a" ? "audio/mp4" : "";
					let final = "___base122___" + mimeType + "___" + encoded.toString("utf-8");
					return `export default "${final}";`;
				} else {
					// Use base64 encoding
					const fileContent = fs.readFileSync(filePath, {
						encoding: "base64",
					});
					const mimeType = extname === ".mp3" ? "audio/mpeg" : extname === ".m4a" ? "audio/mp4" : ""; // Adjust the MIME type as needed
					return `export default "data:${mimeType};base64,${fileContent}";`;
				}
			} else if (extname === ".glb") {
				const filePath = path.resolve(id);

				if (useBase122) {
					const fileBuffer = fs.readFileSync(filePath);
					let encoded = Buffer.from(base122.encode(fileBuffer), "utf8");
					const mimeType = "model/gltf-binary";
					let final = "___base122___" + mimeType + "___" + encoded.toString("utf-8");
					return `export default "${final}";`;
				} else {
					// Use base64 encoding
					const fileContent = fs.readFileSync(filePath, {
						encoding: "base64",
					});
					const mimeType = "model/gltf-binary";
					return `export default "data:${mimeType};base64,${fileContent}";`;
				}
			} else if (extname === ".ttf" || extname === ".otf" || extname === ".woff" || extname === ".woff2") {
				const filePath = path.resolve(id);

				if (useBase122) {
					const fileBuffer = fs.readFileSync(filePath);
					let encoded = Buffer.from(base122.encode(fileBuffer), "utf8");
					const mimeType = extname === ".ttf" ? "font/ttf" : extname === ".otf" ? "font/otf" : extname === ".woff" ? "font/woff" : extname === ".woff2" ? "font/woff2" : "";
					let final = "___base122___" + mimeType + "___" + encoded.toString("utf-8");
					return `export default "${final}";`;
				} else {
					// Use base64 encoding
					const fileContent = fs.readFileSync(filePath, {
						encoding: "base64",
					});
					const mimeType = extname === ".ttf" ? "font/ttf" : extname === ".otf" ? "font/otf" : extname === ".woff" ? "font/woff" : extname === ".woff2" ? "font/woff2" : ""; // Adjust the MIME type as needed
					return `export default "data:${mimeType};base64,${fileContent}";`;
				}
			} else if (extname === ".gltf") {
				const filePath = path.resolve(id);
				const fileContent = fs.readFileSync(filePath, "utf-8");
				let data = JSON.parse(fileContent);
				if (data.buffers) {
					const buffers = data.buffers;
					for (let i = 0; i < buffers.length; i++) {
						const buffer = buffers[i];
						const bufferFilePath = path.resolve(path.dirname(filePath), buffer.uri);
						const bufferFileContent = fs.readFileSync(bufferFilePath, {
							encoding: "base64",
						});
						buffer.uri = `data:application/octet-stream;base64,${bufferFileContent}`;
					}
				}

				if (data.images) {
					const images = data.images;
					for (let i = 0; i < images.length; i++) {
						const image = images[i];
						const imageFilePath = path.resolve(path.dirname(filePath), image.uri);
						const imageFileContent = fs.readFileSync(imageFilePath, {
							encoding: "base64",
						});
						image.uri = `data:image/png;base64,${imageFileContent}`;
					}
				}
				data = JSON.stringify(data);
				return `export default ${JSON.stringify(data)}`;
			} else if (extname === ".mp4") {
				const filePath = path.resolve(id);

				if (useBase122) {
					const fileBuffer = fs.readFileSync(filePath);
					let encoded = Buffer.from(base122.encode(fileBuffer), "utf8");
					const mimeType = "video/mp4";
					let final = "___base122___" + mimeType + "___" + encoded.toString("utf-8");
					return `export default "${final}";`;
				} else {
					// Use base64 encoding
					const fileContent = fs.readFileSync(filePath, {
						encoding: "base64",
					});
					const mimeType = "video/mp4";
					return `export default "data:${mimeType};base64,${fileContent}";`;
				}
			} else if (extname === ".atlas") {
				const filePath = path.resolve(id);
				const fileContent = fs.readFileSync(filePath, "utf-8");
				return "export default `" + fileContent + "`";
			} else if (extname === ".wasm") {
				const filePath = path.resolve(id);

				if (useBase122) {
					const fileBuffer = fs.readFileSync(filePath);
					let encoded = Buffer.from(base122.encode(fileBuffer), "utf8");
					const mimeType = "application/wasm";
					let final = "___base122___" + mimeType + "___" + encoded.toString("utf-8");
					return `export default "${final}";`;
				} else {
					// Use base64 encoding
					const fileContent = fs.readFileSync(filePath, {
						encoding: "base64",
					});
					const mimeType = "application/wasm";
					return `export default "data:${mimeType};base64,${fileContent}";`;
				}
			} else if (extname === ".lottie") {
				const filePath = path.resolve(id);

				if (useBase122) {
					const fileBuffer = fs.readFileSync(filePath);
					let encoded = Buffer.from(base122.encode(fileBuffer), "utf8");
					const mimeType = "application/json";
					let final = "___base122___" + mimeType + "___" + encoded.toString("utf-8");
					return `export default "${final}";`;
				} else {
					// Use base64 encoding
					const fileData = fs.readFileSync(filePath);
					const base64Data = Buffer.from(fileData).toString("base64");
					const mimeType = "application/zip";
					return `export default "data:${mimeType};base64,${base64Data}";`;
				}
			}
		},
	};
}

export default base64Plugin;
