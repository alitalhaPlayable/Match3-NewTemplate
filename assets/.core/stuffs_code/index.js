import "./style.css";
import { processBuckets } from "@src/buckets";
const jsStuffs = {};

///do not change/remove between these 2 comments below!!!!
/*START STUFFS IMPORTS*/const stuffsItems = {};const optionalAssets = {};/*END STUFFS IMPORTS*/

// const boxSrc = require("@assets/ui/box.png")
// const musicSrc = require("@assets/sounds/music.m4a");
// const sfxSrc = require("@assets/sounds/output.m4a");
// const sfxJson = require("@assets/sounds/output.json");

// const videoSrc = require("@assets/2d/video.mp4");

jsStuffs.processResults = function (results) {
	results = processBuckets(results);

	const stuffsLoadList = {
		image: {},
		animation: {},
		spine: {},
		lottie: {},
		video: {},
		gltf: {},
		brotliGltf: {},
		texture: {},
	};
	results.stuffsLoadList = stuffsLoadList;
	results.__stuffsExportMap = {};
	results.__optionalAssets = {
		image: {},
		animation: {},
		spine: {},
		model: {},
	};
	
	function pushToStuffsList(item, value, exportCodeName) {
		if (item.type === "none") return;
		stuffsLoadList[item.type][item.id] = item.src;
		if (exportCodeName) {
			results.__stuffsExportMap[exportCodeName] = item.id;
		}
		
		if (item.type === "image" && item.importAsTexture3D) {
			stuffsLoadList.texture[item.id] = item.src;
		}
	}
	if(results.musicSrc?.custom){
		let anyCustomMusic = false;
		Object.values(results.musicSrc).forEach((item) => {
			if(item.enable && item.src){
				anyCustomMusic = true;
			}
		});
		if(!anyCustomMusic){
			results.musicSrc = null;
		}
	}
	///do not change/remove between these 2 comments!!!!
	/*START STUFFS*/
const AudioPool = {
  "audioSprite": {
        id: "audioSprite",
        key: "audioSprite",
        type: "audioSprite",
        src: require("@assets/.core/audio/audio-sprite/audio-sprite-compressed.m4a"),
        json: require("@assets/.core/audio/audio-sprite/audio-sprite.json"),
    },
};
        // #if process.projConfig.generalSettings.enableAudio
        if(results.soundEnabled || results.soundEnabled === undefined) {
            results.___audioData = AudioPool;
        }
        // #endif
        
/*END STUFFS*/
	////you can change below
	// pushToStuffsList({
	// 	id: "75ffeb12-062b-46eb-96c1-319cb54deb75",
	// 	src: stuffsItems["75ffeb12-062b-46eb-96c1-319cb54deb75"][0],
	// 	type: "image",
	// })

	// results["75ffeb12-062b-46eb-96c1-319cb54deb75_" + (results["test"] || 0)] = stuffsItems["75ffeb12-062b-46eb-96c1-319cb54deb75"][results["test"] || 0];
	// stuffsLoadList.push(stuffsItems["75ffeb12-062b-46eb-96c1-319cb54deb75"][results["test"] || 0]);

	// if (results.soundEnabled) {
	// 	if (!results.musicSrc) {
	// 		results.musicSrc = musicSrc;
	// 	}
	// 	results.sfxSrc = sfxSrc;
	// 	results.sfxJson = sfxJson;
	// } else {
	// 	results.musicSrc = null;
	// 	results.sfxSrc = null;
	// 	results.sfxJson = null;
	// }

	// if(!results.videoSrc) {
	// 	results.videoSrc = videoSrc;
	// }

	let removeDefaults = (results) => {
		if (!results) return;

		for (let _res in results) {
			if (_res === "jsonPath") {
				continue;
			}
			let res = results[_res];
			if (!res) continue;

			if (typeof res === "object") {
				if (res.default) {
					results[_res] = res.default;
				} else {
					removeDefaults(res);
				}
			}
		}
	};

	removeDefaults(results);

	// Get unique stuffs list
	const stuffsUniqueList = [];
	for (let listName in stuffsLoadList) {
		const list = stuffsLoadList[listName];

		for (let key in list) {
			const val = list[key];
			const matchIndex = stuffsUniqueList.findIndex((item) => {
				return JSON.stringify(item) === JSON.stringify(val);
			});

			if (matchIndex === -1) {
				stuffsUniqueList.push(val);
				list[key] = stuffsUniqueList.length - 1;
			} else {
				list[key] = matchIndex;
				console.log(`Duplicate found at index: ${matchIndex}`);
			}
		}
	}

	results.__stuffsUniqueList = stuffsUniqueList;

	return results;
};

