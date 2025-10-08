import * as PIXI from "pixi.js";
import gsap from "gsap";
import { TransitionFXGC } from "../../../common/components";
import { getEventEmitter, getRootScene, isStudio } from "../../../common/editorGlobals";
import CustomEase from "gsap/CustomEase";
import { endianness } from "os";

export function toGlobalScale(obj: any) {
	let scaleX = obj.scale.x;
	let scaleY = obj.scale.y;

	const parents: any[] = [];

	let currentObj = obj;

	while (currentObj.parent) {
		if (currentObj.parent.label !== "editor_viewport" && currentObj.parent.label !== "root") {
			scaleX *= currentObj.parent.scale.x;
			scaleY *= currentObj.parent.scale.y;
			parents.push(currentObj.parent);
			currentObj = currentObj.parent;
		} else {
			break;
		}
	}

	return { x: scaleX, y: scaleY, parents };
}

class TransitionFX {
	node: PIXI.Container;
	componentData?: TransitionFXGC;
	eventEmitter: any;
	defaults: TransitionFXGC | null = null;
	transformDefaults: any;
	transitionFXs: any[] = [];
	constructor(node: PIXI.Container) {
		this.node = node;

		this.eventEmitter = getEventEmitter();

		this.transformDefaults = this.node.components.transform.defaults;
	}

