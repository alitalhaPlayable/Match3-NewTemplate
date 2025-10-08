import * as THREE from "three";
import { Physics3DGC } from "../../../common/components";
import { isStudio } from "../../../common/editorGlobals";
import Physics3DManager from "../../utils/physics/Physics3DManager";

// #if process.projConfig.physics3DSettings.physicsType === "cannon"
import Cannon3DBody from "../../utils/physics/cannon/body";
// #endif
// #if process.projConfig.physics3DSettings.physicsType === "rapier3d"
import Rapier3DBody from "../../utils/physics/rapier/body";
// #endif

class Physics3D {
	node: THREE.Object3D;
	componentData?: Physics3DGC;
	defaults: Physics3DGC | null = null;

	constructor(node: THREE.Object3D) {
		this.node = node;
		// Don't create physics body immediately - wait for actual component data
	}

	update(component: Physics3DGC) {
		if (!component) return;

		this.componentData = component;

		if (!this.defaults || isStudio()) {
			this.defaults = this.get().data || null;
		}

		// Create physics body if it doesn't exist, otherwise update it
		if (!this.node.body) {
			// Create new physics body with component data based on current physics engine
			const physicsType = Physics3DManager.getCurrentPhysicsType();

			if (physicsType === "cannon") {
				// #if process.projConfig.physics3DSettings.physicsType === "cannon"
				this.node.body = new Cannon3DBody({
					node: this.node,
					...component,
				});
				// #endif
			} else if (physicsType === "rapier3d") {
				// #if process.projConfig.physics3DSettings.physicsType === "rapier3d"
				this.node.body = new Rapier3DBody({
					node: this.node,
					...component,
				});
				// #endif
			} else {
				console.warn("Physics3D: No physics engine found");
			}
		} else {
			// Update existing body
			this.node.body.updateBody(this.node, component);
		}
	}

	remove() {
		if (this.node.body) {
			this.node.body.remove(true);
			this.node.body = null;
		}
		this.componentData = undefined;
		this.defaults = null;
	}

	get() {
		return {
			type: "physics3D",
			data: this.componentData,
		};
	}

	step() {
		if (this.node?.body) {
			this.node.position.copy(this.node.body.position);
			this.node.quaternion.copy(this.node.body.quaternion);
		}
	}
}

export default Physics3D;
