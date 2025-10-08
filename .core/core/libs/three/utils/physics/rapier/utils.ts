import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { Physics3DGC } from "../../../../common/components";

export interface PhysicsBodyOptions {
	bodyType: "static" | "dynamic" | "kinematic";
	mass?: number;
	shape: any;
	compounds?: any[];
	categoryBits?: string;
	maskBits?: string[];
	sensor?: boolean;
	node?: THREE.Object3D;
	position?: { x: number; y: number; z: number };
	rotation?: { x: number; y: number; z: number };
}

export class Physics3DUtils {
	/**
	 * Creates a rigid body description based on body type and mass
	 */
	public static createRigidBodyDesc(options: PhysicsBodyOptions): RAPIER.RigidBodyDesc {
		let bodyType: RAPIER.RigidBodyType;
		switch (options.bodyType) {
			case "dynamic":
				bodyType = RAPIER.RigidBodyType.Dynamic;
				break;
			case "kinematic":
				bodyType = RAPIER.RigidBodyType.KinematicPositionBased;
				break;
			default:
				bodyType = RAPIER.RigidBodyType.Fixed;
		}

		const rigidBodyDesc = new RAPIER.RigidBodyDesc(bodyType);

		// Set mass if dynamic and mass is specified
		if (options.bodyType === "dynamic" && options.mass && options.mass > 0) {
			rigidBodyDesc.setAdditionalMass(options.mass);
		}

		return rigidBodyDesc;
	}

	/**
	 * Sets the position and rotation of a rigid body
	 */
	public static setRigidBodyTransform(rigidBody: RAPIER.RigidBody, position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }): void {
		rigidBody.setTranslation(position, false);

		// Convert Euler rotation to quaternion
		const euler = new THREE.Euler(rotation.x, rotation.y, rotation.z);
		const quaternion = new THREE.Quaternion();
		quaternion.setFromEuler(euler);
		rigidBody.setRotation({ x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w }, false);
	}

	/**
	 * Creates colliders for all shapes and attaches them to a rigid body
	 */
	public static createCollidersForBody(world: RAPIER.World, rigidBody: RAPIER.RigidBody, options: PhysicsBodyOptions, collidersArray?: RAPIER.Collider[]): RAPIER.Collider[] {
		const createdColliders: RAPIER.Collider[] = [];

		// Create colliders for all shapes (main shape + compounds)
		const allShapes = [options.shape, ...(options.compounds || [])].filter((shape) => shape);

		for (const shape of allShapes) {
			const colliderDesc = this.createColliderDescFromShape(shape);
			if (colliderDesc) {
				const collider = world.createCollider(colliderDesc, rigidBody);
				createdColliders.push(collider);

				// Add to provided array if specified
				if (collidersArray) {
					collidersArray.push(collider);
				}

				// Set collision groups if specified
				if (options.categoryBits || (options.maskBits && options.maskBits.length > 0)) {
					const categoryValue = options.categoryBits ? parseInt(options.categoryBits) : 0x00000001;
					const maskValue = options.maskBits && options.maskBits.length > 0 
						? options.maskBits.reduce((acc: number, bit: string) => acc | parseInt(bit), 0)
						: 0xFFFFFFFF;
					
					// Rapier uses a single 32-bit integer where:
					// - Lower 16 bits: collision groups (what this collider belongs to)
					// - Upper 16 bits: collision filter (what this collider can collide with)
					const collisionGroups = (maskValue << 16) | categoryValue;
					collider.setCollisionGroups(collisionGroups);
				}

				// Set sensor if specified
				if (options.sensor) {
					collider.setSensor(true);
				}

				// Set collider offset if specified
				if (shape?.offset) {
					collider.setTranslationWrtParent({
						x: shape.offset.x,
						y: shape.offset.y,
						z: shape.offset.z,
					});
				}
			} else {
				console.warn("Failed to create collider for shape:", shape);
			}
		}

		return createdColliders;
	}

	/**
	 * Creates a complete physics body with all colliders
	 */
	public static createPhysicsBody(world: RAPIER.World, options: PhysicsBodyOptions, collidersArray?: RAPIER.Collider[]): RAPIER.RigidBody | null {
		try {
			// Create rigid body description
			const rigidBodyDesc = this.createRigidBodyDesc(options);
			const rigidBody = world.createRigidBody(rigidBodyDesc);

			// Set position and rotation
			if (options.position && options.rotation) {
				this.setRigidBodyTransform(rigidBody, options.position, options.rotation);
			}

			// Create colliders
			this.createCollidersForBody(world, rigidBody, options, collidersArray);

			return rigidBody;
		} catch (error) {
			console.error("Failed to create physics body:", error);
			console.error("Options passed:", options);
			return null;
		}
	}

	/**
	 * Creates a collider description from a shape
	 */
	public static createColliderDescFromShape(shape: any): RAPIER.ColliderDesc | null {
		if (!shape || !shape.type) {
			console.warn("No shape or shape type specified:", shape);
			return null;
		}

		switch (shape.type) {
			case "box":
				return RAPIER.ColliderDesc.cuboid((shape.width || 1) / 2, (shape.height || 1) / 2, (shape.depth || 1) / 2);
			case "sphere":
				return RAPIER.ColliderDesc.ball(shape.radius || 0.5);
			case "cylinder":
				return RAPIER.ColliderDesc.cylinder((shape.height || 1) / 2, shape.radius || 0.5);
			case "capsule":
				return RAPIER.ColliderDesc.capsule((shape.height || 1) / 2, shape.radius || 0.25);
			case "cone":
				return RAPIER.ColliderDesc.cone((shape.height || 1) / 2, shape.radius || 0.5);
			case "plane":
				return RAPIER.ColliderDesc.cuboid(
					(shape.width || 1) / 2,
					0.01, // Very thin for plane
					(shape.height || 1) / 2
				);
			default:
				console.warn("Unknown shape type:", shape.type);
				return null;
		}
	}

	/**
	 * Converts Physics3DGC to PhysicsBodyOptions
	 */
	public static physics3DGCToOptions(component: Physics3DGC, node?: THREE.Object3D): PhysicsBodyOptions {
		return {
			bodyType: component.bodyType,
			mass: component.mass,
			shape: component.shape,
			compounds: component.compounds,
			categoryBits: component.categoryBits,
			maskBits: component.maskBits,
			sensor: component.sensor,
			node: node,
			position: node?.position ? { x: node.position.x, y: node.position.y, z: node.position.z } : undefined,
			rotation: node?.rotation ? { x: node.rotation.x, y: node.rotation.y, z: node.rotation.z } : undefined,
		};
	}
}

export default Physics3DUtils;
