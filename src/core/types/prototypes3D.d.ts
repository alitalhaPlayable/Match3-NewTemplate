import * as THREE from "three";
import Components3D from "core/libs/three/objects/components/components";

// Type extensions for THREE objects
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

		destroy(): void;
		setVisible(value: boolean): void;
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