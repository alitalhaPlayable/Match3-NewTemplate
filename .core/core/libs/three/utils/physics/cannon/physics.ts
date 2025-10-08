import * as CANNON from "cannon-es";
import * as THREE from "three";
import CannonDebugRenderer from "cannon-es-debugger";

export class CannonPhysics3D {
	public world: CANNON.World | null = null;
	private debugScene: THREE.Scene | null = null;
	private debugRenderer: { update: () => void } | null = null;
	private isDebugEnabled: boolean = false;

	constructor() {
		this.init();
	}

	private init() {
		try {
			// Create Cannon world with gravity
			const world = new CANNON.World({
				gravity: new CANNON.Vec3(0, -9.82, 0),
			});
			this.world = world;

			// Set broadphase algorithm
			world.broadphase = new CANNON.NaiveBroadphase();

			world.defaultContactMaterial.contactEquationStiffness = 1e6;
			// world.defaultContactMaterial.contactEquationRegularizationTime = 3;
			// world.solver.iterations = 6;
			world.allowSleep = true;

			// Enable sleeping
			this.world.allowSleep = true;
		} catch (error) {
			console.error("Failed to initialize Cannon:", error);
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
		if (!this.debugScene || !this.world) return;

		try {
			// Create Cannon debug renderer
			this.debugRenderer = CannonDebugRenderer(this.debugScene, this.world);
		} catch (error) {
			console.error("Failed to initialize Cannon debug renderer:", error);
		}
	}

	private clearDebugRenderer() {
		if (this.debugRenderer) {
			// Cannon debug renderer doesn't have a clear method
			this.debugRenderer = null;
		}
	}

	public getWorld(): CANNON.World | null {
		return this.world;
	}

	public step(deltaTime: number) {
		if (this.world) {
			// Fixed timestep for stability
			const fixedTimeStep = 1 / 60;
			const maxSubSteps = 3;

			this.world.step(fixedTimeStep, deltaTime, maxSubSteps);

			if (this.isDebugEnabled && this.debugRenderer) {
				this.debugRenderer.update();
			}
		}
	}

	public dispose() {
		if (this.world) {
			// Remove all bodies
			this.world.bodies.concat().forEach((body) => {
				this.world!.removeBody(body);
			});

			// Clear contacts
			this.world.contacts = [];

			// Clear narrowphase (Cannon-ES doesn't expose these properties directly)
			// this.world.narrowphase.contactEquations = [];
			// this.world.narrowphase.frictionEquations = [];
		}
		this.clearDebugRenderer();
	}

	public setWorld(world: CANNON.World) {
		this.world = world;
	}

	public clear() {
		if (!this.world) return;

		this.world.bodies.concat().forEach((body) => {
			this.world!.removeBody(body);
		});

		this.world.contacts = [];
	}
}

export default CannonPhysics3D;
