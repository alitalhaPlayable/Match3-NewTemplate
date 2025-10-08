import * as THREE from "three";

import { FileLoader, WebGLRenderer } from "three";
//import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils";
import { checkWebGL } from "./utils/misc/WebGL";

// @ts-ignore
//THREE.SkeletonUtils = {
//	clone: skeletonClone,
//};
import Data3D from "./utils/Data3D";
import Responsive from "./responsive";
import Cache3D from "./utils/Cache3D";
import SceneHelper3D from "./utils/SceneHelper3D";
import ThreePrototypes from "./objects/prototypes/ThreePrototypes";
import { Timer, FixedTimer } from "three/examples/jsm/misc/Timer";
import ScriptSystem from "../common/script/ScriptSystem";
import ObjectHelper3D from "./utils/ObjectHelper3D";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import globals from "@globals";
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";

import { FileLoaderNoFetch } from "./utils/misc/fileloaderNoFetch";
import { Renderer3DSettings } from "../common/types";
FileLoader.prototype.load = FileLoaderNoFetch.prototype.load;

import ParticlePool from "./utils/quarks/ParticlePool";
import MaterialController from "./utils/MaterialController";
import Physics3DManager from "./utils/physics/Physics3DManager";
ThreePrototypes();

require("./utils/misc/TrailRenderer");

export class Renderer3D {
	renderer: WebGLRenderer;
	responsive: Responsive;

	inited = false;
	timer = new Timer();
	// fixedTimer = new FixedTimer();
	scriptSystem: ScriptSystem;
	sceneHelper: SceneHelper3D;

	orbitControls?: OrbitControls;
	controls = {
		isDown: false,
		downX: 0,
		downY: 0,
		mouseX: 0,
		mouseY: 0,
		prevX: 0,
		prevY: 0,
	};

	constructor(renderer: WebGLRenderer) {
		this.sceneHelper = SceneHelper3D;
		this.renderer = renderer;
		const responsiveConfig = {
			maxDimension: 1000,
			resolution: Data3D.getRendererConfig().resolution,
		};
		this.scriptSystem = new ScriptSystem(SceneHelper3D, ObjectHelper3D);
		ScriptSystem.script3d = this.scriptSystem;

		this.responsive = new Responsive(responsiveConfig, renderer);
	}

	onAllReady() {
		THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
		THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
		THREE.Mesh.prototype.raycast = acceleratedRaycast;

		if (globals.data.editableBg) {
			const bgTypeList = ["solid", "gradient", "image"];
			const sceneData = Data3D.getScenes();
			sceneData.forEach((scene) => {
				scene.settings.backgroundType = bgTypeList[globals.data.backgroundType];
				scene.settings.backgroundColor1 = globals.data.backgroundType ? globals.data.bgGradientTop : globals.data.backgroundColor;
				scene.settings.backgroundColor2 = globals.data.bgGradientBottom;
				scene.settings.backgroundImage = "bg3d";
			});
		}
		MaterialController.initFromTemplate(Data3D.getMaterials());
		SceneHelper3D.init();
		// SceneHelper3D.initSceneByIndex(0);
		//SceneHelper3D.initPersistentScene();

		ParticlePool.init();
		this.initOrbitControls();
		this.initGlobalControls();

		let physicsType: "none" | "cannon" | "rapier3d" = "none";

		// #if process.projConfig.physics3DSettings.physicsType === "cannon"
		physicsType = "cannon";
		// #endif
		// #if process.projConfig.physics3DSettings.physicsType === "rapier3d"
		physicsType = "rapier3d";
		// #endif

		Physics3DManager.setPhysicsType(physicsType);

		setTimeout(() => {
			Physics3DManager.setScene(SceneHelper3D.currentScene);
			Physics3DManager.setDebugEnabled(globals.showPhyiscsDebug);
		}, 100);
	}

	physicsUpdate(delta: number) {
		Physics3DManager.step(delta);
	}

	onBeforeUpdate() {
		this.inited = true;
	}

