import data from "./params";
// #if process.projConfig.projectType === "3D"
import { getCurrentScene3D, getMainCamera3D, getRenderer3D } from "utils3D";
// #endif

import gsap from "gsap";
import Game from "./game";
import { getApplication, getCurrentScene2D, getRenderer2D, setGlobalFont } from "utils2D";
import { Event, gameFinished } from "utils";
import { Controls3D } from "./core/types/globalTypes";

const projectConfig = require("@project/projectConfig.json");
const studioVersion = projectConfig.studioVersion;

setGlobalFont(projectConfig.globalFont);

/* TEMPLATE IMPORTS */

const globals = {
	/* TEMPLATE GLOBALS */

	projectConfig,
	projectType: projectConfig.projectType,
	data: data,
	spritesheets: {} as any,
	get eventEmitter() {
		return Event.get();
	},

	game: new Game(),

	//2d
	get pixiApp() {
		return getApplication();
	},

	get pixiMain() {
		return getRenderer2D();
	},

	get pixiScene() {
		return getCurrentScene2D();
	},

	controls: {} as Controls3D,
	// #if process.projConfig.projectType === "3D"
	//3d
	get threeScene() {
		return getCurrentScene3D();
	},
	get threeCamera() {
		return getMainCamera3D();
	},
	get threeMain() {
		return getRenderer3D();
	},

	showPhyiscsDebug: false,

	// #endif

	threeWidth: 0,
	threeHeight: 0,
	pixiWidth: 0,
	pixiHeight: 0,
	pixiScale: 1,
	screenWidth: 0,
	screenHeight: 0,

	useSameCanvas: projectConfig.generalSettings.useSameCanvas,

	topBanner: null as any,
	firstClick: false,

	studioVersion,
	getVersionNumber: () => {
		if (!studioVersion) return 0;
		const parts = studioVersion.split(".").map(Number);
		return parts[0] * 1000000 + parts[1] * 1000 + parts[2];
	},

	end(didWon: boolean) {
		gameFinished(didWon);
	},
};

export default globals;
