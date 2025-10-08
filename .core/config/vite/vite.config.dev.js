/* eslint-disable no-undef */
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import commonConfig from "./vite.config.common";
import EnvironmentPlugin from "vite-plugin-environment";
import commonjs from "vite-plugin-commonjs";
import jsccPlugin from "rollup-plugin-jscc";
import base64Plugin from "../base64Plugin";

let projectConfig = require("../../../projectConfig.json");

process.projConfig = projectConfig;
process.isDEV = true;

const args = process.argv.slice(2);
const platformArg = args.find((arg) => arg.startsWith("--platform="));
const platform = platformArg ? platformArg.split("=")[1] : undefined;
const isGearboxTest = platform === "gearbox";

if (isGearboxTest) {
	process.isDEV = false;
	process.isGearbox = true;
}

let template = "./.core/config/runtime_templates/index.html";

if (isGearboxTest) {
	template = "./.core/config/runtime_templates/index_gearbox.html";
} else if (projectConfig.generalSettings.preloader === "rollic") {
	template = "./.core/config/runtime_templates/index_rollic.html";
} else if (projectConfig.generalSettings.preloader === "disney") {
	template = "./.core/config/runtime_templates/index_disney.html";
} else if (projectConfig.generalSettings.preloader === "supercell") {
	template = "./.core/config/runtime_templates/index_supercell.html";
}

const plugins = [
	base64Plugin({
		include: ["**/*.br", "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.webp", "**/*.gltf", "**/*.mp3", "**/*.m4a", "**/*.mp4", "**/*.atlas", "**/*.wasm", "**/*.lottie"],
	}),
	EnvironmentPlugin({
		CANVAS_RENDERER: true,
		WEBGL_RENDERER: true,
		PRODUCTION: false,
		STUFFS_NAME: "src/index",
	}),
	createHtmlPlugin({
		template,
		minify: false,
	}),
	jsccPlugin(),
	commonjs(),
];

export default defineConfig({
	...commonConfig,
	mode: "development",
	server: {
		host: true,
		open: false,
		port: 8008,
	},

	optimizeDeps: {
		include: ["three", "pixi.js"],
		esbuildOptions: {
			target: "es2022",
		},
	},
	build: {
		cssCodeSplit: true,
		target: "es2022",
		commonjsOptions: {
			transformMixedEsModules: true,
		},
	},
	plugins: plugins,
});
