/* eslint-disable no-undef */
/* eslint-disable camelcase */
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import commonConfig from "./vite.config.common";
import EnvironmentPlugin from "vite-plugin-environment";
import commonjs from "vite-plugin-commonjs";
import jsccPlugin from "rollup-plugin-jscc";
import { exec } from "child_process";
import base64Plugin from "../base64Plugin";
import { visualizer } from "rollup-plugin-visualizer";
import fs from "fs";

let projectConfig = require("../../../projectConfig.json");
let iosLink = projectConfig.buildSettings.iosLink || "";
let androidLink = projectConfig.buildSettings.androidLink || "";
let hideConsolesOnBuild = projectConfig.buildSettings.hideConsoles ?? true;

try {
	let vars = require("../../../vars");
	iosLink = vars.iosLink || iosLink;
	androidLink = vars.androidLink || androidLink;
	hideConsolesOnBuild = vars.hideConsoles ?? hideConsolesOnBuild;
} catch (e) {
	//
}

process.projConfig = projectConfig;
process.isDEV = false;

let generateBrotli, showAnalyze;

generateBrotli = true;
showAnalyze = !!process.env.npm_config_analyze;
if (process.env.npm_config_hideconsoles) {
	hideConsolesOnBuild = process.env.npm_config_hideconsoles;
}

let pathToHtml = "build/template.html";
let template = ".core/config/templates/template.html";

if (projectConfig.generalSettings.preloader === "rollic") {
	template = ".core/config/templates/template_rollic.html";
	pathToHtml = "build/template_rollic.html";
} else if (projectConfig.generalSettings.preloader === "disney") {
	template = ".core/config/templates/template_disney.html";
	pathToHtml = "build/template_disney.html";
} else if (projectConfig.generalSettings.preloader === "supercell") {
	template = ".core/config/templates/template_supercell.html";
	pathToHtml = "build/template_supercell.html";
}

console.log("Generate Brotli", generateBrotli);
console.log("Show Analyze", showAnalyze);
console.log("Hide Console Messages", hideConsolesOnBuild);

const buildVersions = ["dashboard", "test"];

if (generateBrotli) {
	buildVersions.push("brotli");
}

if (!iosLink || iosLink == "") iosLink = "https://apps.apple.com/";
if (!androidLink || androidLink == "") androidLink = "https://play.google.com";

const buildData = pathToHtml + " " + buildVersions.join(",");

const buildStepPlugin = () => {
	return {
		name: "buildstep-plugin",
		writeBundle() {
			console.log("Building platform");
			exec(`node "./.core/config/build_helpers/platformBuilder.js" ${buildData}`, (err, stdout, stderr) => {
				console.log("");
				console.log("!!!DON'T FORGET CHECKING GAME LINKS!!!");
				console.log("--------------------");
				console.log(`iosLink: ${iosLink}`);
				console.log(`androidLink: ${androidLink}`);
				console.log("--------------------");
				if (stdout) process.stdout.write(stdout);
				if (stderr) process.stderr.write(stderr);
			});
		},
		closeBundle() {
			console.log("Closing bundle");

			// if (!generateBrotli) {
			// 	const fs = require("fs");
			// 	fs.writeFile("./build/step.txt", "1", function (err) {
			// 		if (err) {
			// 			console.error("Error writing to file", err);
			// 		}
			// 	});
			// }
		},
	};
};

const inlineCSSPlugin = () => {
	return {
		name: "vite-plugin-inline-css",
		apply: "build",
		enforce: "post",
		generateBundle(options, bundle) {
			let htmlFileName = Object.keys(bundle).find((fileName) => fileName.includes(template));
			const files = {
				html: [],
				css: [],
				js: [],
				other: [],
			};

			const isHtmlFile = /\.html?$/;
			const isCssFile = /\.css$/;
			const isJsFile = /\.[mc]?js$/;
			for (const i of Object.keys(bundle)) {
				if (isHtmlFile.test(i)) {
					files.html.push(i);
				} else if (isCssFile.test(i)) {
					files.css.push(i);
				} else if (isJsFile.test(i)) {
					files.js.push(i);
				} else {
					files.other.push(i);
				}
			}

			const bundlesToDelete = [];

			const htmlChunk = bundle[htmlFileName];
			let htmlContent = htmlChunk.source;
			htmlContent = htmlContent.replace(/<script type="module"[^>]*><\/script>/, "");

			const cssFileNameMatch = htmlContent.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
			for (const filename of files.css) {
				const cssChunk = bundle[filename].source;
				console.debug(`Inlining: ${filename}`);

				const styleTag = `<style>${cssChunk}</style>`;
				htmlContent = htmlContent.replace(cssFileNameMatch[0], styleTag);

				bundlesToDelete.push(filename);
			}
			htmlChunk.source = htmlContent;
			for (const filename of bundlesToDelete) {
				delete bundle[filename];
			}
		},
	};
};

const plugins = [
	base64Plugin({
		include: [
			"**/*.br",
			"**/*.png",
			"**/*.jpg",
			"**/*.jpeg",
			"**/*.gif",
			"**/*.webp",
			"**/*.gltf",
			"**/*.glb",
			"**/*.mp3",
			"**/*.m4a",
			"**/*.mp4",
			"**/*.ttf",
			"**/*.otf",
			"**/*.woff",
			"**/*.woff2",
			"**/*.atlas",
			"**/*.wasm",
			"**/*.lottie",
		],
	}),
	EnvironmentPlugin({
		CANVAS_RENDERER: true,
		WEBGL_RENDERER: true,
		PRODUCTION: true,
		STUFFS_NAME: "src_empty/index",
	}),
	jsccPlugin(),
	commonjs(),
	createHtmlPlugin({
		minify: false,
		entry: "/src/index.ts",
		template,
		inject: {
			data: {
				iosLink: iosLink,
				androidLink: androidLink,
			},
		},
	}),
	buildStepPlugin(),
	inlineCSSPlugin(),
];

if (showAnalyze) {
	plugins.push(
		visualizer({
			filename: "./build/stats.html", // Path where the stats will be generated
			open: true, // Open the stats file after the build
		})
	);
}

const normalConfig = {
	...commonConfig,
	mode: "production",
	build: {
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: hideConsolesOnBuild, // Hide console logs based on the environment variable
			},
		},
		cssCodeSplit: false,
		emptyOutDir: false,
		cssMinify: false,
		outDir: "./build/",
		rollupOptions: {
			input: "./src/index.ts",
			output: {
				banner: "export {}",
				format: "es",
				manualChunks: false,
				inlineDynamicImports: true,
				entryFileNames: "main.js",
				chunkFileNames: "[name].js",
				assetFileNames: ({ name }) => {
					return "_temp_assets/[name].[hash].[ext]"; // For other assets
				},
			},
		},
	},
	plugins: plugins,
};

export default defineConfig(normalConfig);
