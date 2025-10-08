import * as PIXI from "pixi.js";
import { StudioObject2D } from "./types";
import { CameraGC } from "../../common/components";
import ObjectHelper2D from "../utils/ObjectHelper2D";
import { getPixiApplication, isStudio } from "../../common/editorGlobals";

function lerp(start: number, end: number, alpha: number) {
	return start + (end - start) * alpha;
}

class Camera extends PIXI.Container implements StudioObject2D {
	id: string = "";
	type: string = "camera";

	selected: boolean = false;
	locked: boolean = false;

	view: PIXI.Rectangle;
	target: PIXI.Container | null;
	lerp: { x: number; y: number };
	world?: PIXI.Container;
	debug: PIXI.Graphics | null = null;
	worldBounds: PIXI.Rectangle = new PIXI.Rectangle(0, 0, 0, 0);
	screenSize: PIXI.Rectangle = new PIXI.Rectangle(0, 0, 0, 0);
	zoom: number = 1;
	clampToWorldBounds: boolean = false;
	ignoreList: PIXI.Container[] = [];
	fitScale: PIXI.Point = new PIXI.Point(1, 1);
	offset: PIXI.Point = new PIXI.Point(0.5, 0.5);
	isFit: boolean = false;

	private debugWidth: number = 6;

	constructor(name: string) {
		super();

		this.label = name;

		this.view = new PIXI.Rectangle(0, 0, 0, 0);
		this.target = null;
		this.lerp = { x: 1, y: 1 };
		this.screenSize = new PIXI.Rectangle(0, 0, 0, 0);
		this.setWorldBounds(0, 0, 0, 0);

		this.initComponentSystem();

		getPixiApplication().ticker.add(() => {
			this.update();
		});

		this.onResizeCallback = (w: number, h: number) => {
			this.resize(w, h);
			if (this.target && this.isFit) {
				this.view.width = w * this.fitScale.x;
				this.view.height = h * this.fitScale.y;
				this.fitOn(this.target);
			}
			this.setWorldBounds(this.worldBounds.x, this.worldBounds.y, Math.max(this.worldBounds.width, w), Math.max(this.worldBounds.height, h));
		};
	}

	updateCameraComponent(camera: CameraGC) {
		this.baseWidth = camera.width;
		this.baseHeight = camera.height;
		this.view.width = camera.width;
		this.view.height = camera.height;
		this.clampToWorldBounds = camera.clamp;
		this.world = ObjectHelper2D.getNodeById(camera.world);

		if (!this.world) {
			console.error("Camera world not found!");
		}

		this.worldBounds = new PIXI.Rectangle(camera.worldPosition.x, camera.worldPosition.y, camera.worldWidth, camera.worldHeight);

		this.lerp = camera.lerp;
		this.isFit = camera.isFit;
		this.fitScale = new PIXI.Point(camera.fitScale.x, camera.fitScale.y);
		this.offset = new PIXI.Point(camera.offset.x, camera.offset.y);

		const target = ObjectHelper2D.getNodeById(camera.target);
		if (target) {
			this.follow(target, this.lerp.x, this.lerp.y);
		}

		if (!isStudio()) {
			if (camera.debug) {
				this.showDebug();
			} else {
				this.hideDebug();
			}
		}
	}

	updateComponents(components: { [key: string]: any }) {
		const camera = components.camera as CameraGC;

		if (camera) {
			this.updateCameraComponent(camera);
		}

		super.updateComponents(components);
	}

	setWorldBounds(x: number, y: number, width: number, height: number) {
		this.worldBounds = new PIXI.Rectangle(x, y, width * this.zoom, height * this.zoom);
	}

	follow(target: PIXI.Container, lerpX: number = 1, lerpY: number = 1) {
		if (isStudio()) {
			return;
		}
		if (this.ignoreList.includes(target)) {
			this.ignoreList = this.ignoreList.filter((ignore) => ignore !== target);
		}

		this.target = target;
		this.lerp = { x: lerpX, y: lerpY };
	}

	unfollow() {
		this.target = null;
	}

	focusOn(displayObject: PIXI.Container) {
		this.view.x = displayObject.x * this.zoom - this.view.width / 2;
		this.view.y = displayObject.y * this.zoom - this.view.height / 2;
	}

	focusOnXY(x: number, y: number) {
		this.view.x = x * this.zoom - this.view.width / 2;
		this.view.y = y * this.zoom - this.view.height / 2;
	}

	fitOn(displayObject: PIXI.Container) {
		// find the zoom ratio to fit the displayObject
		const zoomX = this.view.width / displayObject.width;
		const zoomY = this.view.height / displayObject.height;
		this.zoom = Math.min(zoomX, zoomY);

		this.focusOn(displayObject);
	}

	update() {
		if (isStudio()) {
			return;
		}

		if (this.target) {
			this.followTarget();
		}

		let offset = { x: 0, y: 0 };
		if (this.clampToWorldBounds && !this.isFit) {
			this.clampCameraToWorldBounds();
		}
		offset = this.offsetCamera();

		if (this.world) {
			this.world.position.set(-this.view.x + offset.x, -this.view.y + offset.y);
			this.world.scale.set(this.zoom);
		}

		this.updateIgnoreList(offset);
		this.updateDebug();
	}