window.jsStuffs = jsStuffs;

jsStuffs.initDefault = "prepareBoard";

jsStuffs.prepareBoard = function (list, images) {
	images = images || {};

	// WRITE YOUR DEFAULT DATA HERE
	let defaultData = {
		size: 8,
		boardData: [
			[
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
			],
			[
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
			],
			[
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
			],
			[
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
			],
			[
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
			],
			[
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
			],
			[
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
			],
			[
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
				{
					type: 0,
					level: {
						name: "Base",
					},
					angle: 0,
					blockLevel: 0,
				},
			],
		],
	};
	if (window.editData) {
		defaultData = editData.editorData;
	}

	//console.log(defaultData);

	let mainDiv = document.getElementById(list.divId);

	let iframeReady;

	let iframe = document.createElement("iframe");

	iframe.style.width = "100%";
	iframe.style.height = "600px";
	let ver = Math.floor(Math.random() * 1000000);
	let aa = images["editor.html"] || "editor.html";
	let src = aa + "?ver=" + ver;
	iframe.src = src;

	mainDiv.appendChild(iframe);

	///document.getElementById("preview-device-screen")?.contentWindow.dashboardParams;

	iframe.onload = () => {
		let checkSetData = () => {
			if (iframe.contentWindow.window.pfSetData) {
				iframeReady = true;
				iframe.contentWindow.window.pfSetData(defaultData);
				return;
			}

			setTimeout(() => {
				checkSetData();
			}, 250);
		};

		checkSetData();
	};

	list.returnValue = function () {
		if (iframeReady) {
			try {
				return iframe.contentWindow.window.pfGetData();
			} catch (error) {
				return defaultData;
			}
		}

		return defaultData;
	};
};

jsStuffs.prepareBoardFullScreen = function (list, images) {
	images = images || {};

	// WRITE YOUR DEFAULT DATA HERE
	let defaultData = {};

	if (window.editData) {
		defaultData = editData.editorData;
	}

	let mainDiv = document.getElementById(list.divId);

	const showBtn = document.createElement("button");
	showBtn.innerHTML = "Show Editor";
	mainDiv.appendChild(showBtn);

	showBtn.style.padding = "10px 20px";
	showBtn.style.backgroundColor = "#4CAF50";
	showBtn.style.color = "white";
	showBtn.style.border = "none";
	showBtn.style.borderRadius = "5px";
	showBtn.style.cursor = "pointer";
	showBtn.style.fontSize = "16px";

	let cover = document.createElement("div");
	cover.className = "amaze-board-cover";
	mainDiv.appendChild(cover);

	let div = document.createElement("div");
	div.className = "amaze-board";
	mainDiv.appendChild(div);

	const closeBtn = document.createElement("button");
	closeBtn.className = "amaze-close-btn";
	closeBtn.innerHTML = "X";
	div.appendChild(closeBtn);

	showBtn.onclick = function () {
		div.style.top = "0";
		div.style.opacity = 1;
		cover.style.opacity = 1;

		div.style.visibility = "visible";
		cover.style.visibility = "visible";
		iframe.style.opacity = 1;
		iframe.style.visibility = "visible";
	};

	closeBtn.onclick = function () {
		div.style.top = "-100%";
		div.style.opacity = 0;
		cover.style.opacity = 0;
		div.style.visibility = "hidden";
		cover.style.visibility = "hidden";
		iframe.style.opacity = 0;
		iframe.style.visibility = "hidden";
	};

	let iframe = document.createElement("iframe");
	// let src = "shortcut_cam.html";
	let ver = Math.floor(Math.random() * 1000000);

	let aa = images["editor.html"] || "editor.html";
	let src = aa + "?ver=" + ver;
	iframe.src = src;
	iframe.style.width = "100%";
	iframe.style.maxWidth = "1200px";
	iframe.style.height = "85vh";
	iframe.style.opacity = 0;
	iframe.style.visibility = "hidden";
	iframe.style.margin = "auto";

	div.appendChild(iframe);
	let iframeReady;

	iframe.onload = () => {
		let checkSetData = () => {
			if (iframe.contentWindow.window.pfSetData) {
				iframeReady = true;
				iframe.contentWindow.window.pfSetData(defaultData);
				return;
			}

			setTimeout(() => {
				checkSetData();
			}, 250);
		};

		checkSetData();
	};

	list.returnValue = function () {
		if (iframeReady) {
			try {
				return iframe.contentWindow.window.pfGetData();
			} catch (error) {
				return defaultData;
			}
		}

		return defaultData;
	};
};

