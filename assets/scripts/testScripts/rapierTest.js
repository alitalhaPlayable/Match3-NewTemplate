import Script3D from "core/libs/common/script/Script3D";
import rapierHelpers from "@physics3d/rapier/rapier3dHelpers";
import { Vector3 } from "three";
import ObjectHelper3D from "core/libs/three/utils/ObjectHelper3D";
import RAPIER from "@dimforge/rapier3d-compat";

export default class RapierTest extends Script3D {
	_className = "RapierTest";

	awake() {}

	init() {
		this.body = rapierHelpers.createBodyFromObj(this.node, {
			mass: 1,
			type: RAPIER.RigidBodyType.Dynamic,
		});

		this.groundPlane = ObjectHelper3D.getObjectByName("ground");
		rapierHelpers.createBodyFromObj(this.groundPlane);

		this.node.addEventListener("tapped", () => {
			this.body.applyImpulse(new Vector3(0, 5, -2), true);
		});
	}

	update(delta) {
		const pos = this.body.translation();
		const qut = this.body.rotation();
		this.node.position.copy(pos);
		this.node.quaternion.copy(qut);
	}

	resize(w, h) {}

	onAdd() {}

	onRemove() {}
}
