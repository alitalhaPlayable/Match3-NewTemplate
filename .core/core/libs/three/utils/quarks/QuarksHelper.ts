import { Object3D } from "three";
import { ParticleEmitter, QuarksLoader } from "three.quarks";
// eslint-disable-next-line import/no-cycle
import QuarksScene from "./QuarksScene";
import QuarksParticle from "../../objects/QuarksParticle";
// import { getQuarksData } from "../TextureUtils";

export interface QuarksResult {
	particle: Object3D;
	emitterList: ParticleEmitter[];
}

// const quarksList: any = {};

class QuarksHelper {
	static loader = new QuarksLoader();
	static currentQuarksScene: QuarksScene | null = null;

	static async loadQuarks(path: string) {
		QuarksHelper.loader.setCrossOrigin("");
		return new Promise<QuarksResult>((resolve) => {
			const onLoaded = (particle: QuarksParticle) => {
				const emitterList: ParticleEmitter[] = [];
				particle.traverse((child) => {
					if (child instanceof ParticleEmitter) {
						emitterList.push(child);
					}
				});
				if (particle instanceof ParticleEmitter) {
					emitterList.push(particle);
				}
				resolve({ particle, emitterList });
			};

			if (path) {
				if (typeof path === "string") {
					QuarksHelper.loader.load(path, (data: Object3D) => onLoaded(data as QuarksParticle));
				} else {
					QuarksHelper.loader.parse(path, (data: Object3D) => onLoaded(data as QuarksParticle));
				}
			}
		}).catch((error) => {
			console.error("Error loading Quarks data:", error);
		});
	}

	static loadQuarksSync(path: string) {
		QuarksHelper.loader.setCrossOrigin("");
		const onLoaded = (particle: QuarksParticle) => {
			const emitterList: ParticleEmitter[] = [];
			particle.traverse((child) => {
				if (child instanceof ParticleEmitter) {
					emitterList.push(child);
				}
			});
			if (particle instanceof ParticleEmitter) {
				emitterList.push(particle);
			}

			return { particle, emitterList };
		};

		const data = QuarksHelper.loader.parse(path);
		return onLoaded(data as QuarksParticle);
	}
}

export default QuarksHelper;
