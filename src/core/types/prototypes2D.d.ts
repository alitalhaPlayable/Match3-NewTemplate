import * as PIXI from "pixi.js";
import Components2D from "core/libs/pixi/objects/components/components";
import EventEmitter from "core/libs/common/EventEmitter";

// Global module augmentation for PIXI
declare module "pixi.js" {
	interface Container {
		id: string;
		baseWidth: number;
		baseHeight: number;
		body?: any;
		type: string;
		isScene: boolean;
		parentScene: any;

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

		clone(): PIXI.Container;
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
	}

	interface Sprite {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Methods
		setTexture(textureName: string): void;
		setTextureFrame(texture: PIXI.Texture): void;
	}

	interface TilingSprite {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Methods
		setTexture(textureName: string): void;
		setTextureFrame(texture: PIXI.Texture): void;
	}

	interface NineSliceSprite {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Methods
		setTexture(textureName: string): void;
		setTextureFrame(texture: PIXI.Texture): void;
	}

	interface Text {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Methods
		setText(text: string): void;
		convertToFillStyle(fill: string | string[], height: number): PIXI.FillStyle;
	}

	interface HTMLText {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Methods
		setText(text: string): void;
		convertToFillStyle(fill: string | string[], height: number): PIXI.FillStyle;
	}

	interface Graphics {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Methods
		convertToFillStyle(fill: string | string[], height: number): PIXI.FillStyle;
	}

	interface Filter {
		type?: string;
		isStudioFilter?: boolean;
	}

	interface Texture {
		isMissingTexture?: boolean;
	}

	interface AnimatedSprite {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// AnimatedSprite specific properties
		animationKey: string;
		animationTexture: string;
		autoplay: boolean;
		isAnimatedSprite: boolean;

		// Methods
		changeAnimationTexture(animData: any): void;
		playAnim(animation: string, reverse?: boolean): void;
		changeTextureAndPlay(animationTexture: string, animationKey: string): void;
	}

	interface Video {
		// StudioObject2D properties (extends Sprite)
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;
		eventEmitter: EventEmitter;

		// Video specific properties
		videoComponent: any;
		videoElement: HTMLVideoElement | null;
		videoSrc: string;

		// Methods
		updateVideoParams(): void;
		changeVideoTexture(component: any): Promise<void>;
		play(): void;
		pause(): void;
		stop(): void;
	}

	interface Viewport {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		selected: boolean;
		locked: boolean;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Viewport specific properties
		config: any;
		minScale: number;

		// Methods
		setWorldSize(width: number, height: number): void;
		followTarget(targetNode: PIXI.Container | null): void;
	}

	interface Spine {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Spine specific properties
		spineTexture: string;
		animation: string;
		animationSpeed: number;
		autoplay: boolean;
		loop: boolean;
		spineObj?: any;

		// Methods
		setSkinByName(skinName: string): void;
		play(animation: string, loop: boolean, callback: (() => void) | null, duration: number): void;
		stop(): void;
		setTimeScale(timeScale: number): void;
		updateHitArea(): void;
	}

	interface Camera {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Camera specific properties
		view: PIXI.Rectangle;
		target: PIXI.Container | null;
		lerp: { x: number; y: number };
		world?: PIXI.Container;
		debug: PIXI.Graphics | null;
		worldBounds: PIXI.Rectangle;
		screenSize: PIXI.Rectangle;
		zoom: number;
		clampToWorldBounds: boolean;
		ignoreList: PIXI.Container[];
		fitScale: PIXI.Point;
		offset: PIXI.Point;
		isFit: boolean;

		// Methods
		update(): void;
		setWorldBounds(x: number, y: number, width: number, height: number): void;
		follow(target: PIXI.Container, lerp?: { x: number; y: number }): void;
		setZoom(zoom: number): void;
	}

	interface Layout2D {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Layout2D specific properties
		portrait: { data: {} };
		landscape: { enabled: boolean; data: {} };
		hasDebug: boolean;
	}

	interface Cell2D {
		// StudioObject2D properties
		id: string;
		type: string;
		label: string;
		nodeData?: any;
		customUpdate?: (delta: number) => void;

		// Cell2D specific properties
		debugRect: PIXI.Graphics;
		hasPortraitMask: boolean;
		hasLandscapeMask: boolean;
		maskGraph: PIXI.Graphics;
		portrait: any;
		landscape: any;

		resizeChildren(): void;
	}
}
