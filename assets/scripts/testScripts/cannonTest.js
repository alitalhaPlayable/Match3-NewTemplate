import { Body, Vec3 } from "cannon-es";
import Script3D from "core/libs/common/script/Script3D";
import CannonHelpers from "@physics3d/cannon/cannonHelpers";
import gsap from "gsap";
import ObjectHelper3D from "core/libs/three/utils/ObjectHelper3D";

export default class CannonTest extends Script3D {
	_className = "CannonTest";

	awake() {}

	init() {
		this.body = CannonHelpers.createBodyFromObj(this.node, {
			mass: 1,
			type: Body.STATIC,
		});

		gsap.delayedCall(0.1, () => {
			this.body.type = Body.DYNAMIC;
		});

		this.groundPlane = ObjectHelper3D.getObjectByName("ground");
		CannonHelpers.createBodyFromObj(this.groundPlane);

		this.node.addEventListener("tapped", () => {
			this.body.applyImpulse(new Vec3(0, 5, -2));
		});
	}

	update(delta) {
		this.node.position.copy(this.body.position);
		this.node.quaternion.copy(this.body.quaternion);
	}

	resize(w, h) {}

	onAdd() {}

	onRemove() {}
}
