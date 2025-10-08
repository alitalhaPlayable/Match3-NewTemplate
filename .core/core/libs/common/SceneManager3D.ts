import globals from "@globals";
import gsap from "gsap";

export default class SceneManager3D {
	static renderer3d: any;
	static renderer2d: any;

	static init(renderer2d: any, renderer3d: any) {
		SceneManager3D.renderer2d = renderer2d;
		SceneManager3D.renderer3d = renderer3d;
	}

	static restartScene() {
		if (!this.renderer3d) {
			console.log("No renderer3d found");
			return;
		}

		this.goToScene(this.renderer3d.sceneHelper.currentScene.name);
	}

	static goToScene(scene3dIndexOrName: string | number, sceneIndex2d: number = 0) {
		if (window.app.cannonPhysics) {
			window.app.cannonPhysics.clear();
		}
		if (window.app.rapierPhysics) {
			window.app.rapierPhysics.clear();
		}

		gsap.globalTimeline.getChildren(true, true, true).forEach((ch) => {
			ch.kill();
		});
		gsap.globalTimeline.clear(true);
		globals.eventEmitter.removeAllListeners();

		if (typeof scene3dIndexOrName === "number") {
			this.renderer3d.sceneHelper.initSceneByIndex(scene3dIndexOrName);
		} else {
			this.renderer3d.sceneHelper.initSceneByName(scene3dIndexOrName);
		}

		this.renderer2d.sceneHelper.initSceneByIndex(sceneIndex2d); //true, true,

		window.app.resizeNow();

		SceneManager3D.start();
	}

	static start() {
		this.renderer3d.scriptSystem.awakeAll();
		this.renderer2d.scriptSystem.awakeAll();

		this.renderer3d.scriptSystem.initAll();
		this.renderer2d.scriptSystem.initAll();

		this.renderer3d.onBeforeUpdate();
		this.renderer2d.onBeforeUpdate();
	}
}
