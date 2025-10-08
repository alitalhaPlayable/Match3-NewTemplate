import * as THREE from "three";
import Mesh from "../Mesh";

const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

class Cylinder extends Mesh {
	constructor(material?: THREE.Material) {
		super(cylinderGeometry, material || baseMaterial);
	}
}

export default Cylinder;
