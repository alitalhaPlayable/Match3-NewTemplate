import * as THREE from "three";
import Mesh from "../Mesh";
import { MeshGC } from "../../../common/components";
import EventEmitter from "../../../common/EventEmitter";
import MaterialController from "../../utils/MaterialController";
import { parseObject3DRelativePath } from "../../utils/parseObject3DRelativePath";
import Cache3D from "../../utils/Cache3D";

const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0xf705f7 });
const defaultGeometry = new THREE.BoxGeometry(5, 5, 5, 5);

class CustomMesh extends Mesh {
	eventEmitter: EventEmitter = EventEmitter.getInstance();
	component: MeshGC | undefined;

	constructor(cachedObject: any, meshComponent: MeshGC | undefined, id:string) {
		const {geometry, material} = CustomMesh.loadCustomMesh(cachedObject, meshComponent, id);
		super(geometry || defaultGeometry, material || defaultMaterial);
		this.component = meshComponent;
	}

	static loadCustomMesh(cachedObject: any, meshComponent: MeshGC | undefined, id: string) {
		if (!cachedObject) return {geometry: null, material: null};
		cachedObject = Cache3D.getModel(cachedObject.modelUUID)
		let geometryNode = cachedObject.scene;

		geometryNode = parseObject3DRelativePath(geometryNode, meshComponent?.geometry ?? "");

		let materialNode = null;
		if (meshComponent?.material) {
			materialNode = MaterialController.get(meshComponent.material);
		}

		if (!materialNode) {
			materialNode = defaultMaterial;
		}

		let geometry = geometryNode as THREE.BufferGeometry;
		const material = materialNode as THREE.Material;
		return { geometry, material };
	}

	public updateMaterial() {
		if (this.component?.material)
			this.material = MaterialController.get(this.component?.material)
	}
}

export default CustomMesh;
