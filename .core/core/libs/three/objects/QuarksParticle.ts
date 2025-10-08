import * as THREE from "three";
import { ParticleEmitter } from "three.quarks";
import { StudioObject3D } from "./types";
import ObjectTypes from "../../common/objectTypes";
import QuarksHelper from "../utils/quarks/QuarksHelper";
import { AnimationState, QuarksParticleEmitterSettings, QuarksParticleGC } from "../../common/components";
import QuarksModifier from "../utils/quarks/QuarksModifier";
import EventEmitter from "../../common/EventEmitter";
import Cache3D from "../utils/Cache3D";
import { isStudio } from "core/libs/common/editorGlobals";

class QuarksParticle extends THREE.Object3D implements StudioObject3D {
	sID: string = "";
	type: string = ObjectTypes.QUARKS_PARTICLE;
	selected: boolean = false;
	locked: boolean = false;
	isGameObject: boolean = true;
	modelUUID: string = "";
	particle!: THREE.Object3D;
	emitterList: ParticleEmitter[] = [];
	orgValues: any = {};
	eventEmitter: EventEmitter = EventEmitter.getInstance();

	constructor(modelUUID: string) {
		super();

		this.modelUUID = modelUUID;

		const quarksData = Cache3D.getQuarks(modelUUID, (quarksDataTemp) => {
			if (quarksDataTemp) {
				this.handleQuarksData(quarksDataTemp.particle, quarksDataTemp.emitterList);
			}
		});

		if (quarksData) {
			this.handleQuarksData(quarksData.particle, quarksData.emitterList);
		}

		this.initComponentSystem();
	}

	handleQuarksData(particle: THREE.Object3D, emitterList: ParticleEmitter[]) {
		this.particle = particle;
		this.emitterList = emitterList;
		this.add(this.particle);

		const animNames: { [name: string]: { state: AnimationState; loop: boolean } } = {};
		animNames.anim1 = {
			state: "stop",
			loop: false,
		};

		const emitterEditorList: QuarksParticleEmitterSettings[] = [];
		for (let i = 0; i < this.emitterList.length; i++) {
			const emitter = this.emitterList[i];
			emitterEditorList.push({
				name: emitter.name,
				worldSpace: emitter.system.worldSpace,
			});
		}

		if (isStudio()) {
			this.eventEmitter.emit("quarksUpdate", {
				id: this.sID,
				animations: animNames,
				emitters: emitterEditorList,
			});
		}

		return this.particle;
	}

	updateComponents(components: { [key: string]: any }) {
		const quarksComp = components.quarksParticle as QuarksParticleGC;
		if (quarksComp && this.particle) {
			this.updateQuarksComponent(quarksComp);
		}

		super.updateComponents(components);
	}

	play() {
		for (let i = 0; i < this.emitterList.length; i++) {
			const emitter = this.emitterList[i];
			emitter.system.restart();
			console.log(emitter);
		}
	}

	updateQuarksComponent(component: QuarksParticleGC) {
		QuarksModifier.multiplyParticleScale(this.emitterList, component.scale, false);

		if (isStudio()) {
			const animation = Object.values(component.animations)[0];
			if (!animation) return;

			if (this.particle) {
				if (animation.state === "play") {
					this.play();
				} else if (animation.state === "stop") {
					this.stop();
				}
			}
		}
	}

	stop(force: boolean = true) {
		for (let i = 0; i < this.emitterList.length; i++) {
			const emitter = this.emitterList[i];
			if (force) {
				emitter.system.restart();
				emitter.system.pause();
			} else {
				emitter.system.pause();
			}
		}
	}

	// update(delta: number): void {}
}

export default QuarksParticle;
