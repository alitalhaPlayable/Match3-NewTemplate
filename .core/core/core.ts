// process.projConfig.projectType === "2D"
import { application, initRenderer2D, resize2D } from "./libs/pixi/main";
import SceneManager2D from "./libs/common/SceneManager2D";
// endif

// #if process.projConfig.projectType === "3D"
import { initRenderer3D, resize3D } from "./libs/three/main";
import SceneManager3D from "./libs/common/SceneManager3D";
import GUIHelper from "core/libs/common/general/guiHelper";
import * as THREE from "three";
(window as any).THREE = THREE;

// #if process.projConfig.physics3DSettings.physicsType === "rapier3d"
import * as RAPIER3D from "@dimforge/rapier3d-compat";
// #endif
// #endif

import "./style.css";

// #if process.projConfig.generalSettings.preloader === "rollic"
import "./css/rollic_preloader.css";
// #endif

// #if process.projConfig.generalSettings.preloader === "disney"
import "./css/disney_preloader.css";
// #endif

// #if process.projConfig.generalSettings.preloader === "supercell"
import "./css/supercell_preloader.css";
// #endif

import AudioManager from "./libs/common/general/audios/audios";
import { MainConfig } from "./libs/common/general/networks";
import Manager from "./libs/common/manager";
import EventEmitter from "./libs/common/EventEmitter";
import { setEventEmitter } from "./libs/common/editorGlobals";
import globals from "@globals";
import gsap from "gsap";
import VersionIntro from "./versionIntro/versionIntro";
import Game from "@src/game";

const eventEmitter: EventEmitter = EventEmitter.getInstance();
setEventEmitter(eventEmitter);

interface CustomAssets {
	assets2D: any[];
	assets3D: any[];
	audios: any[];
	fonts: any;
}

interface Config3D {
	enableFixedUpdate3d: boolean;
	timeStep: number;
}

class Core {
	config: MainConfig;
	numOfLoaded = 0;
	totalToLoad = 1;
	sceneManager?: SceneManager2D | SceneManager3D;
	renderer2D?: any;
	renderer3D?: any;
	customAssets: CustomAssets;
	enabled2D: boolean = false;
	enabled3D: boolean = false;
	gameStarted: boolean = false;
	config3D: Config3D;
	readyCallback: () => void;
	updateActive: boolean = true;
	versionIntro?: VersionIntro;
	game: Game;

	constructor(config: MainConfig, assets: CustomAssets, readyCallback: () => void, config3D?: Config3D) {
		this.config = config;
		this.customAssets = assets;
		this.readyCallback = readyCallback;
		this.config3D = config3D || { enableFixedUpdate3d: false, timeStep: 1 / 60 };
		this.game = globals.game;

		let app = {
			// globals,
			type: window.type || null,
			data: globals.data,
			globals: globals,
			resizeNow: Manager.resizeNow,
			isPixiTemplate: true,
			main: Manager.main,
			templateVersion: "2",
			mobvistaStarted: false,
			gameStart: () => {
				if (app.type === "mobvista") {
					app.mobvistaStarted = true;
					this.loadCallback("mobvista");
				}
			},
			gameClose: () => {
				app.main.soundEnabled = false;
				AudioManager.muteAll();
			},
		};
		window.app = app;

		Manager.init(config).then(() => {
			setTimeout(() => {
				this.loadCallback("manager");
			}, 1);
		});

		if (app.type === "mobvista") {
			this.totalToLoad++;
		}

		// @ts-ignore
		if (globals.data.___versionIntro) {
			this.totalToLoad++;
			const intro = new VersionIntro(() => {
				this.loadCallback("versionIntro");
			});
			this.versionIntro = intro;
		} else {
			this.startLibraries();
		}
	}

	startLibraries() {
		let useSameCanvas = globals.projectType === "3D" && globals.useSameCanvas;

		const start2D = (renderer3D?: any) => {
			console.log("start2D");
			// process.projConfig.projectType === "2D"
			this.init2D(renderer3D);
			// endif
		};

		if (!useSameCanvas) {
			start2D();
		}

		// #if process.projConfig.projectType === "3D"
		this.init3D().then((renderer3D) => {
			if (useSameCanvas) {
				start2D(renderer3D);
			}
		});
		// #if process.projConfig.physics3DSettings.physicsType === "rapier3d"
		this.initRapier();
		// #endif
		// #endif
	}

	loadCallback(name: string) {
		this.numOfLoaded++;

		if (app.type === "mobvista" && this.numOfLoaded === this.totalToLoad - 1) {
			// @ts-ignore
			window.mobvistaGameReady && window.mobvistaGameReady();
		}

		if (this.numOfLoaded == this.totalToLoad) {
			if (this.gameStarted) {
				if (this.versionIntro) {
					console.log("readyCallback");
					this.readyCallback();
				}
			} else {
				this.gameStarted = true;
				if (this.versionIntro) {
					this.versionIntro?.init(() => {
						this.startLibraries();
					});
					app.main.hidePreloader();
					app.main.gameInited();
					app.main.gameStarted();
				} else {
					this.readyCallback();
				}
			}
		}
	}

	preInit() {
		Manager.gameInited();
		Manager.resizeNow();

		this.initSound();

		this.renderer2D?.onAllReady();
		this.renderer3D?.onAllReady();
	}

