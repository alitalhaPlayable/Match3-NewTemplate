import * as THREE from "three";
import materialController from "../utils/MaterialController";
import { StudioObject3D } from "./types";

interface MeshGC {
	type: "mesh";
	geometry: string;
	material: string;
	castShadow: boolean;
	receiveShadow: boolean;
}

class Mesh extends THREE.Mesh implements StudioObject3D {
	sID: string = "";
	type: string = "Mesh";
	selected: boolean = false;
	locked: boolean = false;
	isGameObject: boolean = true;

	constructor(geometry: THREE.BufferGeometry, material: THREE.Material) {
		super(geometry, material);
		this.initComponentSystem();
	}

	updateMeshComponent(component: MeshGC) {
		this.castShadow = component.castShadow;
		this.receiveShadow = component.receiveShadow;

		if (component.material) {
			const material = materialController.get(component.material);
			if (material) {
				this.material = material;
			}
		}
	}

	updateComponents(components: { [key: string]: any }) {
		const mesh = components.mesh as MeshGC;
		if (mesh) {
			this.updateMeshComponent(mesh);
		}
		super.updateComponents(components);
	}
}

export default Mesh;
