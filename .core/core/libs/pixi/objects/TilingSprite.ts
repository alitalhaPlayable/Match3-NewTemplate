import * as PIXI from "pixi.js";

import Cache2D from "../utils/Cache2D";
import { Texture2D } from "../../common/types";
import { StudioObject2D } from "./types";
import { TilingSpriteGC } from "../../common/components";

class TilingSprite extends PIXI.TilingSprite implements StudioObject2D {
	type: string = "tilingSprite";
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
			texture: useTexture || PIXI.Texture.EMPTY,
			x,
			y,
			tilePosition: { x: 0, y: 0 },
			tileScale: { x: 1, y: 1 },
		});

		this.isReady = true;

		this.initComponentSystem();
	}

	// COMPONENTS
	updateTilingSpriteComponent(component: TilingSpriteGC) {
		this.updateTextureData(component);

		this.width = component.width;
		this.height = component.height;
		this.tilePosition = component.tilePosition;
		this.tileScale = component.tileScale;

		this.baseWidth = this.width;
		this.baseHeight = this.height;

		if (component.tint) {
			this.tint = new PIXI.Color(component.tint);
		}
	}

	getTilingSpriteComponent(): TilingSpriteGC {
		return {
			type: "tilingSprite",
			texture: this.textureData,
			landscapeTexture: this.textureDataLandscape,
			landscape: this.lanscapeEnabled,
			tint: this.tint.toString(16),
			width: this.width,
			height: this.height,
			tilePosition: {
				x: this.tilePosition.x,
				y: this.tilePosition.y,
				linked: true,
			},
			tileScale: {
				x: this.tileScale.x,
				y: this.tileScale.y,
				linked: true,
			},
		};
	}

	updateComponents(components: { [key: string]: any }) {
		const tilingSprite = components.tilingSprite as TilingSpriteGC;
		if (tilingSprite) {
			this.updateTilingSpriteComponent(tilingSprite);
		}

		super.updateComponents(components);
		// this.components.update(components);
	}

	preResize() {
		this.updateTilingSpriteComponent(this.getTilingSpriteComponent());
	}
}

export default TilingSprite;
