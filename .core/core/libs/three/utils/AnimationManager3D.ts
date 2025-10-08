import { AnimationMixer, AnimationClip, AnimationAction, Object3D, LoopOnce, LoopRepeat, LoopPingPong } from "three";

type LoopType = typeof LoopOnce | typeof LoopRepeat | typeof LoopPingPong;

interface AnimationClipExtended extends AnimationClip {
	defaultDuration?: number;
	startTime?: number;
}

interface AnimationActionExtended extends AnimationAction {
	animClip: AnimationClipExtended;
	oncompleteCallback?: () => void;
	onComplete: (func: () => void) => void;
}

interface StartAnimationOptions {
	force?: boolean;
	loopType?: LoopType;
	speed?: number;
	startPerc?: number;
}

interface FadeToActionOptions {
	fadeDuration?: number;
	loopType?: LoopType;
	speed?: number;
	forced?: boolean;
	startPerc?: number;
}

interface AddAnimationOptions {
	name: string;
	startTime?: number;
	duration?: number;
}

interface PlayAnimOptions {
	loopType?: typeof LoopOnce | typeof LoopRepeat;
	fadeDuration?: number;
	speed?: number;
	force?: boolean;
	noFade?: boolean;
	startPerc?: number;
}

class AnimManager {
	public mixer: AnimationMixer;
	public curAnim: AnimationActionExtended | null = null;
	public animActions: Record<string, AnimationActionExtended> = {};

	private model: Object3D;
	private animClips: Record<string, AnimationClipExtended> = {};
	private prevAnim: AnimationActionExtended | null = null;

	private events: Record<string, { fired: boolean; perc: number; event: (animManager: AnimManager) => void; anim: AnimationActionExtended }[]> = {};

	constructor(model: Object3D, animations: AnimationClip[], addAll: boolean = true) {
		this.mixer = new AnimationMixer(model);
		this.model = model;

		// Process animations and store clips
		animations.forEach((anim) => {
			const extendedAnim = anim as AnimationClipExtended;
			this.animClips[anim.name] = extendedAnim;
			extendedAnim.defaultDuration = anim.duration;
		});

		// Initialize event listener
		this.initEventListener();

		// Add all animations if requested
		if (addAll) {
			this.addAllAnims();
		}

		this.events = {};
	}

	/**
	 * Play an animation with various options
	 * @param animName - Animation name (can be mapped name or original name)
	 * @param options - Animation playback options
	 * @returns The animation action or undefined if animation not found
	 */
	public playAnim(animName: string, { loopType = LoopRepeat, fadeDuration = 0.2, speed = 1, force = false, noFade = false, startPerc = 0 }: PlayAnimOptions = {}): AnimationAction | undefined {
		// Check if animation exists
		const animationExists = this.animClips[animName];

		if (!animationExists) {
			console.warn("Animation not found:", animName);
			return;
		}

		if (!this.curAnim) {
			noFade = true;
		}

		const anim = noFade
			? this.startAnimation(animName, {
					loopType,
					force,
					speed,
					startPerc,
			  })
			: this.fadeToAction(animName, {
					fadeDuration,
					loopType,
					speed,
					forced: force,
					startPerc,
			  });

		return anim;
	}

	private addAllAnims(): void {
		Object.entries(this.animClips).forEach(([animName, anim]) => {
			const animAction = this.mixer.clipAction(anim, this.model) as AnimationActionExtended;
			this.animActions[animName] = animAction;
			animAction.animClip = anim;
			animAction.onComplete = (func: () => void) => {
				animAction.oncompleteCallback = func;
			};
		});
	}

	/**
	 * Add a single animation with optional timing parameters
	 * @param options - Animation options
	 */
	private addAnimation({ name, startTime, duration }: AddAnimationOptions): void {
		const anim = this.animClips[name];
		if (!anim) {
			console.warn(`Animation "${name}" not found in clips`);
			return;
		}

		const animAction = this.mixer.clipAction(anim, this.model) as AnimationActionExtended;
		this.animActions[name] = animAction;

		if (startTime !== undefined) {
			anim.startTime = startTime;
		}
		if (duration !== undefined) {
			anim.duration = duration;
		}

		animAction.animClip = anim;
	}

