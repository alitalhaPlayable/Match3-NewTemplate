import { Vector3, LoopOnce, LoopRepeat, AnimationMixer, LoopPingPong, AnimationAction } from "three";

/*
export default class AnimManager{
  constructor(mesh, animClips) {
    this.mixer = new AnimationMixer(mesh);
    this.anims = animClips;
  }

  play(name, repeat=true){
    if(name === this.mixer)
  }

  update(delta){
    this.mixer.update(delta);
  }
  
};
*/

///some utility functions
function AnimManager(model, animations, addAll = true) {
	let mixer = new AnimationMixer();
	this.mixer = mixer;

	let animClips = {};

	let animActions = {};
	this.animActions = animActions;

	/**@type{AnimationAction} */
	this.curAnim;

	let prevAnim;

	for (let anim of animations) {
		let name = anim.name;
		animClips[name] = anim;
		anim.defaultDuration = anim.duration;
	}

	this.addAllAnims = function () {
		for (let animName in animClips) {
			let anim = animClips[animName];
			let animAction = mixer.clipAction(anim, model);
			animActions[animName] = animAction;
			animActions[animName].animClip = anim;
			animActions[animName].onComplete = function (func) {
				this.oncompleteCallback = func;
			};
		}
	};

	if (addAll) {
		this.addAllAnims();
	}

	/**
	 * startTime 0'dan farklı olmalı
	 */
	this.addAnimation = function ({ name, startTime, duration }) {
		let anim = animClips[name];

		let animAction = mixer.clipAction(anim, model);
		animActions[name] = animAction;
		if (startTime) {
			anim.startTime = startTime;
		}
		if (duration) anim.duration = duration;

		animActions[name].animClip = anim;
	};

	this.stopAllAnimations = function () {
		this.mixer.stopAllAction();
	};

	this.initEventListener = function () {
		this.mixer.addEventListener("finished", (e) => {
			if (e.action.oncompleteCallback) {
				e.action.oncompleteCallback();
			}
		});
	};
	this.initEventListener();

	this.startWithoutStopping = function () {};

	this.startAnimation = function (name, { noRepeat = false, force = false, loopType = LoopOnce, noStop = false, speed = 1 } = {}) {
		if (!force && this.curAnim && this.curAnim.animClip.name === name) {
			return;
		}

		animActions[name].reset();
		/* if (!noStop) {
			this.stopAllAnimations();
		}
		if (noRepeat && !noStop) {
			animActions[name].repetitions = 0;
			animActions[name].clampWhenFinished = true;
		} */

		if (loopType) {
			animActions[name].loop = loopType;
		}

		animActions[name].play();
		this.curAnim = animActions[name];
		this.curAnim.timeScale = speed;

		return animActions[name];
	};

	/**
	 * experimental, not working
	 */
	this.startAnotherAnim = function (name, noRepeat = false) {
		if (this.curAnim && this.curAnim.animClip.name === name) {
			return;
		}

		animActions[name].setEffectiveTimeScale(1);
		animActions[name].play();
		this.curAnim = animActions[name];
	};

	this.checkCurAnimName = function (name) {
		return this.curAnim.animClip.name === name;
	};

	this.fadeToAction = function (name, { duration = 0.3, loopType = LoopOnce, speed = 1, forced = false }) {
		prevAnim = this.curAnim;
		this.curAnim = animActions[name];
		if (prevAnim === this.curAnim && !forced) {
			return;
		}

		if (prevAnim) {
			prevAnim.fadeOut(duration);
		}
		this.curAnim.clampWhenFinished = true;
		this.curAnim.loop = loopType;

		this.curAnim.reset().setEffectiveTimeScale(speed).setEffectiveWeight(1).fadeIn(duration).play();

		return this.curAnim;
	};

	this.skipToAnimPerc = function (percentage) {
		this.curAnim.time = this.curAnim.getClip().duration * percentage;
	};

	this.update = function (delta) {
		mixer.update(delta);
	};

	this.removeBonesFromAnim = (animClip, boneNames, exclude = false) => {
		for (let i = animClip.tracks.length - 1; i >= 0; i--) {
			let trak = animClip.tracks[i];
			let gotOne = false;
			for (let boneName of boneNames) {
				if (exclude) {
					if (trak.name.indexOf(boneName) > -1) {
						gotOne = true;
						break;
					}
				} else {
					if (trak.name.indexOf(boneName) > -1) {
						animClip.tracks.splice(i, 1);
						break;
					}
				}
			}

			if (exclude && !gotOne) {
				animClip.tracks.splice(i, 1);
			}
		}

		return animClip.tracks;
	};

	this.getCurPerctange = () => {
		if (!this.curAnim) return 0;

		return this.curAnim.time / this.curAnim.getClip().duration;
	};

	this.getAnimPerctange = (anim) => {
		return anim.time / anim.getClip().duration;
	};

	this.getAnimActions = () => {
		return animActions;
	};

	this.getCurAnim = () => {
		return this.curAnim;
	};
	this.getPrevAnim = () => {
		return prevAnim;
	};
}

export default AnimManager;
