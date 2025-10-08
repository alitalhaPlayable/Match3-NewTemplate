import * as THREE from "three";

// #if process.projConfig.physics3DSettings.physicsType === "cannon"
import * as CANNON from "cannon-es";
import CannonPhysics3D from "./cannon/physics";
// #endif

// #if process.projConfig.physics3DSettings.physicsType === "rapier3d"
import * as RAPIER from "@dimforge/rapier3d-compat";
import RapierPhysics3D from "./rapier/physics";
// #endif

// Physics3DManager - manages both Rapier and Cannon physics engines
export class Physics3DManager {
	private static currentPhysicsType: "none" | "cannon" | "rapier3d" = "none";
	// #if process.projConfig.physics3DSettings.physicsType === "rapier3d"
	public static rapierPhysics: RapierPhysics3D = new RapierPhysics3D();
	// #endif
	// #if process.projConfig.physics3DSettings.physicsType === "cannon"
	public static cannonPhysics: CannonPhysics3D = new CannonPhysics3D();
	// #endif
	private static scene: THREE.Scene | null = null;

	static get world() {
		if (this.currentPhysicsType === "rapier3d") {
			return this.rapierPhysics.getWorld();
		} else if (this.currentPhysicsType === "cannon") {
			return this.cannonPhysics.getWorld();
		}
	}

	public static setPhysicsType(type: "none" | "cannon" | "rapier3d") {
		if (this.currentPhysicsType === type) return;

		console.log(`Physics3DManager: Starting ${type}`);

		// #if process.projConfig.physics3DSettings.physicsType === "rapier3d"
		this.rapierPhysics.init();
		// #endif

		// Set new physics type
		this.currentPhysicsType = type;

		// Initialize new physics engine
		if (type === "rapier3d") {
			this.scene && this.rapierPhysics.setScene(this.scene);
		} else if (type === "cannon") {
			this.scene && this.cannonPhysics.setScene(this.scene);
		}
	}

	public static setScene(scene: THREE.Scene) {
		this.scene = scene;
		this.rapierPhysics?.setScene(scene);
		this.cannonPhysics?.setScene(scene);
	}

	public static setDebugEnabled(enabled: boolean) {
		// Disable debug on all engines first to clear any existing debug renderers
		this.rapierPhysics?.setDebugEnabled(false);
		this.cannonPhysics?.setDebugEnabled(false);

		// Enable debug on the current engine
		if (this.currentPhysicsType === "rapier3d") {
			this.rapierPhysics?.setDebugEnabled(enabled);
		} else if (this.currentPhysicsType === "cannon") {
			this.cannonPhysics.setDebugEnabled(enabled);
		}
	}

	public static step(deltaTime: number) {
		if (this.currentPhysicsType === "rapier3d") {
			this.rapierPhysics.step(deltaTime);
		} else if (this.currentPhysicsType === "cannon") {
			this.cannonPhysics.step(deltaTime);
		}
	}

	public static getWorld() {
		if (this.currentPhysicsType === "rapier3d") {
			return this.rapierPhysics.getWorld();
		} else if (this.currentPhysicsType === "cannon") {
			return this.cannonPhysics.getWorld();
		}
		return null;
	}

	public static isReady(): boolean {
		if (this.currentPhysicsType === "rapier3d") {
			return this.rapierPhysics !== null && this.rapierPhysics.getWorld() !== null;
		} else if (this.currentPhysicsType === "cannon") {
			return this.cannonPhysics !== null && this.cannonPhysics.getWorld() !== null;
		}
		return false;
	}

	public static getCurrentPhysicsType(): "none" | "cannon" | "rapier3d" {
		return this.currentPhysicsType;
	}

	public static removeBody(body: any) {
		if (this.currentPhysicsType === "rapier3d") {
			const world = this.rapierPhysics.getWorld() as RAPIER.World;
			if (world && body) {
				world.removeRigidBody(body);
			}
		} else if (this.currentPhysicsType === "cannon") {
			const world = this.cannonPhysics.getWorld() as CANNON.World;
			if (world && body) {
				world.removeBody(body);
			}
		}
	}

	public static clearAllBodies() {
		// Clear Rapier bodies
		const rapierWorld = this.rapierPhysics.getWorld() as RAPIER.World;
		if (rapierWorld) {
			// Rapier bodies is a RigidBodySet, we need to iterate differently
			const bodiesToRemove: RAPIER.RigidBody[] = [];
			rapierWorld.bodies.forEach((body) => {
				bodiesToRemove.push(body);
			});
			bodiesToRemove.forEach((body) => {
				rapierWorld.removeRigidBody(body);
			});
		}

		// Clear Cannon bodies
		const cannonWorld = this.cannonPhysics.getWorld() as CANNON.World;
		if (cannonWorld) {
			const bodies = [...cannonWorld.bodies]; // Create a copy to avoid modification during iteration
			bodies.forEach((body) => {
				cannonWorld.removeBody(body);
			});
		}
	}
}

export default Physics3DManager;
