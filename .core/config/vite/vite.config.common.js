/* eslint-disable no-undef */
import { defineConfig } from "vite";
import path from "path";

const projectDir = path.resolve(__dirname, "../../../");
console.log(projectDir);

export default defineConfig({
	root: projectDir,
	resolve: {
		alias: {
			"@project": path.join(projectDir),
			"@assets": path.join(projectDir, "assets"),
			"@build": path.join(projectDir, "build"),
			"@build_temp": path.join(projectDir, ".temp", "build_temp"),
			"@assets_core": path.join(projectDir, "assets/.core"),
			"@temp": path.join(projectDir, ".temp"),

			core: path.join(projectDir, ".core", "core"),
			"@src": path.join(projectDir, "src"),
			three: path.join(projectDir, "node_modules/three"),
			"@globals": path.join(projectDir, "src/globals.ts"),
			"@data": path.join(projectDir, "src/params.ts"),
			"@physics3d": path.join(projectDir, ".core/core/libs/three/utils/physics"),
			utils2D: path.join(projectDir, ".core/utils/utils2D-impl.ts"),
			utils3D: path.join(projectDir, ".core/utils/utils3D-impl.ts"),
			utils: path.join(projectDir, ".core/utils/utils-impl.ts"),
		},
		extensions: [".mjs", ".js", ".json", ".ts"],
	},
	/* optimizeDeps: {
		include: ["three", "pixi.js"],
	}, */
	assetsInclude: [
		"**/*.efk",
		"**/*.wasm",
		"**/*.vert",
		"**/*.frag",
		"**/*.atlas",
		"**/*.xml",
		"**/*.scene",
		"**/*.prefab",
		"**/*.png",
		"**/*.webp",
		"**/*.mp3",
		"**/*.jpg",
		"**/*.jpeg",
		"**/*.m4a",
		"**/*.ttf",
		"**/*.otf",
		"**/*.woff",
		"**/*.woff2",
		"**/*.gif",
		"**/*.svg",
		"**/*.mp4",
		"**/*.ogg",
		"**/*.zip",
		"**/*.br",
		"**/*.fbx",
		"**/*.glb",
		"**/*.hdr",
		"**/*.gltf",
		"**/*.bin",
		"**/*.lottie",
	],
});
