import { AnimationTexture2D, SpineTexture2D, Texture2D } from "../../common/types";

export const defaultTexture: Texture2D = {
	type: "texture",
	path: "",
	uploadId: "",
	stuffs: null,
	stuffsDataId: "",
	localPath: "",
};

export const defaultAnimationTexture: AnimationTexture2D = {
	imagePath: "assets/snake.png",
	jsonPath: "assets/snake.json",
};

export const defaultSpineTexture: SpineTexture2D = {
	uuid: "defaultSpineTexture",
	imagePath: "assets/chars.png",
	jsonPath: "assets/chars.json",
	atlasPath: "assets/chars.atlas",
};
