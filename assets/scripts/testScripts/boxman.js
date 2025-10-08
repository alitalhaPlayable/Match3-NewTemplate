import Script3D from "core/libs/common/script/Script3D";
import globals from "@globals";
import { PerspectiveCamera } from "three";
import ObjectHelper3D from "core/libs/three/utils/ObjectHelper3D";

export default class Boxman extends Script3D {
	_className = "Boxman";

	camera;

	awake() { }

	init() {
		this.camera = ObjectHelper3D.getObjectByType(PerspectiveCamera);
		this.startPos = this.node.position.clone();
		this.camera.startPos = this.camera.position.clone();
	}

	update(delta) {
		if (globals.controls.isDown) {
			if (!this.firstClick) {
				this.firstClick = true;
				this.node.dispatchEvent({ type: "tapped" });
			}

			if (this.node.position.z < -5 && !this.winner) {
				globals.eventEmitter.emit("gameWin");

				this.winner = true;
			}
		} else {
			this.firstClick = false;
		}

		//this.camera.position.copy(this.camera.startPos);
		//let perc = this.node.position.z / -10;
		//this.camera.position.y += MathUtils.lerp(0, 5, perc);
		//this.camera.position.z -= MathUtils.lerp(0, 5, perc);
	}

	resize(w, h) { }

	onAdd() { }

	onRemove() { }
}
