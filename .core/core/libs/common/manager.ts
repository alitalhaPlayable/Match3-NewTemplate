import { getCustomFonts } from "@src/assets";
import FontHandler from "./general/fonts";
import TemplateMain, { MainConfig } from "./general/networks";
import { setGlobalFont } from "./editorGlobals";

interface FontAssets {
	[key: string]: string;
}

const data: {
	assets: {
		font: FontAssets;
	};
	scenes: any[];
	objectMap: {
		font: {
			[key: string]: string;
		};
	};
} = require("@assets_core/templateDataGeneral.json");

// #if !process.isDEV
let generalAssets = require("@build_temp/generalAssets.js");
generalAssets = generalAssets.default || generalAssets;
const fontList = generalAssets.filter((asset: any) => asset.type === "font");

for (let prop in data.assets.font) {
	if (!data.assets.font.hasOwnProperty(prop)) continue;
	const fontInList = fontList.find((f: any) => f.key === prop);
	if (fontInList) {
		data.assets.font[prop] = fontInList.src;
	}
}
// #endif

class Manager {
	static main: TemplateMain;

	static async init(_config: MainConfig) {
		const promises: Promise<void>[] = [];
		const fontList = { ...data.assets.font, ...getCustomFonts(app.data) };
		if (app.data.__globalFont) {
			fontList["__globalFont"] = app.data.__globalFont;
			setGlobalFont("__globalFont");
		}

		promises.push(FontHandler.loadFonts(fontList, data.objectMap.font));
		promises.push(this.initMain(_config));
		await Promise.all(promises);
	}

	static async initMain(_config: MainConfig) {
		return new Promise<void>(async (resolve) => {
			const config: MainConfig = {
				..._config,
				networkReady: () => {
					resolve();
				},
			};
			const main = new TemplateMain(config);
			this.main = main;
		});
	}

	static resizeNow() {
		this.main.resizeNow();
	}

	static gameInited() {
		this.main.gameInited();
	}

	static gameStarted() {
		this.main.gameStarted();
	}
}

export default Manager;
