import * as THREE from "three";
import ThreeTransformPrototypes from "./ThreeTransformPrototypes";
import Components3D from "../components/components";
import ObjectHelper3D from "../../utils/ObjectHelper3D";
import AnimationManager3D from "../../utils/AnimationManager3D";
import Script3D from "core/libs/common/script/Script3D";

ThreeTransformPrototypes();

declare module "three" {
	interface Object3D {
		sID: string;
		label: string;
		isGameObject: boolean;
		selected: boolean;
		locked: boolean;
		// components
		components: Components3D;
		updateComponents(components: { [key: string]: any }): void;
		getComponent(component: string): any;
		initComponentSystem(): void;
		update(delta: number): void;
		parentScene: any;
		body: any;

		destroy(): void;

		setVisible(value: boolean): void;
		animationManager: AnimationManager3D;
		scripts: Script3D[];

		// get scaleX(): number;
		// set scaleX(value: number);

		isStudioObject: boolean;
	}

	interface Light {
		updateComponents(components: { [key: string]: any }): void;
	}

	interface ShaderMaterial {
		fragmentShaderReady: boolean;
		vertexShaderReady: boolean;
	}
}

THREE.Object3D.prototype.sID = "";
THREE.Object3D.prototype.label = "";
THREE.Object3D.prototype.isGameObject = false;
THREE.Object3D.prototype.selected = false;
THREE.Object3D.prototype.locked = false;

THREE.Object3D.prototype.destroy = function destroy() {
	// this.visible = false;
	this.parent?.remove(this);
	this.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			// these dispose methods may cause trouble in future, fine for now
			//child.geometry.dispose();
			child.material.dispose();
			ObjectHelper3D.removeFromList(child);
		}
	});
	this.components?.removeAll();
	ObjectHelper3D.removeFromList(this);
};

THREE.Object3D.prototype.setVisible = function setVisible(value: boolean) {
	this.visible = value;
};

THREE.Object3D.prototype.initComponentSystem = function initComponentSystem() {
	this.components = new Components3D(this);
};

THREE.Object3D.prototype.updateComponents = function updateComponents(components: { [key: string]: any }) {
	this.components.updateComponents(components);
};

THREE.Object3D.prototype.getComponent = function getComponent(component: string) {
	return this.components.get(component);
};

THREE.Object3D.prototype.update = function update(delta: number) {};

THREE.Light.prototype.updateComponents = function updateComponents(components: { [key: string]: any }) {
	const light = components.light as any;
	if (light) {
		this.color.set(light.color);
		this.intensity = light.intensity;
	}
	THREE.Object3D.prototype.updateComponents.call(this, components);
};

THREE.Object3D.prototype.isStudioObject = false;

export default () => {
	return null;
};
