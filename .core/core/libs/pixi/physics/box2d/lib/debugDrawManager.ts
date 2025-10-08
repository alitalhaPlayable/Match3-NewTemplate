import { Sprite, Texture, Container, Graphics } from "pixi.js";

let graphics: Graphics;
let PTM: number;
let world: any;
let sprite: Sprite | null = null;
let worldBounds = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
};
let parentCont: Container | null = null;

const destroy = (): void => {
	if (sprite) {
		sprite.destroy();
		sprite = null;
	}
};

export const init = (
	_world: any,
	_worldBounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	},
	_wallStroke: any,
	_PTM: number,
	Box2D: any,
	_parentCont: Container
) => {
	destroy();
	if (_worldBounds) worldBounds = _worldBounds;
	parentCont = _parentCont;
	graphics = new Graphics()
	parentCont.addChild(graphics)
	graphics.zIndex = 999999

	PTM = _PTM;
	world = _world;

	const { makeDebugDraw } = require("./debugDrawPixi");
	const debugDraw = makeDebugDraw(graphics, PTM, Box2D);
	world.SetDebugDraw(debugDraw);
};

export const refresh = (
	_worldBounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	},
	_wallStroke: any,
	_PTM: number
): void => {
	if (_worldBounds) worldBounds = _worldBounds;
	PTM = _PTM;
};

export const update = (): void => {
	graphics.clear()
	if (!parentCont || parentCont.destroyed) {
		return;
	}

	world.DebugDraw();
};
