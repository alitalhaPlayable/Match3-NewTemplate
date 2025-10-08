import { Vector2, Raycaster, Vector3, Plane, ArrowHelper } from "three";
import globals from "@globals";

export default class Toucher {
	constructor(camera, planeVec = new Vector3(0, 1, 0), offset) {
		this.mouse = new Vector2();
		this.raycaster = new Raycaster();
		this.camera = camera;

		this.plane = new Plane(planeVec, 0);
		this.planeVec3 = new Vector3();
		if (offset) {
			this.plane.translate(offset);
		}
	}

	getMousePos(clientX, clientY) {
		this.mouse.x = (clientX / globals.screenWidth) * 2 - 1;
		this.mouse.y = -(clientY / globals.screenHeight) * 2 + 1;
		return this.mouse;
	}

	getIntersects(moPosX, moPosY, objList, goDeep = true) {
		this.getMousePos(moPosX, moPosY);
		this.raycaster.firstHitOnly = true;
		this.raycaster.setFromCamera(this.mouse, this.camera);
		let intersects = this.raycaster.intersectObjects(objList, goDeep);
		return intersects;
	}

	raycastFromObject(origin, dir, far, objList) {
		this.raycaster.firstHitOnly = true;
		this.raycaster.set(origin, dir);
		this.raycaster.far = far;
		let intersect = this.raycaster.intersectObjects(objList, true);
		return intersect;
	}

	showArrow() {
		if (!this.arrow) {
			this.arrow = new ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 1, "#ff0000");
			app.main.scene.add(this.arrow);
		}

		this.arrow.position.copy(this.raycaster.ray.origin);
		this.arrow.setDirection(this.raycaster.ray.direction);
		this.arrow.setLength(this.raycaster.far);
	}

	getIntersect(moPosX, moPosY, obj) {
		this.getMousePos(moPosX, moPosY);
		this.raycaster.setFromCamera(this.mouse, this.camera);
		let intersect = this.raycaster.intersectObject(obj, true);
		return intersect;
	}

	getPlaneIntersection(moX, moY) {
		this.getMousePos(moX, moY);
		this.raycaster.setFromCamera(this.mouse, this.camera);

		this.raycaster.ray.intersectPlane(this.plane, this.planeVec3);

		return this.planeVec3;
	}

	screenXY(pos, camera = globals.main.camera) {
		// get the position of the center of the cube
		let tempV = pos.clone();
		camera.updateMatrixWorld();
		tempV.project(camera);
		// convert the normalized position to CSS coordinates
		const x = (tempV.x * 0.5 + 0.5) * globals.pixiScene.baseWidth;
		const y = (tempV.y * -0.5 + 0.5) * globals.pixiScene.baseHeight;
		return new Vector2(x, y);
	}
}
