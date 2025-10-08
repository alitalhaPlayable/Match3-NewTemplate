import * as PIXI from "pixi.js";
import { v4 as uuidv4 } from "uuid";
import PixiTransformPrototypes from "./PixiTransformPrototypes";
import Components2D from "../components/components";
import { NineSliceSpriteGC, Node2DGC, SpriteGC, TilingSpriteGC } from "../../../common/components";
import ObjectHelper2D from "../../utils/ObjectHelper2D";
import Cache2D from "../../utils/Cache2D";
import { isStudio, isTemplate } from "../../../common/editorGlobals";
import PixiSpritePrototypes from "./PixiSpritePrototypes";
import { StudioObject2D } from "../types";
import SceneHelper2D from "../../utils/SceneHelper2D";
import Container from "../Container";
import PixiTextPrototypes from "./PixiTextPrototypes";
import EventEmitter from "core/libs/common/EventEmitter";
import Script2D from "core/libs/common/script/Script2D";

PixiTransformPrototypes();
PixiSpritePrototypes();
PixiTextPrototypes();

declare module "pixi.js" {
	interface Container {
		id: string;
		baseWidth: number;
		baseHeight: number;
		body?: any;
		type: string;
		isScene: boolean;
		parentScene: any;
		scripts: Script2D[];

		// components
		components: Components2D;
		updateComponents(components: { [key: string]: any }): void;
		getComponent(component: string): any;
		initComponentSystem(): void;
		_changeMask(maskNode: PIXI.Container | null, inverse?: boolean): void;

		// transform related
		setScale(x: number, y: number): void;
		setOrigin(x: number, y: number): void;
		setSkew(x: number, y: number): void;
		bringToTop(child: PIXI.Container): PIXI.Container;
		sendToBack(child: PIXI.Container): PIXI.Container;

		get scaleX(): number;
		set scaleX(value: number);
		get scaleY(): number;
		set scaleY(value: number);

		get originX(): number;
		set originX(value: number);
		get originY(): number;
		set originY(value: number);

		get skewX(): number;
		set skewX(value: number);
		get skewY(): number;
		set skewY(value: number);

		get top(): number;
		set top(value: number);
		get bottom(): number;
		set bottom(value: number);
		get left(): number;
		set left(value: number);
		get right(): number;
		set right(value: number);

		isClicked: boolean;

		onResizeCallback: (w: number, h: number) => void;
		onResize(w: number, h: number): void;
		preResize(w: number, h: number): void;

		data: any;
		isStudioObject: boolean;
		isHorizontalTexture?: boolean;
		needsTextureUpdate: boolean;

		clone(): Container;
		playTransitionFX(name: string): void;
		updateResponsive2D?(index?: number, direction?: string, data?: any, animated?: boolean): void;
		maskRef: string | null;

		getChildByLabelRecursive(label: string): PIXI.Container | null;
		getObjectByName(label: string): PIXI.Container | null;
		traverse(callback: (child: PIXI.Container) => void): void;

		datajsEventsInited?: boolean;
		eventEmitter: EventEmitter;

		// helpers
		forceResize: () => void;
		isReady: boolean;
	}

	interface Sprite {
		updateTextureData(component: SpriteGC): void;
		setTexture(textureName: string): void;
		setTextureFrame(texture: PIXI.Texture): void;
		_setTextureFrame(texture: PIXI.Texture): void;
		userDefinedTexture: boolean;
		originalTextureDescriptor: any;
	}

	interface TilingSprite {
		updateTextureData(component: TilingSpriteGC): void;
		setTexture(textureName: string): void;
		setTextureFrame(texture: PIXI.Texture): void;
		_setTextureFrame(texture: PIXI.Texture): void;
		userDefinedTexture: boolean;
		originalTextureDescriptor: any;
	}

	interface NineSliceSprite {
		updateTextureData(component: NineSliceSpriteGC): void;
		setTexture(textureName: string): void;
		setTextureFrame(texture: PIXI.Texture): void;
		_setTextureFrame(texture: PIXI.Texture): void;
		userDefinedTexture: boolean;
		originalTextureDescriptor: any;
	}

	interface Text {
		convertToFillStyle(fill: string | string[], height: number, gradientData: any): PIXI.FillStyle;
	}

	interface HTMLText {
		convertToFillStyle(fill: string | string[], height: number, gradientData: any): PIXI.FillStyle;
	}

	interface Graphics {
		convertToFillStyle(fill: string | string[], height: number, gradientData: any): PIXI.FillStyle;
	}

	interface Filter {
		type?: string;
		isStudioFilter?: boolean;
	}

	interface Texture {
		isMissingTexture?: boolean;
	}
}

