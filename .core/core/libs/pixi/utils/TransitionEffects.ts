import gsap from "gsap";
import { Container } from "pixi.js";

type EffectConfig = {
	alpha?: number;
	angle?: number;
	x?: number;
	y?: number;
	scaleX?: number;
	scaleY?: number;
	blur?: number;
	brightness?: number;
	tint?: number;
	duration: number;
	delay: number;
	repeat?: number;
	repeatDelay?: number;
	yoyo?: boolean;
	ease: string;
	onUpdate?: () => void;
	onComplete?: () => void;
};

type Target = Container;

const defaultEffectConfig: EffectConfig = {
	// alpha: 1,
	// x: 0,
	// y: 0,
	// scaleX: 1,
	// scaleY: 1,
	duration: 0.6,
	delay: 0,
	repeat: 0,
	ease: "sine.inOut",
	onComplete: () => {},
};

export default class TransitionEffects {
	static register() {
		gsap.registerEffect({
			name: "fadeIn",
			effect: (targets: Target[], config: EffectConfig) => {
				return gsap.to(targets, {
					alpha: config.alpha,
					duration: config.duration,
					delay: config.delay,
					ease: config.ease,
					repeat: config.repeat,
					repeatDelay: config.repeatDelay,
					yoyo: config.yoyo,
					onComplete: config.onComplete,
				});
			},
			defaults: defaultEffectConfig, // defaults get applied to any "config" object passed to the effect
			extendTimeline: true, // now you can call the effect directly on any GSAP timeline to have the result immediately inserted in the position you define (default is sequenced at the end)
		});

		gsap.registerEffect({
			name: "fadeOut",
			effect: (targets: Target[], config: EffectConfig) => {
				return gsap.to(targets, {
					alpha: 0,
					duration: config.duration,
					delay: config.delay,
					ease: config.ease,
					repeat: config.repeat,
					repeatDelay: config.repeatDelay,
					yoyo: config.yoyo,
					onComplete: config.onComplete,
				});
			},
			defaults: defaultEffectConfig,
			extendTimeline: true,
		});

		gsap.registerEffect({
			name: "rotate",
			effect: (targets: Target[], config: EffectConfig) => {
				return gsap.to(targets, {
					angle: config.angle,
					duration: config.duration,
					delay: config.delay,
					ease: config.ease,
					repeat: config.repeat,
					repeatDelay: config.repeatDelay,
					yoyo: config.yoyo,
					onComplete: config.onComplete,
				});
			},
			defaults: defaultEffectConfig,
			extendTimeline: true,
		});

		const scaleList = ["scaleIn", "scaleOut", "scaleUp", "scaleDown"];

		scaleList.forEach((effectName) => {
			gsap.registerEffect({
				name: effectName,
				effect: (targets: Target[], config: EffectConfig) => {
					return gsap.to(targets[0].scale, {
						x: config.scaleX,
						y: config.scaleY,
						duration: config.duration,
						delay: config.delay,
						ease: config.ease,
						repeat: config.repeat,
						repeatDelay: config.repeatDelay,
						yoyo: config.yoyo,
						onComplete: config.onComplete,
					});
				},
				defaults: defaultEffectConfig,
				extendTimeline: true,
			});
		});

		const fromToListVer = ["fromTop", "fromBottom", "toTop", "toBottom"];

		fromToListVer.forEach((effectName) => {
			gsap.registerEffect({
				name: effectName,
				effect: (targets: Target[], config: EffectConfig) => {
					return gsap.to(targets[0], {
						y: config.y,
						duration: config.duration,
						delay: config.delay,
						ease: config.ease,
						repeat: config.repeat,
						repeatDelay: config.repeatDelay,
						yoyo: config.yoyo,
						onComplete: config.onComplete,
					});
				},
				defaults: defaultEffectConfig,
				extendTimeline: true,
			});
		});

		const fromToListHor = ["fromLeft", "fromRight", "toLeft", "toRight"];
		fromToListHor.forEach((effectName) => {
			gsap.registerEffect({
				name: effectName,
				effect: (targets: Target[], config: EffectConfig) => {
					return gsap.to(targets[0], {
						x: config.x,
						duration: config.duration,
						delay: config.delay,
						ease: config.ease,
						repeat: config.repeat,
						repeatDelay: config.repeatDelay,
						yoyo: config.yoyo,
						onComplete: config.onComplete,
					});
				},
				defaults: defaultEffectConfig,
				extendTimeline: true,
			});
		});

		gsap.registerEffect({
			name: "pulse",
			effect: (targets: Target[], config: EffectConfig) => {
				return gsap.to(targets[0].scale, {
					x: config.scaleX,
					y: config.scaleY,
					duration: config.duration,
					delay: config.delay,
					ease: config.ease,
					repeat: config.repeat,
					repeatDelay: config.repeatDelay,
					yoyo: true,
					onUpdate: config.onUpdate,
					onComplete: config.onComplete,
				});
			},
			defaults: defaultEffectConfig,
			extendTimeline: true,
		});

		gsap.registerEffect({
			name: "blur",
			effect: (targets: Target[], config: EffectConfig) => {
				return gsap.to(targets, {
					pixi: {
						blur: config.blur,
					},
					duration: config.duration,
					delay: config.delay,
					ease: config.ease,
					repeat: config.repeat,
					repeatDelay: config.repeatDelay,
					yoyo: config.yoyo,
					onComplete: config.onComplete,
				});
			},
			defaults: defaultEffectConfig,
			extendTimeline: true,
		});

		gsap.registerEffect({
			name: "brightness",
			effect: (targets: Target[], config: EffectConfig) => {
				return gsap.to(targets, {
					pixi: {
						brightness: config.brightness,
					},
					duration: config.duration,
					delay: config.delay,
					ease: config.ease,
					repeat: config.repeat,
					repeatDelay: config.repeatDelay,
					yoyo: config.yoyo,
					onComplete: config.onComplete,
				});
			},
			defaults: defaultEffectConfig,
			extendTimeline: true,
		});

		gsap.registerEffect({
			name: "tint",
			effect: (targets: Target[], config: EffectConfig) => {
				return gsap.to(targets, {
					pixi: {
						tint: config.tint,
					},
					duration: config.duration,
					delay: config.delay,
					ease: config.ease,
					repeat: config.repeat,
					repeatDelay: config.repeatDelay,
					yoyo: config.yoyo,
					onComplete: config.onComplete,
				});
			},
			defaults: defaultEffectConfig,
			extendTimeline: true,
		});

		gsap.registerEffect({
			name: "shake",
			effect: (targets: Target[], config: EffectConfig) => {
				return gsap.to(targets[0], {
					x: config.x,
					y: config.y,
					duration: config.duration,
					delay: config.delay,
					ease: config.ease,
					yoyo: true,
					repeat: config.repeat,
					repeatDelay: config.repeatDelay,
					onComplete: config.onComplete,
				});
			},
			defaults: defaultEffectConfig,
			extendTimeline: true,
		});

		gsap.registerEffect({
			name: "custom",
			effect: (targets: Target[], config: EffectConfig) => {
				const animationProps: any = {
					duration: config.duration,
					delay: config.delay,
					ease: config.ease,
					repeat: config.repeat,
					repeatDelay: config.repeatDelay,
					yoyo: config.yoyo,
					onComplete: config.onComplete,
				};

				Object.keys(config).forEach(key => {
					if (!['duration', 'delay', 'ease', 'repeat', 'repeatDelay', 'yoyo', 'onComplete', 'getStart', 'getEnd'].includes(key)) {
						//@ts-ignore
						animationProps[key] = typeof config[key] === 'function' ? config[key]() : config[key];
					}
				});

				return gsap.to(targets, animationProps);
			},
			defaults: defaultEffectConfig,
			extendTimeline: true,
		});
	}
}
