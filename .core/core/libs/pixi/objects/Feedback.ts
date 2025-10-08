/* eslint-disable class-methods-use-this */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable radix */
import * as PIXI from "pixi.js";

import gsap from "gsap";
import { StudioObject2D } from "./types";
import { FeedbackGC } from "../../common/components";
import { isStudio } from "../../common/editorGlobals";

class Feedback extends PIXI.Container implements StudioObject2D {
	id: string = "";
	type: string = "feedback";

	debugRect: PIXI.Graphics = new PIXI.Graphics();
	mainWrapper: PIXI.Container = new PIXI.Container();

	selected: boolean = false;
	locked: boolean = false;

	feedbacks: { [key: string]: any } = {};
	animationTargets: PIXI.Container[] = [];
	delayedCalls: gsap.core.Tween[] = [];
	fontFamily: string = "Arial";
	introTargets: PIXI.Container[] = [];
	outroTargets: PIXI.Container[] = [];
	promises: Promise<void>[] = [];

	constructor() {
		super();

		if (isStudio()) {
			this.updateDebug();
			this.addChild(this.debugRect);
		}

		this.initComponentSystem();
	}

	prepareText(matchedFeedback: any) {
		const { texts, behaviors, skewBehavior, scaleBehavior, rotationBehavior, positionBehavior, blurBehavior } = matchedFeedback;

		this.animationTargets = [];
		this.children.forEach((child) => {
			if (child === this.debugRect) return;
			this.removeChild(child);
			child.destroy();
		});

		const textsList = texts.split(",");
		const randomText = textsList[Math.floor(Math.random() * textsList.length)];

		const textCont = this.prepareByContext(matchedFeedback, randomText);
		textCont.label = "main_wrapper";
		this.mainWrapper = textCont;

		this.addChild(textCont);

		const textContBounds = textCont.getLocalBounds();
		textCont.pivot.set(textContBounds.x + textContBounds.width * 0.5, textContBounds.y + textContBounds.height * 0.5);

		textCont.scale.set(Math.min(this.baseWidth / textContBounds.width, this.baseHeight / textContBounds.height));
		textCont.x = this.baseWidth * 0.5;
		textCont.y = this.baseHeight * 0.5;

		// this.applySettings();

		this.animationTargets.forEach((target) => {
			if (behaviors.includes("alpha")) {
				target.alpha = matchedFeedback.alphaBehavior.intro.fromAlpha;
			}

			if (behaviors.includes("scale")) {
				target.scale.set(scaleBehavior!.intro.fromScaleX, scaleBehavior!.intro.fromScaleY);
			}

			if (behaviors.includes("rotation")) {
				target.rotation = rotationBehavior!.intro.fromAngle * (Math.PI / 180);
			}

			if (behaviors.includes("skew")) {
				target.skew.set(skewBehavior!.intro.fromSkewX, skewBehavior!.intro.fromSkewY);
			}

			if (behaviors.includes("position")) {
				target.x += positionBehavior!.intro.fromX;
				target.y += positionBehavior!.intro.fromY;
			}

			if (behaviors.includes("tint")) {
				target.tint = positionBehavior!.intro.tint;
			}
		});

		if (behaviors.includes("blur")) {
			gsap.to(this.mainWrapper, {
				pixi: {
					blur: blurBehavior!.intro.fromBlur,
				},
				duration: 0,
			});
		}
	}