	updateIgnoreList(offset: { x: number; y: number }) {
		this.ignoreList.forEach((ignore: any) => {
			if (!ignore.cameraOffset) {
				ignore.cameraOffset = { x: ignore.x, y: ignore.y };
			}

			if (ignore.isDirty) {
				ignore.isDirty = false;
				ignore.cameraOffset = { x: ignore.x, y: ignore.y };
			}

			const x = -(-this.view.x + offset.x);
			const y = -(-this.view.y + offset.y);
			ignore.position.set(x + ignore.cameraOffset.x, y + ignore.cameraOffset.y);
		});
	}

	clampCameraToWorldBounds() {
		if (this.worldBounds) {
			if (this.leftCenter.x <= this.worldBounds.x) {
				this.view.x = this.worldBounds.x;
			}

			if (this.rightCenter.x >= this.worldBounds.x + this.worldBounds.width * this.zoom) {
				this.view.x = this.worldBounds.x + this.worldBounds.width * this.zoom - this.view.width;
			}

			if (this.topCenter.y <= this.worldBounds.y) {
				this.view.y = this.worldBounds.y;
			}

			if (this.bottomCenter.y >= this.worldBounds.y + this.worldBounds.height * this.zoom) {
				this.view.y = this.worldBounds.y + this.worldBounds.height * this.zoom - this.view.height;
			}
		}
	}

	offsetCamera() {
		const fullOffset = {
			x: this.screenSize.width - this.view.width,
			y: this.screenSize.height - this.view.height,
		};

		const offset = {
			x: fullOffset.x * this.offset.x,
			y: fullOffset.y * this.offset.y,
		};

		if (!this.clampToWorldBounds || this.isFit) {
			return offset;
		}

		if (this.leftCenter.x <= offset.x + this.worldBounds.x) {
			offset.x = this.leftCenter.x - this.worldBounds.x;
		}

		// console.log(this.topCenter.y, offset.y + this.worldBounds.y);
		if (this.topCenter.y <= offset.y + this.worldBounds.y) {
			offset.y = this.topCenter.y - this.worldBounds.y;
		}

		if (this.rightCenter.x + (fullOffset.x - offset.x) >= this.worldBounds.x + this.worldBounds.width * this.zoom && this.worldBounds.width * this.zoom >= this.screenSize.width) {
			offset.x = this.screenSize.width - this.view.width - (this.worldBounds.width * this.zoom - this.rightCenter.x) - this.worldBounds.y;
		}

		if (this.bottomCenter.y + (fullOffset.y - offset.y) >= this.worldBounds.y + this.worldBounds.height * this.zoom && this.worldBounds.height * this.zoom >= this.screenSize.height) {
			offset.y = this.screenSize.height - this.view.height - (this.worldBounds.height * this.zoom - this.bottomCenter.y) - this.worldBounds.y;
		}

		return offset;
	}

	followTarget() {
		if (!this.target) {
			return;
		}
		// this.x = this.target.x * this.zoom - this.width * 0.5;
		// this.y = this.target.y * this.zoom - this.height * 0.5;

		// lerping
		this.view.x = lerp(this.view.x, this.target.x * this.zoom - this.view.width * 0.5, this.lerp.x);
		this.view.y = lerp(this.view.y, this.target.y * this.zoom - this.view.height * 0.5, this.lerp.y);
	}

	setViewSize(width: number, height: number) {
		this.view.width = width;
		this.view.height = height;
	}

	setScreenSize(width: number, height: number) {
		this.screenSize = new PIXI.Rectangle(0, 0, width, height);
	}

	resize(width: number, height: number) {
		this.setScreenSize(width, height);
	}

	reset() {
		this.target = null;
		this.view.x = 0;
		this.view.y = 0;
	}

	set x(value: number) {
		this.view.x = value;
	}

	get x() {
		return this.view.x;
	}

	set y(value: number) {
		this.view.y = value;
	}

	get y() {
		return this.view.y;
	}

	get center() {
		return {
			x: this.view.x + this.view.width * 0.5,
			y: this.view.y + this.view.height * 0.5,
		};
	}

	get leftCenter() {
		return {
			x: this.view.x,
			y: this.view.y + this.view.height * 0.5,
		};
	}

	get rightCenter() {
		return {
			x: this.view.x + this.view.width,
			y: this.view.y + this.view.height * 0.5,
		};
	}

	get topCenter() {
		return {
			x: this.view.x + this.view.width * 0.5,
			y: this.view.y,
		};
	}

	get bottomCenter() {
		return {
			x: this.view.x + this.view.width * 0.5,
			y: this.view.y + this.view.height,
		};
	}

	showDebug(zIndex: number = 0) {
		if (!this.debug) {
			this.debug = new PIXI.Graphics();
			this.parent.addChild(this.debug);
			this.debug.zIndex = zIndex;
		}
	}

	hideDebug() {
		if (this.debug) {
			this.debug.clear();
			this.parent.removeChild(this.debug);
			this.debug = null;
		}
	}