	init() {
		// @ts-ignore
		this.sceneManager?.init(this.renderer2D, this.renderer3D);
		// @ts-ignore
		this.sceneManager?.start();

		this.game.init();

		this.initUpdate();
		Manager.resizeNow();
		setTimeout(() => {
			Manager.gameStarted();
			this.initFirstClickHandler();
		}, 1);

		Manager.main.hidePreloader();

		if (window?.editorMeta?.isEditing) {
			window.pfTakeSnapshot = () => {
				return new Promise((resolve) => {
					const ss2D = window.pfTakeSnapshotPixi();
					if (globals.projectType === "2D") {
						resolve(ss2D);
						return ss2D;
					}

					const ss3D = window.pfTakeSnapshotThree();

					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");
					if (!ctx) {
						resolve(ss2D);
						return ss2D;
					}

					const img2D = new Image();
					img2D.src = ss2D;
					const img3D = new Image();
					img3D.src = ss3D;

					let numOfLoaded = 0;
					const imageLoaded = function () {
						numOfLoaded++;
						if (numOfLoaded === 2) {
							canvas.width = img3D.width;
							canvas.height = img3D.height;

							ctx.drawImage(img3D, 0, 0);
							ctx.drawImage(img2D, 0, 0);
							resolve(canvas.toDataURL("image/jpeg", 0.7));
						}
					};

					img2D.onload = () => {
						imageLoaded();
					};

					img3D.onload = () => {
						imageLoaded();
					};
				});
			};
		}
	}

	initFirstClickHandler() {
		const firstClickHandler = () => {
			if (globals.firstClick) {
				return;
			}
			globals.firstClick = true;
			globals.eventEmitter.emit("___firstClick");

			document.body.removeEventListener("touchstart", firstClickHandler);
			document.body.removeEventListener("mousedown", firstClickHandler);
		};
		document.body.addEventListener("touchstart", firstClickHandler);
		document.body.addEventListener("mousedown", firstClickHandler);
	}

	initSound() {
		function initSoundHelper() {
			if (app.data.isEditor) {
				return;
			}
			AudioManager.init();
			AudioManager.playBgMusic();
		}

		// initialize sound
		if (app.data.playSoundAfterFirstTouch) {
			let tempEvent = () => {
				initSoundHelper();
				window.removeEventListener("touchstart", tempEvent);
				window.removeEventListener("mousedown", tempEvent);
			};
			window.addEventListener("touchstart", tempEvent);
			window.addEventListener("mousedown", tempEvent);
		} else {
			initSoundHelper();
		}
	}

	init2D(renderer3D?: any) {
		this.totalToLoad++;
		this.enabled2D = true;
		this.sceneManager = SceneManager2D;

		initRenderer2D(this.customAssets.assets2D, renderer3D).then((renderer2D) => {
			this.renderer2D = renderer2D;
			this.loadCallback("pixi");
		});
	}

	// init3D(rendererReadyCallback?: (renderer: any) => void) {
	init3D() {
		return new Promise((resolve) => {
			this.totalToLoad++;
			this.enabled3D = true;
			this.sceneManager = SceneManager3D;

			initRenderer3D(this.customAssets.assets3D, (renderer) => {
				resolve(renderer);
			}).then((renderer3D) => {
				this.renderer3D = renderer3D;
				this.loadCallback("three");
			});
		});
	}

	initRapier() {
		this.totalToLoad++;
		RAPIER3D.init().then(() => {
			this.loadCallback("rapierPhysics");
		});
	}

	resize(w: number, h: number) {
		globals.screenWidth = w;
		globals.screenHeight = h;
		if (this.enabled2D) {
			resize2D(w, h);
		}
		if (this.enabled3D) {
			resize3D(w, h);
		}

		app.documentWidth = w;
		app.documentHeight = h;

		app.pfResizeVideo && app.pfResizeVideo(w, h);
		app.pfResizeVersionIntro && app.pfResizeVersionIntro(w, h);
	}

	update2D(delta: number) {
		this.renderer2D.update(delta / 1000);
		app.main?.update();
	}

	update3D() {
		if (GUIHelper.stats) {
			GUIHelper.stats.begin();
		}
		this.renderer3D.timer.update();
		let delta = this.renderer3D.timer.getDelta();
		if (isNaN(delta) || delta === Infinity || !delta) {
			return;
		}

		if (delta > 0.05) delta = 0.05;

		this.game.update(delta);

		if (this.config3D.enableFixedUpdate3d) {
			this.renderer3D.fixedUpdate(delta);
		} else {
			this.renderer3D.update(delta);
		}

		this.renderer3D.render();

		if (GUIHelper.stats) {
			GUIHelper.stats.end();
		}
		return delta;
	}
	initUpdate() {
		if (this.enabled2D) {
			application.ticker.stop();
		}

		if (this.enabled3D) {
			const mainUpdate3d = () => {
				requestAnimationFrame(mainUpdate3d);
				if (!this.updateActive) return;
				const delta = this.update3D();

				if (this.enabled2D) {
					this.update2D(delta * 1000);
				}
			};
			mainUpdate3d();
		} else {
			if (this.enabled2D) {
				gsap.ticker.add((time, delta) => {
					if (!this.updateActive) return;
					this.update2D(delta);
				});
			}
		}
	}
}

export default Core;

// #if process.isDEV
const versionText = document.createElement("div");
versionText.style.position = "fixed";
versionText.style.bottom = "0";
versionText.style.right = "0";
versionText.style.color = "#000000";
versionText.style.zIndex = "999";
versionText.style.fontSize = "16px";
versionText.style.padding = "5px";
// versionText.style.backgroundColor = "rgba(0,0,0,0.5)";
const packageData = require("@project/package.json");
const versionNo = packageData.version;
versionText.innerHTML = `v${versionNo}`;
document.body.appendChild(versionText);
// #endif