	prepareByContext(matchedFeedback: any, textStr: string): PIXI.Container {
		const { textsContext, letterSpacing, wordSpacing, letterOrigin, wordOrigin, colors, colorOrder } = matchedFeedback;

		const wrapper = new PIXI.Container();

		let splitRule = null;
		if (textsContext === "letter") {
			splitRule = "";
		} else if (textsContext === "word") {
			splitRule = " ";
		} else if (textsContext === "line") {
			splitRule = "\n";
		} else if (textsContext === "all") {
			splitRule = null;
		}

		let splittedTexts = null;
		if (splitRule != null) {
			splittedTexts = textStr.split(splitRule);
		} else {
			splittedTexts = [textStr];
		}

		const subWrapperList: PIXI.Container[] = [];
		const bmTextList: PIXI.BitmapText[] = [];

		let emptyCharSpace = 0;
		splittedTexts.forEach((subText, i2) => {
			const subLetters = subText.split("");

			// console.log(subLetters);
			let subWrapper = null;
			if (subLetters.length > 1) {
				subWrapper = new PIXI.Container();
				wrapper.addChild(subWrapper);
			}

			for (let i = 0; i < subLetters.length; i++) {
				const letter = subLetters[i];

				if (letter.trim() === "") {
					emptyCharSpace = wordSpacing;
					// eslint-disable-next-line no-continue
					continue;
				}

				const bmText = new PIXI.BitmapText({
					text: letter,
					style: {
						fontFamily: this.fontFamily,
						fontSize: 64,
						align: "center",
					},
				});

				if (colors.length) {
					if (colorOrder === "random") {
						const randomColor = colors[Math.floor(Math.random() * colors.length)];
						bmText.tint = randomColor;
					} else if (colorOrder === "sequential") {
						const colorIndex = i2 % colors.length;
						bmText.tint = colors[colorIndex];
					} else if (colorOrder === "reverse") {
						const colorIndex = colors.length - 1 - (i2 % colors.length);
						bmText.tint = colors[colorIndex];
					}
				}

				bmText.anchor.set(letterOrigin.x, letterOrigin.y);

				if (subWrapper) {
					subWrapper.addChild(bmText);
				} else {
					wrapper.addChild(bmText);
					this.animationTargets.push(bmText);
				}

				if (bmTextList.length === 0) {
					bmText.x = 0;
				} else {
					const prevBmText = bmTextList[bmTextList.length - 1];

					bmText.x = prevBmText.x + (prevBmText.width || wordSpacing) * (1 - prevBmText.anchor.x) + (bmText.width || wordSpacing) * bmText.anchor.x + letterSpacing + emptyCharSpace;
					emptyCharSpace = 0;
				}

				(bmText as any).iX = bmText.x;
				(bmText as any).iY = bmText.y;

				bmTextList.push(bmText);
			}

			if (subLetters.length > 1 && subWrapper) {
				const lb = subWrapper.getLocalBounds();
				subWrapper.pivot.set(lb.x + lb.width * wordOrigin.x, lb.y + lb.height * wordOrigin.y);
				subWrapper.width = lb.width;
				subWrapper.height = lb.height;

				if (subWrapperList.length === 0) {
					subWrapper.x = 0;
					subWrapper.y = 0;
				} else {
					const prevSubWrapper = subWrapperList[subWrapperList.length - 1];

					if (textsContext === "line") {
						subWrapper.x = 0;
						subWrapper.y = prevSubWrapper.y + prevSubWrapper.height * (1 - wordOrigin.y) + subWrapper.height * wordOrigin.y;
					} else {
						subWrapper.x = prevSubWrapper.x + prevSubWrapper.width * (1 - wordOrigin.x) + subWrapper.width * wordOrigin.x + wordSpacing + letterSpacing;
					}
				}

				(subWrapper as any).iX = subWrapper.x;
				(subWrapper as any).iY = subWrapper.y;

				subWrapperList.push(subWrapper);
				this.animationTargets.push(subWrapper);
			}
		});

		return wrapper;
	}

