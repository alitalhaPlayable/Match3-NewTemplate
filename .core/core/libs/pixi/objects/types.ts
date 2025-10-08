import * as PIXI from "pixi.js";
// eslint-disable-next-line import/no-cycle
// import Node2d from "./Node2d";

// import { Viewport as PixiViewport } from "../plugins/viewport/pixi_viewport";
// eslint-disable-next-line import/no-cycle
import Components2D from "./components/components";

// export type PixiObj = PIXI.Container & PIXI.Sprite & pixiExtraParams;
// export type PixiObjOld = PIXI.Container & PIXI.Sprite & PIXI.AnimatedSprite & pixiExtraParams & PixiViewport;

// export type PixiMask = PIXI.Graphics | PIXI.Sprite | null;
// export type PixiObj = {
// 	width: number;
// 	height: number;
// 	parent: PIXI.Container | null;
// 	visible: boolean;
// 	x: number;
// 	y: number;
// 	scale: PIXI.ObservablePoint;
// 	pivot: PIXI.ObservablePoint;
// 	rotation: number;
// 	alpha: number;
// 	buttonMode: boolean;
// 	interactive: boolean;
// 	interactiveChildren: boolean;
// 	hitArea: PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle | PIXI.IHitArea;
// 	cursor: string;
// 	anchor: PIXI.ObservablePoint;
// 	mask: PixiMask;
// 	filters: PIXI.Filter[];
// 	gameObject: Node2d;
// 	onResizeCallback: () => {};
// 	tint: number;
// 	blendMode: PIXI.BLEND_MODES;
// 	skew: PIXI.ObservablePoint;
// 	position: PIXI.ObservablePoint;
// 	angle: number;
// 	sortableChildren: boolean;
// 	zIndex: number;
// 	destroy: () => {};
// 	getBounds: () => {};
// 	getLocalBounds: () => PIXI.Bounds;
// 	toGlobal: () => {};
// 	toLocal: () => {};
// 	on: (event: string, callback: () => {}) => {};
// 	off: (event: string, callback: () => {}) => {};
// } & PIXI.Container;

// export type SpritePixiObj = PIXI.Sprite & PixiObj;
// export type AnimatedSpritePixiObj = PIXI.AnimatedSprite & PixiObj;
// export type ContainerPixiObj = PIXI.Container & PixiObj;
// export type TextPixiObj = PIXI.Text & PixiObj;
// export type ViewportPixiObj = PixiViewport & PixiObj;

type PixiObject2D = {
	id: string;
	type: string;
	label: string;
	components: Components2D;
	updateComponents: (components: any) => void;
	getComponent: (component: string) => any;
	selected: boolean;
	locked: boolean;
	componentsData?: any;
	nodeData?: any;
	isContainer?: boolean;
	customUpdate?: (delta: number) => void;
};

export type StudioObject2D = PixiObject2D & PIXI.Container;
export type StudioLayer2D = PixiObject2D & PIXI.IRenderLayer;
