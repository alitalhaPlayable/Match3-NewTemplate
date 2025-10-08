// import { AnimatedSprite, Graphics, Loader, TextStyle, Text, Texture, utils, NineSlicePlane } from "pixi.js-legacy";
import * as PIXI from "pixi.js";

import Cache2D from "../utils/Cache2D";
import { Texture2D } from "../../common/types";
import { StudioObject2D } from "./types";
import { NineSliceSpriteGC } from "../../common/components";

class NineSliceSprite extends PIXI.NineSliceSprite implements StudioObject2D {
	type: string = "nineSliceSprite";
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

	constructor({ texture = "" }) {
		const useTexture = Cache2D.getTexture(texture, (textureRef: PIXI.Texture) => {
			this._setTextureFrame(textureRef);
		});
		super({
			texture: useTexture,
			leftWidth: 0,
			rightWidth: 0,
			topHeight: 0,
			bottomHeight: 0,
		});

		this.isReady = true;

		this.initComponentSystem();
	}

	// COMPONENTS
	updateNineSliceSpriteComponent(component: NineSliceSpriteGC) {
		this.updateTextureData(component);

		this.width = component.width;
		this.height = component.height;
		this.leftWidth = component.leftWidth;
		this.rightWidth = component.rightWidth;
		this.topHeight = component.topHeight;
		this.bottomHeight = component.bottomHeight;

		this.baseWidth = this.width;
		this.baseHeight = this.height;

		if (component.tint) {
			this.tint = new PIXI.Color(component.tint);
		}
	}

	getNineSliceSpriteComponent(): NineSliceSpriteGC {
		return {
			type: "nineSliceSprite",
			texture: this.textureData,
			landscapeTexture: this.textureDataLandscape,
			landscape: this.lanscapeEnabled,
			tint: this.tint.toString(16),
			width: this.width,
			height: this.height,
			leftWidth: this.leftWidth,
			rightWidth: this.rightWidth,
			topHeight: this.topHeight,
			bottomHeight: this.bottomHeight,
		};
	}

	updateComponents(components: { [key: string]: any }) {
		const transform = this.components.get("transform");

		const nineSliceSprite = components.nineSliceSprite as NineSliceSpriteGC;
		if (nineSliceSprite) {
			this.updateNineSliceSpriteComponent(nineSliceSprite);
		}

		this.setOrigin(transform.origin.x, transform.origin.y);

		super.updateComponents(components);
		// this.components.update(components);
	}
}

export default NineSliceSprite;
