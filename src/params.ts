const data = {
	/* TEMPLATE PARAMS */

	// debug
	enableFpsCounter: false,

	editableBg: false,
	backgroundType: 1,
	backgroundColor: "#ffffff",
	bgGradientTop: "#01D5FF",
	bgGradientBottom: "#ffffff",
	bgSrc: null,

	bannerEnable: false,
	bannerHideOnEndCard: false,
	bannerHideOnEndCardIsQuick: false,
	bannerWidthRatio: 95,
	bannerHeightRatio: 10,
	bannerOffsetYRatio: 5,
	bannerBorderRadius: 50,
	bannerAlpha: 1,
	bannerTextAlpha: 1,
	bannerBgType: 0, //solid, gradient, image
	bannerBgColor: "#000000",
	bannerBgGradientColorTop: "#000000",
	bannerBgGradientColorBottom: "#00a2ff",
	bannerBgImage: null,
	bannerText: { text: "Top Banner", color: "#FFFFFF" },
	bannerTextFont: "Arial",

	soundEnabled: true,
	playSoundAfterFirstTouch: false,
	musicSrc: null,
	musicVolume: 0.5,
	videoVolume: 1,
	sfxSrc: null,
	sfxJson: null,
	sfxVolume: 1,
	ttsVolume: 1,
	sfxEnabled: true,

	entranceVideo: null,
	entranceVideoDuration: 3,

	gifOn: false,
	gifSrc: null,

	videoSrc: null, //require("@assets/2d/video.mp4"),

	// isEditor: false,
	postprocessData: {
		enable: false,
		fxaa: true,
		bloom: {
			enable: true,
			//exposure: 10.5,
			//radius: 10,
		},
	},
};

/* import { pfDynamicFuncs } from "core/pfDynamicFuncs";
pfDynamicFuncs(); */

export default data;