	action(component: any): gsap.EffectsMap | null {
		if (!this.transformDefaults) {
			this.transformDefaults = this.node.components.transform.defaults;
			if (!this.transformDefaults) console.error("No transform defaults found");
		}

		let dynamicProps: any = {};
		let target: any = this.node;

		const result = this.getDynamicProps(component, target);
		dynamicProps = result.dynamicProps || {};
		const targets = result.targets || [this.node];

		// Handle custom transitions with individual target-property pairs
		if (component.transitionType === "custom") {
			// Kill any existing effects first to avoid conflicts
			this.transitionFXs.forEach(fx => {
				fx.kill();
			});
			this.transitionFXs = [];
			
			const effects = []; // Store all created effects
			
			for (let i = 0; i < targets.length; i++) {
				const currentTarget = targets[i];
				const currentProp = dynamicProps.targetProps[i];
				const endValues = dynamicProps.end() as any;
				
				// Validate that target is still valid
				if (!currentTarget) {
					continue;
				}
				
				// Validate that the property exists in the end values
				if (!endValues[currentProp]) {
					continue;
				}
				
				// Handle PIXI property mapping
				let actualTarget = currentTarget;
				let actualProp = currentProp;
				
				// Fix scaleX/scaleY mapping for PIXI objects
				if (currentTarget === this.node) {
					if (currentProp === 'scaleX') {
						actualTarget = this.node.scale;
						actualProp = 'x';
					} else if (currentProp === 'scaleY') {
						actualTarget = this.node.scale;
						actualProp = 'y';
					}
				}
				
				// Capture the current value in a closure to avoid reference issues
				const currentValue = endValues[currentProp]();
				
				// Create individual animation for this target-property pair
				const individualProps = {
					targetProps: [actualProp],
					start: () => {},
					end: () => ({ [actualProp]: () => currentValue }) // Use captured value
				};
				
				const prop: any = {
					getStart: () => individualProps.start(),
					getEnd: () => individualProps.end(),
				};
				// Create a proper function closure for this specific property
				prop[actualProp] = () => currentValue;

				gsap.delayedCall(component.delay, () => {
					if ('visible' in actualTarget && actualTarget.visible !== undefined) {
						actualTarget.visible = true;
					}
				});

				const animationConfig = {
					...prop,
					duration: component.duration,
					delay: component.delay,
					ease: (component.easeCurve && component.easeCurve != "") ? component.easeCurve : component.ease,
					repeat: component.repeat ? component.repeat : 0,
					repeatDelay: component.repeatDelay ? component.repeatDelay : 0,
					yoyo: component.yoyo ? component.yoyo : false,
					onComplete: () => {
						// Protect against infinite callbacks
						if (effect._completed) {
							return;
						}
						effect._completed = true;
						
						if (isStudio()) {
							// Only kill tweens for the specific target being animated, not the whole node
							gsap.killTweensOf(actualTarget);
							effect.kill();
							effect.progress(0);
							
							if (actualTarget.components && actualTarget.components.responsive) {
								actualTarget.components.responsive.update(actualTarget.components.get("responsive").data);
							} else {
								// Reset only the specific target that was animated
								if (actualTarget === this.node) {
									// If animating the main node, reset main node properties
									if (this.node.components.responsive) {
										this.node.components.responsive.update(this.node.components.get("responsive").data);
									} else {
										this.node.alpha = this.node.components.transform.defaults?.alpha ?? 1;
										this.node.x = this.node.components.transform.defaults?.position.x ?? 0;
										this.node.y = this.node.components.transform.defaults?.position.y ?? 0;
										this.node.scale.set(
											this.node.components.transform.defaults?.scale.x ?? 1,
											this.node.components.transform.defaults?.scale.y ?? 1
										);
									}
								} else if (actualTarget === this.node.scale) {
									// Reset scale object
									this.node.scale.set(
										this.node.components.transform.defaults?.scale.x ?? 1,
										this.node.components.transform.defaults?.scale.y ?? 1
									);
								} else if (actualTarget === this.node.position) {
									// Reset position object
									this.node.position.set(
										this.node.components.transform.defaults?.position.x ?? 0,
										this.node.components.transform.defaults?.position.y ?? 0
									);
								} else {
									// For other targets (like filters), try to reset sensibly
								}
							}
						}

						if (component.hideOnComplete) {
							if ('visible' in actualTarget && actualTarget.visible !== undefined) {
								actualTarget.visible = false;
							}
						}

						// Find and remove the effect more reliably
						for (let j = this.transitionFXs.length - 1; j >= 0; j--) {
							if (this.transitionFXs[j] === effect || this.transitionFXs[j].name === effect.name) {
								this.transitionFXs.splice(j, 1);
								break;
							}
						}

						if (component.nextFxs && component.nextFxs.length && !isStudio()) {
							const mappedNextFxs = component.nextFxs.map((fxId: string) => {
								const fxComp = this.componentData!.effects[fxId];
								return fxComp.name;
							});
							mappedNextFxs.forEach((fx: string) => {
								if (!this.transitionFXs.some((e) => e.name === fx)) {
									Object.entries(this.componentData!.effects).forEach(([key]) => {
										const localComp = this.componentData!.effects[key];
										if (localComp.name === fx) {
											const nextEffect = this.action(localComp);
											this.transitionFXs.push(nextEffect);
											nextEffect!.play();
										}
									});
								}
							});
						}

						if (typeof component.completeEventNames !== "string") {
							const splittedEventNames = component.completeEventNames;
							if (splittedEventNames) {
								splittedEventNames.forEach((eventName: string) => {
									this.eventEmitter.emit(eventName);
								});
							}
						}
					}
				};
				
				// Create the effect without onComplete first
				const effectConfig = { ...animationConfig };
				delete effectConfig.onComplete;
				
				const effect = gsap.effects[component.transitionType](actualTarget, effectConfig);
				
				// Now add the onComplete callback with proper effect reference
				effect.eventCallback("onComplete", () => {
					// Protect against infinite callbacks
					if (effect._completed) {
						return;
					}
					effect._completed = true;
					
					if (isStudio()) {
						// Only kill tweens for the specific target being animated, not the whole node
						gsap.killTweensOf(actualTarget);
						effect.kill();
						effect.progress(0);
						
						if (actualTarget.components && actualTarget.components.responsive) {
							actualTarget.components.responsive.update(actualTarget.components.get("responsive").data);
						} else {
							// Reset only the specific target that was animated
							if (actualTarget === this.node) {
								// If animating the main node, reset main node properties
								if (this.node.components.responsive) {
									this.node.components.responsive.update(this.node.components.get("responsive").data);
								} else {
									this.node.alpha = this.node.components.transform.defaults?.alpha ?? 1;
									this.node.x = this.node.components.transform.defaults?.position.x ?? 0;
									this.node.y = this.node.components.transform.defaults?.position.y ?? 0;
									this.node.scale.set(
										this.node.components.transform.defaults?.scale.x ?? 1,
										this.node.components.transform.defaults?.scale.y ?? 1
									);
								}
							} else if (actualTarget === this.node.scale) {
								// Reset scale object
								this.node.scale.set(
									this.node.components.transform.defaults?.scale.x ?? 1,
									this.node.components.transform.defaults?.scale.y ?? 1
								);
							} else if (actualTarget === this.node.position) {
								// Reset position object
								this.node.position.set(
									this.node.components.transform.defaults?.position.x ?? 0,
									this.node.components.transform.defaults?.position.y ?? 0
								);
							}
						}
					}

					if (component.hideOnComplete) {
						if ('visible' in actualTarget && actualTarget.visible !== undefined) {
							actualTarget.visible = false;
						}
					}

					// Find and remove the effect more reliably
					for (let j = this.transitionFXs.length - 1; j >= 0; j--) {
						if (this.transitionFXs[j] === effect || this.transitionFXs[j].name === effect.name) {
							this.transitionFXs.splice(j, 1);
							break;
						}
					}

					if (component.nextFxs && component.nextFxs.length && !isStudio()) {
						const mappedNextFxs = component.nextFxs.map((fxId: string) => {
							const fxComp = this.componentData!.effects[fxId];
							return fxComp.name;
						});
						mappedNextFxs.forEach((fx: string) => {
							if (!this.transitionFXs.some((e) => e.name === fx)) {
								Object.entries(this.componentData!.effects).forEach(([key]) => {
									const localComp = this.componentData!.effects[key];
									if (localComp.name === fx) {
										const nextEffect = this.action(localComp);
										this.transitionFXs.push(nextEffect);
										nextEffect!.play();
									}
								});
							}
						});
					}

					if (typeof component.completeEventNames !== "string") {
						const splittedEventNames = component.completeEventNames;
						if (splittedEventNames) {
							splittedEventNames.forEach((eventName: string) => {
								this.eventEmitter.emit(eventName);
							});
						}
					}
				});
				
				effect.name = component.name;
				effect.getStart = () => individualProps.start();
				effect.getEnd = () => individualProps.end();
				
				// Store this effect instead of returning immediately
				effects.push(effect);
				// Also add to the main tracking array
				this.transitionFXs.push(effect);
			}
			
			// Return the first effect after all animations are created
			return effects.length > 0 ? effects[0] : null;
		}
		
		// Original logic for non-custom transitions
		// Iterate through each target and apply animation to each one individually
		for (let i = 0; i < targets.length; i++) {
			const currentTarget = targets[i];
			if (Object.keys(dynamicProps).length !== 0) {
				dynamicProps.start(true);
				const prop: any = {
					getStart: (invalidate: boolean = true) => dynamicProps.start(invalidate),
					getEnd: () => dynamicProps.end(),
				};
				dynamicProps.targetProps.forEach((key: string) => {
					prop[key] = () => dynamicProps.end()[key]();
				});
	
				gsap.delayedCall(component.delay, () => {
					if ('visible' in currentTarget && currentTarget.visible !== undefined) {
						currentTarget.visible = true;
					}
				});
	
				const effect = gsap.effects[component.transitionType](currentTarget, {
					...prop,
					duration: component.duration,
					delay: component.delay,
					// ease: component.ease,
					ease: (component.easeCurve && component.easeCurve != "") ? component.easeCurve : component.ease,
					repeat: component.repeat ? component.repeat : 0,
					repeatDelay: component.repeatDelay ? component.repeatDelay : 0,
					yoyo: component.yoyo ? component.yoyo : false,
					onComplete: () => {
						if (isStudio()) {
							gsap.killTweensOf(currentTarget);
							effect.kill()
							effect.progress(0)
							if (currentTarget.components && currentTarget.components.responsive) {
								currentTarget.components.responsive.update(currentTarget.components.get("responsive").data);
							} else {
								// Reset properties if they exist on the target
								const defaults = currentTarget.components?.transform?.defaults || this.node.components.transform.defaults;
								if ('alpha' in currentTarget) currentTarget.alpha = defaults?.alpha ?? 1;
								if ('x' in currentTarget) currentTarget.x = defaults?.position.x ?? 0;
								if ('y' in currentTarget) currentTarget.y = defaults?.position.y ?? 0;
								if ('scale' in currentTarget) {
									currentTarget.scale.set(
										defaults?.scale.x ?? 1,
										defaults?.scale.y ?? 1
									);
								}
							}
						}
	
						if (component.hideOnComplete) {
							if ('visible' in currentTarget && currentTarget.visible !== undefined) {
								currentTarget.visible = false;
							}
						}
	
						const ind = this.transitionFXs.indexOf(effect);
						if (ind !== -1) {
							this.transitionFXs.splice(ind, 1);
							// gsap.effects[component.transitionType] = null;
						}
	
						if (component.nextFxs && component.nextFxs.length && !isStudio()) {
							const mappedNextFxs = component.nextFxs.map((fxId: string) => {
								const fxComp = this.componentData!.effects[fxId];
								return fxComp.name;
							});
							mappedNextFxs.forEach((fx: string) => {
								if (!this.transitionFXs.some((e) => e.name === fx)) {
									Object.entries(this.componentData!.effects).forEach(([key]) => {
										const localComp = this.componentData!.effects[key];
										if (localComp.name === fx) {
											const nextEffect = this.action(localComp);
											this.transitionFXs.push(nextEffect);
											nextEffect!.play();
										}
									});
								}
							});
						}
	
						if (typeof component.completeEventNames !== "string") {
							const splittedEventNames = component.completeEventNames;
							if (splittedEventNames) {
								splittedEventNames.forEach((eventName: string) => {
									this.eventEmitter.emit(eventName);
								});
							}
						}
					},
				});
				effect.name = component.name;
				effect.getStart = (invalidate: boolean = true) => dynamicProps.start(invalidate);
				effect.getEnd = () => dynamicProps.end();
	
				return effect;
			}
		}

		return null;
	}

