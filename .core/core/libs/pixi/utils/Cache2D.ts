// import { Assets } from "@pixi/assets";
// import { Spritesheet, utils, TextureAtlas, SkeletonJson, AtlasAttachmentLoader } from "pixi.js";

import { Assets, Loader, Spritesheet, SpritesheetData, Texture } from "pixi.js";
import globals from "@globals";
import { AtlasAttachmentLoader, SkeletonJson, SpineTexture, TextureAtlas } from "@esotericsoftware/spine-pixi-v8";
import Data2D from "./Data2D";
import base122Helper from "core/brotli/base122Helper";
import { decodeBase122 } from "core/utils";

if (window.type === "fb") {
	Assets.setPreferences({
		preferWorkers: false,
	});
}

// import * as PIXI from "pixi.js";

// let TextureAtlas: typeof TextureAtlas | undefined;
// let SkeletonJson: typeof SkeletonJson | undefined;
// let AtlasAttachmentLoader: typeof AtlasAttachmentLoader | undefined;

// if (app.hasSpine) {
//     import(/* webpackChunkName: "dynamic-modules" */ "pixi-spine")
//         .then((spineModule) => {
//             TextureAtlas = spineModule.TextureAtlas;
//         })
//         .catch((err) => {
//             throw new Error(err);
//         });

//     import(/* webpackChunkName: "dynamic-modules" */ "@pixi-spine/runtime-4.1")
//         .then((spineModule) => {
//             SkeletonJson = spineModule.SkeletonJson;
//             AtlasAttachmentLoader = spineModule.AtlasAttachmentLoader;
//         })
//         .catch((err) => {
//             throw new Error(err);
//         });
// }
const list: any = {};

class Cache2D {
	static get(key: string) {
		return list[key];
	}
	static hasTexture(key: string) {
		return list[key] !== undefined || list[Data2D.getMappedAsset("image", key)] !== undefined;
	}

	static getTexture(key: string, callback?: (texture: any) => void): Texture {
		let texture = list[key];

		if (!texture) {
			const mappedName = Data2D.getMappedAsset("image", key);
			texture = list[mappedName];
		}

		return texture || Texture.WHITE;
	}
	// dummy function for studio compliance
	static async getItemPath(itemPath: string, type: string) {
		let path = itemPath;
		if (type === "image") {
			path = await Assets.get(itemPath);
		} else if (type === "animation") {
			path = await Assets.get(itemPath);
		} else if (type === "spine") {
			path = await Assets.get(itemPath);
		}
		return await Assets.get(itemPath);
	}

	static getTextureFromStuffs(stuffsId: string, callback?: (texture: any) => void): Texture {
		let texture = list[stuffsId];
		if (!texture) {
			const mappedName = Data2D.getMappedAsset("image", stuffsId);
			if (!mappedName) {
				return Texture.EMPTY;
			}
			texture = list[mappedName];
		}
		return texture;
	}

	static getAnimation(key: string, callback?: (animData: any) => void): Spritesheet {
		let animData = list[key];
		if (!animData) {
			const mappedName = Data2D.getMappedAsset("animation", key);
			animData = list[mappedName];
		}
		return animData;
	}

	static getSpine(key: string, callback?: (spineData: any) => void) {
		let spineData = list[key];
		if (!spineData) {
			const mappedName = Data2D.getMappedAsset("spine", key);
			spineData = list[mappedName];
		}
		return spineData;
	}

	static getLottie(key: string, callback?: (lottieData: any) => void) {
		let lottieData = list[key];
		if (!lottieData) {
			const mappedName = Data2D.getMappedAsset("lottie", key);
			lottieData = list[mappedName];
		}
		return lottieData;
	}

	static async getVideo(assetUUID: string, key: string, isFullPath?: boolean, options?: any) {
		const isUniqueTexture = assetUUID !== key;

		let videoData = list[key];
		if (!videoData) {
			const mappedName = Data2D.getMappedAsset("video", key);
			videoData = list[mappedName];
		}

		if (isUniqueTexture && !videoData) {
			let originalVideo = list[assetUUID];
			if (!originalVideo) {
				const mappedName = Data2D.getMappedAsset("video", assetUUID);
				originalVideo = list[mappedName];
			}

			// #if process.isDEV
			videoData = await Cache2D.loadVideo(key, originalVideo.videoSrc + "?t=" + Date.now());
			// #endif

			// #if !process.isDEV
			async function base64DataURLToBlobURL(base64DataURL: string) {
				const response = await fetch(base64DataURL);
				const blob = await response.blob();
				return URL.createObjectURL(blob);
			}

			// Example usage:
			const blobURL = await base64DataURLToBlobURL(originalVideo.videoSrc);
			videoData = await Cache2D.loadVideo(key, blobURL);
			// #endif
		}
		return videoData;
	}

