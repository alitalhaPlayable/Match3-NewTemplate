// import { AnimatedSprite, Graphics, Loader, TextStyle, Text, Texture, utils, NineSlicePlane } from "pixi.js-legacy";
import * as PIXI from "pixi.js";

import Cache2D from "../utils/Cache2D";
import { Texture2D } from "../../common/types";
import { StudioObject2D } from "./types";
import { SpriteGC } from "../../common/components";

class Sprite extends PIXI.Sprite implements StudioObject2D {
	type: string = "sprite";
	id: string = "";

	selected: boolean = false;
	locked: boolean = false;

	textureData: Texture2D = {
		type: "texture",
		path: "",
		uploadId: "",
		stuffs: null,
		stuffsDataId: "",
		localPath: "",
	};

	textureDataLandscape: Texture2D | null = {
		type: "texture",
		path: "",
		uploadId: "",
		stuffs: null,
		stuffsDataId: "",
		localPath: "",
	};
	lanscapeEnabled: boolean = false;

	constructor({ x = 0, y = 0, texture = "" }) {
		const useTexture = Cache2D.getTexture(texture, (textureRef: PIXI.Texture) => {
			this._setTextureFrame(textureRef);
		});

		super({
			texture: useTexture,
			x,
			y,
		});

		this.isReady = true;

		this.initComponentSystem();
	}

	// COMPONENTS
	updateSpriteComponent(component: SpriteGC) {
		this.updateTextureData(component);
	}

	getSpriteComponent(): SpriteGC {
		return {
			type: "sprite",
			texture: this.textureData,
			landscapeTexture: this.textureDataLandscape,
			landscape: this.lanscapeEnabled,
			tint: this.tint.toString(16),
			resizeOnTextureUpdate: true,
		};
	}

	updateComponents(components: { [key: string]: any }) {
		const sprite = components.sprite as SpriteGC;

		if (sprite) {
			this.updateSpriteComponent(sprite);
		}

		super.updateComponents(components);
		// this.components.update(components);
	}

	preResize() {
		this.updateSpriteComponent(this.getSpriteComponent());
	}

	// updateMask(invertAlpha: boolean) {
	// 	if (!this.filters) {
	// 		this.filters = [];
	// 	}

	// 	if (!Array.isArray(this.filters)) {
	// 		if (this.filters) {
	// 			this.filters = [this.filters];
	// 		} else {
	// 			this.filters = [];
	// 		}
	// 	}

	// 	this.filters = this.filters.filter((filter) => filter.constructor.name !== "SpriteMaskFilter");
	// }
}

export default Sprite;
