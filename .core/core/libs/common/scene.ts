import ObjectTypes from "./objectTypes";
import { GameComponent } from "./components";
import { Scene3DSettings } from "./types";
import { StudioObject2D } from "../pixi/objects/types";
import { StudioObject3D } from "../three/objects/types";

export interface SceneBase {
	name: string;
	id?: string | number;
	sID?: string;
	gameObjects: (StudioObject2D | StudioObject3D)[];
}

export interface SceneHelperBase {
	sceneList: Map<string, SceneBase>;
	/* initSceneByName(name: string): SceneBase | undefined;
	removeScene(scene: SceneBase): void;
	getSceneByName(name: string): SceneBase | undefined; */
}

export interface ObjectHelperBase {
	//addObject(obj: any, scene: any): void;
	//removeObject(obj: any): void;
	//removeObjectById(id: string): void;
	getObjectById(id: string): any | undefined;
	//getNodeByLabel(label: string): any | undefined;
	//getObjectByName(name: string): any | undefined;
}

/* export interface ObjectHelperBase {
	objects: Map<string, any>;
	maskObjects: any[];
	rootScene: any;
	objectByScene: Map<any, any[]>;
	addObject(obj: any, scene: any): void;
	removeObject(obj: any): boolean;
	removeObjectById(id: string): void;
	getObjectById(id: string): any | undefined;
	getNodeByLabel(label: string): any | undefined;
	getObjectByName(name: string): any | undefined;
} */

export type PartialGameComponent = Partial<{
	[C in GameComponent as C["type"]]: C;
}>;

export interface GameNode {
	id: string;
	name: string;
	type: ObjectTypes;
	components: PartialGameComponent;
	children: GameNode[];
	prefabId?: string;
	prefabNodeId?: string;
	isPrefabRoot?: boolean;
	hidden?: boolean;
	locked?: boolean;
	referenceFixMap?: Record<string, string>;
}

export interface GameNodeWithPath {
	id: string;
	name: string;
	type: ObjectTypes;
	components: PartialGameComponent;
	path: string;
}

export type GameScene =
	| {
			name: string;
			id: string;
			root: GameNode;
			settings: Scene3DSettings;
			type: "3D";
	  }
	| {
			name: string;
			id: string;
			root: GameNode;
			settings?: Record<string, any>;
			type: "2D";
	  };