	play(feedbackName: string): Promise<void> {
		this.promises = [];

		return new Promise<void>((resolve) => {
			const matchedFeedbacks = Object.values(this.feedbacks).filter((value) => {
				const { name } = value as { name: string };
				return name === feedbackName;
			});

			if (!matchedFeedbacks.length) {
				console.warn("No tutorial found with name:", feedbackName);
				this.stop();
				resolve();
			}

			const matchedFeedback = matchedFeedbacks[0] as any;

			const {
				alphaBehavior,
				scaleBehavior,
				rotationBehavior,
				// skewBehavior,
				tintBehavior,
				positionBehavior,
				behaviorOptions,
			} = matchedFeedback;

			gsap.killTweensOf(this.mainWrapper);
			if (this.mainWrapper) {
				this.mainWrapper.alpha = 1;
				this.mainWrapper.visible = true;
			}

			this.prepareText(matchedFeedback);

			this.emit("feedback:start");

			this.introTargets = [...this.animationTargets];
			this.outroTargets = [...this.animationTargets];
			const startOrder = behaviorOptions!.intro.order;

			if (startOrder === "random") {
				this.introTargets.sort(() => Math.random() - 0.5);
			} else if (startOrder === "reverse") {
				this.introTargets.reverse();
			}

			const endOrder = behaviorOptions!.outro.order;
			if (endOrder === "random") {
				this.outroTargets.sort(() => Math.random() - 0.5);
			} else if (endOrder === "reverse") {
				this.outroTargets.reverse();
			}

			this.introTargets.forEach((target, index) => {
				this.playBrightnessBehavior(target, index, matchedFeedback);

				this.playStartBehavior(target, index, matchedFeedback, "alpha", { alpha: 1 }, { alpha: alphaBehavior.intro.fromAlpha }, { alpha: alphaBehavior.intro.toAlpha });

				this.playStartBehavior(
					target,
					index,
					matchedFeedback,
					"scale",
					{ scaleX: 1, scaleY: 1 },
					{ scaleX: scaleBehavior.intro.fromScaleX, scaleY: scaleBehavior.intro.fromScaleY },
					{ scaleX: scaleBehavior.intro.toScaleX, scaleY: scaleBehavior.intro.toScaleY }
				);

				this.playStartBehavior(target, index, matchedFeedback, "rotation", { rotation: 0 }, { rotation: rotationBehavior.intro.fromAngle }, { rotation: rotationBehavior.intro.toAngle });

				this.playStartBehavior(
					target,
					index,
					matchedFeedback,
					"position",
					{ x: 0, y: 0 }, // dummy value
					{ x: positionBehavior.intro.fromX, y: positionBehavior.intro.fromY },
					{ x: positionBehavior.intro.toX, y: positionBehavior.intro.toY }
				);

				this.playBlurStartBehavior(target, index, matchedFeedback);

				if (tintBehavior) {
					this.playStartBehavior(target, index, matchedFeedback, "tint", { tint: 0xffffff }, { tint: tintBehavior.intro.fromTint }, { tint: tintBehavior.intro.toTint });
				}
			});

			Promise.all(this.promises).then(() => {
				resolve();
				this.promises = [];
				this.emit("feedback:complete");
			});
		});
	}

	playBrightnessBehavior(target: any, index: number, matchedFeedback: any) {
		const { behaviors, brightnessBehavior, behaviorOptions } = matchedFeedback;

		if (behaviors.includes("brightness")) {
			gsap.to(this.mainWrapper, {
				pixi: {
					brightness: brightnessBehavior!.brightness,
				},
				duration: brightnessBehavior!.duration,
				delay: brightnessBehavior!.delay,
				repeat: brightnessBehavior!.repeat,
				yoyo: brightnessBehavior!.yoyo,
				ease: brightnessBehavior!.ease !== "-" ? brightnessBehavior!.ease : behaviorOptions!.intro.ease,
			});
		}
	}

	playBlurStartBehavior(target: any, index: number, matchedFeedback: any): Promise<void> {
		const { behaviors, behaviorOptions } = matchedFeedback;
		if (!behaviors.includes("blur")) {
			return Promise.resolve();
		}

		const promise = new Promise<void>((resolve) => {
			const { delay, ease, duration } = (matchedFeedback as any)[`${"blur"}Behavior`].intro;

			gsap.to(this.mainWrapper, {
				pixi: {
					blur: 0,
				},
				delay,
				duration,
				ease: ease !== "-" ? ease : behaviorOptions!.intro.ease,
				onComplete: () => {
					const dc = gsap.delayedCall(behaviorOptions!.betweenDelay, () => {
						if (behaviorOptions!.intro.perDelay !== 0) {
							if (index === this.introTargets.length - 1) {
								this.playBlurEndBehavior(target, index, matchedFeedback);
							}
						} else {
							this.playBlurEndBehavior(target, index, matchedFeedback);
						}

						const { delay: outroDelay, duration: outroDuration } = (matchedFeedback as any)[`${"blur"}Behavior`].outro;
						gsap.delayedCall(outroDuration + outroDelay, () => {
							resolve();
						});
					});
					this.delayedCalls.push(dc);
				},
			});
		});
		this.promises.push(promise);
		return promise;
	}

	playBlurEndBehavior(target: any, index: number, matchedFeedback: any): Promise<void> {
		const { behaviors, behaviorOptions, blurBehavior } = matchedFeedback;
		if (!behaviors.includes("blur")) {
			return Promise.resolve();
		}

		const promise = new Promise<void>((resolve) => {
			const { delay, ease, duration } = (matchedFeedback as any)[`${"blur"}Behavior`].outro;

			gsap.to(this.mainWrapper, {
				pixi: {
					blur: blurBehavior!.outro.blur,
				},
				delay,
				duration,
				ease: ease !== "-" ? ease : behaviorOptions!.outro.ease,
				onComplete: resolve,
			});
		});

		return promise;
	}

