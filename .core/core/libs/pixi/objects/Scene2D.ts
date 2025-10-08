import { SceneBase } from "../../common/scene";
import { Container, DestroyOptions } from "pixi.js";
import ObjectHelper2D from "../utils/ObjectHelper2D";

// #if process.projConfig.physics2DSettings.physicsType !== "none"
import Box2DPhysics from "../physics/box2d/Box2dPhysics";
// #endif

export class Scene2D extends Container implements SceneBase {
	name: string = "Scene2d";
	isScene: boolean = true;
	physics2d?: Box2DPhysics;

	get gameObjects() {
		return ObjectHelper2D.getSceneObjects(this)!;
	}

	constructor() {
		super();
	}

	onSceneInited() {}

	setupScene() {}

	update(delta: number): void {
		if (this.physics2d) {
			this.physics2d.update();
		}

		this.gameObjects.forEach((obj) => {
			obj.components.update(delta);
		});
	}

	render() {}

	resize(w: number, h: number): void {
		this.baseWidth = w;
		this.baseHeight = h;
		this.gameObjects.forEach((obj) => {
			obj.components.resize(w, h);
		});
	}

	destroy(options?: DestroyOptions): void {
		this.gameObjects.forEach((obj) => {
			ObjectHelper2D.removeObject(obj);
		});
		super.destroy(options);
	}
}

export default Scene2D;