PIXI.Container.prototype.baseWidth = 100;
PIXI.Container.prototype.baseHeight = 100;
PIXI.Container.prototype.needsTextureUpdate = true;
PIXI.Container.prototype.isHorizontalTexture = undefined;
PIXI.Container.prototype.eventEmitter = new EventEmitter();

const tempDestroy = PIXI.Container.prototype.destroy;
PIXI.Container.prototype.destroy = function destroy() {
	ObjectHelper2D.removeObject(this as any);
	tempDestroy.call(this);
};

PIXI.Container.prototype.forceResize = function forceResize() {
	// this.components?.responsive?.update(this.components?.responsive?.componentData);
	const w = this.parent?.baseWidth || app.globals.pixiWidth;
	const h = this.parent?.baseHeight || app.globals.pixiHeight;

	this.components?.resize(w, h);
};

PIXI.Container.prototype.initComponentSystem = function initComponentSystem() {
	this.components = new Components2D(this);
};

PIXI.Container.prototype._changeMask = function changeMask(maskNode: PIXI.Container | null, inverse = false) {
	const tempMask = this.mask;
	this.mask = null;
	if (tempMask) {
		if (ObjectHelper2D.maskOfXObject(tempMask) === 0) {
			(tempMask as PIXI.Container).renderable = true;
		}
	}

	if (maskNode) {
		if (ObjectHelper2D.maskOfXObject(maskNode) === 0) {
			(maskNode as PIXI.Container).renderable = true;
		}
		try {
			// this.mask = maskNode;
			this.effects = this.effects || [];
			// @ts-ignore
			this.setMask({ inverse, mask: maskNode });
		} catch (e) {
			console.error(e);
		}
		ObjectHelper2D.setMaskObjects([maskNode]);
	}
};

PIXI.Container.prototype.updateComponents = function updateComponents(components: { [key: string]: any }) {
	this.components.updateComponents(components);

	const node2D = components.node2D as Node2DGC;
	if (node2D) {
		if (node2D.mask) {
			const maskNode = ObjectHelper2D.getNodeById(node2D.mask);
			if (maskNode) {
				this._changeMask(maskNode, node2D.invertAlpha);
			} else {
				if (isStudio()) {
					setTimeout(() => {
						if (node2D.mask) {
							const maskNode2 = ObjectHelper2D.getNodeById(node2D.mask);
							if (maskNode2) {
								this._changeMask(maskNode2);
							}
						}
					}, 500);
				}
			}
		} else {
			this._changeMask(null);
		}

		if (node2D.layer) {
			// @ts-ignore
			const layer = ObjectHelper2D.getNodeById(node2D.layer) as PIXI.IRenderLayer;
			if (layer) {
				layer.attach(this);
			}
		} else if (this.parentRenderLayer) {
			this.parentRenderLayer.detach(this);
		}
	}
};

PIXI.Container.prototype.traverse = function traverse(callback: (child: PIXI.Container) => void) {
	this.children.forEach((child) => {
		if (child instanceof PIXI.Container) {
			callback(child);
			(child as PIXI.Container).traverse(callback);
		}
	});
};

PIXI.Container.prototype.getComponent = function getComponent(component: string) {
	return this.components.get(component);
};

PIXI.Container.prototype.isClicked = false;

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
PIXI.Container.prototype.onResizeCallback = function onResizeCallback(w: number, h: number) {
	// this.components?.responsive?.update();
};

PIXI.Container.prototype.onResize = function onResize(w: number, h: number) {
	this.onResizeCallback(w, h);
};
PIXI.Container.prototype.preResize = function preResize() {};

PIXI.Container.prototype.data = {};

PIXI.Container.prototype.isStudioObject = false;

// const randomId = () => {
// 	return Math.random().toString(36).substring(7);
// };

