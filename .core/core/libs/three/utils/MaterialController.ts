import {
	Material,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
	Scene,
	WebGLRenderer,
	PerspectiveCamera,
	AmbientLight,
	DirectionalLight,
	SphereGeometry,
	BoxGeometry,
	Mesh,
	Sprite,
	SpriteMaterial,
	MeshToonMaterial,
	MeshMatcapMaterial,
	Blending,
	ShaderMaterial,
	MeshPhysicalMaterial,
} from "three";
// import { IMaterialData, MaterialComponent } from "../../../../../types/materials";
// import { updateMaterialIcon } from "../../editor/components/Folders/apis/updateMaterialIcon";
import Cache3D from "./Cache3D";
import { MaterialData } from "./Data3D";
import { hexToRgba } from "./ColorUtils";
import { Euler } from "three.quarks";

class MaterialController {
	static list: {
		[key: string]: Material;
	};
	static iconList: {
		[key: string]: string;
	};

	static snapshotList: {
		[id: string]: () => void;
	};

	static init() {
		this.list = {};
		this.iconList = {};
		this.initDefaults();
		this.snapshotList = {};
	}

	static add(id: string, material: Material) {
		this.list[id] = material;
	}

	static remove(id: string) {
		delete this.list[id];
	}

	static get(id: string, createIfNotExists: boolean = false) {
		let material = this.list[id];
		if (!material && createIfNotExists) {
			material = this.create(id, "basic");
		}
		return material;
	}

	static addCommonUniforms(shaderCode: string) {
		let tempShaderCode = shaderCode;
		const commonUniforms = ["uniform float time", "uniform float deltaTime", "uniform vec2 resolution"];

		commonUniforms.forEach((uniform) => {
			if (!shaderCode.includes(uniform)) {
				tempShaderCode = `${uniform};\n${tempShaderCode}`;
			}
		});

		return tempShaderCode;
	}

	static async updateShader(id: string, data: any) {
		const material = this.get(id) as ShaderMaterial;

		if (material && data) {
			material.fragmentShaderReady = false;
			material.vertexShaderReady = false;

			let vertexShader = `void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`;
			if (data.vertexShader) {
				vertexShader = Cache3D.getItem(data.vertexShader) || vertexShader;
			}

			let fragmentShader = `void main() {
                gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
            }`;
			if (data.fragmentShader) {
				fragmentShader = Cache3D.getItem(data.fragmentShader) || fragmentShader;
			}

			fragmentShader = this.addCommonUniforms(fragmentShader);
			vertexShader = this.addCommonUniforms(vertexShader);

			material.fragmentShader = fragmentShader;
			material.vertexShader = vertexShader;
			material.needsUpdate = true;
			material.fragmentShaderReady = true;
			material.vertexShaderReady = true;

			for (const name in data.uniforms) {
				if (Object.prototype.hasOwnProperty.call(data.uniforms, name)) {
					const uniform = data.uniforms[name];
					if (uniform.value !== undefined) {
						if (uniform.type === "sampler2D") {
							// texture
							const texture = Cache3D.getTexture(uniform.value);
							if (texture instanceof Promise) {
								texture
									.then((t) => {
										material.uniforms[name] = { value: t };
										return t;
									})
									.catch(() => {
										material.uniforms[name] = { value: null };
									});
							} else {
								material.uniforms[name] = { value: texture };
							}
						} else if (uniform.type === "color") {
							// hex to r,g,b,a
							const color = hexToRgba(uniform.value, 1, "array");
							material.uniforms[name] = { value: color };
						} else {
							material.uniforms[name] = { value: uniform.value };
						}
					}
				}
			}

			// default uniforms
			if (!material.uniforms.time) {
				material.uniforms.time = { value: 0 };
			}

			if (!material.uniforms.deltaTime) {
				material.uniforms.deltaTime = { value: 0 };
			}

			if (!material.uniforms.resolution) {
				material.uniforms.resolution = { value: { x: window.innerWidth, y: window.innerHeight } };
			}

			return material;
		}
	}

