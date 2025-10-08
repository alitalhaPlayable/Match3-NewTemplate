import { Object3D, Scene } from "three";
import { BatchedRenderer, ParticleEmitter } from "three.quarks";

class QuarksScene {
	public particleList: Object3D[] = [];
	public batchedRenderer: BatchedRenderer;
	public scene: Scene;

	constructor(scene: Scene) {
		this.batchedRenderer = new BatchedRenderer();
		this.scene = scene;
		scene.add(this.batchedRenderer);
	}

	add(particle: Object3D) {
		if (this.particleList.includes(particle)) return;

		this.particleList.push(particle);
		const emitterList = (particle as any).emitterList;
		if (!emitterList || !emitterList.length) {
			console.log("No emitter list found or it is empty");
			return;
		}
		for (const emitter of emitterList) {
			this.batchedRenderer.addSystem(emitter.system);
		}
	}

	destroy() {
		for (const system of this.batchedRenderer.systemToBatchIndex) {
			this.batchedRenderer.deleteSystem(system[0]);
		}

		setTimeout(() => {
			console.log(this.scene.children);
		}, 1000);
		this.particleList = [];
	}

	update(delta: number) {
		this.batchedRenderer.update(delta);
	}
}

export default QuarksScene;
