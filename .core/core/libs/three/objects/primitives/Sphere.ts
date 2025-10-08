import * as THREE from "three";
import Mesh from "../Mesh";

const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

class Sphere extends Mesh {
	constructor(material?: THREE.Material) {
		super(sphereGeometry, material || baseMaterial);
	}
}

export default Sphere;
