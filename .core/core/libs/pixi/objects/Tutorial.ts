/* eslint-disable no-use-before-define */
import * as PIXI from "pixi.js";

import gsap from "gsap";
import { StudioObject2D } from "./types";
import { TutorialGC } from "../../common/components";
import { getPixiApplication, isStudio } from "../../common/editorGlobals";
import Sprite from "./Sprite";
import ObjectHelper2D from "../utils/ObjectHelper2D";
import Graphics from "./Graphics";

type TutorialData = {
	name: string;
	tutorialType: "choose" | "infinity" | "path";
	chooseType: {
		chooseOrder: "random" | "sequential" | "reverse";
		behaviors: ("movement" | "scale" | "rotation" | "alpha" | "drag")[];
		alpha: {
			timeline: [number, number];
			duration: number;
			startDelay: number;
			endDelay: number;
			easeStart: string;
			easeEnd: string;
			disableAt: "none" | "start" | "end";
		};
		scale: {
			scaleRatio: number;
			timeline: [number, number];
			duration: number;
			startDelay: number;
			endDelay: number;
			easeStart: string;
			easeEnd: string;
			disableAt: "none" | "start" | "end";
		};
		rotation: {
			angleAmount: number;
			timeline: [number, number];
			duration: number;
			startDelay: number;
			endDelay: number;
			easeStart: string;
			easeEnd: string;
			disableAt: "none" | "start" | "end";
		};
		movement: {
			timeline: [number, number];
			duration: number;
			startDelay: number;
			endDelay: number;
			easeStart: string;
			easeEnd: string;
			disableAt: "none" | "start" | "end";
		};
		drag: {
			dragTheObjectsClone: boolean;
			duration: number;
		};
		duration: number;
		delay: number;
		ease: string;
		repeat: number;
		repeatDelay: number;
	};
	infinityType: {
		behaviors: ("scale" | "rotation" | "alpha")[];
		behaviorsDuration: number;
		scale: {
			scaleRatio: number;
			speed: number;
			ease: string;
		};
		rotation: {
			angleAmount: number;
			speed: number;
			ease: string;
		};
		infinityMovementWidth: number;
		infinityMovementHeight: number;
		duration: number;
		delay: number;
		repeat: number;
		repeatDelay: number;
		ease: string;
	};
	pathType: {
		behaviors: ("scale" | "rotation" | "alpha")[];
		alpha: {
			timeline: [number, number];
			speed: number;
			easeStart: string;
			easeEnd: string;
			disableAt: "none" | "start" | "end";
		};
		scale: {
			timeline: [number, number];
			speed: number;
			easeStart: string;
			easeEnd: string;
			disableAt: "none" | "start" | "end";
		};
		rotation: {
			timeline: [number, number];
			speed: number;
			easeStart: string;
			easeEnd: string;
			disableAt: "none" | "start" | "end";
		};
		movement: {
			timeline: [number, number];
			speed: number;
			easeStart: string;
			easeEnd: string;
			disableAt: "none" | "start" | "end";
		};
		pathGraphics: string;
		pathDuration: number;
		curviness: number;
		duration: number;
		delay: number;
		repeat: number;
		yoyo: boolean;
		repeatDelay: number;
		ease: string;
	};
	showEvents: string[];
	hideEvents: string[];
};

class Tutorial extends PIXI.Container implements StudioObject2D {
	type: string = "tutorial";
	id: string = "";

	selected: boolean = false;
	locked: boolean = false;

	debugRect: PIXI.Graphics = new PIXI.Graphics();

	hand: Sprite | null = null;
	pathGraphics: Graphics | null = null;
	tutorials: any = {};
	targets: any[] = [];
	private _targets: any[] = [];
	currentTarget: any = null;
	currentState: any = null;
	enabled: boolean = true;

	handOrigScale: PIXI.Point = new PIXI.Point(1, 1);
	handOrigAngle: number = 0;
	handOrigAlpha: number = 1;

	dragTargets: any = [];
	private _dragTargets: any[] = [];
	currentDragTarget: any = null;

	private movementTween: any = null;
	private dragTween: any = null;
	private dragObjectsClone: any = null;

	private camera: any;
	private pixiScene: any;

	pathTween: gsap.core.Tween | null = null;

	private delayedCalls: any[] = [];

	private pixiApp: PIXI.Application = getPixiApplication();
	private updateTickers: any = [];

	private skipFirstResizeFlag: boolean = false;

