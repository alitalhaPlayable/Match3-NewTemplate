import * as THREE from "three";
import Mesh from "../Mesh";

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

class Box extends Mesh {
	constructor(material?: THREE.Material) {
		super(boxGeometry, material || boxMaterial);
	}
}

export default Box;
