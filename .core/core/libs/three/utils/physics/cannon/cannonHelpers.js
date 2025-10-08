import { Vector3, Box3, Object3D, Quaternion, Euler } from "three";
import { Box, Vec3, Body } from "cannon-es";
import SceneHelper3D from "../../SceneHelper3D";
import Physics3DManager from "../Physics3DManager";

/**
 * Buradaki fonksiyonlar CannonHelpers.fonksiyonAdı şeklinde istenilen yerden çağırılabilir
 */

let CannonHelpers = {};

let bb8;
let tmpSize;
let tmpPos;

CannonHelpers.createBodyFromObj = (obj, { mass = 0, type = Body.STATIC, addToWorld = true, sizMult = 1, sizeVecMult = new Vector3(1, 1, 1), leaveBodyAtScene = false, isTrigger = false } = {}) => {
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
	let bShape = new Box(new Vec3(tmpSize.x, tmpSize.y, tmpSize.z));
	let body = new Body({
		mass: mass,
		type: type,
		isTrigger: isTrigger,
	});
	if (isTrigger) {
		body.collisionResponse = false;
	}
	body.bb8Size = tmpSize.clone();
	body.bb8 = bb8;

	body.offsetman = new Vec3().copy(orgcenter);
	body.addShape(bShape, body.offsetman);

	body.position.copy(wPos);
	body.quaternion.copy(wQut);

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

	if (addToWorld) Physics3DManager.world.addBody(body);

	return body;
};

CannonHelpers.bodiesAreInContact = (bodyA, bodyB) => {
	for (var i = 0; i < Physics3DManager.world.contacts.length; i++) {
		var c = Physics3DManager.world.contacts[i];
		if ((c.bi === bodyA && c.bj === bodyB) || (c.bi === bodyB && c.bj === bodyA)) {
			return true;
		}
	}
	return false;
};

CannonHelpers.createBox = (config) => {
	if (!config) config = {};
	let { size = new Vec3(1, 1, 1), mass = 0.1, type = Body.STATIC, addToWorld = true } = config;

	let bb = new Body({
		shape: new Box(size),
		mass: mass,
		type: type,
	});
	if (addToWorld) Globals.main.world.add(bb);
	return bb;
};

CannonHelpers.calculateVeloToReachTarget = function (startPos, targetPos, h = 3, gravity) {
	let sPos = new Vector3(startPos.x, startPos.y, startPos.z);
	let tPos = new Vector3(targetPos.x, targetPos.y, targetPos.z);
	let displacements = tPos.sub(sPos);
	//console.log("h:", h);

	let veloY = new Vector3(0, 1, 0).multiplyScalar(Math.sqrt(-2 * gravity * h));

	//console.log(displacements);
	let velo = new Vector3(
		displacements.x / (Math.sqrt((-2 * h) / gravity) + Math.sqrt((2 * (displacements.y - h)) / gravity)),
		veloY.y,
		displacements.z / (Math.sqrt((-2 * h) / gravity) + Math.sqrt((2 * (displacements.y - h)) / gravity))
	);
	//console.log("velo:", velo);
	return velo;
};

function moveToScene(obj) {
	obj.updateWorldMatrix(true);
	obj.getWorldPosition(obj.position);
	obj.getWorldScale(obj.scale);
	obj.getWorldQuaternion(obj.quaternion);
	SceneHelper3D.currentScene.add(obj);
}

export default CannonHelpers;
