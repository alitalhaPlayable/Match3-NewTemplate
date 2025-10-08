import { ProjectConfig } from "@src/types/globalTypes";
import { decodeBase122 } from "core/utils";

type AssetType = "texture" | "model" | "material" | "quarks";

type GltfModel = {
	gltfPath: string;
	binPath: string;
	textures: string[];
};

type GlbModel = {
	[key: string]: string;
};

interface TextureAssets {
	[key: string]: string;
}

interface GltfAssets {
	[key: string]: GltfModel | string;
}
interface GlbAssets {
	[key: string]: GlbModel | string;
}

interface BrotliGltfAssets {
	[key: string]: {
		gltf: string;
		bin: string;
		textures: {
			name: string;
			uri: string;
		}[];
	};
}

interface QuarksAssets {
	[key: string]: {
		jsonPath: string;
	};
}

interface HdrAssets {
	[key: string]: string;
}

interface CubemapAssets {
	[key: string]: string[];
}

interface VertexShaderAssets {
	[key: string]: string;
}

interface FragmentShaderAssets {
	[key: string]: string;
}

interface Prefab {
	id: string;
	name: string;
	exportId: string;
	root: any;
}

export interface MaterialData {
	uuid: string;
	name: string;
	type: string;
	params: any;
}

const projectConfig: ProjectConfig = require("@project/projectConfig.json");

const data: {
	assets: {
		texture: TextureAssets;
		gltf: GltfAssets;
		glb: GlbAssets;
		quarks: QuarksAssets;
		hdr: HdrAssets;
		cubemap: CubemapAssets;
		fragmentShader: FragmentShaderAssets;
		vertexShader: VertexShaderAssets;
	};
	scenes: any[];
	rendererConfig: any;
	objectMap: {
		texture: {
			[key: string]: string;
		};
		model: {
			[key: string]: string;
		};
		material: {
			[key: string]: string;
		};
		quarks: {
			[key: string]: string;
		};
	};
	prefabs: Prefab[];
	materials: MaterialData[];
} = require("@assets_core/templateData3D.json");

const assetsToLoad: any[] = [];

function addToLoadList(
	textureList: TextureAssets,
	gltfList: GltfAssets,
	glbList: GlbAssets,
	brotliGltfList: BrotliGltfAssets,
	quarksList: QuarksAssets,
	hdrList: HdrAssets,
	cubemapList: CubemapAssets = {},
	vertexShaderList: VertexShaderAssets = {},
	fragmentShaderList: FragmentShaderAssets = {}
) {
	for (let prop in textureList) {
		if (!textureList.hasOwnProperty(prop)) continue;
		if (!textureList[prop]) continue;
		const src = textureList[prop];
		assetsToLoad.push({
			type: "texture",
			key: prop,
			src,
		});
	}
	for (let prop in gltfList) {
		if (!gltfList.hasOwnProperty(prop)) continue;
		if (!gltfList[prop]) continue;
		let src;

		if (typeof gltfList[prop] === "string") {
			src = gltfList[prop];
		} else {
			src = (gltfList[prop] as GltfModel).gltfPath;
		}
		assetsToLoad.push({
			type: "gltf",
			key: prop,
			src,
		});
	}

	for (let prop in glbList) {
		if (!glbList.hasOwnProperty(prop)) continue;
		if (!glbList[prop]) continue;

		assetsToLoad.push({
			type: "glb",
			key: prop,
			src: glbList[prop],
		});
	}

	for (let prop in brotliGltfList) {
		if (!brotliGltfList.hasOwnProperty(prop)) continue;
		if (!brotliGltfList[prop]) continue;
		const brotliData = brotliGltfList[prop];
		assetsToLoad.push({
			type: "brotliGltf",
			key: prop,
			src: brotliData,
		});
	}

	for (let prop in quarksList) {
		if (!quarksList.hasOwnProperty(prop)) continue;
		if (!quarksList[prop]) continue;
		const jsonPath = quarksList[prop];
		assetsToLoad.push({
			type: "quarks",
			key: prop,
			src: jsonPath,
		});
	}

	for (let prop in hdrList) {
		if (!hdrList.hasOwnProperty(prop)) continue;
		if (!hdrList[prop]) continue;
		const src = hdrList[prop];
		assetsToLoad.push({
			type: "hdr",
			key: prop,
			src,
		});
	}

	for (let prop in cubemapList) {
		if (!cubemapList.hasOwnProperty(prop)) continue;
		if (!cubemapList[prop]) continue;
		const list = cubemapList[prop];
		assetsToLoad.push({
			type: "cubemap",
			key: prop,
			list,
		});
	}

	for (let prop in vertexShaderList) {
		if (!vertexShaderList.hasOwnProperty(prop)) continue;
		if (!vertexShaderList[prop]) continue;
		const src = vertexShaderList[prop];
		assetsToLoad.push({
			type: "vertexShader",
			key: prop,
			src,
		});
	}

	for (let prop in fragmentShaderList) {
		if (!fragmentShaderList.hasOwnProperty(prop)) continue;
		if (!fragmentShaderList[prop]) continue;
		const src = fragmentShaderList[prop];
		assetsToLoad.push({
			type: "fragmentShader",
			key: prop,
			src,
		});
	}
}

