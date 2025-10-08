import RAPIER from "@dimforge/rapier3d-compat";
import { Box3, Vector3 } from "three";
import SceneHelper3D from "../../SceneHelper3D";
import Physics3DManager from "../Physics3DManager";

export default class Rapier3dHelpers {
	static createBodyFromObj(
		obj,
		{ mass = 0, type = RAPIER.RigidBodyType.Fixed, addToWorld = true, sizMult = 1, sizeVecMult = new Vector3(1, 1, 1), leaveBodyAtScene = false, isSensor = false, colGroup, colGroup2, onEnter, onExit, rigidbodyDescDecorator } = {}
	) {
		let bb8 = new Box3();
		let tmpSize = new Vector3();

		let orgPos = obj.position.clone();
		let orgQut = obj.quaternion.clone();
		let orgSkal = obj.scale.clone();
		let parent = obj.parent;

		moveToScene(obj);

		let wPos = obj.position.clone();
		let wQut = obj.quaternion.clone();
		let wSkal = obj.scale.clone();

		obj.position.set(0, 0, 0);
		obj.rotation.set(0, 0, 0);

		obj.updateMatrixWorld(true);

		bb8.setFromObject(obj);
		bb8.getSize(tmpSize);
		let orgcenter = bb8.getCenter(new Vector3());

		tmpSize.multiplyScalar(0.5 * sizMult);
		tmpSize.x *= sizeVecMult.x;
		tmpSize.y *= sizeVecMult.y;
		tmpSize.z *= sizeVecMult.z;
		if (tmpSize.y < 0.01) {
			tmpSize.y = 0.01;
		}

		let rigidBodyDesc = new RAPIER.RigidBodyDesc(type);
		rigidBodyDesc.setAdditionalMass(mass);
		if(rigidbodyDescDecorator){
			rigidbodyDescDecorator(rigidBodyDesc);
		}
		let rigidBody = Physics3DManager.rapierPhysics.world.createRigidBody(rigidBodyDesc);
		let colliderDesc = RAPIER.ColliderDesc.cuboid(tmpSize.x, tmpSize.y, tmpSize.z);
		let collider = Physics3DManager.rapierPhysics.world.createCollider(colliderDesc, rigidBody);

		if (colGroup) {
			collider.setCollisionGroups(colGroup);
		}
		if (colGroup2) {
			collider.setSolverGroups(colGroup2);
		}

		collider.setSensor(isSensor);
		if(isSensor){
        	collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
			if (onEnter) collider.onEnter = onEnter;
			if (onExit) collider.onExit = onExit;
		}
		collider.node = obj;

		rigidBody.setTranslation(wPos);
		rigidBody.setRotation(wQut);

		collider.setTranslationWrtParent(orgcenter);

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

function moveToScene(obj) {
	obj.updateWorldMatrix(true);
	obj.getWorldPosition(obj.position);
	obj.getWorldScale(obj.scale);
	obj.getWorldQuaternion(obj.quaternion);
	SceneHelper3D.currentScene.add(obj);
}