	public stopAllAnimations(): void {
		this.mixer.stopAllAction();
	}

	private initEventListener(): void {
		this.mixer.addEventListener("finished", (e: any) => {
			if (e.action.oncompleteCallback) {
				e.action.oncompleteCallback();
			}
		});
	}

	/**
	 * Start an animation with various options
	 * @param name - Animation name
	 * @param options - Animation options
	 * @returns The animation action
	 */
	public startAnimation(name: string, { force = false, loopType = LoopRepeat, speed = 1, startPerc = 0 }: StartAnimationOptions = {}): AnimationActionExtended | undefined {
		const animAction = this.animActions[name];
		if (!animAction) {
			console.warn(`Animation "${name}" not found in actions`);
			return;
		}

		// Check if already playing the same animation
		if (!force && this.curAnim?.animClip.name === name) {
			return;
		}

		animAction.reset();

		if (loopType) {
			animAction.loop = loopType;
		}

		animAction.play();
		this.curAnim = animAction;
		this.curAnim.timeScale = speed;
		this.skipToAnimPerc(startPerc);

		return animAction;
	}

	/**
	 * Start another animation (experimental, may not working)
	 * @param name - Animation name
	 * @param noRepeat - Disable repeat
	 */
	public startAnotherAnim(name: string): void {
		if (this.curAnim?.animClip.name === name) {
			return;
		}

		const animAction = this.animActions[name];
		if (!animAction) {
			console.warn(`Animation "${name}" not found in actions`);
			return;
		}

		animAction.setEffectiveTimeScale(1);
		animAction.play();
		this.curAnim = animAction;
	}

	public checkCurAnimName(name: string): boolean {
		return this.curAnim?.animClip.name === name;
	}

	/**
	 * Fade to a new animation
	 * @param name - Animation name
	 * @param options - Fade options
	 * @returns The animation action
	 */
	public fadeToAction(name: string, { fadeDuration = 0.3, loopType = LoopRepeat, speed = 1, forced = false, startPerc = 0 }: FadeToActionOptions = {}): AnimationActionExtended | undefined {
		const newAction = this.animActions[name];
		if (!newAction) {
			console.warn(`Animation "${name}" not found in actions`);
			return;
		}

		this.prevAnim = this.curAnim;
		this.curAnim = newAction;

		if (this.prevAnim === this.curAnim && !forced) {
			return;
		}

		if (this.prevAnim) {
			this.prevAnim.fadeOut(fadeDuration);
		}

		this.curAnim.clampWhenFinished = true;
		this.curAnim.loop = loopType;

		this.curAnim.reset().setEffectiveTimeScale(speed).setEffectiveWeight(1).fadeIn(fadeDuration).play();
		this.skipToAnimPerc(startPerc);

		return this.curAnim;
	}

	/**
	 * Skip to a percentage of the current animation
	 * @param percentage - Percentage (0-1)
	 */
	public skipToAnimPerc(percentage: number): void {
		if (!this.curAnim) {
			console.warn("No current animation to skip");
			return;
		}
		this.curAnim.time = this.curAnim.getClip().duration * percentage;
	}

	public update(delta: number): void {
		this.mixer.update(delta);
		this.updateAnimEventSystem(delta);
	}

