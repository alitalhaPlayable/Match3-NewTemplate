import { Object3D } from "three";
import QuarksModifier from "./QuarksModifier";

export default class QuarksParticleLocal extends Object3D {
	constructor(particle, emitterList) {
		super();

		this.add(particle);
		this.emitterList = emitterList;

		this.stop(true);
	}

	addToScene(scene) {
		scene.add(this);

		if (scene.quarksScene) {
			scene.quarksScene.add(this);
			this.quarksScene = scene.quarksScene;
		}
	}

	destroy() {
		this.stop();
	}

	restart() {
		for (let i = 0; i < this.emitterList.length; i++) {
			let emitter = this.emitterList[i];
			emitter.system.restart();
			//console.log(emitter);
			//emitter.system.play();
		}
	}

	trigger(count = 1) {
		for (let i = 0; i < this.emitterList.length; i++) {
			let emitter = this.emitterList[i];
			emitter.system.looping = false;
			emitter.system.spawn(count);
		}
	}

	emit() {
		for (let i = 0; i < this.emitterList.length; i++) {
			let emitter = this.emitterList[i];
			//emitter.system.looping = true;
			emitter.system.play();
		}
	}

	stop(force) {
		for (let i = 0; i < this.emitterList.length; i++) {
			let emitter = this.emitterList[i];
			if (force) {
				emitter.system.restart();
				emitter.system.pause();
				emitter.system.endEmit();
			} else {
				emitter.system.endEmit();
			}
		}
	}

	setPos(pos) {
		for (let i = 0; i < this.emitterList.length; i++) {
			let emitter = this.emitterList[i];
			emitter.position.copy(pos);
		}
	}

	changeLife(val) {
		for (let i = 0; i < this.emitterList.length; i++) {
			let emitter = this.emitterList[i];

			let startLife = emitter.system.startLife;
			startLife.value = val;
		}
	}

	changeForce(val, dir) {
		let applyForce;
		for (let i = 0; i < this.emitterList.length; i++) {
			let emitter = this.emitterList[i];

			let startSpeed = emitter.system.startSpeed;

			for (let j = 0; j < emitter.system.behaviors.length; j++) {
				let beh = emitter.system.behaviors[j];
				if (beh.type === "ApplyForce") {
					applyForce = beh;
					break;
				}
			}

			if (applyForce) {
				applyForce.magnitude.value = val;
				if (dir) {
					applyForce.direction.copy(dir);
				}
				//this.changeProperty(applyForce, val);
				/* if (!startSpeed.curVal) {
					startSpeed.curVal = startSpeed.value;
				}

				startSpeed.value = startSpeed.curVal * val; */
				//this.changeProperty(startSpeed, val);
			}
		}
	}

	changeColor(val) {
		let kolor = new THREE.Color(val);
		for (let i = 0; i < this.emitterList.length; i++) {
			let emitter = this.emitterList[i];

			let startColor = emitter.system.startColor;
			startColor.color.x = kolor.r;
			startColor.color.y = kolor.g;
			startColor.color.z = kolor.b;
		}
	}

	multiplyParticleScale(mult, fullScale = false) {
		QuarksModifier.multiplyParticleScale(this.emitterList, mult, fullScale);
	}
}
