import { Application, ApplicationOptions, BitmapFont, Color, Container, Rectangle, Sprite } from "pixi.js";
import Cache2D from "./utils/Cache2D";
import PixiPrototypes from "./objects/prototypes/PixiPrototypes";
import Data2D from "./utils/Data2D";
import SceneHelper2D from "./utils/SceneHelper2D";
import gsap from "gsap";
import PixiPlugin from "gsap/PixiPlugin";
import CustomEase from "gsap/CustomEase";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import ScriptSystem from "../common/script/ScriptSystem";
import ObjectHelper2D from "./utils/ObjectHelper2D";
import { setDeviceOrientation, setPixiApplication, setPixiDimensions, setRootScene } from "../common/editorGlobals";
import TransitionEffects from "./utils/TransitionEffects";
import Responsive from "./responsive";
import globals from "@globals";
import * as PIXI from "pixi.js";

// #if process.projConfig.physics2DSettings.physicsType !== "none"
import Box2DFactory from "../pixi/physics/box2d/Box2D.js";
// #endif

import "./utils/particle-emitter/particle-emitter.js";

const projectConfig = require("@project/projectConfig.json");

import Stats from "stats.js";
import Banner from "./utils/banner";
let stats: Stats;

window.gsap = gsap;
PixiPrototypes();

export class Renderer2D {
	application: Application;
	scriptSystem: ScriptSystem;
	sceneHelper: SceneHelper2D;
	responsive: Responsive;

	constructor(application: Application) {
		this.sceneHelper = SceneHelper2D;
		this.application = application;
		this.scriptSystem = new ScriptSystem(SceneHelper2D, ObjectHelper2D);
		ScriptSystem.script2d = this.scriptSystem;

		const responsiveConfig = {
			maxDimension: 1000,
			resolution: 2,
		};
		this.responsive = new Responsive(responsiveConfig, application);

		// #if process.isDEV
		// https://chromewebstore.google.com/detail/pixijs-devtools/dlkffcaaoccbofklocbjcmppahjjboce
		(window as any).__PIXI_DEVTOOLS__ = {
			pixi: PIXI,
			app: application,
			stage: application.stage,
			renderer: application.renderer,
			plugins: {
				stats: [],
				properties: [],
			},
		};
		// #endif
	}

	onAllReady() {
		if (globals.data.enableFpsCounter) {
			stats = new Stats();
			stats.showPanel(0);

			// @ts-ignore
			stats.domElement.children[0].style.left = "15px";
			// @ts-ignore
			stats.domElement.children[0].style.top = "30px";

			document.body.appendChild(stats.dom);
		}

		TransitionEffects.register();

		setPixiApplication(this.application);
		setRootScene(this.application.stage);

		SceneHelper2D.init(this.application);
		// SceneHelper2D.initSceneByIndex(0);
	}

	onBeforeUpdate() {
		// this.game.init();
		if (globals.data.bannerEnable) {
			if (globals.topBanner) {
				globals.topBanner.show();
			} else {
				globals.topBanner = new Banner(globals.pixiScene);
			}
		}
	}

	update(delta: number) {
		if (stats) {
			stats.begin();
		}
		application.ticker.update();

		SceneHelper2D.sceneList.forEach((scene) => {
			scene.update(delta);
		});

		// this.game?.update(delta);

		ObjectHelper2D.update(delta);

		if (threeRenderer) {
			// Render Three.js scene
			threeRenderer.resetState();
			threeRenderer.render(globals.threeScene, globals.threeCamera);

			// Render PixiJS scene
			application.renderer.resetState();
			application.renderer.render({ container: application.stage });
		}
		if (stats) {
			stats.end();
		}
	}

	canvasResize(w: number, h: number) {
		return this.responsive.resize(w, h);
	}

	resize(w: number, h: number) {
		let realW = w;
		let realH = h;

		const lockScreen = globals.projectConfig.generalSettings.lockScreen;
		const mainScene = application.stage;

		if (lockScreen === "landscape") {
			if (w < h) {
				realW = h;
				realH = w;
			}

			if (w > h) {
				mainScene.rotation = 0;
				mainScene.x = 0;
			} else {
				mainScene.rotation = Math.PI / 2;
				mainScene.x = w;
			}
		} else if (lockScreen === "portrait") {
			if (w > h) {
				realW = h;
				realH = w;
			}

			if (w > h) {
				mainScene.rotation = -Math.PI / 2;
				mainScene.x = 0;
				mainScene.y = h;
			} else {
				mainScene.rotation = 0;
				mainScene.x = 0;
				mainScene.y = 0;
			}
		}

		SceneHelper2D.sceneList.forEach((scene) => {
			scene.resize(realW, realH);
			scene.hitArea = new Rectangle(0, 0, realW, realH);
		});

		mainScene.hitArea = new Rectangle(0, 0, realW, realH);
		globals.game?.resize2D(realW, realH);
	}
}

const application = new Application();
let isAppInitialized = false;
let state = "waiting";
let renderer2D: Renderer2D | null = null;
let threeRenderer: any;