	////////event system
	/**
	 * Add an event callback that triggers at a specific percentage during an animation
	 *
	 * Events are automatically managed by the animation system - they fire once when the animation
	 * reaches the specified percentage and reset when the animation restarts or rewinds past that point.
	 *
	 * @param animName - The name of the animation to attach the event to
	 * @param perc - The percentage (0-1) of the animation at which to trigger the event
	 * @param event - Callback function that receives the AnimManager instance when triggered
	 *
	 * @example
	 * ```typescript
	 * // Trigger an event at 50% through the "walk" animation
	 * animManager.addEvent("walk", 0.5, (manager) => {
	 *   console.log("Walk animation is halfway complete");
	 *   // Access current animation state
	 *   console.log("Current progress:", manager.getCurPercentage());
	 * });
	 *
	 * // Multiple events for the same animation
	 * animManager.addEvent("jump", 0.3, () => console.log("Jump start"));
	 * animManager.addEvent("jump", 0.8, () => console.log("Jump peak"));
	 * ```
	 */
	public addEvent(animName: string, perc: number, event: (animManager: AnimManager) => void): void {
		if (!this.events[animName]) {
			this.events[animName] = [];
		}

		this.events[animName].push({ fired: false, perc, event, anim: this.animActions[animName] });
	}

	public resetEvents(anim: string): void {
		this.events[anim] = [];
	}

	public getCurAnimCurEvent() {
		let perc = this.getCurPercentage();
		let anim = this.curAnim?.getClip().name ?? "";
		return this.getCurAnimEvent(anim, perc);
	}

	public getCurAnimEvent(curAnim: string, perc: number) {
		let eventObj = null;
		if (this.events[curAnim] && this.events[curAnim].length > 0) {
			for (let i = 0; i < this.events[curAnim].length; i++) {
				if (perc >= this.events[curAnim][i].perc && !this.events[curAnim][i].fired) {
					eventObj = this.events[curAnim][i];
					return eventObj;
				}
			}
		}

		return eventObj;
	}

	private updateAnimEventSystem(delta: number): void {
		if (!this.curAnim) return;

		for (let key in this.events) {
			let event = this.events[key];

			for (let i = 0; i < event.length; i++) {
				let data = event[i];
				let anim = data.anim;
				let perc = this.getAnimPercentage(anim);

				if (perc >= data.perc && !data.fired) {
					data.fired = true;
					data.event(this);
				}

				if (perc < data.perc) {
					data.fired = false;
				}
			}
		}
	}

	/**
	 * Remove bones from animation clip
	 * @param animClip - Animation clip
	 * @param boneNames - Bone names to remove/keep
	 * @param exclude - If true, keep only specified bones
	 * @returns Remaining tracks
	 */
	public removeBonesFromAnim = (animClip: AnimationClip, boneNames: string[], exclude: boolean = false): any[] => {
		for (let i = animClip.tracks.length - 1; i >= 0; i--) {
			const track = animClip.tracks[i];
			let hasMatchingBone = false;

			// Check if track matches any bone name
			for (const boneName of boneNames) {
				if (track.name.includes(boneName)) {
					hasMatchingBone = true;
					break;
				}
			}

			// Remove track based on exclude flag
			if (exclude) {
				// Keep only specified bones - remove if not matching
				if (!hasMatchingBone) {
					animClip.tracks.splice(i, 1);
				}
			} else {
				// Remove specified bones - remove if matching
				if (hasMatchingBone) {
					animClip.tracks.splice(i, 1);
				}
			}
		}

		return animClip.tracks;
	};

	/**
	 * Get current animation percentage
	 * @returns Percentage (0-1)
	 */
	public getCurPercentage = (): number => {
		if (!this.curAnim) return 0;
		return this.curAnim.time / this.curAnim.getClip().duration;
	};

	/**
	 * Get animation percentage for specific animation
	 * @param anim - Animation action
	 * @returns Percentage (0-1)
	 */
	public getAnimPercentage = (anim: AnimationAction): number => {
		return anim.time / anim.getClip().duration;
	};

	// Getters for accessing internal state
	public getAnimActions = (): Record<string, AnimationActionExtended> => this.animActions;
	public getCurAnim = (): AnimationActionExtended | null => this.curAnim;
	public getPrevAnim = (): AnimationActionExtended | null => this.prevAnim;
}

export default AnimManager;
export type { AnimationActionExtended, AnimationClipExtended, StartAnimationOptions, FadeToActionOptions, AddAnimationOptions, LoopType };
