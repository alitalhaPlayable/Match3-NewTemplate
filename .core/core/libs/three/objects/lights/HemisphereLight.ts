import * as THREE from "three";
import { StudioObject3D } from "../types";
import { HemisphereLightGC } from "../../../common/components";
import EventEmitter from "../../../common/EventEmitter";

class HemisphereLight extends THREE.HemisphereLight implements StudioObject3D {
	lightHelper: THREE.HemisphereLightHelper;

	eventEmitter: EventEmitter = new EventEmitter();
	debugEnabled: boolean = false;

	constructor(
		skyColor: number | string = "#ffffff",
		groundColor: number | string = "#ffffff",
		intensity: number = 1
	) {
		super(skyColor, groundColor, intensity);
		this.initComponentSystem();

		this.lightHelper = new THREE.HemisphereLightHelper(this, 2, 0x000000);
	}

	updateDirectionalLightComponent(component: HemisphereLightGC) {
		this.color.set(component.color);
		this.groundColor.set(component.groundColor);
		this.intensity = component.intensity;
		this.changeDebug(component.debug!);
		this.lightHelper.update();
	}

	updateComponents(components: { [key: string]: any }) {
		const hemisphereLight = components.hemisphereLight as HemisphereLightGC;
		if (hemisphereLight) {
			this.updateDirectionalLightComponent(hemisphereLight);
		}
		super.updateComponents(components);
	}

	changeDebug(debugEnabled: boolean) {
		this.debugEnabled = debugEnabled;
		if (debugEnabled) {
			this.eventEmitter.emit("addToScene3D", this.lightHelper);
			this.lightHelper.update();
		} else {
			this.lightHelper.parent?.remove(this.lightHelper);
		}
	}

	transformUpdate() {
		if (this.debugEnabled) {
			this.lightHelper.update();
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

export default HemisphereLight;