	constructor({ x = 0, y = 0 }) {
		super({
			x,
			y,
		});

		if (isStudio()) {
			this.updateDebug();
			this.addChild(this.debugRect);
		}

		this.initComponentSystem();
	}

	updateDebug() {
		if (!isStudio()) return;
		this.debugRect.clear();
		this.debugRect.rect(0, 0, this.baseWidth, this.baseHeight);
		this.debugRect.fill({ color: 0x0ea5e9, alpha: 0.2 });
	}

	play(tutorialName: string) {
		if (!this.targets.length) {
			console.warn("No targets found for tutorial");
			this.clearTweensAndDelayedCalls();
			return;
		}

		// @ts-ignore
		if (window.app && window.app.globals) {
			// @ts-ignore
			if (window.app.globals.threeCamera) {
				// @ts-ignore
				this.setCamera(window.app.globals.threeCamera);
			}

			// @ts-ignore
			if (window.app.globals.pixiScene) {
				// @ts-ignore
				this.setPixiScene(window.app.globals.pixiScene);
			}
		}

		const matchedTutorials = Object.values(this.tutorials).filter((value) => {
			const { name } = value as { name: string };
			return name === tutorialName;
		});

		if (!matchedTutorials.length) {
			console.warn("No tutorial found with name:", tutorialName);
			this.clearTweensAndDelayedCalls();
			return;
		}

		gsap.killTweensOf(this);
		gsap.killTweensOf(this.hand);
		this.visible = true;
		this.alpha = 1;

		const matchedTutorial = matchedTutorials[0];

		const { tutorialType, chooseType, infinityType, pathType, showEvents, hideEvents } = matchedTutorial as TutorialData;

		let selectedTutorial = null;
		if (tutorialType === "choose") {
			selectedTutorial = this.chooseTutorial;
		} else if (tutorialType === "infinity") {
			selectedTutorial = this.infinityTutorial;
		} else if (tutorialType === "path") {
			selectedTutorial = this.pathTutorial;
		}

		this.setTutorial(selectedTutorial, {
			tutorialType,
			chooseType,
			infinityType,
			pathType,
			showEvents,
			hideEvents,
		});
	}

	stop() {
		this.setTutorial(this.stopTutorial);
	}

	private getParentsScale(parent: any) {
		const parents = [];
		const scale = new PIXI.Point(parent.scale.x, parent.scale.y);

		while (parent && parent.label !== this.parent.label) {
			parents.push(parent);
			// eslint-disable-next-line no-param-reassign
			parent = parent.parent;

			if (parent && parent.scale) {
				scale.x *= parent.scale.x;
				scale.y *= parent.scale.y;
			}
		}

		return scale;
	}

	getMappedPath(pathList: any, globalPos: PIXI.Point) {
		return pathList.map((item: any) => {
			const tutParentScale = this.getParentsScale(this.parent);
			const globalScale = (this.pathGraphics!.scale.x * this.getParentsScale(this.pathGraphics!.parent).x) / tutParentScale.x;
			return { x: globalPos.x + item.x * globalScale, y: globalPos.y + item.y * globalScale };
		});
	}

	private alphaBehaviorIn(alpha: number, duration: number = 0.4, delay: number = 0, ease: string = "sine.inOut") {
		this.hand!.alpha = alpha;

		gsap.to(this.hand, {
			pixi: { alpha: 1 },
			duration,
			delay,
			ease,
		});
	}

	private alphaBehaviorOut(alpha: number, duration: number = 0.4, delay: number = 0, ease: string = "sine.inOut") {
		gsap.to(this.hand, {
			pixi: { alpha },
			duration,
			delay,
			ease,
		});
	}

	private rotateBehaviorIn(angle: number = 12, duration: number = 0.4, delay: number = 0, ease: string = "sine.inOut") {
		this.hand!.angle = this.handOrigAngle;
		gsap.to(this.hand, {
			pixi: { angle: `+=${angle}` },
			duration,
			delay,
			ease,
		});
	}

	private rotateBehaviorOut(angle: number, duration: number = 0.4, delay: number = 0, ease: string = "sine.inOut") {
		gsap.to(this.hand, {
			pixi: { angle: `-=${angle}` },
			duration,
			delay,
			ease,
		});
	}

	private scaleBehaviorIn(scale: number = 1.2, duration: number = 0.4, delay: number = 0, ease: string = "sine.inOut") {
		this.hand?.scale.set(this.handOrigScale.x * scale, this.handOrigScale.y * scale);
		gsap.to(this.hand, {
			pixi: { scale: this.handOrigScale.x },
			duration,
			delay,
			ease,
		});
	}

