import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import Physics3DManager from "../Physics3DManager";
import Physics3DUtils, { PhysicsBodyOptions } from "./utils";
import { Physics3DGC } from "../../../../common/components";

export default class Rapier3DBody {
	coreBody: RAPIER.RigidBody | null = null;
	colliders: RAPIER.Collider[] = [];
	label: string;
	bodyOptions: any;
	node: THREE.Object3D;

	constructor(bodyOptions: any) {
		this.bodyOptions = bodyOptions;
		this.label = bodyOptions.physicsLabel as string;
		this.node = bodyOptions.node;

		// Initialize body synchronously
		this.coreBody = this.createRapierBody(bodyOptions);
	}

	get position() {
		return this.coreBody?.translation();
	}

	get quaternion() {
		return this.coreBody?.rotation();
	}

	setTransform(position: THREE.Vector3, rotation: THREE.Quaternion) {
		if (this.coreBody) {
			this.coreBody.setTranslation(position, false);
			this.coreBody.setRotation(rotation, false);
		}
	}

	updateTransformFromNode() {
		if (this.node) {
			this.setTransform(this.node.position, new THREE.Quaternion().setFromEuler(this.node.rotation));
		}
	}

	private createRapierBody(options: any): RAPIER.RigidBody | null {
		// Get the Rapier world from the manager
		if (!Physics3DManager.isReady()) {
			console.warn("Physics world not ready yet");
			return null;
		}

		const world = Physics3DManager.getWorld();
		if (!world) {
			console.warn("Could not get physics world");
			return null;
		}

		// Convert options to PhysicsBodyOptions format
		const bodyOptions: PhysicsBodyOptions = {
			bodyType: options.bodyType,
			mass: options.mass,
			shape: options.shape,
			compounds: options.compounds,
			categoryBits: options.categoryBits,
			maskBits: options.maskBits,
			sensor: options.sensor,
			node: options.node,
			position: options.node.position
				? {
						x: options.node.position.x,
						y: options.node.position.y,
						z: options.node.position.z,
					}
				: undefined,
			rotation: options.node.rotation
				? {
						x: options.node.rotation.x,
						y: options.node.rotation.y,
						z: options.node.rotation.z,
					}
				: undefined,
		};

		// Use the utils class to create the physics body
		return Physics3DUtils.createPhysicsBody(world as RAPIER.World, bodyOptions, this.colliders);
	}

	updateBody(node: THREE.Object3D, component: Physics3DGC) {
		if (component) {
			// Remove the old body from the physics world completely
			this.remove(true);

			// Create new body with updated component data
			node.body = new Rapier3DBody({
				...this.bodyOptions,
				...component,
				node: node,
			});
		}
	}

	remove(removeFromWorld: boolean = true) {
		if (this.coreBody && removeFromWorld) {
			// Remove from physics world using unified method
			Physics3DManager.removeBody(this.coreBody);
		}

		// Clean up references
		this.coreBody = null;
		this.colliders = [];
	}
}
