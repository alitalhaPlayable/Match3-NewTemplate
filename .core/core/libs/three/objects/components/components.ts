import * as THREE from "three";
import Transform from "./transform";
import Scriptable from "../../../common/script/Scriptable";
import { ComponentManager } from "./../../../common/components";
import ScriptBase from "../../../common/script/ScriptBase";
import AnimationManager3D from "../../utils/AnimationManager3D";
import Physics3D from "./physics3d";

class Components3D implements ComponentManager {
	_node!: THREE.Object3D;
	transform: Transform;
	scripts?: Scriptable;
	physics3D?: Physics3D;
	get animationManager(): AnimationManager3D {
		return this.node.animationManager;
	}

	get node() {
		return this._node;
	}

	constructor(node: THREE.Object3D) {
		this._node = node;
		this.transform = new Transform(node);
	}

	updateComponents(components: any) {
		this.transform.update(components.node3D);
		if (this.physics3D) {
			this.physics3D.update(components.physics3D);
		}
	}

	update(delta: number) {
		if (this.scripts) {
			this.scripts.update(delta);
		}
		if (this.node.animationManager) {
			this.node.animationManager.update(delta);
		}
		if (this.physics3D) {
			this.physics3D.step();
		}
	}

	resize(w: number, h: number): void {
		if (this.scripts) {
			this.scripts.resize(w, h);
		}
	}

	add(componentName: string) {
		switch (componentName) {
			case "scripts":
				if (!this.scripts) {
					this.scripts = new Scriptable(this.node);
				}
				return this.scripts;

			case "animationManager":
				if (!this.node.animationManager) {
					this.node.animationManager = new AnimationManager3D(this.node, this.node.animations);
				}
				return this.node.animationManager;
			case "physics3D":
				this.physics3D = new Physics3D(this.node);
				return this.physics3D;
			default:
				break;
		}
	}

	get(componentName: string) {
		switch (componentName) {
			case "transform":
				return this.transform.get();
			case "scripts":
				return this.scripts;
			case "animationManager":
				return this.node.animationManager;
			case "physics3D":
				return this.physics3D?.get();
			default:
				return null;
		}
	}

	remove(componentName: string): void {
		switch (componentName) {
			case "scripts":
				this.scripts?.scripts.forEach((script: ScriptBase) => {
					this.scripts?.remove(script);
				});
				this.scripts = undefined;
				break;
			case "physics3D":
				this.physics3D?.remove();
				this.physics3D = undefined;
				break;
			default:
				break;
		}
	}

	removeAll() {
		this.remove("scripts");
		this.remove("physics3D");
	}

	getAll() {
		return {
			transform: this.transform,
			scripts: this.scripts,
			animationManager: this.node.animationManager,
			physics3D: this.physics3D,
		};
	}
}

export default Components3D;