	private scaleBehaviorOut(scale: number = 1.2, duration: number = 0.4, delay: number = 0, ease: string = "sine.inOut") {
		gsap.to(this.hand, {
			pixi: { scale: this.handOrigScale.x * scale },
			duration,
			delay,
			ease,
		});
	}

	private movementBehavior(target: any, duration: number = 0.4, delay: number = 0, ease: string = "sine.inOut") {
		if (this.movementTween) {
			this.movementTween.kill();
		}

		this.movementTween = gsap.to(this, {
			x: () => this.getTargetsGlobalPosition(target).x,
			y: () => this.getTargetsGlobalPosition(target).y,
			duration,
			delay,
			ease,
		});
	}

	chooseTutorial = {
		onEnter: (params: any) => {
			if (!this.hand) {
				console.warn("No hand found for tutorial");
				this.clearTweensAndDelayedCalls();
				return;
			}

			const random = () => {
				return Math.random() - 0.5;
			};

			const { chooseOrder, behaviors, repeat, delay, repeatDelay, ease, alpha, scale, rotation, movement, drag } = params.chooseType;

			if (!alpha.duration) alpha.duration = 0.4;
			if (!alpha.startDelay) alpha.startDelay = 0;
			if (!alpha.endDelay) alpha.endDelay = 0;

			if (!scale.duration) scale.duration = 0.4;
			if (!scale.startDelay) scale.startDelay = 0;
			if (!scale.endDelay) scale.endDelay = 0;

			if (!rotation.duration) rotation.duration = 0.4;
			if (!rotation.startDelay) rotation.startDelay = 0;
			if (!rotation.endDelay) rotation.endDelay = 0;

			if (!movement.duration) movement.duration = 0.4;
			if (!movement.startDelay) movement.startDelay = 0;
			if (!movement.endDelay) movement.endDelay = 0;

			const setTargets = () => {
				if (chooseOrder === "sequential") {
					this._targets = [...this.targets];
					this._dragTargets = [...this.dragTargets];
				} else if (chooseOrder === "reverse") {
					this._targets = [...this.targets].reverse();
					this._dragTargets = [...this.dragTargets].reverse();
				} else if (chooseOrder === "random") {
					this._targets = [...this.targets].sort(() => random());
					this._dragTargets = [...this.dragTargets].sort(() => random());
				}

				if (!this._targets || !this._targets.length) {
					console.warn("No targets found for tutorial");
					this.clearTweensAndDelayedCalls();
				}
			};

			setTargets();

			let targetIndex = 0;
			let dragTargetIndex = 0;
			let curRepeat = -1;

			const getNextTarget = () => {
				targetIndex++;
				dragTargetIndex++;

				if (targetIndex >= this._targets.length) {
					targetIndex = 0;
					if (chooseOrder === "random") {
						this._targets = this.targets.sort(() => random());
					}
				}

				if (targetIndex === 0) {
					curRepeat++;
				}

				if (this._dragTargets) {
					if (dragTargetIndex >= this._dragTargets.length) {
						dragTargetIndex = 0;
						if (chooseOrder === "random") {
							this._dragTargets = this.dragTargets.sort(() => random());
						}
					}
				}

				return {
					target: this._targets[targetIndex],
					dragTarget: this._dragTargets ? this._dragTargets[dragTargetIndex] : null,
				};
			};

			this.currentTarget = this._targets[targetIndex];
			this.currentDragTarget = this._dragTargets ? this._dragTargets[targetIndex] : null;

			let updateTicker: any = null;

			const startFunc = (target: any, dragTarget: any) => {
				return new Promise<void>((resolve) => {
					if (!this.hand) {
						console.warn("No hand found for tutorial");
						this.clearTweensAndDelayedCalls();
						return;
					}

					let maxDuration = 0;

					this.delayedCalls.forEach((dc) => {
						if (dc) {
							dc.kill();
							// eslint-disable-next-line no-param-reassign
							dc = null;
						}
					});

					if (behaviors.includes("movement")) {
						this.movementBehavior(target, movement.duration, movement.startDelay, movement.easeStart === "-" ? ease : movement.easeStart);
						maxDuration = Math.max(maxDuration, movement.duration + movement.startDelay);
					} else {
						const targetPos = this.getTargetsGlobalPosition(target);

						this.x = targetPos.x;
						this.y = targetPos.y;

						maxDuration = Math.max(maxDuration, 0);
					}

					if (behaviors.includes("alpha")) {
						this.alphaBehaviorIn(0, alpha.duration, alpha.startDelay, alpha.easeStart === "-" ? ease : alpha.easeStart);
						maxDuration = Math.max(maxDuration, alpha.duration + alpha.startDelay);
					}
					if (behaviors.includes("scale")) {
						this.scaleBehaviorIn(scale.scaleRatio, scale.duration, scale.startDelay, scale.easeStart === "-" ? ease : scale.easeStart);
						maxDuration = Math.max(maxDuration, scale.duration + scale.startDelay);
					}
					if (behaviors.includes("rotation")) {
						this.rotateBehaviorIn(rotation.angleAmount, rotation.duration, rotation.startDelay, rotation.easeStart === "-" ? ease : rotation.easeStart);
					}

					if (this.currentTarget.emit) this.currentTarget.emit("tutorial:start");

					const dc = gsap.delayedCall(maxDuration, () => {
						if (behaviors.includes("drag")) {
							if (this.dragTargets.length === 0) {
								console.warn("No drag targets found for tutorial");
								this.clearTweensAndDelayedCalls();
								return;
							}

							dragFunc(target, dragTarget)
								.then(() => {
									return endFunc();
								})
								.catch(() => {
									console.log("Error in dragFunc");
								});
						} else {
							endFunc();
						}
						resolve();
					});
					this.delayedCalls.push(dc);
				});
			};

			const dragFunc = (target: any, dragTarget: any) => {
				return new Promise<void>((resolve) => {
					if (behaviors.includes("drag")) {
						this.dragTween = gsap.to(this, {
							x: () => this.getTargetsGlobalPosition(dragTarget).x,
							y: () => this.getTargetsGlobalPosition(dragTarget).y,
							delay: 0,
							duration: drag.duration,
							ease: "sine.inOut",
						});

						if (drag.dragTheObjectsClone) {
							if (target instanceof PIXI.Container) {
								if (target.renderPipeId === "sprite") {
									this.createClone(target);
								}
							} else {
								this.createClone(target);
							}
						}

						const dc = gsap.delayedCall(drag.duration, () => {
							resolve();
						});
						this.delayedCalls.push(dc);
					}
				});
			};

			const endFunc = () => {
				let maxDuration = 0;

				if (behaviors.includes("alpha")) {
					this.alphaBehaviorOut(0, alpha.duration, alpha.endDelay, alpha.easeEnd === "-" ? ease : alpha.easeEnd);
					maxDuration = Math.max(maxDuration, alpha.duration + alpha.endDelay);
				}
				if (behaviors.includes("scale")) {
					this.scaleBehaviorOut(scale.scaleRatio, scale.duration, scale.endDelay, scale.easeEnd === "-" ? ease : scale.easeEnd);
					maxDuration = Math.max(maxDuration, scale.duration + scale.endDelay);
				}
				if (behaviors.includes("rotation")) {
					this.rotateBehaviorOut(rotation.angleAmount, rotation.duration, rotation.endDelay, rotation.easeEnd === "-" ? ease : rotation.easeEnd);
					maxDuration = Math.max(maxDuration, rotation.duration + rotation.endDelay);
				}

				if (this.dragObjectsClone) {
					if (this.dragObjectsClone instanceof PIXI.Container) {
						gsap.to(this.dragObjectsClone, {
							pixi: { alpha: 0 },
							duration: 0.4,
							ease: "sine.inOut",
							onComplete: () => {
								this.dragObjectsClone!.destroy();
								this.dragObjectsClone = null;
							},
						});
					} else {
						console.warn("Hide 3D Mesh");
					}
				}

				const dc = gsap.delayedCall(maxDuration, () => {
					const nextTarget = getNextTarget();

					if (this.currentTarget.emit) this.currentTarget.emit("tutorial:complete");

					if (repeat !== -1 && curRepeat >= repeat) {
						this.clearTweensAndDelayedCalls();
						this.emit("tutorial:complete");
						this.removeUpdateTicker(updateTicker);
						return;
					}

					if (this.currentTarget.emit) this.currentTarget.emit("tutorial:repeat");

					if (nextTarget) {
						const { target, dragTarget } = nextTarget;

						this.currentTarget = target;
						this.currentDragTarget = dragTarget;

						let _repeatDelay = 0;
						if (this._targets.indexOf(target) === 0) {
							this.emit("tutorial:repeat");
							_repeatDelay = repeatDelay;
						}

						const dc2 = gsap.delayedCall(_repeatDelay, () => {
							startFunc(target, dragTarget);
						});
						this.delayedCalls.push(dc2);
					} else {
						console.error("Failed to get next target");
					}
				});
				this.delayedCalls.push(dc);
			};

			this.hand.visible = false;
			const dc = gsap.delayedCall(delay, () => {
				this.hand!.visible = true;

				startFunc(this.currentTarget, this.currentDragTarget);

				this.emit("tutorial:start");

				updateTicker = this.addUpdateTicker((ticker: PIXI.Ticker) => {
					if (this.currentTarget.emit) this.currentTarget.emit("tutorial:update", ticker);
				});
			});
			this.delayedCalls.push(dc);
		},
		onResize: () => {
			if (!this.currentTarget) {
				return;
			}

			const pos = this.getTargetsGlobalPosition(this.currentTarget);
			this.x = pos.x;
			this.y = pos.y;

			if (this.movementTween) {
				(this.movementTween as gsap.core.Tween).invalidate();
			}

			if (this.currentDragTarget && this.dragTween) {
				(this.dragTween as gsap.core.Tween).invalidate();
			}

			if (this.dragObjectsClone) {
				if (this.dragObjectsClone instanceof PIXI.Container) {
					// const localScale = this.getLocalScale(this.dragObjectsClone, this.currentTarget);
					// this.dragObjectsClone.scale.set(localScale.x, localScale.y);
					this.dragObjectsClone.visible = false;
				}
			}
		},
		onUpdate: () => {},
		onExit: () => {},
	};