	playStartBehavior(
		target: PIXI.Container,
		index: number,
		matchedFeedback: any,
		type: "alpha" | "scale" | "rotation" | "skew" | "position" | "blur" | "tint",
		startValue: { [key: string]: any },
		introFromVal: { [key: string]: any },
		introToVal: { [key: string]: any }
	): Promise<void> {
		const { behaviors, behaviorOptions } = matchedFeedback;
		if (!behaviors.includes(type)) {
			return Promise.resolve();
		}

		const startOrder = behaviorOptions!.intro.order;
		const endOrder = behaviorOptions!.outro.order;
		const introTargets = [...this.introTargets];
		const outroTargets = [...this.outroTargets];
		// if (index === 0) {
		if (startOrder === "random") {
			introTargets.sort(() => Math.random() - 0.5);
		} else if (startOrder === "reverse") {
			introTargets.reverse();
		}

		if (endOrder === "random") {
			outroTargets.sort(() => Math.random() - 0.5);
		} else if (endOrder === "reverse") {
			outroTargets.reverse();
		}
		// }

		const promise = new Promise<void>((resolve) => {
			const { duration: introDuration, repeat: introRepeat, delay: introDelay, ease: introEase } = (matchedFeedback as any)[`${type}Behavior`].intro;

			const { duration: outroDuration, delay: outroDelay } = (matchedFeedback as any)[`${type}Behavior`].outro;

			if (type === "position") {
				introFromVal.x = (target as any).iX + introFromVal.x;
				introFromVal.y = (target as any).iY + introFromVal.y;
				introToVal.x += (target as any).iX + introToVal.x;
				introToVal.y += (target as any).iY + introToVal.y;
			}

			let repeatNo = 0;
			const repeater = (val: any) => {
				gsap.to(target, {
					pixi: {
						...val,
					},
					duration: introDuration,

					ease: introEase !== "-" ? introEase : behaviorOptions!.intro.ease,
					onComplete: () => {
						if (repeatNo === introRepeat) {
							const dc = gsap.delayedCall(behaviorOptions!.betweenDelay, () => {
								const behaviorOutro = (matchedFeedback as any)[`${type}Behavior`].outro;

								const ind = outroTargets.indexOf(target);
								const scalar = behaviorOptions!.outro.order === "reverse" ? 2 : 1;
								let _delay = outroDelay + behaviorOptions!.intro.perDelay * ind * scalar;
								if (behaviorOptions!.outro.order === "once") _delay = outroDelay;

								let tweenConfig = {} as any;
								if (type === "alpha") {
									tweenConfig = { alpha: behaviorOutro.alpha };
								} else if (type === "scale") {
									tweenConfig = { scaleX: behaviorOutro.scaleX, scaleY: behaviorOutro.scaleY };
								} else if (type === "rotation") {
									tweenConfig = { rotation: behaviorOutro.angle };
								} else if (type === "position") {
									tweenConfig = {
										x: (target as any).iX + behaviorOutro.x,
										y: (target as any).iY + behaviorOutro.y,
									};
								} else if (type === "tint") {
									tweenConfig = { tint: behaviorOutro.tint };
								}

								if (!behaviorOutro.enabled) {
									resolve();
									return;
								}

								if (endOrder === "once") {
									if (index === introTargets.length - 1) {
										introTargets.forEach((target2, index2) => {
											this.playEndBehavior(target2, index2, matchedFeedback, type, {
												[type]: tweenConfig,
											});
										});
									}

									gsap.delayedCall(outroDuration + _delay, () => {
										resolve();
									});
								} else if (startOrder === "random") {
									if (index === introTargets.length - 1) {
										introTargets.forEach((target2, index2) => {
											this.playEndBehavior(target2, index2, matchedFeedback, type, {
												[type]: tweenConfig,
											});
										});
									}
									gsap.delayedCall(outroDuration + _delay, () => {
										resolve();
									});
								} else {
									this.playEndBehavior(target, index, matchedFeedback, type, {
										[type]: tweenConfig,
									});

									gsap.delayedCall(outroDuration + _delay, () => {
										resolve();
									});
								}
							});
							this.delayedCalls.push(dc);
						} else if (repeatNo % 2 === 1) {
							repeater(introToVal);
						} else {
							repeater(introFromVal);
						}
						repeatNo += 1;
					},
				});
			};
			const ind = introTargets.indexOf(target);
			gsap.delayedCall(introDelay + behaviorOptions!.intro.perDelay * ind, () => {
				repeater(introToVal);
			});
		});
		this.promises.push(promise);

		return promise;
	}