// #if !process.isDEV
let assets3DImages = require("@build_temp/assets3DImages.js");
assets3DImages = assets3DImages.default || assets3DImages;

for (let i = 0; i < assets3DImages.length; i++) {
	assets3DImages[i] = decodeBase122(assets3DImages[i]);
}

let assets3D = require("@build_temp/assets3D.js");
assets3D = assets3D.default || assets3D;

let quarks = require("@build_temp/quarks.js");
quarks = quarks.default || quarks;

assets3D.forEach((asset: any) => {
	if (asset.type === "gltf") {
		// fill textures
		asset.gltf?.images?.forEach((image: any) => {
			if (image.uri !== undefined) {
				image.uri = assets3DImages[image.uri];
			}
		});

		assetsToLoad.push({
			type: "gltf",
			key: asset.uuid,
			src: JSON.stringify(asset.gltf),
		});
	} else if (asset.type === "glb") {
		assetsToLoad.push({
			type: "glb",
			key: asset.uuid,
			src: asset.src,
		});
	} else if (asset.type === "brotliGltf") {
		assetsToLoad.push({
			type: "brotliGltf",
			key: asset.uuid,
			src: {
				gltf: decodeBase122(asset.src.gltf),
				bin: decodeBase122(asset.src.bin),
				textures: asset.src.textures.map((texture: any) => {
					if (texture.uri) {
						return texture;
					}

					return {
						name: texture.name,
						uri: assets3DImages[texture.no],
					};
				}),
			},
		});
	} else if (asset.type === "hdr") {
		assetsToLoad.push({
			type: "hdr",
			key: asset.uuid,
			src: asset.hdrData,
		});
	} else if (asset.type === "cubemap") {
		assetsToLoad.push({
			type: "cubemap",
			key: asset.uuid,
			list: asset.list.map((item: number) => assets3DImages[item]),
		});
	} else if (asset.type === "texture") {
		assetsToLoad.push({
			type: "texture",
			key: asset.uuid,
			src: assets3DImages[asset.src],
		});
	}
});

for (let key in quarks) {
	const quarksData = quarks[key];

	console.log("quarksData", quarksData);
	quarksData.src.images.forEach((image: any) => {
		image.url = assets3DImages[image.url];
	});

	assetsToLoad.push({
		type: "quarks",
		key,
		src: quarksData,
	});
}

// #endif

// #if process.isDEV
addToLoadList(data.assets.texture, data.assets.gltf, data.assets.glb, {}, data.assets.quarks, data.assets.hdr, data.assets.cubemap, data.assets.vertexShader, data.assets.fragmentShader);
// #endif

class Data3D {
	static assets: any;

	static addStuffsAssets() {
		// add stuffs assets
		if (window.app && window.app.data.stuffsLoadList) {
			const { texture, gltf, glb, brotliGltf } = window.app.data.stuffsLoadList;
			addToLoadList(texture, gltf, glb, brotliGltf, {}, {});
		}
	}

	static addOptionalAssets() {
		if (window.app && window.app.data.__optionalAssets) {
			const { model } = window.app.data.__optionalAssets;
			for (let id in model) {
				if (!model[id]) continue;
				const dt = model[id];
				if (dt.type === "brotliGltf") {
					assetsToLoad.push({
						type: "brotliGltf",
						key: id,
						src: dt.src,
					});
				}
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

	static getRendererConfig() {
		return projectConfig.rendererSettings3D;
		// return data.rendererConfig;
	}

	static getMaterials() {
		return data.materials;
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

export default Data3D;
