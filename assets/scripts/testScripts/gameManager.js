import SceneManager3D from "core/libs/common/SceneManager3D";
import Script3D from "core/libs/common/script/Script3D";
import globals from "../../src/globals";
import Data3D from "core/libs/three/utils/Data3D";
import ObjectHelper3D from "core/libs/three/utils/ObjectHelper3D";

export default class GameManager extends Script3D {
	_className = "GameManager";

	static instance;

	currentLevel = 0;
	maxLevel = 2;
	resetCount = 0;
	inited = false;
	goCount = 0;

	awake() {
		if (!GameManager.instance) {
			GameManager.instance = this;
			ObjectHelper3D.DoNotDestroyOnLoad(this.node);
			// console.log("CREATING GAME MANAGER");
		} else {
			if (GameManager.instance !== this) {
				// console.log("DESTROYING GAME MANAGER ALREADY GOT ONE");
				this.node.destroy();
			}
		}
	}

	init() {
		if (this.inited) return;
		this.inited = true;
		// console.log("INIT GAME MANAGER");
		globals.eventEmitter.on("gameWin", () => {
			this.currentLevel = (this.currentLevel + 1) % this.maxLevel;
			// console.log("NEXT LEVEL", this.currentLevel);
			SceneManager3D.goToScene("level2");
		});

		document.addEventListener("keydown", (e) => {
			if (e.key === "r") {
				this.goCount++;
				this.resetCount++;
				SceneManager3D.restartScene();
			}
			if (e.key === "t") {
				this.goCount++;
				globals.eventEmitter.emit("gameWin");
			}
		});
	}

	update(delta) { }

	resize(w, h) { }

	onAdd() { }

	onRemove() { }
}
