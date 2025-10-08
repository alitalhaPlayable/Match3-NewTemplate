import * as THREE from "three";
import { StudioObject3D } from "../types";
import { PerspectiveCameraGC } from "../../../common/components";
import EventEmitter from "../../../common/EventEmitter";

class PerspectiveCamera extends THREE.PerspectiveCamera implements StudioObject3D {
	cameraHelper: THREE.CameraHelper;
	eventEmitter: EventEmitter = EventEmitter.getInstance();
	debugEnabled: boolean = false;

	constructor(fov: number = 75, aspect: number = 1, near: number = 0.1, far: number = 1000) {
		super(fov, aspect, near, far);
		this.initComponentSystem();

		this.cameraHelper = new THREE.CameraHelper(this);
	}

	updatePerspectiveCameraComponent(component: PerspectiveCameraGC) {
		this.fov = component.fov;
		this.aspect = component.aspect;
		this.near = component.near;
		this.far = component.far;

		this.changeDebug(component.debug!);
		this.cameraHelper.update();
	}

	updateComponents(components: { [key: string]: any }) {
		const perspectiveCamera = components.perspectiveCamera as PerspectiveCameraGC;
		if (perspectiveCamera) {
			this.updatePerspectiveCameraComponent(perspectiveCamera);
		}
		super.updateComponents(components);
	}

	changeDebug(debugEnabled: boolean) {
		if (this.debugEnabled === debugEnabled) return;
		if (debugEnabled) {
			this.eventEmitter.emit("addToScene3D", this.cameraHelper);
		} else {
			this.cameraHelper.parent?.remove(this.cameraHelper);
		}
		this.debugEnabled = debugEnabled;
	}

	transformUpdate() {
		if (this.debugEnabled) {
			this.cameraHelper.update();
		}
	}

	destroy(): void {
		super.destroy();
		this.cameraHelper.parent?.remove(this.cameraHelper);
	}

	setVisible(visible: boolean) {
		this.visible = visible;
		this.cameraHelper.visible = visible;
	}
}

export default PerspectiveCamera;