	getDynamicProps(component: any, target: any) {
		if (!component) return {};

		let targetNodes: any[] = []

		const hasResponsive = target.components.responsive;

		let dynamicProps: any = {};

		if (component.transitionType === "fadeIn") {
			dynamicProps = {
				targetProps: ["alpha"],
				start: (invalidate: boolean) => {
					if (invalidate) target.alpha = 0;
				},
				end: () => {
					return {
						// alpha: () => (this.transformDefaults.alpha ? this.transformDefaults.alpha : 1),
						alpha: () => {
							const val = component.alphaFadeIn ?? this.transformDefaults.alpha ?? 1;
							return val;
						},
					};
				},
			};
		} else if (component.transitionType === "fadeOut") {
			dynamicProps = {
				targetProps: ["alpha"],
				start: (invalidate: boolean) => {
					if (invalidate) target.alpha = target.components.transform.defaults?.alpha ?? 1;
				},
				end: () => {
					return {
						// alpha: () => 0,
						alpha: () => component.alphaFadeOut ?? 0,
					};
				},
			};
		} else if (component.transitionType === "rotate") {
			dynamicProps = {
				targetProps: ["angle"],
				start: (invalidate: boolean) => {
					if (invalidate) target.angle = this.transformDefaults.angle ? this.transformDefaults.angle : 0;
				},
				end: () => {
					return {
						angle: () => component.angle,
					};
				},
			};
		} else if (component.transitionType === "scaleIn") {
			const getTargetScale = () => {
				let targetScaleX: number = 0;
				let targetScaleY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					targetScaleX = data.scale.x;
					targetScaleY = data.scale.y;
				} else {
					targetScaleX = this.transformDefaults.scale.x;
					targetScaleY = this.transformDefaults.scale.y;
				}

				return { x: targetScaleX, y: targetScaleY };
			};

			dynamicProps = {
				targetProps: ["scaleX", "scaleY"],
				start: (invalidate: boolean) => {
					if (invalidate) target.scale.set(0);
				},
				end: () => {
					return {
						scaleX: () => getTargetScale().x,
						scaleY: () => getTargetScale().y,
					};
				},
			};
			target.scale.set(0);
		} else if (component.transitionType === "scaleOut") {
			const setInitialScale = () => {
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					target.scale.set(data.scale.x, data.scale.y);
				} else {
					target.scale.set(this.transformDefaults.scale.x, this.transformDefaults.scale.y);
				}
			};

