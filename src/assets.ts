import globals from "@globals";

function getCustomAssets2D(data: any) {
	const customAssets2D: any[] = [
		// { type: "video", key: "video", src: require("@assets/2d/sample.mp4") },
		// { type: "image", key: "bg", src: require("@assets/dummy/button.png") },
		// { type: "spritesheet", key: "snake", src: require("@assets/dummy/snake.png"), json: require("@assets/dummy/snake.json") },
		// {
		// 	type: "spine",
		// 	key: "test",
		// 	src: require("@assets/dummy/chars.png"),
		// 	json: "assets/dummy/chars.json",
		// 	atlas: "assets/dummy/chars.atlas",
		// },
	];

	if (globals.data.bannerBgType == 2 && globals.data.bannerBgImage) {
		customAssets2D.push({ type: "image", src: globals.data.bannerBgImage, key: "bannerBgImage" });
	}

	if (globals.data.videoSrc) {
		customAssets2D.push({ type: "video", key: "video", src: globals.data.videoSrc });
	}

	return customAssets2D;
}

function getCustomAssets3D(data: any) {
	const customAssets3D: any[] = [
		//{ type: "texture", key: "test_texture", src: require("@assets/dummy/button.png") }
		// {
		// 	key: "bus",
		// 	type: "gltf",
		// 	src: require("@assets/models/bus/bus.gltf"),
		// },
		// {
		// 	key: "crown",
		// 	type: "glb",
		// 	src: require("@assets/models/crown.glb"),
		// },
	];
	
	if (globals.data.bgSrc) {
		customAssets3D.push({ type: "texture", key: "bg3d", src: globals.data.bgSrc });
	}

	return customAssets3D;
}

function getCustomAudios(data: any) {
	const customAudios: any[] = [];
	return customAudios;
}

function getCustomFonts(data: any) {
	const customFonts: any = {
		// font: data.fontSrc,
	};
	return customFonts;
}

export { getCustomAssets2D, getCustomAssets3D, getCustomAudios, getCustomFonts };