jsStuffs.preparePresets = function (list, results) {
	let holderDiv = document.getElementById(list.divId);

	let addButton = (name, data) => {
		let button = document.createElement("button");
		button.innerHTML = name;
		holderDiv.appendChild(button);

		button.onclick = () => {
			for (let id in data) {
				let value = data[id];

				window.dispatchEvent(new CustomEvent("gb_game_update", { detail: { nonce: Date.now(), id: id, value: value } }));
				document.getElementById("preview-device-screen")?.contentWindow?.dispatchEvent(new CustomEvent("pf_" + id, { detail: { nonce: Date.now(), id: id, value: value } }));
			}
		};
	};

	addButton("Top Down", {
		camRotation: -90,
		camElevation: 25,
		camDist: -5,
		portraitFOV: 53,
		landscapeFOV: 48,
	});

	// let button0 = document.createElement('button');
	// button0.innerHTML = 'Top Down';
	// holderDiv.appendChild(button0);

	// button0.onclick = () => {
	// 	window.dispatchEvent(new CustomEvent("gb_game_update", { detail: {nonce: Date.now(), id: "camRotation", value: -90}}))
	// 	window.dispatchEvent(new CustomEvent("gb_game_update", { detail: {nonce: Date.now(), id: "camElevation", value: 25}}))
	// 	window.dispatchEvent(new CustomEvent("gb_game_update", { detail: {nonce: Date.now(), id: "camDist", value: -5}}))
	// 	window.dispatchEvent(new CustomEvent("gb_game_update", { detail: {nonce: Date.now(), id: "portraitFOV", value: 53}}));
	// 	window.dispatchEvent(new CustomEvent("gb_game_update", { detail: {nonce: Date.now(), id: "landscapeFOV", value: 48}}));

	// 	document.getElementById("preview-device-screen")?.contentWindow?.dispatchEvent(new CustomEvent("pf_camRotation", { detail: {nonce: Date.now(), id: "camRotation", value: -90}}));
	// 	document.getElementById("preview-device-screen")?.contentWindow?.dispatchEvent(new CustomEvent("pf_camElevation", { detail: {nonce: Date.now(), id: "camElevation", value: 25}}));
	// 	document.getElementById("preview-device-screen")?.contentWindow?.dispatchEvent(new CustomEvent("pf_camDist", { detail: {nonce: Date.now(), id: "camDist", value: -5}}));
	// 	document.getElementById("preview-device-screen")?.contentWindow?.dispatchEvent(new CustomEvent("pf_portraitFOV", { detail: {nonce: Date.now(), id: "camDist", value: 53}}));
	// 	document.getElementById("preview-device-screen")?.contentWindow?.dispatchEvent(new CustomEvent("pf_landscapeFOV", { detail: {nonce: Date.now(), id: "camDist", value: 48}}));
	// }

	list.returnValue = function () {
		return "asd";
	};
};

window.forceRefreshed = false;
