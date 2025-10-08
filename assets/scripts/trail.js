// import { BLEND_MODES, Graphics } from "pixi.js-legacy";
import globals from "@globals";
import Graphics from "core/libs/pixi/objects/Graphics";
import { GlowFilter } from "pixi-filters";

/** @type {Phaser.Scene} */
let scene;
/** @type {Phaser.Scene} */
let ui;
let main, data;

class TrailHelper {
	constructor(obj, parent) {
		main = globals.main;
		scene = globals.scene;
		ui = globals.pixiScene;
		data = globals.data;

		this.graphics = new Graphics();
		ui.addChild(this.graphics);
		// this.graphics = ui.add.graphics().setDepth(21)
		this.colorName = obj.color;

		let pos;
		if (obj.tile && obj.tile.gameObject) {
			pos = obj.tile.gameObject.getCenter();
		}
		if (pos && pos.x && pos.y)
			this.pos = {
				x: pos.x,
				y: pos.y,
			};
		else
			this.pos = {
				x: obj.x,
				y: obj.y,
			};
		this.pos = obj.toGlobal({ x: 0, y: 0 });
		this.obj = obj;
		this.setColor();

		this.pointList = [];
		this.graphics.onResizeCallback = function (w, h) {
			this.visible = false;
		};
		//!this.rt = scene.add.renderTexture(0, 0, undefined, undefined, `atlas`, `sphere_blue`).setDepth(20);
		this.isActive = true;
	}

	setColor() {
		//         #FF2500  yellow
		// #07FFFF  blue
		// #86FF3B  green
		// #FF1FFF  purple
		// #FF2500  red
		switch (this.colorName) {
			case "yellow":
				this.color = 0xffff00;
				// this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xf5dc51 })];
				this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xffffff })];
				break;
			case "blue":
				this.color = 0x07ffff;
				// this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0x6df7f3 })];
				this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xffffff })];
				break;
			case "green":
				this.color = 0x86ff3b;
				// this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0x82ed6d })];
				this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xffffff })];
				break;
			case "purple":
				this.color = 0xff1fff;
				// this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xd86ef5 })];
				this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xffffff })];
				break;
			case "red":
				this.color = 0xff2500;
				// this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xf56278 })];
				this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xffffff })];
				break;
			case "orange":
				this.color = 0xffa500;
				// this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xf5ac62 })];
				this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xffffff })];
				break;
			default:
				this.color = 0x300fff;
				// this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0x6b93ff })];
				this.graphics.filters = [new GlowFilter({ distance: 10, innerStrength: 0, outerStrength: 2, color: 0xffffff })];
				break;
		}

		return this.color;
	}

	clear() {
		this.pointList = [];
	}

	update() {
		if (this.graphics == null) return;

		let graphics = this.graphics;
		graphics?.clear();
		// graphics.blendMode = BLEND_MODES.ADD;
		// graphics.setBlendMode(Phaser.BlendModes.ADD)

		this.pos = this.obj.toGlobal({ x: 0, y: 0 });
		if (this.isActive) {
			this.pointList.push({ x: this.pos.x, y: this.pos.y });

			if (this.pointList.length > 30) {
				this.pointList.shift();
			}
		} else {
			if (this.pointList.length > 0) {
				this.pointList.shift();
			}
		}

		if (this.pointList.length == 0) {
			this.pointList.shift();
			return;
		}
		//graphics.fillStyle(this.color,0.8);//0.4
		graphics.fill({ color: this.color, alpha: 0.7 });
		//graphics.setTexture('atlas', 'sphere_blue');
		// graphics.lineStyle(1, this.color,0.8);
		//graphics.beginPath();
		graphics.moveTo(this.pos.x, this.pos.y);

		let rad = 10;
		let returnPath = [];

		for (let i = this.pointList.length - 1; i >= 0; i--) {
			let cur = this.pointList[i];
			let next = this.pointList[i - 1];

			if (!next) continue;

			let dx = next.x - cur.x;
			let dy = next.y - cur.y;
			let rot = Math.atan2(dy, dx);

			let sideRot = rot + Math.PI / 2;
			let moveX = rad * Math.cos(sideRot);
			let moveY = rad * Math.sin(sideRot);

			let sideX = cur.x + moveX;
			let sideY = cur.y + moveY;

			let revSideX = cur.x - moveX;
			let revSideY = cur.y - moveY;

			returnPath.push({ x: revSideX, y: revSideY });

			graphics.lineTo(sideX, sideY);

			rad -= 0.4;

			// graphics.fillCircle(cur.x, cur.y, 10);
		}

		// for(let j=0;j<returnPath.length;j++){
		for (let j = returnPath.length - 1; j >= 0; j--) {
			let pos = returnPath[j];
			graphics.lineTo(pos.x, pos.y);
		}

		graphics.fill();
	}
}

export default TrailHelper;
