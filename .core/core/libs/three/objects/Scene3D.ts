import * as THREE from "three";
import { StudioObject3D } from "./types";
import { Scene3DSettings } from "../../common/types";
import { SceneBase } from "../../common/scene";
import Texture3dHelpers from "../utils/Texture3dHelpers";
import ObjectHelper3D from "../utils/ObjectHelper3D";
import globals from "@globals";
import QuarksScene from "../utils/quarks/QuarksScene";
import QuarksHelper from "../utils/quarks/QuarksHelper";
import Postprocess from "./../utils/postprocess/postprocess";
class Scene3D extends THREE.Scene implements SceneBase {
	name: string = "Scene3d";

	resizeableBg: boolean = false;
	persistent: boolean = false;

	quarksScene?: QuarksScene;

	mainCamera: THREE.Camera | undefined;
	dirLight: THREE.DirectionalLight | undefined;
	ambientLight: THREE.AmbientLight | undefined;

	postprocess: Postprocess | undefined;

	get gameObjects() {
		return ObjectHelper3D.getSceneObjects(this)!;
	}

	constructor(_persistent = false) {
		super();
		this.persistent = _persistent;
		if (!this.persistent) {
			this.quarksScene = new QuarksScene(this);
		}
	}

	onSceneInited(settings?: Scene3DSettings) {
		if (settings) {
			this.setupScene(settings);
		}
		this.mainCamera = ObjectHelper3D.getObjectByType(THREE.Camera, this);
		this.dirLight = ObjectHelper3D.getObjectByType(THREE.DirectionalLight, this);
		this.ambientLight = ObjectHelper3D.getObjectByType(THREE.AmbientLight, this);

		if (!this.persistent && globals.data.postprocessData.enable) {
			this.postprocess = new Postprocess();
			this.postprocess.init(this, this.mainCamera!);
		}
	}

	setupScene(opts: Scene3DSettings) {
		this.initSceneBg(opts);
		this.initEnvmap(opts);
		this.initFog(opts);
	}

	async initSceneBg(opts: Record<string, any> | Scene3DSettings) {
		const scene = this;
		if (opts.backgroundType === "solid") {
			scene.background = Texture3dHelpers.initSolidTexture(opts.backgroundColor1);
		} else if (opts.backgroundType === "gradient") {
			scene.background = Texture3dHelpers.initGradientTexture(opts.backgroundColor1, opts.backgroundColor2);
		} else if (opts.backgroundType === "image") {
			this.resizeableBg = true;
			scene.background = await Texture3dHelpers.getImageBg(opts.backgroundImage);
			this.resize(globals.threeWidth, globals.threeHeight);
		} else if (opts.backgroundType === "hdr") {
			scene.background = await Texture3dHelpers.getHdrBg(opts.hdrFile);
		} else if (opts.backgroundType === "cubemap") {
			scene.background = await Texture3dHelpers.getCubeMapBg(opts.cubemap);
		} else {
			scene.background = null;
		}
	}

	async initEnvmap(opts: Record<string, any> | Scene3DSettings) {
		const scene = this;

		if (opts.environment) {
			const envMap = await Texture3dHelpers.getEnvironmentMap(opts.environment);
			if (envMap) {
				envMap.mapping = THREE.EquirectangularReflectionMapping;
				envMap.needsUpdate = true;
				scene.environment = envMap;
				scene.environmentIntensity = opts.environmentIntensity;
			} else {
				scene.environment = null;
			}
		} else {
			scene.environment = null;
		}
	}

	initFog(opts: Record<string, any> | Scene3DSettings) {
		const scene = this;
		if (opts.fog) {
			let fog = null;
			if (opts.fogType === "linear") {
				fog = new THREE.Fog(opts.fogColor, opts.fogNear, opts.fogFar);
			} else if (opts.fogType === "exp2") {
				fog = new THREE.FogExp2(opts.fogColor, opts.fogDensity);
			}
			scene.fog = fog;
		} else {
			scene.fog = null;
		}
	}

	update(delta: number): void {
		this.gameObjects.forEach((obj) => {
			obj.components.update(delta);
		});
		this.quarksScene?.update(delta);
	}

	render(renderer: THREE.WebGLRenderer) {
		if (this.mainCamera) {
			if (this.postprocess) {
				this.postprocess.render();
			} else {
				renderer.render(this, this.mainCamera);
			}
		}
	}

	resize(w: number, h: number): void {
		if (this.background && this.resizeableBg) {
			Texture3dHelpers.resizeTexture(this.background as THREE.Texture, w, h);
		}

		const aspect = w / h;
		this.gameObjects.forEach((obj) => {
			if (obj instanceof THREE.PerspectiveCamera) {
				obj.aspect = aspect;
				obj.updateProjectionMatrix();
			}
			obj.components.resize(w, h);
		});

		this.postprocess?.resize(w, h);
	}

	destroy(): void {
		console.log(this);
		this.quarksScene?.destroy();
		for (let i = this.children.length - 1; i >= 0; i--) {
			const child = this.children[i];
			child.destroy();
		}
	}
}

export default Scene3D;