	update(delta: number) {
		if (!this.inited) return;

		this.physicsUpdate(delta);
		SceneHelper3D.sceneList.forEach((scene) => {
			scene.update(delta);
		});

		if (this.orbitControls) {
			this.orbitControls.update();
		}
	}

	timeAccumulator = 0;
	totalElapsed = 0;
	fixedTimeStep = 1 / 60;
	fixedUpdate(delta: number) {
		if (!this.inited) return;

		this.timeAccumulator += delta;
		this.totalElapsed += delta;

		while (this.timeAccumulator >= this.fixedTimeStep) {
			this.update(this.fixedTimeStep);

			this.timeAccumulator -= this.fixedTimeStep;
		}
	}

	render() {
		if (!this.inited) return;

		SceneHelper3D.sceneList.forEach((scene) => {
			scene.render(this.renderer);
		});
	}

	resize(w: number, h: number) {
		const size = this.responsive.resize(w, h);
		globals.threeWidth = size.width;
		globals.threeHeight = size.height;
		SceneHelper3D.sceneList.forEach((scene) => {
			scene.resize(size.width, size.height);
		});
		globals.game.resize3D(size.width, size.height);
	}

	initOrbitControls() {
		const startOrbitControls = () => {
			const camera = SceneHelper3D.currentScene.mainCamera;
			if (!camera) {
				return;
			}

			if (this.orbitControls) {
				this.orbitControls.dispose();
			}

			const controls = new OrbitControls(camera, document.body);
			controls.enableDamping = true;
			controls.dampingFactor = 0.25;
			controls.enableZoom = true;
			controls.enablePan = true;
			controls.screenSpacePanning = false;
			controls.minDistance = 1;
			controls.maxDistance = 1000;
			controls.panSpeed = 1;
			controls.update();
			this.orbitControls = controls;
		};

		window.onkeydown = (e: KeyboardEvent) => {
			if (e.key === "a" && !this.orbitControls) {
				startOrbitControls();
				//@ts-ignore
				this.orbitControls?.listenToKeyEvents(window);
			}
			if (e.key === "s") {
				this.orbitControls?.dispose();
				this.orbitControls = undefined;
			}

			if (e.key === "Shift" && this.orbitControls) {
				this.orbitControls.touches = {
					ONE: THREE.TOUCH.PAN,
				};
			}
		};

		window.onkeyup = (e: KeyboardEvent) => {
			if (!this.orbitControls) return;

			if (e.key === "Shift") {
				this.orbitControls.touches = {
					ONE: THREE.TOUCH.ROTATE,
				};
			}
		};
	}

	initGlobalControls() {
		let controlData = {
			isDown: false,
			downX: 0,
			downY: 0,
			mouseX: 0,
			mouseY: 0,
			prevX: 0,
			prevY: 0,
		};
		const domElement = document.body;

		/////MOUSE CONTROL
		domElement.addEventListener("mousedown", mouseDown);

		function mouseDown(e: MouseEvent) {
			/*e.preventDefault();
            e.stopPropagation();*/

			controlData.downX = e.pageX;
			controlData.downY = e.pageY;

			controlData.mouseX = e.pageX;
			controlData.mouseY = e.pageY;

			controlData.prevX = e.pageX;
			controlData.prevY = e.pageY;

			controlData.isDown = true;

			domElement.addEventListener("mouseup", mouseUp);
			domElement.addEventListener("mousemove", mouseMove);
		}

		function mouseMove(e: MouseEvent) {
			/*e.preventDefault();
            e.stopPropagation();*/

			controlData.prevX = controlData.mouseX;
			controlData.prevY = controlData.mouseY;

			controlData.mouseX = e.pageX;
			controlData.mouseY = e.pageY;
		}

		function mouseUp(e: MouseEvent) {
			/*e.preventDefault();
            e.stopPropagation();*/

			controlData.isDown = false;
			domElement.removeEventListener("mouseup", mouseUp);
			domElement.removeEventListener("mousemove", mouseMove);
		}

		////TOUCH CONTROL
		domElement.addEventListener("touchstart", touchStart);
		function touchStart(e: TouchEvent) {
			/*e.preventDefault();
            e.stopPropagation();*/

			controlData.downX = e.touches[0].pageX;
			controlData.downY = e.touches[0].pageY;

			controlData.mouseX = e.touches[0].pageX;
			controlData.mouseY = e.touches[0].pageY;

			controlData.prevX = e.touches[0].pageX;
			controlData.prevY = e.touches[0].pageY;

			controlData.isDown = true;
			domElement.addEventListener("touchend", touchEnd);
			domElement.addEventListener("touchmove", touchMove);
		}

		function touchMove(e: TouchEvent) {
			/*e.preventDefault();
            e.stopPropagation();*/

			controlData.prevX = controlData.mouseX;
			controlData.prevY = controlData.mouseY;

			controlData.mouseX = e.touches[0].pageX;
			controlData.mouseY = e.touches[0].pageY;
		}

		function touchEnd(e: TouchEvent) {
			/*e.preventDefault();
            e.stopPropagation();*/

			controlData.isDown = false;
			domElement.removeEventListener("touchend", touchEnd);
			domElement.removeEventListener("touchmove", touchMove);
		}

		this.controls = controlData;
		globals.controls = controlData;
		return controlData;
	}
}

