/* eslint-disable no-undef */
"use strict";

const webpack = require("webpack");
const path = require("path");

// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

// const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');

// const FileManagerPlugin = require('filemanager-webpack-plugin');
//const prod = process.argv.indexOf('-p') !== -1;

///check for the -p
// var isProduction = process.argv.indexOf("-p") !== -1;
/*

var debugPlugins=[
        new webpack.DefinePlugin({
            'CANVAS_RENDERER': JSON.stringify(true),
            'WEBGL_RENDERER': JSON.stringify(true)
        }),
        new ExtractTextPlugin({filename: 'style.css'})
];

*/

const projectDir = path.resolve(__dirname, "../../");
const base122LoaderPath = path.join(__dirname, "webpack", "base122-loader");

let projectConfig = require("../../projectConfig.json");
process.projConfig = projectConfig;

let useBase122 = projectConfig.generalSettings.encoding === "base122";
useBase122 = false;

module.exports = {
	entry: "./assets/.core/stuffs_code/index.js",
	mode: "development",
	target: "web", // Specify target environment
	//entry: './src/jsStuffs.js',

	resolve: {
		alias: {
			"@assets": path.join(projectDir, "assets"),
			"@build": path.join(projectDir, "build"),
			"@temp": path.join(projectDir, ".temp"),
			"@src": path.join(projectDir, "src"),
			"base122-loader": base122LoaderPath,
		},
		modules: [
			path.join(__dirname, "webpack"),
			"node_modules"
		],
	},

	output: {
		path: path.resolve(__dirname, "../../build"),
		publicPath: "/build/",
		filename: "stuffs.js",
		chunkFormat: "array-push", // Specify chunk format explicitly
		//filename: 'stuffs.js'
	},

	devServer: {
		open: true,
		static: path.join(__dirname, "../../stuffs"),
	},

	module: {
		rules: [
			{
				test: [/\.vert$/, /\.frag$/],
				use: "raw-loader",
			},
			{
				test: /\.(png|mp3|jpg|jpeg|m4a|ttf|otf|gif|mp4|woff2)$/,
				exclude: /models/,
				use: useBase122 ? [{ loader: base122LoaderPath }] : [{ loader: "url-loader" }],
			},

			{
				test: /\.(zip|br|fbx|glb)$/,
				//exclude: /models/,
				//loader: 'url-loader',
				use: useBase122 ? [{ loader: base122LoaderPath }] : [{ loader: "url-loader", options: { esModule: false } }],
			},

			{
				test: /\.(atlas)$/,
				loader: "raw-loader",
			},

			// GLTF configuration: add this to rules
			{
				// match all .gltf files
				test: /\.(gltf)$/,
				loader: "gltf-loader-2",
			},
			{
				// here I match only IMAGE and BIN files under the gltf folder
				test: /models.*\.(bin|png|jpg|jpeg|gif)$/,
				// or use url-loader if you would like to embed images in the source gltf
				use: useBase122 ? [{ loader: base122LoaderPath }] : [{ loader: "url-loader" }],
			},

			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},

			// { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ["babel-loader", "webpack-conditional-loader"],
			},
		],
	},
};
