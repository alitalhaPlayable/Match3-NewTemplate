import * as PIXI from "pixi.js";
import { NineSliceSpriteGC, SpriteGC, TilingSpriteGC } from "../../../common/components";
import { getRootScene, isStudio, isTemplate } from "../../../common/editorGlobals";
import Cache2D from "../../utils/Cache2D";
import Sprite from "../Sprite";
import NineSliceSprite from "../NineSliceSprite";
import TilingSprite from "../TilingSprite";
import Cell2D from "../Cell2D";

function toFullHex(color: string) {
	// Ensure the color starts with "#"
	if (!color.startsWith("#")) {
		// eslint-disable-next-line no-param-reassign
		color = `#${color}`;
	}

	// Remove the "#" for easier processing
	let hex = color.slice(1);

	// Determine the length and pad accordingly
	if (hex.length === 3) {
		// If color is in shorthand "RGB" format (e.g., "eb9"), expand it
		hex = hex
			.split("")
			.map((char) => char + char)
			.join("");
	} else if (hex.length === 6) {
		// Already in "RRGGBB" format, no change needed
		return `#${hex}`;
	} else {
		// Pad the beginning with "0" to ensure length is 6
		hex = hex.padStart(6, "0");
	}

	return `#${hex}`;
}

function _setTextureFrame(this: Sprite | NineSliceSprite | TilingSprite, texture: PIXI.Texture) {
	this.originalTextureDescriptor?.set?.call(this, texture);
	this.baseWidth = this.texture.orig.width;
	this.baseHeight = this.texture.orig.height;

	this.components?.responsive?.update();

	if (isStudio()) {
		if (this.parent) {
			if (this.parent.type === "cell2D") {
				(this.parent as Cell2D).resizeChildren();
			}
		}
	}
}

function _setTextureById(this: Sprite | NineSliceSprite | TilingSprite, textureId: string) {
	const texture = Cache2D.getTexture(textureId, (textureRef: PIXI.Texture) => {
		_setTextureFrame.call(this, textureRef);
	});

	if (texture) {
		_setTextureFrame.call(this, texture);
	}
}

function _setTextureFromStuffs(this: Sprite | NineSliceSprite | TilingSprite, stuffsId: string | null, stuffsDataId: string) {
	if (!stuffsId) {
		_setTextureFrame.call(this, Cache2D.getTexture("___missing_image"));
		return;
	}

	let id = stuffsId;

	if (isTemplate()) {
		// @ts-ignore
		const stuffsIndex = window.app.data[stuffsDataId] || 0;
		id = `${stuffsId}_${stuffsIndex}`;
	}

	const texture = Cache2D.getTextureFromStuffs(id, (textureRef: PIXI.Texture) => {
		_setTextureFrame.call(this, textureRef);
	});

	if (texture) {
		_setTextureFrame.call(this, texture);
	}
}

function updateTextureData(this: Sprite | NineSliceSprite | TilingSprite, component: SpriteGC | NineSliceSpriteGC | TilingSpriteGC) {
	if (this.userDefinedTexture) {
		return;
	}
	const rootScene = getRootScene();
	const isHorizontal = rootScene.baseWidth > rootScene.baseHeight;

	const textureData = (isHorizontal && component.landscape ? component.landscapeTexture : component.texture) || component.texture;

	if (textureData) {
		const { path, type, uploadId, stuffs } = textureData;

		if (type === "texture") {
			_setTextureById.call(this, path);
		} else if (type === "uploadable") {
			if (isTemplate()) {
				const uploadableId = `___uploaded_${uploadId}`;
				const texture = Cache2D.getTexture(uploadableId);
				if (texture && texture.label !== "WHITE") {
					_setTextureFrame.call(this, texture);
				} else {
					_setTextureById.call(this, path);
				}

				if (!this.datajsEventsInited) {
					this.datajsEventsInited = true;
					window.addEventListener("pf_" + uploadId, async (e: any) => {
						await Cache2D.load([
							{
								type: "image",
								key: uploadableId,
								src: e.detail.value,
							},
						]);
						const texture = Cache2D.getTexture(uploadableId);
						if (texture && texture.label !== "WHITE") {
							_setTextureFrame.call(this, texture);
							this.eventEmitter.emit(uploadId);
						}
					});
				}
			} else {
				_setTextureById.call(this, path);
			}
		} else if (type === "stuffs") {
			_setTextureFromStuffs.call(this, stuffs, textureData.stuffsDataId);
		}
	}

	this.textureData = { ...component.texture };
	if (component.landscapeTexture) {
		this.textureDataLandscape = { ...component.landscapeTexture };
	}
	this.lanscapeEnabled = component.landscape;

	if (component.tint) {
		let color: any = component.tint;
		if (color === "0" || color === 0 || color === 0x000000) {
			color = "#000000";
		}

		if (color.length < 7) {
			color = toFullHex(color);
		}
		this.tint = new PIXI.Color(color);
	}
}

function setTexture(this: Sprite | NineSliceSprite | TilingSprite, textureName: string) {
	const texture = Cache2D.getTexture(textureName);
	if (!texture) {
		console.warn("Texture not found", textureName);
		return;
	}
	this.userDefinedTexture = true;
	this.texture = texture;
	this.baseWidth = this.texture.orig.width;
	this.baseHeight = this.texture.orig.height;

	this.components?.responsive?.update();

	// const spriteComponent = this.components.get("sprite");
	// if (spriteComponent && spriteComponent.resizeOnTextureUpdate) {
	// 	this.components.responsive?.update();
	// }
}

function setTextureFrame(this: Sprite | NineSliceSprite | TilingSprite, texture: PIXI.Texture) {
	this.userDefinedTexture = true;
	this._setTextureFrame(texture);
}

const prototypes = [PIXI.Sprite.prototype, PIXI.TilingSprite.prototype, PIXI.NineSliceSprite.prototype];

prototypes.forEach((proto) => {
	proto.updateTextureData = updateTextureData;
	proto.setTexture = setTexture;
	proto.setTextureFrame = setTextureFrame;
	proto._setTextureFrame = _setTextureFrame;

	const originalTextureDescriptor = Object.getOwnPropertyDescriptor(proto, "texture");
	proto.originalTextureDescriptor = originalTextureDescriptor;

	Object.defineProperty(proto, "texture", {
		get: function () {
			return this._texture;
		},
		set: function (value) {
			if (this.isReady) {
				this.setTextureFrame(value);
			} else {
				originalTextureDescriptor?.set?.call(this, value);
			}
		},
	});
});

export default () => {
	return null;
};
