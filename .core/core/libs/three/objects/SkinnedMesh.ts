import * as THREE from "three";
import materialController from "../utils/MaterialController";
import { StudioObject3D } from "./types";
import { parseObject3DRelativePath } from "../utils/parseObject3DRelativePath";
import MaterialController from "../utils/MaterialController";

const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0xf705f7 });
const defaultGeometry = new THREE.BoxGeometry(5, 5, 5, 5);

interface SkinnedMeshGC {
	type: "skinnedMesh";
	geometry: string;
	material: string;
	skeleton: string;
}

class SkinnedMesh extends THREE.SkinnedMesh implements StudioObject3D {
	sID: string = "";
	type: string = "Mesh";
	selected: boolean = false;
	locked: boolean = false;
	isGameObject: boolean = true;
	materialID: string = "";

	component: SkinnedMeshGC;

	constructor(cachedObject: any, component: SkinnedMeshGC, id: string) {
		const { geometry, material, skeleton, bindMatrix } = SkinnedMesh.loadSkinnedMesh(cachedObject, component, id);

		super(geometry, material || defaultMaterial);
		this.bind(skeleton, bindMatrix);

		this.component = component;
		this.initComponentSystem();
	}

	public updateMaterial() {
		this.material = MaterialController.get(this.component?.material);
	}

	private static loadSkinnedMesh(cachedObject: any, component: SkinnedMeshGC, id: string) {
		let mesh = cachedObject.scene;
		mesh = parseObject3DRelativePath(mesh, component?.geometry ?? "");

		let mat = null;
		mat = MaterialController.get(component.material);
		if (!mat) {
			mat = defaultMaterial;
		}

		let meshTarget = cachedObject.scene;
		meshTarget = parseObject3DRelativePath(meshTarget, component?.geometry.replace("/geometry", "") ?? "");

		let skeleton = meshTarget.skeleton;
		return { geometry: mesh, material: mat, skeleton, bindMatrix: meshTarget.bindMatrix };
	}

	updateMeshComponent(component: SkinnedMeshGC) {
		this.component = component;
		if (component.material) {
			const material = materialController.get(component.material);
			if (material) {
				this.material = material;
			}
			this.materialID = component.material;
		}
	}

	updateComponents(components: { [key: string]: any }) {
		const mesh = components.mesh as SkinnedMeshGC;
		if (mesh) {
			this.updateMeshComponent(mesh);
		}
		super.updateComponents(components);
	}

	// getMeshComponent(): SkinnedMeshGC {
	// 	return {
	// 		type: "skinnedMesh",
	// 		geometry: this.component.geometry,
	// 		material: this.component.material,
	// 	};
	// }

	// resetMaterial() {
	// 	this.updateMeshComponent({
	// 		...this.getMeshComponent(),
	// 	});
	// }

	update(delta: number) {
		super.update(delta);
	}
}

export default SkinnedMesh;