	private updateDebug() {
		if (!this.debug) {
			return;
		}

		this.debug.clear();

		this.drawCameraFrame();
		if (!this.isFit) {
			this.drawWorldFrame();
		}
	}

	private drawCameraFrame() {
		if (!this.debug) {
			return;
		}

		const worldX = this.world ? this.world.x : 0;
		const worldY = this.world ? this.world.y : 0;

		this.debug.rect(worldX + this.view.x, worldY + this.view.y, this.view.width, this.view.height);
		this.debug.fill({
			color: 0xffffff,
			alpha: 0.1,
		});

		const bigFrameLength = Math.min(this.view.width, this.view.height) * 0.2;
		this.debug.moveTo(worldX + this.view.x, worldY + this.view.y + bigFrameLength);
		this.debug.lineTo(worldX + this.view.x, worldY + this.view.y);
		this.debug.lineTo(worldX + this.view.x + bigFrameLength, worldY + this.view.y);

		this.debug.moveTo(worldX + this.view.x + this.view.width, worldY + this.view.y + bigFrameLength);
		this.debug.lineTo(worldX + this.view.x + this.view.width, worldY + this.view.y);
		this.debug.lineTo(worldX + this.view.x + this.view.width - bigFrameLength, worldY + this.view.y);

		this.debug.moveTo(worldX + this.view.x + bigFrameLength, worldY + this.view.y + this.view.height);
		this.debug.lineTo(worldX + this.view.x, worldY + this.view.y + this.view.height);
		this.debug.lineTo(worldX + this.view.x, worldY + this.view.y + this.view.height - bigFrameLength);

		this.debug.moveTo(worldX + this.view.x + this.view.width - bigFrameLength, worldY + this.view.y + this.view.height);
		this.debug.lineTo(worldX + this.view.x + this.view.width, worldY + this.view.y + this.view.height);
		this.debug.lineTo(worldX + this.view.x + this.view.width, worldY + this.view.y + this.view.height - bigFrameLength);

		const smallFrameLength = bigFrameLength * 0.5;

		const offset = 0.3;
		this.debug.moveTo(worldX + this.view.x + this.view.width * offset, worldY + this.view.y + this.view.height * offset + smallFrameLength);
		this.debug.lineTo(worldX + this.view.x + this.view.width * offset, worldY + this.view.y + this.view.height * offset);
		this.debug.lineTo(worldX + this.view.x + this.view.width * offset + smallFrameLength, worldY + this.view.y + this.view.height * offset);

		this.debug.moveTo(worldX + this.view.x + this.view.width * (1 - offset), worldY + this.view.y + this.view.height * offset + smallFrameLength);
		this.debug.lineTo(worldX + this.view.x + this.view.width * (1 - offset), worldY + this.view.y + this.view.height * offset);
		this.debug.lineTo(worldX + this.view.x + this.view.width * (1 - offset) - smallFrameLength, worldY + this.view.y + this.view.height * offset);

		this.debug.moveTo(worldX + this.view.x + this.view.width * offset, worldY + this.view.y + this.view.height * (1 - offset) - smallFrameLength);
		this.debug.lineTo(worldX + this.view.x + this.view.width * offset, worldY + this.view.y + this.view.height * (1 - offset));
		this.debug.lineTo(worldX + this.view.x + this.view.width * offset + smallFrameLength, worldY + this.view.y + this.view.height * (1 - offset));

		this.debug.moveTo(worldX + this.view.x + this.view.width * (1 - offset), worldY + this.view.y + this.view.height * (1 - offset) - smallFrameLength);
		this.debug.lineTo(worldX + this.view.x + this.view.width * (1 - offset), worldY + this.view.y + this.view.height * (1 - offset));
		this.debug.lineTo(worldX + this.view.x + this.view.width * (1 - offset) - smallFrameLength, worldY + this.view.y + this.view.height * (1 - offset));

		this.debug.stroke({
			color: 0x000000,
			width: this.debugWidth,
		});

		this.debug.moveTo(worldX + this.center.x, worldY + this.center.y - this.debugWidth * 2);
		this.debug.lineTo(worldX + this.center.x, worldY + this.center.y + this.debugWidth * 2);
		this.debug.moveTo(worldX + this.center.x - this.debugWidth * 2, worldY + this.center.y);
		this.debug.lineTo(worldX + this.center.x + this.debugWidth * 2, worldY + this.center.y);

		this.debug.stroke({
			color: 0xff0000,
			width: this.debugWidth,
		});
	}

	private drawWorldFrame() {
		if (!this.debug) {
			return;
		}

		const worldX = this.world ? this.world.x : 0;
		const worldY = this.world ? this.world.y : 0;

		this.debug.rect(
			worldX + this.worldBounds.x + this.debugWidth * 0.5,
			worldY + this.worldBounds.y + this.debugWidth * 0.5,
			this.worldBounds.width * this.zoom - this.debugWidth * 1,
			this.worldBounds.height * this.zoom - this.debugWidth * 1
		);
		this.debug.stroke({
			color: 0x0000ff,
			width: this.debugWidth,
		});
	}
}

export default Camera;
