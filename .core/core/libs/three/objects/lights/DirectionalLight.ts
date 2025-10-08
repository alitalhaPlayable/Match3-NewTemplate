import * as THREE from "three";
import { StudioObject3D } from "../types";
// import ObjectTypes from "../../../pixi/objects/objectTypes";
import { DirectionalLightGC } from "../../../common/components";
import EventEmitter from "../../../common/EventEmitter";

class DirectionalLight extends THREE.DirectionalLight implements StudioObject3D {
	lightHelper: THREE.DirectionalLightHelper;
	shadowHelper: THREE.CameraHelper;

	// type: ObjectTypes = ObjectTypes.DIRECTIONAL_LIGHT;
	shadowSize: number = 20;
	debugEnabled: boolean = false;

	eventEmitter: EventEmitter = EventEmitter.getInstance();

	constructor(color: number | string = "#ffffff", intensity: number = 1) {
		super(color, intensity);
		this.initComponentSystem();

		this.lightHelper = new THREE.DirectionalLightHelper(this, 2, 0x000000);
		this.shadowHelper = new THREE.CameraHelper(this.shadow.camera);
	}

	updateHelpers() {
		this.target.updateMatrixWorld();
		this.shadow.camera.updateProjectionMatrix();
		this.lightHelper.update();
		this.shadowHelper.update();
	}

	updateDirectionalLightComponent(component: DirectionalLightGC) {
		this.setTarget(component.target.x, component.target.y, component.target.z);
		this.castShadow = component.castShadow;
		this.shadowMapWidth = component.shadowMapSize;
		this.shadowMapHeight = component.shadowMapSize;

		this.shadowAreaSize = component.shadowAreaSize;

		this.shadow.camera.near = 0.5; // Adjust the value as needed
		this.shadow.camera.far = 500;
		this.shadow.bias = component.bias;

		this.changeDebug(component.debug);
		this.updateHelpers();
	}

	updateComponents(components: { [key: string]: any }) {
		const directionalLight = components.directionalLight as DirectionalLightGC;
		if (directionalLight) {
			this.updateDirectionalLightComponent(directionalLight);
		}
		super.updateComponents(components);
	}

	setTarget(x: number | THREE.Object3D, y: number, z: number) {
		if (x instanceof THREE.Object3D) {
			this.target.position.set(x.position.x, x.position.y, x.position.z);
		} else {
			this.target.position.set(x, y, z);
		}

		this.target.updateMatrixWorld();
		this.lightHelper.update();
	}

	set shadowMapWidth(value: number) {
		this.shadow.mapSize.width = value;
		this.shadow.map = null;
	}

	get shadowMapWidth() {
		return this.shadow.mapSize.width;
	}

	set shadowMapHeight(value: number) {
		this.shadow.mapSize.height = value;
		this.shadow.map = null;
	}

	get shadowMapHeight() {
		return this.shadow.mapSize.height;
	}

	set shadowAreaSize(value: number) {
		this.shadowSize = value;

		this.shadow.camera.left = -this.shadowSize;
		this.shadow.camera.right = this.shadowSize;
		this.shadow.camera.top = this.shadowSize;
		this.shadow.camera.bottom = -this.shadowSize;
	}

	get shadowAreaSize() {
		return this.shadowSize;
	}

	changeDebug(debugEnabled: boolean) {
		if (this.debugEnabled === debugEnabled) return;
		if (debugEnabled) {
			this.eventEmitter.emit("addToScene3D", this.lightHelper);
			this.eventEmitter.emit("addToScene3D", this.shadowHelper);
		} else {
			this.lightHelper.parent?.remove(this.lightHelper);
			this.shadowHelper.parent?.remove(this.shadowHelper);
			// this.position.removeChangeCallback();
		}
		this.debugEnabled = debugEnabled;
	}

	transformUpdate() {
		if (this.debugEnabled) {
			this.updateHelpers();
		}
	}

	destroy(): void {
		super.destroy();
		this.lightHelper.parent?.remove(this.lightHelper);
		this.shadowHelper.parent?.remove(this.shadowHelper);
	}

	setVisible(visible: boolean) {
		this.visible = visible;
		this.lightHelper.visible = visible;
		this.shadowHelper.visible = visible;
	}
}

export default DirectionalLight;
