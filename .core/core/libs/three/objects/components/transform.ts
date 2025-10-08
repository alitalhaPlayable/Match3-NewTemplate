import * as THREE from "three";
import { MathUtils } from "three/src/math/MathUtils";

class Transform {
	node: THREE.Object3D;
	constructor(node: THREE.Object3D) {
		this.node = node;
	}

	update(component: any) {
		if (!component) return;
		this.node.position.set(component.position.x, component.position.y, component.position.z);
		this.node.scale.set(component.scale.x, component.scale.y, component.scale.z);
		let rX = MathUtils.degToRad(component.rotation.x);
		let rY = MathUtils.degToRad(component.rotation.y);
		let rZ = MathUtils.degToRad(component.rotation.z);

		this.node.rotation.set(rX, rY, rZ);
		this.node.name = component.label;
		this.node.setVisible(component.visible);
	}

	get() {
		return {
			type: "node3D",
			label: this.node.name,
			visible: this.node.visible,
			position: {
				x: this.node.position.x,
				y: this.node.position.y,
				z: this.node.position.z,
				linked: false,
			},
			scale: {
				x: this.node.scale.x,
				y: this.node.scale.y,
				z: this.node.scale.z,
				linked: true,
			},
			rotation: {
				x: this.node.rotation.x,
				y: this.node.rotation.y,
				z: this.node.rotation.z,
				linked: false,
			},
			renderOrder: 0,
		};
	}
}

export default Transform;