async function loadAssets2D(customAssets: any = []) {
	Data2D.addStuffsAssets();
	Data2D.addOptionalAssets();
	const list: any = await Cache2D.load(Data2D.getAssetsToLoad().concat(customAssets));
	Data2D.setLoadedAssets(list);

	state = "ready";

	application.canvas.style.zIndex = "1";
}

async function initRenderer2D(customAssets: any = [], renderer3D?: any) {
	if (isAppInitialized) return;
	isAppInitialized = true;

	let backgroundColor = app.data.backgroundColor;
	let backgroundAlpha = 1;
	// #if process.projConfig.projectType === "3D"
	backgroundAlpha = 0;
	backgroundColor = 0x000000;
	// #endif

	const config: Partial<ApplicationOptions> = {
		preference: "webgl" as "webgl" | "webgpu",
		clearBeforeRender: true,
		backgroundAlpha,
		backgroundColor: backgroundColor,
		resolution: 1,
		antialias: true,
		hello: true,
		autoDensity: false,
		// resizeTo: window,
		width: window.innerWidth,
		height: window.innerHeight,
	};

	if (renderer3D) {
		config.context = renderer3D.getContext();
		config.clearBeforeRender = false;
		threeRenderer = renderer3D;
	} else {
		const canvas = document.createElement("canvas");
		document.body.appendChild(canvas);

		canvas.addEventListener("touchstart", (e) => {
			e.preventDefault();
		});
		config.canvas = canvas;
	}

	if (window?.editorMeta?.isEditing) {
		config.preserveDrawingBuffer = true;

		window.pfTakeSnapshotPixi = () => {
			if (globals.projectType === "3D") {
				return application.canvas.toDataURL("image/png");
			}
			return application.canvas.toDataURL("image/jpeg", 0.7);
		};
	}

	await application.init(config);

	application.stage.label = "root";

	renderer2D = new Renderer2D(application);
	state = "loading";

	PixiPlugin.registerPIXI(PIXI);
	gsap.registerPlugin(PixiPlugin, CustomEase);
	gsap.registerPlugin(MotionPathPlugin);
	gsap.defaults({
		ease: "sine.inOut",
	});

	installBitmapFonts();

	// #if process.projConfig.physics2DSettings.physicsType !== "none"
	load2DPhysics();
	// #endif

	await loadAssets2D(customAssets);
	return renderer2D;
}

function load2DPhysics() {
	const Box2DFactory_ = Box2DFactory;

	Box2DFactory_().then((_box2D: any) => {
		// const { b2_dynamicBody, b2BodyDef, b2CircleShape, b2EdgeShape, b2Vec2, b2PolygonShape, b2World } = _box2D;
		app.box2D = _box2D;
		window.Box2D = _box2D;
	});
}

function installBitmapFonts() {
	Object.entries(projectConfig.bitmapFontSettings.bitmapFonts).forEach(([key, value]) => {
		const { color, fontFamily, label, stroke, dropShadow } = value as any;

		BitmapFont.install({
			name: label,
			style: {
				fontFamily: fontFamily || "Arial",
				fontSize: 64,
				fill: color,
				stroke: {
					width: stroke.width,
					color: new Color(stroke.color.replace("#", "0x")),
					// join: "round",
				},
				dropShadow: {
					alpha: dropShadow.alpha,
					color: new Color(dropShadow.color.replace("#", "0x")),
					blur: dropShadow.blur,
					angle: dropShadow.angle,
					distance: dropShadow.distance,
				},
			},
			// chars: [],
			// resolution: 1,
			padding: 10,
		});
	});
}

function get2DState() {
	return state;
}

function getRenderer2D() {
	return renderer2D;
}

function getAllGameObjects(parent: Container) {
	const list: Container[] = [];

	const addChildren = (parent: Container) => {
		parent.children.forEach((child) => {
			list.push(child);
			if (child.children) addChildren(child);
		});
	};
	parent.children.forEach((child) => {
		list.push(child);
		if (child.children) addChildren(child);
	});
	return list;
}

function resize2D(iw: number, ih: number) {
	const rd = renderer2D?.canvasResize(iw, ih);
	if (!rd) return;
	const w = rd.width;
	const h = rd.height;

	application.stage.baseWidth = w;
	application.stage.baseHeight = h;

	setDeviceOrientation(w > h ? "landscape" : "portrait");
	setPixiDimensions(w, h);

	if (state === "waiting") return;

	application.renderer.resize(w, h);
	renderer2D?.resize(w, h);

	const list = getAllGameObjects(application.stage);
	list.forEach((obj) => {
		if (obj.onResizeCallback) {
			obj.onResizeCallback(obj.parent?.baseWidth || 0, obj.parent?.baseHeight || 0);
		}
	});

	// if (SceneHelper2D.currentScene) SceneHelper2D.currentScene.hitArea = application.screen;
}

export { application, initRenderer2D, get2DState as is2DReady, getRenderer2D, resize2D };
