import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { StudioObject3D } from "./types";
import ObjectTypes from "../../common/objectTypes";
import Cache3D from "../utils/Cache3D";
import { AnimationState, ModelGC, ModelTreeGC } from "../../common/components";
// import { sceneStore } from "../../../editor/stores/Scene";
import Animation3DPlayer from "./components/animation3dPlayer";
import EventEmitter from "../../common/EventEmitter";
import { isStudio, isTemplate } from "../../common/editorGlobals";
import AnimationManager from "../utils/AnimationManager3D";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

class Model extends THREE.Object3D implements StudioObject3D {
	sID: string = "";
	type: string = ObjectTypes.MODEL;
	selected: boolean = false;
	locked: boolean = false;
	isGameObject: boolean = true;
	modelUUID: string = "";
	stuffsID: string | null = null;
	model: THREE.Object3D | null = null;
	internalAnimationPlayer: Animation3DPlayer | undefined;
	morphObjects: { [name: string]: THREE.Mesh } = {};
	eventEmitter: EventEmitter = EventEmitter.getInstance();
	activeModel: "model" | "stuffs" | "empty" = "empty";
	componentRef: ModelGC | null = null;
	modelPath?: string;
	animationManager?: AnimationManager;

	constructor(modelUUID: string | null) {
		super();
		// if (isTemplate()) {
		// 	this.setModel(modelUUID);
		// }
		if (modelUUID) {
			this.setModel(modelUUID);
		}
		this.initComponentSystem();
	}

	handleModelLoad(gltf: GLTF) {
		if (!this.sID && isStudio()) {
			setTimeout(() => {
				this.handleModelLoad(gltf);
			}, 50);
			return;
		}

		if (this.model) {
			this.remove(this.model);
		}
		const { scene, animations } = gltf;
		this.model = SkeletonUtils.clone(scene);
		this.add(this.model);

		animations.forEach((anim) => {
			const sanitizedName = anim.name.replace(/[|]/g, "_").replace(/\./g, "_");
			// anim.name = anim.name.replace(/[^0-9a-zA-Z]/g, "_");
			anim.name = sanitizedName;
		});

		if (isStudio()) {
			const animNames: { [name: string]: { state: AnimationState; loop: "none" } } = {};
			animations.forEach((anim) => {
				animNames[anim.name] = {
					state: "stop",
					loop: "none",
				};
			});

			// @ts-ignore
			this.internalAnimationPlayer = new Animation3DPlayer(this.model, animations, (animName: string) => {
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

			const morphDatas: { name: string; targets: number[] }[] | undefined = [];
			this.model.traverse((obj) => {
				if (obj.type === "Mesh") {
					const mesh = obj as THREE.Mesh;
					if (mesh.morphTargetInfluences && mesh.morphTargetInfluences?.length > 0) {
						morphDatas.push({
							name: mesh.name,
							targets: [...mesh.morphTargetInfluences],
						});
						this.morphObjects[mesh.name] = mesh;
					}
				}
			});

			this.eventEmitter.emit("modelAnimUpdate", {
				id: this.sID,
				animations: animNames,
				morphs: morphDatas,
			});

			if (this.activeModel === "model" && isStudio()) {
				this.modelPath = Cache3D.getModelPathFromUUID(this.modelUUID);
				setTimeout(() => {
					if (this.modelPath === this.componentRef?.modelPath) return;
					this.eventEmitter.emit("modifyComponent3D", this.sID, "model", {
						...this.componentRef,
						modelPath: this.modelPath,
					});
				}, 1);
			}

			this.eventEmitter.emit("initCoreComponents3D", this.sID, "model", {
				...this.componentRef,
				modelPath: this.modelPath,
			});
		}

		if (isTemplate()) {
			this.animationManager = new AnimationManager(this.model, animations);
		}
	}

	setModel(modelUUID: string) {
		if (this.modelUUID === modelUUID && this.activeModel === "model") return;
		this.modelUUID = modelUUID;
		this.activeModel = "model";

		const gltf = Cache3D.getModel(modelUUID, (gltfModel: GLTF | null) => {
			if (this.activeModel !== "model") return;
			if (!gltfModel) {
				if (isStudio()) {
					Cache3D.getModelUUIDFromPath(this.modelPath!)
						.then((uuid: string | undefined) => {
							if (uuid) {
								this.setModel(uuid);
								this.eventEmitter.emit("modifyComponent3D", this.sID, "model", {
									...this.componentRef,
									modelUUID: uuid,
								});
							}
							return uuid;
						})
						.catch((e: any) => {
							return e;
						});
				}
				return;
			}
			this.handleModelLoad(gltfModel);
		});

		if (gltf) {
			this.handleModelLoad(gltf);
		}
	}

	setModelFromStuffs(stuffsId: string | null, stuffsDataId: string) {
		if (!stuffsId) return;
		// if (this.stuffsID === stuffsId && this.activeModel === "stuffs") return;
		this.activeModel = "stuffs";

		let id = stuffsId;

		if (isTemplate()) {
			const stuffsIndex = window.app.data[stuffsDataId] || 0;
			id = stuffsId + "_" + stuffsIndex;
		}

		const gltf = Cache3D.getModelFromStuffs(id, (gltfModel: GLTF | null) => {
			if (this.activeModel !== "stuffs") return;
			if (gltfModel) {
				this.handleModelLoad(gltfModel);
			} else if (this.model) {
				this.remove(this.model);
				this.model = null;
			}
		});

		if (gltf) {
			this.handleModelLoad(gltf);
		}
	}

	updateModelComponent(component: ModelGC) {
		this.componentRef = component;
		if (component.modelPath) {
			this.modelPath = component.modelPath;
		}
		const { animations, morphs } = component;

		if (this.internalAnimationPlayer) {
			Object.entries(animations).forEach(([animName, anim]) => {
				if (anim.state === "play") {
					this.internalAnimationPlayer!.play(animName, anim.loop);
				} else if (anim.state === "stop") {
					this.internalAnimationPlayer!.stop(animName);
				}
			});
		}

		if (morphs && morphs.length > 0) {
			morphs.forEach((morph) => {
				const mesh = this.morphObjects[morph.name] as THREE.Mesh;
				if (mesh && mesh.morphTargetInfluences) {
					mesh.morphTargetInfluences = morph.targets;
				}
			});
		}

		if (component.stuffs) {
			this.setModelFromStuffs(component.stuffs, component.stuffsDataId);
		} else {
			this.setModel(component.modelUUID);
		}
	}

	getModelComponent(): ModelGC {
		return this.componentRef!;
	}

	updateTreeComponent(component: ModelTreeGC) {
		if (!this.model) {
			setTimeout(() => {
				this.updateTreeComponent(component);
			}, 250);
			return;
		}
		if (component.modelData) {
			Object.keys(component.modelData).forEach((name) => {
				const dt = component.modelData[name];
				const obj = this.model!.getObjectByName(name);
				if (obj) {
					obj.visible = dt.visible;
					obj.castShadow = dt.castShadow;
					obj.receiveShadow = dt.receiveShadow;
				}
			});
		}
	}

	updateComponents(components: { [key: string]: any }) {
		const modelComp = components.model as ModelGC;
		const treeComp = components.modelTree as ModelTreeGC;
		if (modelComp) {
			this.updateModelComponent(modelComp);
		}

		if (treeComp) {
			this.updateTreeComponent(treeComp);
		}

		super.updateComponents(components);
	}

	update(delta: number): void {
		if (this.internalAnimationPlayer) {
			this.internalAnimationPlayer.update(delta);
		}

		this.animationManager?.update(delta);
	}
}

export default Model;
