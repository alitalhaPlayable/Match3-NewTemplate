import RAPIER from "@dimforge/rapier2d-compat";
import { Box3, Vector2, Vector3 } from "three";
import rapier2dPhysics from "./rapier2d";
import threeHelper from "../../threeHelper";

export default class Rapier2dHelpers {
	static createBodyFromObj(
		obj,
		{ mass = 0, type = RAPIER.RigidBodyType.Fixed, addToWorld = true, sizMult = 1, sizeVecMult = new Vector3(1, 1, 1), leaveBodyAtScene = false, isSensor = false } = {}
	) {
		let bb8 = new Box3();
		let tmpSize = new Vector3();

		let orgPos = obj.position.clone();
		let orgQut = obj.quaternion.clone();
		let orgSkal = obj.scale.clone();
		let parent = obj.parent;

		threeHelper.moveToScene(obj);

		let wPos = obj.position.clone();
		let wQut = obj.quaternion.clone();
		let wSkal = obj.scale.clone();

		let wRot = obj.rotation.clone();
		let orgRot = obj.rotation.clone();
		orgRot.x = 0;

		obj.position.set(0, 0, 0);
		obj.rotation.set(0, 0, 0);

		obj.updateMatrixWorld(true);

		bb8.setFromObject(obj);
		bb8.getSize(tmpSize);
		let orgCenter = bb8.getCenter(new Vector3());
		orgCenter = new Vector2(orgCenter.x, orgCenter.z);

		tmpSize.multiplyScalar(0.5 * sizMult);
		tmpSize.x *= sizeVecMult.x;
		tmpSize.y *= sizeVecMult.y;
		tmpSize.z *= sizeVecMult.z;
		if (tmpSize.y < 0.01) {
			tmpSize.y = 0.01;
		}

		let rigidBodyDesc = new RAPIER.RigidBodyDesc(type);
		rigidBodyDesc.setAdditionalMass(mass);
		let rigidBody = rapier2dPhysics.world.createRigidBody(rigidBodyDesc);
		let colliderDesc = RAPIER.ColliderDesc.cuboid(tmpSize.x, tmpSize.z);
		let collider = rapier2dPhysics.world.createCollider(colliderDesc, rigidBody);

		collider.setSensor(isSensor);
		rigidBody.setTranslation({ x: wPos.x, y: wPos.z });

		//let angle = 2 * Math.acos(wQut.w) * -Math.sign(wQut.y);
		let angle = orgRot.z;
		//console.log(angle);

		//angle = -orgRot.z;
		rigidBody.setRotation(angle);

		collider.setTranslationWrtParent(orgCenter);

		if (!leaveBodyAtScene) {
			if (parent) {
				parent.add(obj);
			}
			obj.position.copy(orgPos);
			obj.quaternion.copy(orgQut);
			obj.scale.copy(orgSkal);
		} else {
			obj.position.copy(wPos);
			obj.quaternion.copy(wQut);
			obj.scale.copy(wSkal);
		}

		return rigidBody;
	}
}
