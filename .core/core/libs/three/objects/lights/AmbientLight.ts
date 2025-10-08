import * as THREE from "three";
import { StudioObject3D } from "../types";

class AmbientLight extends THREE.AmbientLight implements StudioObject3D {
	constructor(color: number = 0xffffff, intensity: number = 0.5) {
		super(color, intensity);
		this.initComponentSystem();
	}
}

export default AmbientLight;