	infinityTutorial = {
		onEnter: (params: any) => {
			const { behaviors, infinityMovementWidth, infinityMovementHeight, delay, duration, ease, scale, rotation, behaviorsDuration } = params.infinityType;

			const t = { value: 0 };
			const centerX = this.baseWidth * 0.5;
			const centerY = this.baseHeight * 0.5;
			const radiusX = infinityMovementWidth;
			const radiusY = infinityMovementHeight;

			const updateTicker = this.addUpdateTicker();

			const pathTween = gsap.to(t, {
				value: 1,
				duration,
				delay,
				repeat: -1,
				onStart: () => {
					this.emit("tutorial:start");
				},
				onRepeat: () => {
					this.emit("tutorial:repeat");
				},
				ease: "none",
				onUpdate: () => {
					const { value } = t;

					const angle = value * Math.PI * 2; // Normalize t to 0-2π
					const x = radiusX * Math.cos(angle);
					const y = (radiusY * Math.sin(2 * angle)) / 2; // Creates the sideways figure-eight

					this.hand!.x = centerX + x;
					this.hand!.y = centerY + y;
				},
				onComplete: () => {
					this.emit("tutorial:complete");
					if (updateTicker) {
						this.removeUpdateTicker(updateTicker);
					}
				},
			});
			this.delayedCalls.push(pathTween);

			if (behaviors.includes("scale")) {
				gsap.to(this.hand, {
					pixi: { scale: this.handOrigScale.x * scale.scaleRatio },
					duration: behaviorsDuration / scale.speed,
					ease: scale.ease === "-" ? ease : scale.ease,
					repeat: -1,
					yoyo: true,
				});
			}

			if (behaviors.includes("rotation")) {
				const _duration = behaviorsDuration / rotation.speed;
				const rotator = (angle: number, dur: number) => {
					gsap.to(this.hand, {
						pixi: { angle },
						duration: dur,
						ease: rotation.ease === "-" ? ease : rotation.ease,
						onComplete: () => {
							if (Math.sign(angle) === -1) {
								rotator(Math.abs(angle), dur);
							} else {
								rotator(-Math.abs(angle), dur);
							}
						},
					});
				};
				rotator(rotation.angleAmount, _duration);
			}
		},
		onResize: () => {},
		onUpdate: () => {},
		onExit: () => {},
	};

