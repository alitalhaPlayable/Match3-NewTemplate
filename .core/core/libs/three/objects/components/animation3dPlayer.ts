import { AnimationClip, AnimationMixer, LoopOnce, LoopPingPong, LoopRepeat, Object3D } from "three";

class Animation3DPlayer {
	node: Object3D;
	mixer: AnimationMixer;
	clips: AnimationClip[] = [];

	constructor(node: Object3D, clips: AnimationClip[], animEndCallback?: (animName: string) => void) {
		this.node = node;
		this.mixer = new AnimationMixer(this.node);
		this.clips = clips;

		this.mixer.addEventListener("finished", (e) => {
			const animName = e.action.getClip().name;
			e.action.stop();
			animEndCallback?.(animName);
		});
	}

	play(animName: string, loopType: string = "none") {
		const clip = AnimationClip.findByName(this.clips, animName);
		const action = this.mixer.clipAction(clip);
		// action.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 0);
		if (loopType === "loop") {
			action.setLoop(LoopRepeat, Infinity);
		} else if (loopType === "pingpong") {
			action.setLoop(LoopPingPong, Infinity);
		} else {
			action.setLoop(LoopOnce, 0);
		}
		action.play();
	}

	stop(animName: string) {
		const clip = AnimationClip.findByName(this.clips, animName);
		const action = this.mixer.clipAction(clip);
		if (action && action.isRunning()) {
			action.stop();
		}
	}

	stopAll() {
		this.mixer.stopAllAction();
	}

	playAll() {
		this.clips.forEach((clip) => {
			this.mixer.clipAction(clip).play();
		});
	}

	update(delta: number) {
		this.mixer.update(delta);
	}
}

export default Animation3DPlayer;
