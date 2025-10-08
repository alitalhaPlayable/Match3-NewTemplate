import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { StudioObject3D } from "./types";
import ObjectTypes from "../../common/objectTypes";
import Cache3D from "../utils/Cache3D";
import { AnimationState, InlineModelGC } from "../../common/components";
import gsap from "gsap";
import EventEmitter from "../../common/EventEmitter";
import { isStudio } from "../../common/editorGlobals";
import Animation3DPlayer from "./components/animation3dPlayer";
import AnimationManager from "../utils/AnimationManager3D";

class InlineModel extends THREE.Object3D implements StudioObject3D {
	sID: string = "";
	internalAnimationPlayer: Animation3DPlayer | undefined;
	modelAnimations: THREE.AnimationClip[] = [];
	modelRef: THREE.Object3D;
	eventEmitter: EventEmitter = EventEmitter.getInstance();
	morphObjects: { [name: string]: THREE.Mesh } = {};
	isInlineModel: boolean;
	componentRef: InlineModelGC | null = null;
	animationManager?: AnimationManager;
	constructor(modelRef: THREE.Object3D) {
		super();
		this.modelRef = modelRef;

		this.initializeInlineModel();
		this.initComponentSystem();
		this.isGameObject = true;
		this.isInlineModel = true;
	}

	initializeInlineModel() {
		if (!this.sID && isStudio()) {
			setTimeout(() => {
				this.initializeInlineModel();
			}, 50);
			return;
		}

		this.modelAnimations = this.modelRef.animations;
		this.modelAnimations?.forEach((anim) => {
			const sanitizedName = anim.name.replace(/[|]/g, "_").replace(/\./g, "_");
			// anim.name = anim.name.replace(/[^0-9a-zA-Z]/g, "_");
			anim.name = sanitizedName;
		});
		
		const animNames: { [name: string]: { state: AnimationState; loop: "none" } } = {};
		this.modelAnimations.forEach((anim) => {
			animNames[anim.name] = {
				state: "stop",
				loop: "none",
			};
		});

		// const morphDatas: { name: string; targets: number[] }[] | undefined = [];
		// this.modelRef.scene.traverse((obj) => {
		// 	if (obj.type === "Mesh") {
		// 		const mesh = obj as THREE.Mesh;
		// 		if (mesh.morphTargetInfluences && mesh.morphTargetInfluences?.length > 0) {
		// 			morphDatas.push({
		// 				name: mesh.name,
		// 				targets: [...mesh.morphTargetInfluences],
		// 			});
		// 			this.morphObjects[mesh.name] = mesh;
		// 		}
		// 	}
		// });

		this.eventEmitter.emit("inlineModelAnimUpdate", {
			id: this.sID,
			animations: animNames,
			// morphs: morphDatas,
		});

		if (isStudio()) {
			this.internalAnimationPlayer = new Animation3DPlayer(this, this.modelAnimations, (animName: string) => {
				this.eventEmitter.emit("modifyComponent3D", this.sID, "model", {
					...this.componentRef,
					animations: {
						...this.componentRef?.animations,
						[animName]: {
							state: "stop",
							loop: "none",
						},
					},
				});
			});
		}

		if (!isStudio()) {
			this.animationManager = new AnimationManager(this, this.modelAnimations);
		}
	}

	updateInlineModelComponent(inlineModelComp: InlineModelGC) {
		this.componentRef = inlineModelComp;
		if (this.modelAnimations.length === 0) {
			this.initializeInlineModel();
		}

		const { animations } = inlineModelComp;
		if (this.internalAnimationPlayer) {
			Object.entries(animations).forEach(([animName, anim]) => {
				if (anim.state === "play") {
					this.internalAnimationPlayer!.play(animName, anim.loop);
				} else if (anim.state === "stop") {
					this.internalAnimationPlayer!.stop(animName);
				}
			});
		}

		// if (morphs && morphs.length > 0) {
		// 	morphs.forEach((morph) => {
		// 		const mesh = this.morphObjects[morph.name] as THREE.Mesh;
		// 		if (mesh && mesh.morphTargetInfluences) {
		// 			mesh.morphTargetInfluences = morph.targets;
		// 		}
		// 	});
		// }
	}

	updateComponents(components: { [key: string]: any }) {
		const inlineModelComp = components.inlineModel as InlineModelGC;
		if (inlineModelComp) {
			this.updateInlineModelComponent(inlineModelComp);
		}
		super.updateComponents(components);
	}

	update(delta: number): void {
		this.internalAnimationPlayer?.update(delta);
		this.animationManager?.update(delta);
	}
}

export default InlineModel;