	pathTutorial = {
		onEnter: (params: any) => {
			if (!this.hand) {
				console.warn("No hand found for tutorial");
				this.clearTweensAndDelayedCalls();
				return;
			}

			const { behaviors, duration, repeat, yoyo, delay, repeatDelay, pathDuration, curviness, pathGraphics, ease, alpha, scale, rotation } = params.pathType;

			if (pathGraphics) {
				this.pathGraphics = ObjectHelper2D.getNodeById(pathGraphics) as Graphics;
				const pathList = (this.pathGraphics.context.instructions[0].data as any).path.instructions[0].data[0];
				// const pathList2 = (this.pathGraphics.context.instructions[1].data as any);

				const alphaStartDelay = gsap.utils.mapRange(0, 1, 0, duration, alpha.timeline[0]);
				const alphaDuration = gsap.utils.mapRange(0, 1, 0, duration, (alpha.timeline[1] - alpha.timeline[0]) / alpha.speed);
				const alphaEndDelay = gsap.utils.mapRange(0, 1, 0, duration, 1 - alpha.timeline[1]);

				const scaleStartDelay = gsap.utils.mapRange(0, 1, 0, duration, scale.timeline[0]);
				const scaleDuration = gsap.utils.mapRange(0, 1, 0, duration, (scale.timeline[1] - scale.timeline[0]) / scale.speed);
				const scaleEndDelay = gsap.utils.mapRange(0, 1, 0, duration, 1 - scale.timeline[1]);

				const rotationStartDelay = gsap.utils.mapRange(0, 1, 0, duration, rotation.timeline[0]);
				const rotationDuration = gsap.utils.mapRange(0, 1, 0, duration, (rotation.timeline[1] - rotation.timeline[0]) / rotation.speed);
				const rotationEndDelay = gsap.utils.mapRange(0, 1, 0, duration, 1 - rotation.timeline[1]);

				const updateTicker = this.addUpdateTicker();

				if (pathList && typeof pathList === "object") {
					let curRepeat = 0;

					const getMappedList = (): any[] => {
						const globalPos = this.pathGraphics?.getGlobalPosition() as PIXI.Point;
						const localPos = this.parent.toLocal(globalPos);
						const mappedList = this.getMappedPath(pathList, localPos);
						return mappedList;
					};

					const startFunc = () => {
						return new Promise<void>((resolve) => {
							if (!this.hand) {
								console.warn("No hand found for tutorial");
								this.clearTweensAndDelayedCalls();
								return;
							}

							this.pixiApp.ticker.add(updateTicker);
							this.updateTickers.push(updateTicker);

							const mappedList = getMappedList();
							this.x = mappedList[0].x;
							this.y = mappedList[0].y;

							this.delayedCalls.forEach((dc) => {
								if (dc) {
									dc.kill();
									// eslint-disable-next-line no-param-reassign
									dc = null;
								}
							});

							if (behaviors.includes("alpha")) {
								if (alpha.disableAt !== "start") {
									this.alphaBehaviorIn(0, alphaDuration, alphaStartDelay, alpha.easeStart === "-" ? ease : alpha.easeStart);
								} else {
									this.hand.alpha = 1;
								}
							}
							if (behaviors.includes("scale")) {
								if (scale.disableAt !== "start") {
									this.scaleBehaviorIn(scale.scaleRatio, scaleDuration, scaleStartDelay, scale.easeStart === "-" ? ease : scale.easeStart);
								} else {
									this.hand.scale.set(this.handOrigScale.x, this.handOrigScale.y);
								}
							}
							if (behaviors.includes("rotation")) {
								if (rotation.disableAt !== "start") {
									this.rotateBehaviorIn(rotation.angleAmount, rotationDuration, rotationStartDelay, rotation.easeStart === "-" ? ease : rotation.easeStart);
								} else {
									this.hand.angle = this.handOrigAngle;
								}
							}
							const dc = gsap.delayedCall(duration, () => {
								// eslint-disable-next-line no-use-before-define
								curveTween();
								resolve();
							});
							this.delayedCalls.push(dc);
						});
					};

					const endFunc = () => {
						return new Promise<void>((resolve) => {
							if (behaviors.includes("alpha")) {
								if (alpha.disableAt !== "end") {
									this.alphaBehaviorOut(0, alphaDuration, alphaEndDelay, alpha.easeEnd === "-" ? ease : alpha.easeEnd);
								}
							}
							if (behaviors.includes("scale")) {
								if (scale.disableAt !== "end") {
									this.scaleBehaviorOut(scale.scaleRatio, scaleDuration, scaleEndDelay, scale.easeEnd === "-" ? ease : scale.easeEnd);
								} else {
									// may be unnecessary
									const dc = gsap.delayedCall(duration, () => {
										this.hand!.scale.set(this.handOrigScale.x, this.handOrigScale.y);
									});
									this.delayedCalls.push(dc);
								}
							}
							if (behaviors.includes("rotation")) {
								if (rotation.disableAt !== "end") {
									this.rotateBehaviorOut(rotation.angleAmount, rotationDuration, rotationEndDelay, rotation.easeEnd === "-" ? ease : rotation.easeEnd);
								} else {
									const dc = gsap.delayedCall(duration, () => {
										this.hand!.angle = this.handOrigAngle;
									});
									this.delayedCalls.push(dc);
								}
							}

							const dc = gsap.delayedCall(duration, () => {
								if (updateTicker) {
									this.removeUpdateTicker(updateTicker);
								}

								if (repeat !== -1 && curRepeat >= repeat) {
									this.clearTweensAndDelayedCalls();
									resolve();
									this.emit("tutorial:complete");
									return;
								}

								const dc2 = gsap.delayedCall(repeatDelay, () => {
									this.emit("tutorial:repeat");

									startFunc();
									resolve();
								});
								this.delayedCalls.push(dc2);
							});
							this.delayedCalls.push(dc);
						});
					};

					const curveTween = () => {
						const curve = gsap.to(this, {
							motionPath: {
								path: () => {
									const globalPos = this.getTargetsGlobalPosition(this.pathGraphics);
									return this.getMappedPath(pathList, globalPos);
								},
								autoRotate: false,
								curviness,
								offsetX: 0,
								offsetY: 0,
								fromCurrent: false,
							},
							duration: pathDuration,
							ease,
							repeat: yoyo ? 1 : 0,
							yoyo,
							onComplete: () => {
								curRepeat++;
								endFunc();
							},
						});
						this.pathTween = curve;
					};

					this.hand.visible = false;
					const dc = gsap.delayedCall(delay, () => {
						this.hand!.visible = true;

						this.emit("tutorial:start");

						startFunc();
					});
					this.delayedCalls.push(dc);
				} else {
					console.warn("Path Graphics is not a valid path");
				}
			} else {
				console.warn("Choose a path graphics");
			}
		},
		onResize: () => {
			if (!this.pathGraphics) return;
			const pathList = (this.pathGraphics.context.instructions[0].data as any).path.instructions[0].data[0];
			const globalPos = this.pathGraphics?.getGlobalPosition() as PIXI.Point;
			const localPos = this.parent.toLocal(globalPos);
			const mappedList = this.getMappedPath(pathList, localPos);
			this.x = mappedList[0].x;
			this.y = mappedList[0].y;

			if (this.pathTween) {
				(this.pathTween as gsap.core.Tween).invalidate();
			}
		},
		onUpdate: () => {},
		onExit: () => {},
	};

