import * as PIXI from "pixi.js";

import { ParticleEmitterGC } from "../../common/components";
import Cache2D from "../utils/Cache2D";
import Container from "./Container";

class ParticleEmitter extends Container {
	id: string = "";
	type: string = "particleEmitter";

	selected: boolean = false;
	locked: boolean = false;

	config: any = {};
	// emitter: PIXI.particles.Emitter | null = null;
	emitter: any;
	autoplay: boolean = false;

	constructor(x: number = 0, y: number = 0, config: any = {}) {
		super(x, y);
		this.config = config;
	}

	updateComponents(components: { [key: string]: any }) {
		const particleEmitter = components.particleEmitter as ParticleEmitterGC;

		if (particleEmitter) {
			this.updateContainerComponent({
				type: "container",
				width: particleEmitter.width,
				height: particleEmitter.height,
				landscape: false,
				landscapeWidth: 0,
				landscapeHeight: 0,
				debug: particleEmitter.debug,
			});
			this.updateParticleEmitterComponent(particleEmitter);
		}

		super.updateComponents({
			...components,
		});
	}

	async updateEmitter(config: any) {
		const init = () => {
			if (this.emitter) {
				this.emitter.destroy();
			}

			const textureData = config.behaviors.find((bh: any) => bh.type === "textureData");
			config.behaviors = config.behaviors.filter((bh: any) => bh.config.enabled);

			if (textureData) {
				// filter out all texture related behaviors
				const list = ["textureSingle", "textureRandom", "textureOrdered", "animatedSingle", "animatedRandom"];
				config.behaviors = config.behaviors.filter((bh: any) => !list.includes(bh.type));

				config.behaviors.push({
					type: textureData.config.type === "random" ? "textureRandom" : "textureOrdered",
					config: {
						textures: textureData.config.textures,
					},
				});
			}

			config.pos = {
				x: this.baseWidth * 0.5,
				y: this.baseHeight * 0.5,
			};

			// @ts-ignore
			this.emitter = new window.particles.Emitter(this, config);
			this.emitter.emit = this.autoplay;
			this.emitter.spawnPos.x = this.baseWidth * 0.5;
			this.emitter.spawnPos.y = this.baseHeight * 0.5;
		};

		const textureData = config.behaviors.find((bh: any) => bh.type === "textureData");

		if (textureData) {
			Promise.all(
				textureData.config.textures.map((texture: string, index: number) => {
					return new Promise((resolve) => {
						const loadedTexture = Cache2D.getTexture(texture, (textureRef: PIXI.Texture) => {
							textureData.config.textures[index] = textureRef;
							resolve(textureRef);
						});

						if (loadedTexture) {
							textureData.config.textures[index] = loadedTexture;
							resolve(loadedTexture);
						}
					});
				})
			).then(() => {
				init();
			});
		}
		//
		else {
			const textureSingle = config.behaviors.find((bh: any) => bh.type === "textureSingle");
			const textureId = textureSingle.config.texture;

			const texture = Cache2D.getTexture(textureId, (textureRef: PIXI.Texture) => {
				textureSingle.config.texture = textureRef;
				init();
			});

			// if (texture && !texture.isMissingTexture) {
			if (texture) {
				textureSingle.config.texture = texture;
				init();
			}
		}
	}

	updateParticleEmitterComponent(particleEmitter?: ParticleEmitterGC) {
		this.autoplay = particleEmitter?.particleData.autoplay || false;
		// @ts-ignore
		if (window.particles) {
			const config = this.mapParticleDataToComponent(particleEmitter?.particleData);

			this.updateEmitter(JSON.parse(JSON.stringify(config)));
		}
	}

	customUpdate(delta: number) {
		if (this.emitter) {
			this.emitter.update(delta);
		}
	}

	// eslint-disable-next-line class-methods-use-this
	mapParticleDataToComponent(rawConfig: any) {
		const behaviors: any = [];

		Object.keys(rawConfig.behaviors).forEach((key: any) => {
			const bh = rawConfig.behaviors[key];
			behaviors.push({
				type: key,
				config: bh,
			});
		});
		const config = {
			...rawConfig,
			behaviors,
		};

		const spawnShape = config.behaviors.find((bh: any) => bh.type === "spawnShape");

		const typeDataName = spawnShape.config.type.charAt(0).toUpperCase() + spawnShape.config.type.slice(1);
		// spawnShape.config.data = spawnShape.config[`data${spawnShape.type}`];
		spawnShape.config = {
			...spawnShape.config,
			data: spawnShape.config[`data${typeDataName}`],
		};

		return config;
	}

	set isActive(value: boolean) {
		this.autoplay = value;
		if (this.emitter) {
			this.emitter.emit = value;
		}
	}

	get isActive() {
		return this.autoplay;
	}

	setEmitterPosition(x: number, y: number) {
		if (this.emitter) {
			this.emitter.spawnPos.x = x;
			this.emitter.spawnPos.y = y;
		}
	}

	emitParticleAt(x: number, y: number, amount: number = 1) {
		if (this.emitter) {
			const tempX = this.emitter.spawnPos.x;
			const tempY = this.emitter.spawnPos.y;

			this.emitter.spawnPos.x = x;
			this.emitter.spawnPos.y = y;

			for (let i = 0; i < amount; i++) {
				this.emitter.emitNow();
			}

			this.emitter.spawnPos.x = tempX;
			this.emitter.spawnPos.y = tempY;
		}
	}
}

export default ParticleEmitter;
