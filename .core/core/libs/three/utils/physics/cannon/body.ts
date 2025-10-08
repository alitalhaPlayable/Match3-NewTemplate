import * as THREE from "three";
import * as CANNON from "cannon-es";
import Physics3DManager from "../Physics3DManager";
import { PhysicsBodyOptions } from "../rapier/utils";
import Cannon3DUtils from "./utils";
import { Physics3DGC } from "../../../../common/components";

export default class Cannon3DBody {
	coreBody: CANNON.Body | null = null;
	shapes: CANNON.Shape[] = [];
	label: string;
	bodyOptions: any;
	node: THREE.Object3D;

	constructor(bodyOptions: any) {
		this.bodyOptions = bodyOptions;
		this.label = bodyOptions.physicsLabel as string;
		this.node = bodyOptions.node;

		// Initialize body synchronously
		this.coreBody = this.createCannonBody(bodyOptions);
	}

	get position() {
		return this.coreBody?.position;
	}

	get quaternion() {
		return this.coreBody?.quaternion;
	}

	setTransform(position: THREE.Vector3, rotation: THREE.Quaternion) {
		if (this.coreBody) {
			this.coreBody.position.set(position.x, position.y, position.z);
			this.coreBody.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
		}
	}

	updateTransformFromNode() {
		if (this.coreBody) {
			this.coreBody.position.set(this.node.position.x, this.node.position.y, this.node.position.z);
			this.coreBody.quaternion.setFromEuler(this.node.rotation.x, this.node.rotation.y, this.node.rotation.z);
		}
	}

	private createCannonBody(options: any): CANNON.Body | null {
		// Get the Cannon world from the manager
		if (!Physics3DManager.isReady()) {
			console.warn("Physics world not ready yet");
			return null;
		}

		const world = Physics3DManager.getWorld() as CANNON.World;
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

		// Create Cannon body using utils
		const body = Cannon3DUtils.createCannonBodyFromOptions(world, bodyOptions);
		return body;
	}

	updateBody(node: THREE.Object3D, component: Physics3DGC) {
		// Update bodyOptions with new component data
		this.bodyOptions = { ...this.bodyOptions, ...component };

		// Always recreate the body to ensure debug renderer updates properly
		// This is more reliable than trying to update in place
		if (this.coreBody) {
			console.log("Cannon3DBody: Recreating body for update");
			// Remove old body
			this.remove(false);

			// Create new body with updated data
			this.coreBody = this.createCannonBody({
				node: node,
				...component,
			});
		}
	}

	remove(dispose: boolean = false) {
		if (this.coreBody) {
			// Use the unified removeBody method from Physics3DManager
			Physics3DManager.removeBody(this.coreBody);

			if (dispose) {
				// Dispose shapes
				this.shapes.forEach((shape) => {
					// Cannon shapes don't need explicit disposal
				});
				this.shapes = [];
			}

			this.coreBody = null;
		}
	}
}
