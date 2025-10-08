import SceneHelper3D from "../../SceneHelper3D";
import * as RAPIER2D from "@dimforge/rapier2d-compat";
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from "three";
import rapier2dHelpers from "./rapier2dHelpers";

export default class rapier2dPhysics {
	static initWorld(gravity = { x: 0, y: 0 }) {
		let world = new RAPIER2D.World(gravity);
		this.world = world;
		console.log("RAPIER world init");

		app.rapierPhysics = this;
		this.rapier = RAPIER2D;

		this.eventQue = new RAPIER2D.EventQueue(true);
		this.deleteList = [];

		this.helper = rapier2dHelpers;
	}

	static update(delta) {
		if (!this.world) return;

		this.world.timeStep = delta;
		this.world.step(this.eventQue);

		this.eventQue.drainContactForceEvents((event) => {
			//console.log(event);
		});

		this.eventQue.drainCollisionEvents((handle1, handle2, started) => {
			//console.log(handle1, handle2, started);
			//let body1 = this.world.bodies.get(handle1);
			//let body2 = this.world.bodies.get(handle2);
		});

		while (this.deleteList.length > 0) {
			const body = this.deleteList.pop();
			this.world.removeRigidBody(body);
		}

		if (this.debugEnabled) this.updateDebugger();
	}

	static initDebug() {
		this.debugEnabled = true;
		let material = new LineBasicMaterial({
			color: 0xffffff,
			vertexColors: true,
			depthTest: false,
			depthWrite: false,
		});
		let geometry = new BufferGeometry();
		this.lines = new LineSegments(geometry, material);
		SceneHelper3D.currentScene.add(this.lines);
	}

	static setWorld(world) {}

	static resetDebugger() {
		if (this.lines) {
			this.lines.parent.remove(this.lines);
			this.lines.geometry.dispose();
			this.lines.material.dispose();
			this.lines = null;
		}
	}

	static getLines() {
		return this.lines;
	}

	static updateDebugger() {
		if (!this.world) return;

		if (!this.lines) {
			//console.log("NO LINES PHYSICS DEBUG");
			return;
		}

		let buffers = this.world.debugRender();

		const originalArray = buffers.vertices;
		const newArrayLength = originalArray.length + Math.floor(originalArray.length / 2);
		const newArray = new Float32Array(newArrayLength);

		let newArrayIndex = 0;
		for (let i = 0; i < originalArray.length; i++) {
			newArray[newArrayIndex] = originalArray[i];
			newArrayIndex++;
			if (i % 2 === 0) {
				newArray[newArrayIndex] = 0;
				newArrayIndex++;
			}
		}

		this.lines.geometry.setAttribute("position", new THREE.BufferAttribute(newArray, 3));
		this.lines.geometry.setAttribute("color", new THREE.BufferAttribute(buffers.colors, 4));
	}

	static clear() {
		this.deleteList = [];
		this.world.forEachRigidBody((body) => {
			this.deleteList.push(body);
		});
	}
}