			dynamicProps = {
				targetProps: ["scaleX", "scaleY"],
				start: (invalidate: boolean) => {
					if (invalidate) setInitialScale();
				},
				end: () => {
					return {
						scaleX: () => 0,
						scaleY: () => 0,
					};
				},
			};
		} else if (component.transitionType === "scaleUp") {
			const setInitialScale = () => {
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					target.scale.set(data.scale.x, data.scale.y);
				} else {
					target.scale.set(this.transformDefaults.scale.x, this.transformDefaults.scale.y);
				}
			};

			const getTargetScale = () => {
				let targetScaleX: number = 0;
				let targetScaleY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					targetScaleX = data.scale.x;
					targetScaleY = data.scale.y;
				} else {
					targetScaleX = this.transformDefaults.scale.x;
					targetScaleY = this.transformDefaults.scale.y;
				}

				const compScaleScalar = component.scaleRatio || 1;
				return { x: targetScaleX * compScaleScalar, y: targetScaleY * compScaleScalar };
			};

			dynamicProps = {
				targetProps: ["scaleX", "scaleY"],
				start: (invalidate: boolean) => {
					if (invalidate) setInitialScale();
				},
				end: () => {
					return {
						scaleX: () => getTargetScale().x,
						scaleY: () => getTargetScale().y,
					};
				},
			};
		} else if (component.transitionType === "scaleDown") {
			const setInitialScale = () => {
				const compScaleScalar = component.scaleRatio || 1;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					target.scale.set(data.scale.x * compScaleScalar, data.scale.y * compScaleScalar);
				} else {
					target.scale.set(
						this.transformDefaults.scale.x * compScaleScalar,
						this.transformDefaults.scale.y * compScaleScalar
					);
				}
			};

			const getTargetScale = () => {
				let targetScaleX: number = 0;
				let targetScaleY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					targetScaleX = data.scale.x;
					targetScaleY = data.scale.y;
				} else {
					targetScaleX = this.transformDefaults.scale.x;
					targetScaleY = this.transformDefaults.scale.y;
				}

				return { x: targetScaleX, y: targetScaleY };
			};

			dynamicProps = {
				targetProps: ["scaleX", "scaleY"],
				start: (invalidate: boolean) => {
					if (invalidate) setInitialScale();
				},
				end: () => {
					return {
						scaleX: () => getTargetScale().x,
						scaleY: () => getTargetScale().y,
					};
				},
			};
		} else if (component.transitionType === "fromTop") {
			const setInitialPos = () => {
				const mainParent: any = getRootScene();
				const globalPos = target.getGlobalPosition();
				const lp = mainParent.toLocal(globalPos);
				const _height = target.baseHeight * toGlobalScale(target).y;
				const point = new PIXI.Point(lp.x, -_height * (1 - target.originY) - _height * 0.5);
				const localPos = target.parent.toLocal(point, mainParent);
				target.x = localPos.x;
				target.y = localPos.y;
			};

			const getTargetY = () => {
				let targetY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					targetY = data.y;
				} else {
					targetY = this.transformDefaults.position.y;
				}

				return targetY;
			};

			dynamicProps = {
				targetProps: ["y"],
				start: (invalidate: boolean) => {
					if (invalidate) setInitialPos();
				},
				end: () => {
					return {
						y: () => getTargetY(),
					};
				},
			};
		} else if (component.transitionType === "fromBottom") {
			const setInitialPos = () => {
				const mainParent: any = getRootScene();
				const globalPos = target.getGlobalPosition();
				const lp = mainParent.toLocal(globalPos);
				const _height = target.baseHeight * toGlobalScale(target).y;
				const parentHeight = isStudio() ? mainParent.border.device.height : mainParent.baseHeight;
				const point = new PIXI.Point(lp.x, parentHeight + _height * target.originY + _height * 0.5);
				const localPos = target.parent.toLocal(point, mainParent);
				target.x = localPos.x;
				target.y = localPos.y;
			};

			const getTargetY = () => {
				let targetY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					targetY = data.y;
				} else {
					targetY = this.transformDefaults.position.y;
				}

				return targetY;
			};

			dynamicProps = {
				targetProps: ["y"],
				start: (invalidate: boolean) => {
					if (invalidate) setInitialPos();
				},
				end: () => {
					return {
						y: () => getTargetY(),
					};
				},
			};
		} else if (component.transitionType === "fromLeft") {
			const setInitialPos = () => {
				const mainParent = getRootScene();
				const globalPos = target.getGlobalPosition();
				const lp = mainParent.toLocal(globalPos);
				const _width = target.baseWidth * toGlobalScale(target).x;
				const point = new PIXI.Point(-_width * (1 - target.originX) - _width * 0.5, lp.y);
				const localPos = target.parent.toLocal(point, mainParent);
				target.x = localPos.x;
				target.y = localPos.y;
			};

			const getTargetX = () => {
				let targetX: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					targetX = data.x;
				} else {
					targetX = this.transformDefaults.position.x;
				}

				return targetX;
			};

			dynamicProps = {
				targetProps: ["x"],
				start: (invalidate: boolean) => {
					if (invalidate) setInitialPos();
				},
				end: () => {
					return {
						x: () => getTargetX(),
					};
				},
			};
		} else if (component.transitionType === "fromRight") {
			const setInitialPos = () => {
				const mainParent = getRootScene();

				const globalPos = target.getGlobalPosition();
				const lp = mainParent.toLocal(globalPos);
				const _width = target.baseWidth * toGlobalScale(target).x;
				const parentWidth = isStudio() ? mainParent.border.device.width : mainParent.baseWidth;
				const point = new PIXI.Point(parentWidth + _width * target.originX + _width * 0.5, lp.y);
				const localPos = target.parent.toLocal(point, mainParent);
				target.x = localPos.x;
				target.y = localPos.y;
			};

			const getTargetX = () => {
				let targetX: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					targetX = data.x;
				} else {
					targetX = this.transformDefaults.position.x;
				}

				return targetX;
			};

			dynamicProps = {
				targetProps: ["x"],
				start: (invalidate: boolean) => {
					if (invalidate) setInitialPos();
				},
				end: () => {
					return {
						x: () => getTargetX(),
					};
				},
			};
		} else if (component.transitionType === "toTop") {
			const getTargetPos = () => {
				const mainParent: any = getRootScene();
				const globalPos = target.getGlobalPosition();
				const lp = mainParent.toLocal(globalPos);
				const _height = target.baseHeight * toGlobalScale(target).y;
				const point = new PIXI.Point(lp.x, -_height * (1 - target.originY) - _height * 0.5);
				const localPos = target.parent.toLocal(point, mainParent);
				return localPos;
			};

			const setStartPos = () => {
				let startY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					startY = data.y;
				} else {
					startY = this.transformDefaults.position.y;
				}

				return startY;
			};

			dynamicProps = {
				targetProps: ["y"],
				start: (invalidate: boolean) => {
					if (invalidate) target.y = setStartPos();
				},
				end: () => {
					return {
						y: () => getTargetPos().y,
					};
				},
			};
		} else if (component.transitionType === "toBottom") {
			const getTargetPos = () => {
				const mainParent: any = getRootScene();
				const globalPos = target.getGlobalPosition();
				const lp = mainParent.toLocal(globalPos);
				const _height = target.baseHeight * toGlobalScale(target).y;
				const parentHeight = isStudio() ? mainParent.border.device.height : mainParent.baseHeight;
				const point = new PIXI.Point(lp.x, parentHeight + _height * target.originY + _height * 0.5);
				const localPos = target.parent.toLocal(point, mainParent);
				return localPos;
			};

			const setStartPos = () => {
				let startY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					startY = data.y;
				} else {
					startY = this.transformDefaults.position.y;
				}

				return startY;
			};

			dynamicProps = {
				targetProps: ["y"],
				start: (invalidate: boolean) => {
					if (invalidate) target.y = setStartPos();
				},
				end: () => {
					return {
						y: () => getTargetPos().y,
					};
				},
			};
		} else if (component.transitionType === "toLeft") {
			const getTargetPos = () => {
				const mainParent = getRootScene();
				const globalPos = target.getGlobalPosition();
				const lp = mainParent.toLocal(globalPos);
				const _width = target.baseWidth * toGlobalScale(target).x;
				const point = new PIXI.Point(-_width * (1 - target.originX) - _width * 0.5, lp.y);
				const localPos = target.parent.toLocal(point, mainParent);
				return localPos;
			};

			const setStartPos = () => {
				let startX: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					startX = data.x;
				} else {
					startX = this.transformDefaults.position.x;
				}

				return startX;
			};

			dynamicProps = {
				targetProps: ["x"],
				start: (invalidate: boolean) => {
					if (invalidate) target.x = setStartPos();
				},
				end: () => {
					return {
						x: () => getTargetPos().x,
					};
				},
			};
		} else if (component.transitionType === "toRight") {
			const getTargetPos = () => {
				const mainParent = getRootScene();

				const globalPos = target.getGlobalPosition();
				const lp = mainParent.toLocal(globalPos);
				const _width = target.baseWidth * toGlobalScale(target).x;
				const parentWidth = isStudio() ? mainParent.border.device.width : mainParent.baseWidth;
				const point = new PIXI.Point(parentWidth + _width * target.originX + _width * 0.5, lp.y);
				const localPos = target.parent.toLocal(point, mainParent);
				return localPos;
			};

			const setStartPos = () => {
				let startX: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					startX = data.x;
				} else {
					startX = this.transformDefaults.position.x;
				}

				return startX;
			};

			dynamicProps = {
				targetProps: ["x"],
				start: (invalidate: boolean) => {
					if (invalidate) target.x = setStartPos();
				},
				end: () => {
					return {
						x: () => getTargetPos().x,
					};
				},
			};
		} else if (component.transitionType === "pulse") {
			const pulseScalar = component.pulseScalar || 0.9;

			const setInitialScale = () => {
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					target.scale.set(data.scale.x, data.scale.y);
				} else {
					target.scale.set(this.transformDefaults.scale.x, this.transformDefaults.scale.y);
				}
			};

			const getTargetScale = () => {
				let targetScaleX: number = 0;
				let targetScaleY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					targetScaleX = data.scale.x * pulseScalar;
					targetScaleY = data.scale.y * pulseScalar;
				} else {
					targetScaleX = this.transformDefaults.scale.x * pulseScalar;
					targetScaleY = this.transformDefaults.scale.y * pulseScalar;
				}

				return { x: targetScaleX, y: targetScaleY };
			};

			dynamicProps = {
				targetProps: ["scaleX", "scaleY"],
				start: (invalidate: boolean) => {
					if (invalidate) setInitialScale();
				},
				end: () => {
					return {
						scaleX: () => getTargetScale().x,
						scaleY: () => getTargetScale().y,
					};
				},
			};
		} else if (component.transitionType === "shake") {
			const shakeAmount = component.shakeAmount || 0.9;
			const getTargetPos = () => {
				let startX: number = 0;
				let startY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					startX = data.x - shakeAmount;
					startX += shakeAmount * Math.random() * 2;

					startY = data.y - shakeAmount;
					startY += shakeAmount * Math.random() * 2;
				} else {
					startX = this.transformDefaults.position.x - shakeAmount;
					startX += shakeAmount * Math.random() * 2;

					startY = this.transformDefaults.position.y - shakeAmount;
					startY += shakeAmount * Math.random() * 2;
				}

				return { x: startX, y: startY };
			};

			const setStartPos = () => {
				let startX: number = 0;
				let startY: number = 0;
				if (hasResponsive) {
					const data = target.components.responsive.update(target.components.get("responsive").data, true);
					startX = data.x;
					startY = data.y;
				} else {
					startX = this.transformDefaults.position.x;
					startY = this.transformDefaults.position.y;
				}

				return { x: startX, y: startY };
			};

			dynamicProps = {
				targetProps: ["x", "y"],
				start: (invalidate: boolean) => {
					if (invalidate) {
						target.x = setStartPos().x;
						target.y = setStartPos().y;
					}
				},
				end: () => {
					return {
						x: () => getTargetPos().x,
						y: () => getTargetPos().y,
					};
				},
			};
		} else if (component.transitionType === "blur") {
			dynamicProps = {
				targetProps: ["blur"],
				start: () => {},
				end: () => {
					return {
						blur: () => {
							return component.blur;
						},
					};
				},
			};
		} else if (component.transitionType === "brightness") {
			dynamicProps = {
				targetProps: ["brightness"],
				start: () => {},
				end: () => {
					return {
						brightness: () => {
							return component.brightness;
						},
					};
				},
			};
		} else if (component.transitionType === "tint") {
			const getStartTint = () => {
				let tint = 0xffffff;
				if (target.components.sprite) {
					tint = target.components.sprite.defaults.tint;
				}

				return tint;
			};
			dynamicProps = {
				targetProps: ["tint"],
				start: () => {
					target.tint = getStartTint();
				},
				end: () => {
					return {
						tint: () => {
							return component.tint;
						},
					};
				},
			};
		} else if (component.transitionType === "custom") {
			const {props, targets} = this.createCustomDynamicProps(component);
			dynamicProps = props;
			targetNodes = targets;
		}

		return {dynamicProps, targets: targetNodes.length === 0 ? [this.node] : targetNodes} ;
	}

	createCustomDynamicProps(component: any) {
		const dynamicProps = {
			targetProps: [],
			start: () => {},
			end: () => {},
		};
		const typeInfoArray = component.custom.split("\n")
		
		let targetPropsArray = typeInfoArray.map((element:any)=>{
			return element.split("_")[0]
		})

		// Parse paths that may contain array indexing like filters[0].blur
		targetPropsArray = targetPropsArray.map((element: any) => {
			const pathParts: any[] = [];
			const parts = element.split(".");
			
			parts.forEach((part: string) => {
				// Check if this part contains array indexing
				const arrayMatch = part.match(/^([^[]+)\[(\d+)\]$/);
				if (arrayMatch) {
					// Split into property name and array index
					pathParts.push(arrayMatch[1]); // property name (e.g., "filters")
					pathParts.push(parseInt(arrayMatch[2])); // array index as number (e.g., 0)
				} else {
					pathParts.push(part);
				}
			});
			
			return pathParts;
		})

		const targetValues = typeInfoArray.map((element:any)=>{
			return element.split("_")[1]
		})
		// this data is filled now
		const customTargetedArray: any[] = []
		for (let i = 0;i<targetPropsArray.length;i++) {
			let tempVar = this.node; // Start from this.node
			
			if (targetPropsArray[i].length === 1) {
				// If there's only one property level, target is this.node itself
				customTargetedArray.push(this.node)
				continue;
			}

			// Traverse the object path to find the target object
			for (let j = 0; j < targetPropsArray[i].length - 1; j++) { // -1 because last element is the property name
				const key = targetPropsArray[i][j];
				
				// Handle both string keys and numeric array indices
				if (typeof key === 'number') {
					// Array index access - cast to any to handle array indexing
					tempVar = (tempVar as any)[key];
				} else {
					// Property access
					tempVar = (tempVar as any)[key];
				}
				
				if (j === targetPropsArray[i].length - 2) { // If this is the last object in the path
					customTargetedArray.push(tempVar); // This is our target object
				}  
			}
		}

		dynamicProps.targetProps = targetPropsArray.map((element:any)=>{
			return element[element.length-1] // Get the final property name
		});
		////////////
		
		let endProp: any = {}
		for (let i = 0;i<targetPropsArray.length;i++) {
			endProp[targetPropsArray[i][targetPropsArray[i].length-1]] = () => { return parseFloat(targetValues[i]) };
		}

		dynamicProps.end = () => endProp;

		return {props: dynamicProps, targets: customTargetedArray};
	}

	play(name: string): gsap.core.Tween | null {
		const effect = this.getEffect(name, this.componentData);

		if (effect) {
			return effect.play();
		}

		console.warn("No effect found with name: ", name);
		return null;
	}

	getEffect(name: string | null, component: any = this.componentData): gsap.EffectsMap | null {
		let effect: gsap.EffectsMap | null = null;
		Object.entries(component.effects).forEach(([key]) => {
			const localComp = component.effects[key];

			if (localComp.autoplay) {
				gsap.delayedCall(0, () => {
					// TO DO: find a better way to do this without using delayedCall
					if (!isStudio()) {
						effect = this.action(localComp);
						this.transitionFXs.push(effect);
					}
				});
			}

			if (name && localComp.name === name) {
				effect = this.action(localComp);
				effect!.pause();
				this.transitionFXs.push(effect);
			}

			if (typeof localComp.eventNames !== "string") {
				const splittedEventNames = localComp.eventNames;
				if (splittedEventNames) {
					splittedEventNames.forEach((eventName: string) => {
						this.eventEmitter.on(eventName, () => {
							effect = this.action(localComp);
							this.transitionFXs.push(effect);
						});
					});
				}
			}
		});

		return effect;
	}

	update(component: any) {
		if (!component) return;

		if (!this.componentData) {
			this.getEffect(null, component);
		}

		this.componentData = component;

		if (!this.defaults) {
			this.defaults = this.get().data || null;
		}
	}

	get() {
		return {
			type: "transitionFX",
			data: this.componentData,
		};
	}
}

export default TransitionFX;
