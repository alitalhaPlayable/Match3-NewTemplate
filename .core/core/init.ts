import Manager from "core/libs/common/manager";
import globals from "@globals";
import { MainConfig } from "core/libs/common/general/networks";
import AudioManager from "core/libs/common/general/audios/audios";

import startVideo from "core/startupVidPlayer";
import Core from "core/core";
import { getCustomAssets2D, getCustomAssets3D, getCustomAudios, getCustomFonts } from "@src/assets";

let data = globals.data as any;

// #if process.isDEV
require(`@assets_core/stuffs_code/index.js`);
data = window.jsStuffs.processResults(data);
// #endif

// #if process.isGearbox
import dashboardParams from "../dashboardParams.json";
window.dashboardParams = dashboardParams;
// #endif

// #if !process.isDEV
if (data.isEditor) {
	if (window.jsStuffs) {
		data = window.jsStuffs.processResults(data);
	}
}
// #endif

if (window.dashboardParams) {
	for (let prop in window.dashboardParams) {
		if (window.dashboardParams[prop] !== undefined && window.dashboardParams[prop] !== null) {
			data[prop] = window.dashboardParams[prop];
		}
	}
}

// refill stuffsLoadList
for (let listName in data.stuffsLoadList) {
	const list = data.stuffsLoadList[listName];

	for (let prop in list) {
		list[prop] = data.__stuffsUniqueList[list[prop]];
	}
}

export class Studio {
	static readyCallback: () => void;

	static init(callback: () => void) {
		this.readyCallback = callback;
		// Initialize the studio environment
		const config: MainConfig = {
			enableCustomPreloader: false,
			gamePaused: () => {
				AudioManager.muteAll();
			},
			gameContinue: () => {
				if (app?.main?.soundEnabled) {
					AudioManager.unmuteAll();
				}
			},
			gameResized: (w, h) => {
				core.resize(w, h);
			},
			soundChanged: (soundEnabled: boolean) => {
				if (soundEnabled) {
					AudioManager.unmuteAll();
				} else {
					AudioManager.muteAll();
				}

				globals.eventEmitter.emit("soundChanged", soundEnabled);
			},
		};

		let core: Core;
		const initGame = () => {
			if (!document.body) {
				setTimeout(() => {
					initGame();
				}, 1);
				return;
			}
			core = new Core(
				config,
				// custom assets
				{
					assets2D: getCustomAssets2D(data),
					assets3D: getCustomAssets3D(data),
					audios: getCustomAudios(data),
					fonts: getCustomFonts(data),
				},
				// ready callback
				() => {
					const initCore = () => {
						core.preInit();
						this.readyCallback();
						core.init();
					};
					if (globals.data.entranceVideo) {
						startVideo(globals.data.entranceVideo, () => {
							initCore();
						});
					} else {
						initCore();
					}
				}
			);

			app.main = Manager.main;
		};

		if (data.isEditor) {
			window.pfSetData = (editorData: any) => {
				// set data from editor
				data.editorData = editorData;

				initGame();
			};

			window.pfGetData = () => {
				return data.editorData;
			};

			// #if process.isDEV
			window.pfSetData(data.editorData);
			// #endif
		} else {
			initGame();
		}
	}
}
