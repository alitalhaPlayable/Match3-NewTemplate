import * as THREE from "three";
// eslint-disable-next-line import/no-cycle
import Components3D from "./components/components";

type ThreeObject3D = {
	// id: string;
	sID: string;
	type: string;
	components: Components3D;
	updateComponents: (components: any) => void;
	getComponent: (component: string) => any;
	selected: boolean;
	locked: boolean;
};

export type StudioObject3D = ThreeObject3D & THREE.Object3D;