PIXI.Container.prototype.clone = function clone() {
	const scene = this.parentScene;

	const recursive = (realObj: PIXI.Container, parent?: PIXI.Container) => {
		if (realObj.isStudioObject) {
			const studioObj = realObj as StudioObject2D;

			const newObj = SceneHelper2D.addGameObject(
				{
					components: studioObj.componentsData,
					children: [],
					type: studioObj.type,
					id: uuidv4(),
				},
				parent || this.parentScene,
				scene
			);

			if (studioObj.children) {
				studioObj.children.forEach((child) => {
					recursive(child, newObj as Container);
				});
			}

			return newObj as PIXI.Container;
		}

		let newObj: PIXI.Container = new PIXI.Container();

		if (realObj instanceof PIXI.Sprite) {
			const oldObj = realObj as PIXI.Sprite;
			newObj = new PIXI.Sprite(oldObj.texture);
		} else if (realObj instanceof PIXI.AnimatedSprite) {
			const oldObj = realObj as PIXI.AnimatedSprite;
			newObj = new PIXI.AnimatedSprite(oldObj.textures);
		} else if (realObj instanceof PIXI.TilingSprite) {
			const oldObj = realObj as PIXI.TilingSprite;
			newObj = new PIXI.TilingSprite({
				texture: oldObj.texture,
				width: oldObj.width,
				height: oldObj.height,
			});
		} else if (realObj instanceof PIXI.NineSliceSprite) {
			const oldObj = realObj as PIXI.NineSliceSprite;
			newObj = new PIXI.NineSliceSprite({
				texture: oldObj.texture,
				leftWidth: oldObj.leftWidth,
				rightWidth: oldObj.rightWidth,
				topHeight: oldObj.topHeight,
				bottomHeight: oldObj.bottomHeight,
			});
		} else if (realObj instanceof PIXI.Graphics) {
			// const oldObj = realObj as PIXI.Graphics;
			newObj = new PIXI.Graphics();
		} else if (realObj instanceof PIXI.Text) {
			const oldObj = realObj as PIXI.Text;
			newObj = new PIXI.Text({
				text: oldObj.text,
				style: oldObj.style,
			});
		} else if (realObj instanceof PIXI.Container) {
			// const oldObj = realObj as PIXI.Container;
			newObj = new PIXI.Container();
		}

		if (newObj) {
			newObj.setOrigin(realObj.originX, realObj.originY);
			newObj.position.set(realObj.position.x, realObj.position.y);
			newObj.scale.set(realObj.scale.x, realObj.scale.y);
			newObj.rotation = realObj.rotation;
			newObj.skew.set(realObj.skew.x, realObj.skew.y);
			newObj.tint = realObj.tint;
			parent?.addChild(newObj);
			return newObj;
		}
		return new Container();
	};

	return recursive(this, this.parent);
};

PIXI.Container.prototype.bringToTop = function bringToTop(child: PIXI.Container) {
	const array = this.children;
	var currentIndex = array.indexOf(child);

	if (currentIndex !== -1 && currentIndex < array.length) {
		array.splice(currentIndex, 1);
		array.push(child);
	}

	return child;
};

PIXI.Container.prototype.sendToBack = function sendToBack(child: PIXI.Container) {
	const array = this.children;
	var currentIndex = array.indexOf(child);

	if (currentIndex !== -1 && currentIndex > 0) {
		array.splice(currentIndex, 1);
		array.unshift(child);
	}

	return child;
};

PIXI.Container.prototype.getChildByLabelRecursive = function getChildByLabelRecursive(label: string) {
	if (this.label === label) {
		return this;
	}

	const child = this.getChildByLabel(label);
	if (child) {
		return child;
	}

	for (const child of this.children) {
		if (child instanceof PIXI.Container) {
			const found = (child as PIXI.Container).getChildByLabelRecursive(label);
			if (found) {
				return found;
			}
		}
	}

	return null;
};

PIXI.Container.prototype.playTransitionFX = function playTransitionFX(animationName: string) {
	if (this.components?.transitionFX) {
		this.components.transitionFX.play(animationName);
	} else {
		console.warn("No transitionFx component found on this container.");
	}
};

PIXI.Container.prototype.updateResponsive2D = function updateResponsive2D(
	index: number = 0,
	direction: "portrait" | "landscape" = "portrait",
	updates: Partial<{
		fitType: string;
		width: number;
		height: number;
		origin: string;
		horizontalSpace: number;
		horizontalSpaceUnit: string;
		verticalSpace: number;
		verticalSpaceUnit: string;
		enabled: boolean;
	}> = {},
	animated: boolean = false
) {
	if (this.components?.responsive) {
		this.components.responsive.setResizePropertiesByIndex(index, direction, updates, animated);
	} else {
		console.warn("Responsive2D component not found on", this);
	}
};

PIXI.Container.prototype.getObjectByName = PIXI.Container.prototype.getChildByLabelRecursive;

// const tempConstructor = PIXI.Sprite.prototype.constructor;
// PIXI.Sprite.prototype.constructor = function constructor(options) {
// 	tempConstructor.call(this, options);
// };

window.PIXI = PIXI;

if (isTemplate()) {
	const tempGetTexture = PIXI.Texture.from;
	PIXI.Texture.from = function getTexture2D(source, options) {
		if (Cache2D.hasTexture(source as string)) {
			return Cache2D.getTexture(source as string);
		}
		return tempGetTexture.call(PIXI.Texture, source, options);
	};

	PIXI.Sprite.from = function getSprite2D(source, options) {
		if (Cache2D.hasTexture(source as string)) {
			return new PIXI.Sprite(Cache2D.getTexture(source as string));
		}
		return new PIXI.Sprite(PIXI.Texture.from(source as string, options));
	};
}

export default () => {
	return null;
};
