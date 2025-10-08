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
export const LevelUpType = {
	Base: { name: "Base" },
	Rocket: { name: "Rocket", enabled: true, blastAmount: 4, destroyDelayWithSpine: 0.1 },
	Bomb: { name: "Bomb", enabled: true, blastAmount: 6, destroyDelayWithSpine: 0 },
	LightBall: { name: "LightBall", enabled: true, blastAmount: 8, destroyDelayWithSpine: 0 },
	Propeller: { name: "Propeller", enabled: true, destroyDelayWithSpine: 0 },
	Block: { name: "Block" },
};
/* TEMPLATE IMPORTS END */

const globals = {
	/* TEMPLATE GLOBALS */
	itemIndicies: ["blue", "green", "orange", "purple", "red", "yellow"],
	blockTypes: ["green", "blue", "purple", "red", "yellow"],

	notMergeType: "None",

	levelUpPattern_0: { pattern: [1, 1, 1, 1, 1], type: LevelUpType.LightBall },
	levelUpPattern_1: { pattern: [[1], [1], [1], [1], [1]], type: LevelUpType.LightBall },

	levelUpPattern_2: {
		pattern: [
			[1, 1, 1],
			[1, 0, 0],
			[1, 0, 0],
		],
		type: LevelUpType.Bomb,
	},
	levelUpPattern_3: {
		pattern: [
			[1, 1, 1],
			[0, 0, 1],
			[0, 0, 1],
		],
		type: LevelUpType.Bomb,
	},
	levelUpPattern_4: {
		pattern: [
			[0, 0, 1],
			[0, 0, 1],
			[1, 1, 1],
		],
		type: LevelUpType.Bomb,
	},
	levelUpPattern_5: {
		pattern: [
			[1, 0, 0],
			[1, 0, 0],
			[1, 1, 1],
		],
		type: LevelUpType.Bomb,
	},
	levelUpPattern_6: {
		pattern: [
			[0, 1, 0],
			[0, 1, 0],
			[1, 1, 1],
		],
		type: LevelUpType.Bomb,
	},

	levelUpPattern_7: {
		pattern: [
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 1],
		],
		type: LevelUpType.Bomb,
	},

	levelUpPattern_8: {
		pattern: [
			[1, 0, 0],
			[1, 1, 1],
			[1, 0, 0],
		],
		type: LevelUpType.Bomb,
	},

	levelUpPattern_9: {
		pattern: [
			[1, 1, 1],
			[0, 1, 0],
			[0, 1, 0],
		],
		type: LevelUpType.Bomb,
	},

	levelUpPattern_10: { pattern: [1, 1, 1, 1], type: LevelUpType.Rocket },
	levelUpPattern_11: { pattern: [[1], [1], [1], [1]], type: LevelUpType.Rocket },

	levelUpPattern_12: {
		pattern: [
			[1, 1],
			[1, 1],
		],
		type: LevelUpType.Propeller,
	},

	levelUpPatterns: [],

	//--------------------
	board: null,
	gameC: null,
	moveEnd: false,
	timeEnd: false,
	gameWon: false,
	canCheckEnd: false,
	isInIntro: true,
	isRestarting: false,

	boardItems5: [
		["green", "yellow", "yellow", "purple", "yellow"],
		["orange", "blue", "red", "red", "orange"],
		["red", "green", "red", "green", "purple"],
		["blue", "orange", "blue", "yellow", "yellow"],
		["orange", "blue", "purple", "orange", "red"],
	],

	boardItems6: [
		["green", "yellow", "yellow", "purple", "yellow", "blue"],
		["orange", "blue", "red", "red", "orange", "blue"],
		["red", "green", "red", "green", "purple", "green"],
		["blue", "orange", "blue", "yellow", "yellow", "purple"],
		["orange", "blue", "purple", "orange", "red", "red"],
		["yellow", "red", "blue", "orange", "blue", "yellow"],
	],

	boardItems2: [
		[0, 0, 0, "yellow", "red", "blue", "green"],
		["yellow", "blue", "red", "green", "orange", "blue", "green"],
		["red", "blue", "red", "red", "green", "green", "red"],
		["blue", "orange", "yellow", "red", "yellow", "purple", "green"],
		["orange", "blue", "orange", "orange", "orange", "orange", "green"],
		["yellow", "blue", "red", "orange", "orange", "yellow", "orange"],
		["yellow", "purple", "green", "yellow", "red", "orange", "green"],
	],

	boardItems75: [
		[0, 0, 0, "yellow", "red", "blue", "green"],
		["yellow", "blue", "red", "green", "orange", "blue", "green"],
		["red", "blue", "red", "red", "green", "green", "red"],
		["blue", "orange", "yellow", "red", "yellow", "purple", "green"],
		["orange", "blue", "green", "orange", "red", "red", "green"],
	],

	boardItemsNone: [
		["yellow", "yellow", "red", "red", "purple", "purple", "green"],
		["yellow", "yellow", "red", "red", "purple", "purple", "green"],
		["blue", "blue", "green", "green", "orange", "orange", "red"],
		["blue", "blue", "green", "green", "orange", "orange", "yellow"],
		["red", "red", "purple", "purple", "red", "red", "green"],
	],

	boardItems9: [
		[0, 0, 0, "yellow", "red", "blue", "green", 0, 0],
		["yellow", "blue", "red", "green", "orange", "blue", "green", 0, 0],
		["red", "blue", "red", "red", "green", "green", "red", 0, 0],
		["blue", "orange", "yellow", "red", "yellow", "purple", "green", 0, 0],
		["orange", "blue", "green", "orange", "red", "red", "green", 0, 0],
		["yellow", "blue", "red", "green", "green", "yellow", "orange", 0, 0],
		["yellow", "purple", "green", "yellow", "red", "orange", "green", 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
	],

	boardItems22: [
		["yellow", 0, 0, 0, 0, 0],
		["yellow", "green", 0, 0, 0, 0],
		["red", "green", 0, 0, 0, 0],
		["yellow", 0, "green", "green", 0, 0],
		["red", "green", 0, 0, 0, 0],
		[0, "green", 0, 0, 0, 0],
		// [0, 0, 0, 0, 0, 0, 0],
		// [0, 0, 0, 0, 0, 0, 0],
	],

	boardItems: [
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
	],

	itemTypes: null,

	starterAnimEnd: false,
	isSpinAnimActive: false,
	isBuilding: false,
	isButtonActive: false,
	canBoardPlay: true,
	resetingBoard: false,
	uiController: null,
	buildingC: null,
	ecButtonIndex: 0,
	wheelItems: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3],

	getColorFromString(colorString) {
		switch (colorString) {
			case "red":
				return 0xff0000; // Red in hex format
			case "blue":
				return 0x0000ff; // Blue in hex format
			case "orange":
				return 0xffa500; // Orange in hex format
			case "purple":
				return 0x800080; // Purple in hex format
			case "green":
				return 0x00ff00; // Green in hex format
			case "yellow":
				return 0xffff00; // Yellow in hex format
			default:
				return 0xffffff; // Default to black if the color is not recognized
		}
	},
	/* TEMPLATE GLOBALS END */

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