	stopTutorial = {
		onEnter: () => {
			this.clearTweensAndDelayedCalls();
		},
		onResize: () => {},
		onUpdate: () => {},
		onExit: () => {},
	};

	private addUpdateTicker(callback: any | null = null) {
		const updateTicker = (ticker: PIXI.Ticker) => {
			this.emit("tutorial:update", ticker);
			if (callback) {
				callback(ticker);
			}
		};
		this.pixiApp.ticker.add(updateTicker);
		this.updateTickers.push(updateTicker);

		return updateTicker;
	}

	private removeUpdateTicker(ut: any) {
		const ind = this.updateTickers.indexOf(ut);
		if (ind !== -1) {
			this.updateTickers.splice(ind, 1);
		}
		this.pixiApp.ticker.remove(ut);
	}

	private createClone(target: any) {
		let clone = null;
		if (target instanceof PIXI.Container) {
			const _target = target as PIXI.Sprite;
			clone = new PIXI.Sprite({
				texture: _target.texture,
				scale: _target.scale,
				angle: _target.angle,
				anchor: _target.anchor,
				alpha: 0.5,
			});
			this.addChildAt(clone, 0);
			clone.x = this.hand!.x;
			clone.y = this.hand!.y;

			const tutParentScale = this.getParentsScale(this.parent);
			const localScale = this.getLocalScale(clone, target);

			clone.scale.set(localScale.x / tutParentScale.x / this.scale.x, localScale.y / tutParentScale.y / this.scale.y);
		} else {
			clone = target.clone();
			target.parent.add(clone);
			clone.position.copy(target.position);
			clone.scale.copy(target.scale);
			clone.quaternion.copy(target.quaternion);
		}

		this.dragObjectsClone = clone;
	}

