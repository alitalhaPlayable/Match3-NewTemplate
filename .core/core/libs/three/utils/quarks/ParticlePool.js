import QuarksParticleLocal from "./QuarksParticleLocal";
import QuarksHelper from "./QuarksHelper";
import globals from "@globals";
import Cache3D from "../Cache3D";

export default class ParticlePool {
	static list = {
		/* flames: {
			index: 0,
			pool: [],
			maxLen: 1,
			keyName: "flameFX",
		}, */
	};

	static init() {
		this.initParticles();
	}

	static initParticles() {
		let count = 0;
		const onLoaded = () => {
			count++;
			if (count === Object.keys(this.list).length) {
			}
		};
		// for (let key in this.list) {
		// 	let listObj = this.list[key];
		// 	let keyName = listObj.keyName;
		// 	let data = require("../../../../../../assets/quarkEffects/" + keyName + ".json");

		// 	for (let i = 0; i < listObj.maxLen; i++) {
		// 		const particleData = QuarksHelper.loadQuarksSync(data);

		// 		let particle = new QuarksParticleLocal(particleData.particle, particleData.emitterList);
		// 		listObj.pool.push(particle);
		// 	}
		// }
	}

	static attachTo(particleName, targetObj, { offset = { x: 0, y: 0, z: 0 }, scale = 1, force = 0 } = {}) {
		const particleObj = this.getParticle(particleName);
		if (!particleObj) return;
		const particle = particleObj.particle;

		particle.position.set(0, 0, 0);
		particle.scale.setScalar(1);
		particle.rotation.set(0, 0, 0);

		let skal = scale;
		particle.multiplyParticleScale(skal);

		if (force) {
			particle.changeForce(force);
		}
		//particle.position.copy(targetObj.position);
		targetObj.add(particle);
		offset && particle.position.copy(offset);
		particle.restart();

		return particle;
	}

	static spawnAt(particleName, pos, scale = 0.5, scene) {
		const particleObj = this.getParticle(particleName);
		if (!particleObj) return;
		const particle = particleObj.particle;
		particle.multiplyParticleScale(scale);
		particle.position.copy(pos);
		particle.restart();

		if (!scene) {
			scene = globals.threeScene;
		}
		particle.addToScene(scene);

		return particle;
	}

	static stop(particleObj, index) {
		let particle = particleObj.pool[index];
		particle.stop();
	}

	/**
	 *
	 * @param {} particleName
	 * @returns QuarkParticle
	 */
	static getParticle(particleName) {
		let particle = Cache3D.getQuarks(particleName);
		return particle;
	}
}