	static update(id: string, data: any) {
		const material = this.get(id);
		const excludedKeys = new Set([
			"color",
			"id",
			"name",
			"type",
			"userData",
			"transparent",
			"opacity",
			"side",
			"visible",
			"depthWrite",
			"depthTest",
			"depthFunc",
			"blending",
			"alphaTest",
			"isDirty",
			"specularColor",
			"envMapColor",
			"envMapRotation",
			"emissive",
		]);

		if (material && data) {
			const originalData = JSON.parse(JSON.stringify(data));
			//@ts-ignore
			material.originalData = originalData;
			const { maps, ...dataWithoutMaps } = data as any;
			material.userData.maps = [];
			material.userData = { ...material.userData, ...dataWithoutMaps };

			if (data.type === "shader") {
				return this.updateShader(id, data);
			}
			// @ts-ignore
			material.color.set(data.color || 0xffffff);
			material.transparent = data.transparent || false;
			material.opacity = data.opacity || 1;
			material.side = data.side || 0;
			material.visible = data.visible || true;
			material.depthWrite = data.depthWrite || false;
			material.depthTest = data.depthTest || false;
			material.depthFunc = data.depthFunc || 0;
			material.blending = Number(data.blending || 0) as Blending;
			material.alphaTest = data.alphaTest || 0;
			//@ts-ignore
			material.specularColor?.set(data.specularColor || 0xffffff);
			//I think this property doesnt really exist. but I dont want to break it by changing something atm, so this will stay.
			//@ts-ignore
			material.envMapColor?.set(data.envMapColor || 0xffffff);
			//@ts-ignore
			// material.emissive?.set(data.emissive ?? 0x000000);
			//@ts-ignore
			if (data.envMapRotation) {
				//@ts-ignore
				material.envMapRotation = new Euler(material.envMapRotation.x, material.envMapRotation.y, material.envMapRotation.z, material.envMapRotation.order);
			}

			//@ts-ignore
			if (Array.isArray(material.normalScale)) {
				//@ts-ignore
				material.normalScale = { x: material.normalScale[0], y: material.normalScale[1] };
			}
			//@ts-ignore
			material.isDirty = data.isDirty || false;

			const filtered = Object.fromEntries(Object.entries(data).filter(([key]) => !excludedKeys.has(key) && !key.endsWith("Map") && key !== "map"));

			Object.assign(material, filtered);
			// fill the maps with the data
			for (const prop in data) {
				if (prop.endsWith("Map") || prop === "map") {
					material.userData.maps.push(prop);
					let mapValue = data[prop];
					if (mapValue) {
						const texture = Cache3D.getTexture(mapValue as string);
						// is promise or not
						//set the material texture data here
						if (texture instanceof Promise) {
							texture
								.then((t) => {
									//@ts-ignore
									const mapData = data[prop + "_data"];
									if (mapData) {
										t.repeat = { ...mapData.repeat };
										t.wrapS = mapData.wrapS;
										t.wrapT = mapData.wrapT;
										t.flipY = mapData.flipY;
										t.colorSpace = mapData.colorSpace;
										t.needsUpdate = true;
									}
									(material as any)[prop] = t;
									return t;
								})
								.catch(() => {
									(material as any)[prop] = null;
								});
						} else {
							//@ts-ignore
							const mapData = data[prop + "_data"];
							if (mapData) {
								texture.repeat = { ...mapData.repeat };
								texture.wrapS = mapData.wrapS;
								texture.wrapT = mapData.wrapT;
								texture.flipY = mapData.flipY;
								texture.colorSpace = mapData.colorSpace;
								texture.needsUpdate = true;
							}
							(material as any)[prop] = texture;
						}
					} else {
						(material as any)[prop] = null;
					}
				}
			}
		}
		return material;
	}

	static create(id: string, type: string, data?: any, name?: string) {
		let material: Material;

		switch (type) {
			case "basic":
				material = new MeshBasicMaterial();
				material.type = "MeshBasicMaterial";
				break;
			case "lambert":
				material = new MeshLambertMaterial();
				material.type = "MeshLambertMaterial";
				break;
			case "phong":
				material = new MeshPhongMaterial();
				material.type = "MeshPhongMaterial";
				break;
			case "standard":
				material = new MeshStandardMaterial();
				material.type = "MeshStandardMaterial";
				break;
			case "sprite":
				material = new SpriteMaterial();
				material.type = "SpriteMaterial";
				break;
			case "matcap":
				material = new MeshMatcapMaterial();
				material.type = "MeshMatcapMaterial";
				break;
			case "toon":
				material = new MeshToonMaterial();
				material.type = "MeshToonMaterial";
				break;
			case "shader":
				material = new ShaderMaterial();
				material.type = "ShaderMaterial";
				break;
			case "physical":
				material = new MeshPhysicalMaterial();
				material.type = "MeshPhysicalMaterial";
				break;
			default:
				material = new Material();
				break;
		}

		this.add(id, material);
		this.update(id, data);
		if (name && name.endsWith?.(".material")) {
			material.name = name.slice(0, -9);
		}
		return material;
	}

	static addToShapsotList(id: string, callback: () => void) {
		if (this.snapshotList[id]) return;
		this.snapshotList[id] = callback;
	}

	static initDefaults() {
		this.create("default_mat_basic", "basic");
		this.create("default_mat_phong", "phong");
		this.create("default_mat_standard", "standard");
		this.create("default_mat_lambert", "lambert");
	}

	static initFromTemplate(list: MaterialData[]) {
		list.forEach((item) => {
			this.create(item.uuid, item.type, item.params, item.name);
		});
	}
}

MaterialController.init();
export default MaterialController;