let renderer3D: Renderer3D;
let state = "waiting";

async function loadAssets3D(customAssets: any = []) {
	Data3D.addStuffsAssets();
	Data3D.addOptionalAssets();
	const assetsToLoad = Data3D.getAssetsToLoad().concat(customAssets);
	const list: any = await Cache3D.load(assetsToLoad);
	Data3D.setLoadedAssets(list);
	state = "ready";

	// SceneHelper.initSceneByIndex(0, application.stage);
}

async function initRenderer3D(customAssets: any = [], rendererReadyCallback?: (renderer: WebGLRenderer) => void) {
	await checkWebGL();

	const defaultConfig = {
		antialias: false,
		alpha: false,
		powerPreference: "high-performance",
	};

	const rendererConfig: Renderer3DSettings = Object.assign(defaultConfig, Data3D.getRendererConfig());
	rendererConfig.logarithmicDepthBuffer = false;
	if (globals.data.postprocessData.enable) {
		rendererConfig.antialias = false;
		rendererConfig.toneMapping = "NoToneMapping";
	}

	if (window?.editorMeta?.isEditing) {
		rendererConfig.preserveDrawingBuffer = true;

		window.pfTakeSnapshotThree = () => {
			return renderer.domElement.toDataURL("image/jpeg", 0.7);
		};
	}

	const renderer = new WebGLRenderer(rendererConfig);

	renderer.outputColorSpace = THREE[rendererConfig.outputColorSpace];
	renderer.shadowMap.enabled = rendererConfig.shadowMapEnabled;
	renderer.shadowMap.type = THREE[rendererConfig.shadowMapType];
	renderer.toneMapping = THREE[rendererConfig.toneMapping];
	renderer.toneMappingExposure = rendererConfig.toneMappingExposure;

	document.body.appendChild(renderer.domElement);

	state = "loading";

	renderer3D = new Renderer3D(renderer);
	state = "ready";
	rendererReadyCallback && rendererReadyCallback(renderer3D.renderer);

	await loadAssets3D(customAssets);
	return renderer3D;
}

function resize3D(w?: number, h?: number) {
	if (state !== "ready") return;

	if (!w || !h) {
		w = globals.threeWidth;
		h = globals.threeHeight;
	}

	const lockScreen = globals.projectConfig.generalSettings.lockScreen;

	let realW = w;
	let realH = h;

	if (lockScreen === "landscape") {
		if (w < h) {
			realW = h;
			realH = w;
		}
	} else if (lockScreen === "portrait") {
		if (w > h) {
			realW = h;
			realH = w;
		}
	}

	renderer3D.resize(realW, realH);
}

function getRenderer3D() {
	return renderer3D;
}

export { initRenderer3D, resize3D, getRenderer3D };
