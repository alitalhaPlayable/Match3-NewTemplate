import * as THREE from "three";
import Mesh from "../Mesh";

const planeGeometry = new THREE.PlaneGeometry(1, 1);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

class Plane extends Mesh {
	constructor(material?: THREE.Material) {
		super(planeGeometry, material || baseMaterial);
	}
}

export default Plane;
