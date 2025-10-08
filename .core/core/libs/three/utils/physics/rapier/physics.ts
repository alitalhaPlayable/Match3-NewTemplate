import * as RAPIER from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import globals from "@globals";

const initRapier = async () => {
	await RAPIER.init();
	globals.rapierInitialized = true;
};
initRapier();
export class RapierPhysics3D {
	private world: RAPIER.World | null = null;
	private eventQue: RAPIER.EventQueue | null = null;
	private debugScene: THREE.Scene | null = null;
	private debugLines: THREE.LineSegments | null = null;
	private debugMaterial: THREE.LineBasicMaterial | null = null;
	private isDebugEnabled: boolean = false;
	private isCollisionCheckEnabled: boolean = true;

	constructor() { }

	public init() {
		try {
			this.world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });
			if(this.isCollisionCheckEnabled){
				this.eventQue = new RAPIER.EventQueue(true);
			}
		} catch (error) {
			console.error("Failed to initialize Rapier:", error);
		}
	}

	public setScene(scene: THREE.Scene) {
		this.debugScene = scene;
	}

	public setDebugEnabled(enabled: boolean) {
		this.isDebugEnabled = enabled;

		if (enabled) {
			this.initDebugRenderer();
		} else {
			this.clearDebugRenderer();
		}
	}

	private initDebugRenderer() {
		if (!this.debugScene) return;

		// Create debug material with vertex colors
		this.debugMaterial = new THREE.LineBasicMaterial({
			color: 0xffffff,
			vertexColors: true,
		});

		// Create debug geometry and lines
		const geometry = new THREE.BufferGeometry();
		this.debugLines = new THREE.LineSegments(geometry, this.debugMaterial);
		this.debugScene.add(this.debugLines);
	}

	private clearDebugRenderer() {
		if (this.debugLines && this.debugScene) {
			this.debugScene.remove(this.debugLines);
			this.debugLines.geometry.dispose();
			if (this.debugLines.material && !Array.isArray(this.debugLines.material)) {
				this.debugLines.material.dispose();
			}
			this.debugLines = null;
		}
	}

	public getWorld(): RAPIER.World | null {
		return this.world;
	}

	public step(deltaTime: number) {
		if (this.world) {
			if (this.eventQue) {
				this.world.step(this.eventQue);
				this.eventQue.drainCollisionEvents((handle1: any, handle2: any, started: any) => {
					const collider1 = this.world.getCollider(handle1);
					const collider2 = this.world.getCollider(handle2);

					if (started) {
						if (collider1.onEnter) {
							collider1.onEnter(collider2);
						}
						if (collider2.onEnter) {
							collider2.onEnter(collider1);
						}
					} else {
						if (collider1.onExit) {
							collider1.onExit(collider2);
						}
						if (collider2.onExit) {
							collider2.onExit(collider1);
						}
					}
				});
			} else {
				this.world.step();
			}

			if (this.isDebugEnabled) {
				this.updateDebugRenderer();
			}
		}
	}

	private updateDebugRenderer() {
		if (!this.isDebugEnabled || !this.world || !this.debugLines) return;

		try {
			// Use Rapier's built-in debug renderer (same as studio-template)
			const buffers = this.world.debugRender();

			// Update geometry with debug buffers
			this.debugLines.geometry.setAttribute("position", new THREE.BufferAttribute(buffers.vertices, 3));
			this.debugLines.geometry.setAttribute("color", new THREE.BufferAttribute(buffers.colors, 4));
		} catch (error) {
			console.warn("Debug render not available:", error);
		}
	}

	public dispose() {
		if (this.world) {
			this.world.free();
		}
		this.clearDebugRenderer();
	}
}

export default RapierPhysics3D;