	playEndBehavior(target: PIXI.Container, index: number, matchedFeedback: any, type: "alpha" | "scale" | "rotation" | "position" | "skew" | "blur" | "tint", endValue: any): Promise<void> {
		const { behaviors, behaviorOptions, positionBehavior } = matchedFeedback;
		if (!behaviors.includes(type)) {
			return Promise.resolve();
		}

		const promise = new Promise<void>((resolve) => {
			const { duration, delay, ease } = (matchedFeedback as any)[`${type}Behavior`].outro;

			let _endValue = endValue;
			if (type === "position") {
				const { x, y } = positionBehavior!.outro;
				_endValue = {
					position: {
						x: (target as any).iX + x,
						y: (target as any).iY + y,
					},
				};
			}

			const ind = this.outroTargets.indexOf(target);
			const scalar = behaviorOptions!.outro.order === "reverse" ? 2 : 1;
			let _delay = delay + behaviorOptions!.outro.perDelay * ind * scalar;
			if (behaviorOptions!.outro.order === "once") _delay = delay;

			gsap.to(target, {
				pixi: {
					..._endValue[type],
				},
				delay: _delay,
				duration,
				ease: ease !== "-" ? ease : behaviorOptions!.outro.ease,
				onComplete: resolve,
			});
		});

		return promise;
	}

	stop() {
		this.delayedCalls.forEach((dc) => {
			dc.kill();
		});

		this.animationTargets.forEach((target) => {
			gsap.killTweensOf(target);
		});

		gsap.to(this.mainWrapper, {
			pixi: {
				alpha: 0,
			},
			duration: 0.5,
			onComplete: () => {
				if (this.children.length && this.mainWrapper) this.mainWrapper.filters = [];
				this.visible = false;
			},
		});

		this.emit("feedback:stop");
	}

	forceStop() {
		this.delayedCalls.forEach((dc) => {
			dc.kill();
		});

		this.animationTargets.forEach((target) => {
			gsap.killTweensOf(target);
		});

		if (this.children.length && this.mainWrapper) this.mainWrapper.filters = [];
		if (this.mainWrapper) {
			this.mainWrapper.alpha = 0;
			this.mainWrapper.visible = false;
		}

		this.emit("feedback:stop");
	}

	// applySettings() {
	// 	const lb = this.getLocalBounds();
	// 	this.pivot.set(lb.x + lb.width * 0.5, lb.y + lb.height * 0.5);

	// 	this.baseWidth = lb.width;
	// 	this.baseHeight = lb.height;
	// }

	updateFeedbackComponent(component: FeedbackGC) {
		if (isStudio()) this.debugRect.visible = component.debug;
		this.baseWidth = component.width;
		this.baseHeight = component.height;
		this.updateDebug();

		this.fontFamily = component.fontFamily;
		this.feedbacks = component.feedbacks;

		if (this.feedbacks) {
			// eslint-disable-next-line guard-for-in
			for (const key in this.feedbacks) {
				const feedback = this.feedbacks[key];
				// console.log(feedback);
				const { name, showEvents, hideEvents } = feedback;

				showEvents.forEach((eventName: string) => {
					this.eventEmitter.on(eventName, () => {
						this.play(name);
					});
				});

				hideEvents.forEach((eventName: string) => {
					this.eventEmitter.on(eventName, () => {
						this.stop();
					});
				});
			}
		}

		const transform = this.components.get("transform");
		this.setOrigin(transform.origin.x, transform.origin.y);

		// this.prepareText();
	}

	updateDebug() {
		if (!isStudio()) return;
		if (this.debugRect) {
			this.debugRect.clear();
			this.debugRect.rect(0, 0, this.baseWidth, this.baseHeight);
			this.debugRect.fill({ color: 0x0ea5e9, alpha: 0.2 });
		}
	}

	updateComponents(components: { [key: string]: any }) {
		const transform = this.components.get("transform");

		const feedback = components.feedback as FeedbackGC;

		if (feedback) {
			this.updateFeedbackComponent(feedback);
		}

		this.setOrigin(transform.origin.x, transform.origin.y);

		super.updateComponents(components);
		// this.components.update(components);
	}
}

export default Feedback;
