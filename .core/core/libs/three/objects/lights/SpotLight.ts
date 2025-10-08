import * as THREE from "three";
import { StudioObject3D } from "../types";
import { SpotLightGC } from "../../../common/components";
import EventEmitter from "../../../common/EventEmitter";

class SpotLight extends THREE.SpotLight implements StudioObject3D {
	lightHelper: THREE.SpotLightHelper;
	debugEnabled: boolean = false;

	eventEmitter: EventEmitter = EventEmitter.getInstance();

	constructor(color: number | string = "#ffffff", intensity: number = 1) {
		super(color, intensity);
		this.initComponentSystem();

		this.lightHelper = new THREE.SpotLightHelper(this, 0x000000);
	}

	updateHelpers() {
		this.target.updateMatrixWorld();
		this.shadow.camera.updateProjectionMatrix();
		this.lightHelper.update();
	}

	updateSpotLightComponent(component: SpotLightGC) {
		this.setTarget(component.target?.x, component.target?.y, component.target?.z);
		this.distance = component.distance;
		this.decay = component.decay;
		this.castShadow = component.castShadow;
		this.angle = component.angle;
		this.penumbra = component.penumbra;
		this.setShadowMapSize(component.shadowMapSize);

		this.changeDebug(component.debug);
		setTimeout(() => {
			this.updateHelpers();
		}, 1);
	}

	updateComponents(components: { [key: string]: any }) {
		const spotLight = components.spotLight as SpotLightGC;
		if (spotLight) {
			this.updateSpotLightComponent(spotLight);
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
		this.updateHelpers();
	}

	// SHADOW MAP SIZE
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

	setShadowMapSize(value: number) {
		this.shadowMapWidth = value;
		this.shadowMapHeight = value;
	}

	changeDebug(debugEnabled: boolean) {
		if (this.debugEnabled === debugEnabled) return;
		if (debugEnabled) {
			this.eventEmitter.emit("addToScene3D", this.lightHelper);
		} else {
			this.lightHelper.parent?.remove(this.lightHelper);
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
	}

	setVisible(visible: boolean) {
		this.visible = visible;
		this.lightHelper.visible = visible;
	}
}

export default SpotLight;