	static load(
		assetsToLoad: {
			type: string; //
			key: string;
			src: string;
			json?: SpritesheetData | string;
			atlas?: string | any;
			additionalImages?: string[];
			encoding?: string;
			mimeType?: string;
		}[]
	) {
		return new Promise((resolve, reject) => {
			assetsToLoad = assetsToLoad.filter(item => item.type !== "font");
			if (assetsToLoad.length === 0) resolve({});
			const totalItems = assetsToLoad.length;
			let loadedItems = 0;
			const loadedList: any = {};

			const onItemLoaded = (key: string, res: any) => {
				loadedItems++;
				loadedList[key] = res;
				list[key] = res;
				if (loadedItems === totalItems) {
					resolve(loadedList);
				}
			};
			assetsToLoad.forEach((item) => {
				if (item.encoding === "base122") {
					item.src = base122Helper.decode(item.src, item.mimeType);
				} else if (item.src.startsWith("___base122___")) {
					// item.src = item.src.slice(13);
					// const parts = item.src.split("___");
					// const mimeType = parts.shift();
					// const encodedData = parts.join("___");
					// item.src = base122Helper.decode(encodedData, mimeType);
					item.src = decodeBase122(item.src);
				}

				switch (item.type) {
					case "image":
						this.loadImage(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "spritesheet":
						this.loadAtlas(item.key, item.src, item.json as SpritesheetData, true).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "atlas":
						this.loadAtlas(item.key, item.src, item.json as SpritesheetData).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "spine":
						this.loadSpine(item.key, item.src, item.json as string, item.atlas as string, item.additionalImages || []).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "lottie":
						this.loadLottie(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "video":
						this.loadVideo(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "font":
						this.loadFont(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
					default:
						break;
				}
			});
		});
	}

	static async loadImage(key: string, imageFile: string) {
		Assets.add({
			alias: key,
			src: imageFile,
		});
		const asset = await Assets.load(key);
		return asset;
	}

	static async loadFont(key: string, fontFile: string) {
		const asset = await Assets.load({
			alias: "font",
			src: fontFile,
			data: {
				family: key,
				weights: ["normal", "bold"],
			},
		});
		return asset;
	}

	static async loadVideo(key: string, videoFile: string) {
		return new Promise(async (resolve, reject) => {
			var video = document.createElement("video") as HTMLVideoElement;
			if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
				video.autoplay = true;
			}

			video.setAttribute("playsinline", "playsinline");

			video.addEventListener("canplay", async function () {
				Assets.add({
					alias: key,
					src: videoFile,
					loadParser: "loadVideo",
				});
				const asset = await Assets.load(key);
				asset.videoSrc = videoFile;

				resolve(asset);
			});
			video.src = videoFile;
			video.muted = true;
		});
	}

	static async loadAtlas(key: string, imageFile: string, jsonFile: SpritesheetData, isSpriteSheet = false) {
		return new Promise(async (resolve, reject) => {
			if (typeof jsonFile === "string") {
				Assets.add({
					alias: key,
					src: jsonFile,
				});
				const jsonData = await Assets.load(key);
				resolve(jsonData);
				return;
			}
			Assets.add({
				alias: `${key}_image`,
				src: imageFile,
			});
			const spritesheetImage = await Assets.load(`${key}_image`);

			jsonFile.meta.image = imageFile;

			let jsonString = JSON.stringify(jsonFile);
			// Replace Turkish characters with ASCII equivalents
			jsonString = jsonString.replace(/[ğüşöçıİĞÜŞÖÇ]/g, (char) => {
				const replacements: { [key: string]: string } = {
					ğ: "g",
					ü: "u",
					ş: "s",
					ö: "u",
					ç: "c",
					ı: "i",
					İ: "I",
					Ğ: "G",
					Ü: "U",
					Ş: "S",
					Ö: "O",
					Ç: "C",
				};
				return replacements[char] || char;
			});

			const base64EncodedData = btoa(jsonString);
			const url = `data:application/json;base64,${base64EncodedData}`;

			Assets.add({
				alias: `${key}_json`,
				src: url,
			});
			const jsonData = await Assets.load(url);

			if (jsonData.textures) {
				jsonData.frames = jsonData.textures[0].frames;
				jsonData.textures = null;
			}

			const sheet = new Spritesheet(spritesheetImage, jsonData);

			sheet.parse().then(() => {
				if (isSpriteSheet) {
					globals.spritesheets[key] = sheet;
				} else {
					Object.values(sheet.textures).forEach((texture: any) => {
						Assets.cache.set(texture.label, texture);
						list[texture.label] = texture;
					});
				}
				resolve(sheet);
			});
		});
	}

	static async loadSpine(key: string, imageFile: string, jsonFile: string | any, atlasFile: string, additionalImages?: string[]) {
		return new Promise(async (resolve, reject) => {
			const jsonName = `${key}Data`;
			const atlasName = `${key}Atlas`;

			if (typeof jsonFile === "string") {
				Assets.add({
					alias: jsonName,
					src: jsonFile,
				});
				Assets.add({ alias: atlasName, src: atlasFile });
				await Assets.load([jsonName, atlasName]);
				resolve({
					skeleton: jsonName,
					atlas: atlasName,
				});
				return;
			}

			// Add all textures to Assets
			Assets.add({
				alias: `${key}`,
				src: imageFile,
			});
			const allTextureKeys = [key];

			additionalImages?.forEach((image, index) => {
				const imageKey = `${key}_texture_${index + 1}`;
				Assets.add({
					alias: imageKey,
					src: image,
				});
				allTextureKeys.push(imageKey);
			});

			// Load all textures
			await Assets.load(allTextureKeys);

			// Create a map of texture names to SpineTexture objects
			const textureMap = new Map<string, any>();

			// Map main texture
			const mainTexture = Assets.cache.get(key) as Texture;
			const mainSpineTexture = SpineTexture.from(mainTexture.source);
			const mainTextureName = imageFile.split("/").pop()?.split(".")[0];
			if (mainTextureName) {
				textureMap.set(mainTextureName, mainSpineTexture);
			}

			// Map additional textures
			additionalImages?.forEach((imagePath, index) => {
				const textureKey = `${key}_texture_${index + 1}`;
				const texture = Assets.cache.get(textureKey) as Texture;
				const spineTexture = SpineTexture.from(texture.source);

				// Handle different types of imagePath
				let textureName: string | undefined;
				if (typeof imagePath === "string") {
					textureName = imagePath.split("/").pop()?.split(".")[0];
				} else if (imagePath && typeof imagePath === "object" && "name" in imagePath) {
					textureName = (imagePath as any).name?.split(".")[0];
				} else {
					textureName = `texture_${index + 1}`;
				}

				if (textureName) {
					textureMap.set(textureName, spineTexture);
				}
			});

			const spineAtlas = new TextureAtlas(atlasFile);

			// Map each region to its correct texture based on the atlas page information
			spineAtlas.regions.forEach((region) => {
				const pageName = region.page.name;
				if (pageName) {
					const basePageName = pageName.split(".")[0]; // Remove extension
					const matchingTexture = textureMap.get(basePageName);
					if (matchingTexture) {
						region.texture = matchingTexture;
						region.page.texture = matchingTexture;
					} else {
						// Fallback to first texture if no match found
						const firstTexture = textureMap.values().next().value;
						region.texture = firstTexture;
						region.page.texture = firstTexture;
					}
				} else {
					// If no page name, use first texture as fallback
					const firstTexture = textureMap.values().next().value;
					region.texture = firstTexture;
					region.page.texture = firstTexture;
				}
			});

			const spineJson = new SkeletonJson(new AtlasAttachmentLoader(spineAtlas));
			// const jsonData = spineJson.readSkeletonData(jsonFile);

			Assets.cache.set(jsonName, jsonFile);
			Assets.cache.set(atlasName, spineAtlas);

			resolve({
				skeleton: jsonName,
				atlas: atlasName,
			});
		});
	}

	static async loadLottie(key: string, lottieFile: string) {
		return new Promise(async (resolve, reject) => {
			let asset: any;
			if (lottieFile.startsWith("data:")) {
				asset = lottieFile;
			} else {
				// asset = await import("../../../../../assets/lottie/confetti.lottie");
				// #if process.isDEV
				// asset = await import("../../../../../" + lottieFile);
				// asset = asset.default || asset;
				// #endif
			}
			resolve(asset);
		});
	}
}

export default Cache2D;
