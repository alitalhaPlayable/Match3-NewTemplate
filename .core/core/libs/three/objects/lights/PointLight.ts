import * as THREE from "three";
import { StudioObject3D } from "../types";
import { PointLightGC } from "../../../common/components";
import EventEmitter from "../../../common/EventEmitter";

class PointLight extends THREE.PointLight implements StudioObject3D {
	lightHelper: THREE.PointLightHelper;
	debugEnabled: boolean = false;
	eventEmitter: EventEmitter = EventEmitter.getInstance();

	constructor(color: number | string = "#ffffff", intensity: number = 1) {
		super(color, intensity);
		this.initComponentSystem();

		this.lightHelper = new THREE.PointLightHelper(this, 2, 0x000000);
	}

	updatePointLightComponent(component: PointLightGC) {
		this.distance = component.distance;
		this.decay = component.decay;
		this.castShadow = component.castShadow;

		this.changeDebug(component.debug);
		this.lightHelper.update();
	}

	updateComponents(components: { [key: string]: any }) {
		const pointLight = components.pointLight as PointLightGC;
		if (pointLight) {
			this.updatePointLightComponent(pointLight);
		}
		super.updateComponents(components);
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

	destroy(): void {
		super.destroy();
		this.lightHelper.parent?.remove(this.lightHelper);
	}

	setVisible(visible: boolean) {
		this.visible = visible;
		this.lightHelper.visible = visible;
	}
}

export default PointLight;