	// eslint-disable-next-line class-methods-use-this
	private getLocalScale(objA: any, objB: any) {
		const worldMatrix1 = objA.worldTransform;
		const worldMatrix2 = objB.worldTransform;

		const worldScale1X = worldMatrix1.a;
		const worldScale1Y = worldMatrix1.d;

		const worldScale2X = worldMatrix2.a;
		const worldScale2Y = worldMatrix2.d;

		const localScaleX = worldScale2X / worldScale1X;
		const localScaleY = worldScale2Y / worldScale1Y;

		return { x: localScaleX, y: localScaleY };
	}

	private clearTweensAndDelayedCalls() {
		this.delayedCalls.forEach((dc) => {
			if (dc) {
				dc.kill();
				// eslint-disable-next-line no-param-reassign
				dc = null;
			}
		});

		this.updateTickers.forEach((ut: any) => {
			this.pixiApp.ticker.remove(ut);
		});
		this.updateTickers = [];

		gsap.killTweensOf(this);
		gsap.killTweensOf(this.hand);

		gsap.to(this, {
			pixi: { alpha: 0 },
			duration: 0.4,
			ease: "sine.inOut",
			onComplete: () => {
				this.visible = false;

				this.setToOriginalValues();
			},
		});
	}

	setToOriginalValues() {
		if (this.hand) {
			this.hand.scale.set(this.handOrigScale.x, this.handOrigScale.y);
			this.hand.angle = this.handOrigAngle;
			this.hand.alpha = this.handOrigAlpha;
		}
	}

