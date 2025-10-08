type AssetType = "image" | "animation" | "spine" | "lottie" | "video";

interface ImageAssets {
	[key: string]: string;
}

interface LottieAssets {
	[key: string]: string;
}

interface VideoAssets {
	[key: string]: string;
}

interface AnimationAssets {
	[key: string]: {
		imagePath: string;
		jsonPath: string;
	};
}

interface SpineAssets {
	[key: string]: {
		imagePath: string;
		atlasPath: string;
		jsonPath: string;
	};
}

interface Prefab {
	id: string;
	name: string;
	exportId: string;
	root: any;
}

export interface UploadableImage {
	path: string;
	uploadId: string;
	assetId: string;
}

const data: {
	assets: {
		image: ImageAssets;
		animation: AnimationAssets;
		spine: SpineAssets;
		lottie: LottieAssets;
		video: VideoAssets;
		uploadableImages: UploadableImage[];
		uploadableVideos?: UploadableImage[];
	};
	scenes: any[];
	objectMap: {
		image: {
			[key: string]: string;
		};
		animation: {
			[key: string]: string;
		};
		spine: {
			[key: string]: string;
		};
		lottie: {
			[key: string]: string;
		};
		video: {
			[key: string]: string;
		};
	};
	prefabs: Prefab[];
} = require("@assets_core/templateData2D.json");

const generalData: {
	assets: {
		font: {
			[key: string]: string;
		};
	};
	objectMap: {
		font: {
			[key: string]: string;
		};
	};
} = require("@assets_core/templateDataGeneral.json");

let assetsToLoad: any[] = [];

function addToLoadList(imageList: ImageAssets, animationList: AnimationAssets, spineList: SpineAssets, lottieList: LottieAssets, videoList: VideoAssets) {
	for (let prop in imageList) {
		if (!imageList.hasOwnProperty(prop)) continue;
		if (!imageList[prop]) continue;
		assetsToLoad.push({
			type: "image",
			key: prop,
			src: imageList[prop],
		});
	}

	for (let prop in animationList) {
		if (!animationList.hasOwnProperty(prop)) continue;
		if (!animationList[prop]) continue;
		const { imagePath, jsonPath } = animationList[prop];
		assetsToLoad.push({
			type: "spritesheet",
			key: prop,
			src: imagePath,
			json: jsonPath,
		});
	}

	for (let prop in spineList) {
		if (!spineList.hasOwnProperty(prop)) continue;
		if (!spineList[prop]) continue;
		const { imagePath, jsonPath, atlasPath } = spineList[prop];
		assetsToLoad.push({
			type: "spine",
			key: prop,
			src: imagePath,
			json: jsonPath,
			atlas: atlasPath,
		});
	}

	if (lottieList) {
		for (let prop in lottieList) {
			if (!lottieList.hasOwnProperty(prop)) continue;
			if (!lottieList[prop]) continue;
			assetsToLoad.push({
				type: "lottie",
				key: prop,
				src: lottieList[prop],
			});
		}
	}

	if (videoList) {
		for (let prop in videoList) {
			if (!videoList.hasOwnProperty(prop)) continue;
			if (!videoList[prop]) continue;
			assetsToLoad.push({
				type: "video",
				key: prop,
				src: videoList[prop],
			});
		}
	}
}

// #if !process.isDEV
let assets2D = require("@build_temp/assets2D.js");
assets2D = assets2D.default || assets2D;
assets2D.forEach((asset: any) => {
	if (asset.type === "spine" || asset.type === "spritesheet" || asset.type === "atlas") {
		asset.json = JSON.parse(asset.json);
	}
});
assetsToLoad.push(...assets2D);

let generalAssets = require("@build_temp/generalAssets.js");
generalAssets = generalAssets.default || generalAssets;
generalAssets.forEach((asset: any) => {
	if (asset.type === "font") {
		assetsToLoad.push(asset);
	}
});
// #endif

// #if process.isDEV
addToLoadList(data.assets.image, data.assets.animation, data.assets.spine, data.assets.lottie, data.assets.video);

const fonts = generalData?.assets?.font || {};
for (let prop in fonts) {
	if (!fonts.hasOwnProperty(prop)) continue;
	if (!fonts[prop]) continue;
	assetsToLoad.push({
		type: "font",
		key: prop,
		src: fonts[prop],
	});
}
// #endif

class Data2D {
	static assets: any;

	static addStuffsAssets() {
		// add uploadable assets
		if (data.assets && data.assets.uploadableImages) {
			data.assets.uploadableImages.forEach((imageData) => {
				const imageId = imageData?.uploadId || imageData;
				const src = window.app.data[imageId as string];
				const key = "___uploaded_" + imageId;
				if (src) {
					assetsToLoad.push({
						type: "image",
						key,
						src,
					});
				}
			});
		}

		// add uploadable videos
		if (data.assets && data.assets.uploadableVideos) {
			data.assets.uploadableVideos.forEach((videoData) => {
				const videoId = (videoData as any)?.uploadId || (videoData as any);
				const src = (window as any).app.data[videoId as string];
				const key = "___uploaded_" + videoId;
				if (src) {
					assetsToLoad.push({
						type: "video",
						key,
						src,
					});
				}
			});
		}

		// add stuffs assets
		if (window.app && window.app.data.stuffsLoadList) {
			const { image, animation, spine, lottie, video } = window.app.data.stuffsLoadList;
			addToLoadList(image, animation, spine, lottie, video);
		}
	}

	static addOptionalAssets() {
		if (window.app && window.app.data.__optionalAssets) {
			const { image, animation, spine } = window.app.data.__optionalAssets;
			for (let id in image) {
				if (!image[id]) continue;
				assetsToLoad.push({
					type: "image",
					key: id,
					src: image[id],
				});
			}

			for (let id in animation) {
				if (!animation[id]) continue;
				const { imagePath, jsonPath } = animation[id];
				assetsToLoad.push({
					type: "spritesheet",
					key: id,
					src: imagePath,
					json: jsonPath,
				});
			}

			for (let id in spine) {
				if (!spine[id]) continue;
				const { imagePath, jsonPath, atlasPath } = spine[id];
				assetsToLoad.push({
					type: "spine",
					key: id,
					src: imagePath,
					json: jsonPath,
					atlas: atlasPath,
				});
			}
		}
	}

	static getAssetsToLoad() {
		return assetsToLoad;
	}

	static getMappedAsset(type: AssetType, key: string) {
		return data.objectMap[type][key] || app.data.__stuffsExportMap?.[key];
	}

	static getScenes() {
		return data.scenes;
	}

	static getSceneDataById(id: string) {
		return data.scenes.find((scene) => scene.id === id);
	}

	static getSceneDataByIndex(index: number) {
		return data.scenes[index];
	}

	static getSceneDataByName(name: string) {
		return data.scenes.find((scene) => scene.name === name);
	}

	static setLoadedAssets(assets: any) {
		this.assets = assets;
	}

	static getAssetById(id: string) {
		return this.assets[id];
	}

	static getPrefab(id: string) {
		let prefab = data.prefabs.find((prefab) => prefab.id === id);
		if (!prefab) {
			prefab = data.prefabs.find((prefab) => prefab.exportId === id);
		}
		if (!prefab) {
			prefab = data.prefabs.find((prefab) => prefab.name === id);
		}
		return prefab;
	}
}

export default Data2D;
