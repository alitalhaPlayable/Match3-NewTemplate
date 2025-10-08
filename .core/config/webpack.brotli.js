/* eslint-disable camelcase */
/* global process __dirname*/

const path = require("path");
const exec = require("child_process").exec;

const appName = "game";

const pathToHtml = "build/htmls/" + appName + "_raw.html";
const buildVersions = ["dashboard", "test"];
const buildData = pathToHtml + " " + buildVersions.join(",");

let projectConfig = require("../../projectConfig.json");

const projectDir = path.resolve(__dirname, "../../");

// Determine which brotli encoding to use
let brotliEntry = "./.core/core/brotli/index.js"; // default base64
const encoding = projectConfig.generalSettings.encoding || "normal";
if (encoding === "base122") {
	brotliEntry = "./.core/core/brotli/index_base122.js";
} else if (encoding === "yEnc") {
	brotliEntry = "./.core/core/brotli/index_yenc.js";
}

const brotliConfig = {
	entry: brotliEntry,

	target: "web", // Specify target environment

	resolve: {
		alias: {
			"@project": path.join(projectDir),
			"@assets": path.join(projectDir, "assets"),
			"@build": path.join(projectDir, "build"),
			"@build_temp": path.join(projectDir, ".temp", "build_temp"),
			"@assets_core": path.join(projectDir, "assets/.core"),

			core: path.join(projectDir, "src", "core"),
			"@src": path.join(projectDir, "src"),
			three: path.join(projectDir, "node_modules/three"),
			"@globals": path.join(projectDir, "src/globals.ts"),
			"@data": path.join(projectDir, "src/params.ts"),
		},
		extensions: [".mjs", ".js", ".json", ".ts"],
	},

	output: {
		path: path.resolve(__dirname, "../../build/brotli"),
		publicPath: "/build/brotli",
		filename: "mainBrotli.js",
		chunkFormat: "array-push", // Specify chunk format explicitly
	},

	plugins: [
		{
			apply: (compiler) => {
				compiler.hooks.afterEmit.tap("AfterEmit", (compilation) => {
					exec('node "./.core/config/build_helpers/brotliBuilder.js" ' + buildData, (err, stdout, stderr) => {
						//filePlugin.checkOptions('onEnd');
						if (stdout) process.stdout.write(stdout);
						if (stderr) process.stderr.write(stderr);
					});
				});
			},
		},
	],

	module: {
		rules: [
			{
				test: [/\.vert$/, /\.frag$/],
				use: "raw-loader",
			},

			{
				test: /\.(br)$/,
				loader: "url-loader",
			},

			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
			},
		],
	},

	resolveLoader: {
		alias: {
			"yenc-loader": path.resolve(__dirname, "loaders/yenc-loader.js"),
		},
	},
};

module.exports = brotliConfig;
