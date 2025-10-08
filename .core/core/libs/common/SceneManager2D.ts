import globals from "@globals";
import gsap from "gsap";

// #if process.projConfig.physics2DSettings.physicsType !== "none"
import Box2DPhysics from "../pixi/physics/box2d/Box2dPhysics";
// #endif

export default class SceneManager2D {
	static renderer2d: any;

	static init(renderer2d: any) {
		SceneManager2D.renderer2d = renderer2d;
	}

	static restartGame() {
		if (!this.renderer2d) {
			console.log("No renderer2d found");
			return;
		}

		this.goToScene(this.renderer2d.sceneHelper.currentScene.name);
	}

	static goToScene(sceneName2d: string) {
		const physics2d = Box2DPhysics.getInstance();
		if (physics2d) {
			physics2d.restart();
		}

		gsap.globalTimeline.getChildren(true, true, true).forEach((ch) => {
			ch.kill();
		});
		gsap.globalTimeline.clear(true);
		globals.eventEmitter.removeAllListeners();

		this.renderer2d.sceneHelper.initSceneByName(sceneName2d);

		window.app.resizeNow();

		SceneManager2D.start();
	}

	static start() {
		this.renderer2d.scriptSystem.awakeAll();

		this.renderer2d.scriptSystem.initAll();

		this.renderer2d.onBeforeUpdate();
	}
}
