import { CubeReflectionMapping, CubeTexture, CubeTextureLoader, DataTexture, DataTextureLoader, EquirectangularReflectionMapping, TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
const loader = new GLTFLoader();

// #if process.projConfig.generalSettings.enableDracoLoader
console.log("DracoLoader enabled");
import { DRACOLoader } from "./misc/DRACOLoader.js";
const dracoLoader = new DRACOLoader();
loader.setDRACOLoader(dracoLoader);
// #endif

import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module";
import QuarksHelper from "./quarks/QuarksHelper";
loader.setMeshoptDecoder(MeshoptDecoder);

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import Data3D from "./Data3D";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";
import { loadBrotliModel } from "./misc/BrotliLoader.js";
import MaterialController from "./MaterialController.js";
import QuarksParticleLocal from "./quarks/QuarksParticleLocal.js";
import { SkeletonUtilsClone } from "./SkeletonUtils.js";

const rgbeLoader = new RGBELoader();
const cubeTextureLoader = new CubeTextureLoader();
const textureLoader = new TextureLoader();

const list: any = {};

class Cache3D {
	static get(key: string) {
		return list[key];
	}

	static getModel(key: string, callback?: (modelData: any) => void) {
		let modelData = list[key];
		if (!modelData) {
			const mappedName = Data3D.getMappedAsset("model", key);
			if (mappedName) {
				modelData = { ...list[mappedName] };
			}
		}
		if (modelData) {
			modelData = { ...modelData };
			modelData.scene = SkeletonUtilsClone(modelData.scene);
		}
		return modelData;
	}

	static getQuarks(key: string, callback?: (modelData: any) => void) {
		let quarksData = list[key];
		if (!quarksData) {
			const mappedName = Data3D.getMappedAsset("quarks", key);
			if (mappedName) {
				quarksData = list[mappedName];
			}
		}
		if (quarksData) {
			let ind = quarksData.index;
			let particle = quarksData.pool[ind];
			ind = (ind + 1) % quarksData.maxLen;
			quarksData.index = ind;
			return {
				particle,
				emitterList: particle.emitterList,
				key: quarksData.key,
			};
		}
	}

	// placeholder for studio
	static getModelPathFromUUID(uuid: string) {
		return list[uuid]?.modelPath;
	}
	// placeholder for studio
	static getModelUUIDFromPath(uuid: string) {
		return list[uuid]?.modelPath;
	}

	static getModelFromStuffs(stuffsId: string, callback?: (modelData: any) => void) {
		const stuffsData = list[stuffsId];
		if (!stuffsData) {
			return null;
		}
		const modelData = { ...stuffsData };
		if (modelData) {
			modelData.scene = clone(modelData.scene);
		}
		return modelData;
	}

	static getTexture(key: string, callback?: (texture: any) => void) {
		let texture = list[key];
		if (!texture) {
			const mappedName = Data3D.getMappedAsset("texture", key);
			if (mappedName) {
				texture = list[mappedName];
			}
		}
		return texture;
	}

	static getMaterial(key: string) {
		const mappedName = Data3D.getMappedAsset("material", key);
		return MaterialController.get(mappedName) || MaterialController.get(key);
	}

	static getItem(key: string) {
		return list[key];
	}

	static syncTextureSettings(loadedList: any) {
		const textureTasks = [];
		const keys = Object.keys(loadedList); 

		for (const key of keys) {
			const item = loadedList[key];
			if (!item.scene || !item.parser?.textureCache) continue;

			const textureEntries = Object.entries(item.parser.textureCache);

			for (const [texKey, texturePromise] of textureEntries) {
				const parsedName = texKey.split(":")[0].split("/").pop()?.split(".")[0];
				if (!parsedName) continue;

				textureTasks.push(
					(texturePromise as any).then((val: any) => {
						for (const compareKey of keys) {
							const loadedTexture = loadedList[compareKey];
							const sourcePath = loadedTexture?.source?.data?.src;
							if (!sourcePath) continue;

							const sourceName = sourcePath.split("/").pop()?.split(".")[0];
							if (parsedName === sourceName) {
								Object.assign(loadedTexture, {
									colorSpace: val.colorSpace,
									flipY: val.flipY,
									repeat: { ...val.repeat },
									wrapS: val.wrapS,
									wrapT: val.wrapT,
									needsUpdate: true,
								});
							}
						}
					})
				);
			}
		}

		Promise.all(textureTasks).catch(console.error);
	}


	static load(assetsToLoad: { type: string; key: string; src: string | any; list: string[] }[]) {
		return new Promise((resolve, reject) => {
			const totalItems = assetsToLoad.length;
			let loadedItems = 0;
			const loadedList: any = {};

			if (totalItems === 0) resolve(loadedList);

			const onItemLoaded = (key: string, res: any) => {
				loadedItems++;
				loadedList[key] = res;
				list[key] = res;
				if (loadedItems === totalItems) {
					setupGltfTextures();
					resolve(loadedList);
				}
			};

			const setupGltfTextures = () => {
				Cache3D.syncTextureSettings(loadedList)
			}

			assetsToLoad.forEach((item) => {
				switch (item.type) {
					case "texture":
						this.loadTexture(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "gltf":
						this.loadGLTF(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "brotliGltf":
						this.loadBrotliGLTF(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "glb":
						this.loadGlb(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "quarks":
						this.loadQuarks(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "hdr":
						this.loadHDR(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "cubemap":
						this.loadCubeMap(item.key, item.list).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "vertexShader":
						this.loadVertexShader(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					case "fragmentShader":
						this.loadFragmentShader(item.key, item.src).then((res) => {
							onItemLoaded(item.key, res);
						});
						break;
					default:
						break;
				}
			});
		});
	}

	static async loadTexture(key: string, src: string) {
		const texture = textureLoader.load(src);
		return texture;
	}

	static async loadGLTF(key: string, model: string) {
		if (model.startsWith("assets")) {
			return new Promise((resolve, reject) => {
				loader.load(model, (gltf) => {
					gltf.modelUUID = key;
					resolve(gltf);
				});
			});
		} else {
			return new Promise((resolve, reject) => {
				loader.parse(model, "", (gltf) => {
					resolve(gltf);
				});
			});
		}
	}

	static async loadBrotliGLTF(key: string, model: any) {
		return new Promise((resolve, reject) => {
			loadBrotliModel(model, loader, (gltf: any) => {
				gltf.modelUUID = key;
				resolve(gltf);
			});
		});
	}

	static async loadGlb(key: string, model: string) {
		return new Promise((resolve, reject) => {
			loader.load(model, (gltf) => {
				resolve(gltf);
			});
		});
	}

	static getModelAnimations(uuid: string) {
		if (list[uuid]) {
			return list[uuid].animations;
		}
	}

	static async loadQuarks(key: string, data: { src: string; amount: number }) {
		const list = [];
		const pool: QuarksParticleLocal[] = [];

		for (let i = 0; i < data.amount; i++) {
			list.push(QuarksHelper.loadQuarks(data.src));
		}
		await Promise.all(list).then((results) => {
			results.forEach((particleData: any) => {
				let particle = new QuarksParticleLocal(particleData.particle, particleData.emitterList);
				pool.push(particle);
			});
		});

		const quarksData = {
			index: 0,
			maxLen: data.amount,
			pool: pool,
			key,
		};

		return quarksData;
	}

	static async loadHDR(key: string, src: string) {
		return new Promise((resolve) => {
			rgbeLoader.load(src, (hdrTexture: DataTexture) => {
				hdrTexture.mapping = EquirectangularReflectionMapping;
				resolve(hdrTexture);
			});
			// if (src.startsWith && src.startsWith("assets")) {
			// 	rgbeLoader.load(src, (hdrTexture: DataTexture) => {
			// 		resolve(hdrTexture);
			// 	});
			// } else {
			// 	new RGBELoader().load(src, function (texture) {
			// 		resolve(texture);
			// 	});
			// }
		});
	}

	static async loadVertexShader(key: string, src: string) {
		if (src.startsWith("assets")) {
			return new Promise((resolve) => {
				fetch(src)
					.then((res) => res.text())
					.then((data) => {
						resolve(data);
					});
			});
		}
	}

	static async loadFragmentShader(key: string, src: string) {
		if (src.startsWith("assets")) {
			return new Promise((resolve) => {
				fetch(src)
					.then((res) => res.text())
					.then((data) => {
						resolve(data);
					});
			});
		}
	}

	static loadEnvironmentMap(uuid: string) {
		return undefined;
	}
	static loadCubeMap(key: string, list: string[]) {
		return new Promise((resolve) => {
			cubeTextureLoader.load(list, (cubeTexture: CubeTexture) => {
				cubeTexture.mapping = CubeReflectionMapping;
				// cubeTextureList[uuid] = cubeTexture;
				resolve(cubeTexture);
			});
		});
	}
}

export default Cache3D;