	getTargetsGlobalPosition(target: any): PIXI.Point {
		let localPosition = new PIXI.Point(0, 0);

		if (target instanceof PIXI.Container) {
			const globalPosition = target.getGlobalPosition();
			localPosition = this.parent.toLocal(globalPosition);
		} else {
			const object3DPosition = this.getObject3DPosition(target.position);
			localPosition = this.parent.toLocal(object3DPosition);
		}

		return localPosition;
	}

	setCamera(camera: any) {
		this.camera = camera;
	}

	setPixiScene(scene: any) {
		this.pixiScene = scene;
	}

	private getObject3DPosition(position: any) {
		// get the position of the center of the cube
		const tempV = position.clone();
		this.camera.updateMatrixWorld();
		tempV.project(this.camera);
		// convert the normalized position to CSS coordinates
		const x = (tempV.x * 0.5 + 0.5) * this.pixiScene.baseWidth;
		const y = (tempV.y * -0.5 + 0.5) * this.pixiScene.baseHeight;
		return new PIXI.Point(x, y);
	}

	updateTutorialComponent(component: TutorialGC) {
		if (isStudio()) this.debugRect.visible = component.debug;
		this.baseWidth = component.width;
		this.baseHeight = component.height;

		if (component.tutorials) {
			Object.values(component.tutorials).forEach((value) => {
				const { name, showEvents, hideEvents } = value;

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
			});
		}

		this.updateDebug();
	}

	getTutorialComponent(): TutorialGC {
		return {
			type: "tutorial",
			tutorials: this.tutorials,
			width: this.baseWidth,
			height: this.baseHeight,
			debug: this.debugRect.visible,
			hand: this.hand ? this.hand.id : "",
		};
	}

	updateComponents(components: { [key: string]: any }) {
		const tutorial = components.tutorial as TutorialGC;
		const transform = this.components.get("transform");

		if (tutorial) {
			this.updateTutorialComponent(tutorial);
			this.tutorials = tutorial.tutorials;
		}

		if (tutorial && tutorial.hand) {
			this.hand = ObjectHelper2D.getNodeById(tutorial.hand) as Sprite;

			if (this.hand) {
				this.handOrigScale.set(this.hand.scale.x, this.hand.scale.y);
				this.handOrigAngle = this.hand.angle;
				this.handOrigAlpha = this.hand.alpha;
			}
		}

		this.setOrigin(transform.origin.x, transform.origin.y);

		super.updateComponents(components);
	}

	get state() {
		return this.currentState;
	}

	setTutorial(state: any, params?: any) {
		if (!state) return;
		if (state === this.currentState) return;

		const oldState = this.currentState;
		if (oldState && oldState.onExit) {
			oldState.onExit.call(this);
		}
		this.currentState = state;
		const newState = this.currentState;
		if (newState.onEnter) {
			newState.onEnter.call(this, params);
		}
	}

	update(delta: number) {
		if (!this.enabled || !this.currentState) return;

		const state = this.currentState;
		if (state.onUpdate) {
			state.onUpdate.call(this, delta);
		}
	}

	onResizeCallback = (w: number, h: number) => {
		if (!this.skipFirstResizeFlag) {
			this.skipFirstResizeFlag = true;
			return;
		}

		if (this.currentState && this.currentState.onResize) {
			this.currentState.onResize(w, h);
		}

		if (this.hand) {
			this.hand.x = this.baseWidth * 0.5;
			this.hand.y = this.baseHeight * 0.5;
		}
	};
}

export default Tutorial;
