// Type-only exports - this prevents TypeScript from scanning the implementation
// Only declare the function signatures you want to expose

import { Renderer3D } from "../core/libs/three/main";
import { Object3D, Vector3, Camera, Vector2, Raycaster, Plane, Mesh, Box3, Material, Color } from "three";
import Scene3D from "../core/libs/three/objects/Scene3D";

export declare function getObject3D(name: string, scene?: any): any;
export declare function cloneAsset(name: string, scale?: number): any;
export declare function cloneAssetSkeleton(name: string, scale?: number): any;
export declare function getTexture3D(key: string): any;
export declare function getMaterial(key: string): any;
export declare function instantiatePrefab3D(key: string, props?: any): any;
export declare function addScript3D(obj: any, scripts: any[]): any;
export declare function getRenderer3D(): Renderer3D;
export declare function getMainCamera3D(): Camera | undefined;
export declare function startScene3D(name: string, removeActiveScenes?: boolean): any;
export declare function startScene3DByIndex(index: number, removeActiveScenes?: boolean): any;
export declare function removeScene3D(scene: any): void;
export declare function removeActiveScenes3D(): void;
export declare function getCurrentScene3D(): Scene3D;
export declare function getScene3DByName(name: string): Scene3D;
export declare function getScene3DList(): Scene3D[];
export declare function restartScene3D(): void;
export declare function goToScene3D(sceneName: string, scene2dIndex?: number): void;
export declare class Particle3D {
	static spawnAt(key: string, position: Vector3, scale: number, scene: Object3D): any;
	static attachTo(key: string, target: Object3D, offset: Vector3, scale: number, force?: number): any;
}

// #if process.projConfig.physics3DSettings.physicsType === "cannon"
import { Body, World } from "cannon-es";

interface CreateBodyFromObjOptions {
	mass?: number;
	type?: typeof Body.STATIC | typeof Body.DYNAMIC | typeof Body.KINEMATIC;
	addToWorld?: boolean;
	sizMult?: number;
	sizeVecMult?: Vector3;
	leaveBodyAtScene?: boolean;
	isTrigger?: boolean;
}

export declare const CannonHelpers: {
	createBodyFromObj(obj: Object3D, config?: CreateBodyFromObjOptions): Body;
	bodiesAreInContact(bodyA: Body, bodyB: Body): boolean;
	createBox(config?: CreateBoxOptions): Body;
	calculateVeloToReachTarget(startPos: any, targetPos: any, h?: number, gravity?: number): Vector3;
};

export declare const cannonPhysics: {
	world: World;
	clear(): void;
	setWorld(world: World): void;
};
// #endif

export declare class Toucher {
	mouse: Vector2;
	raycaster: Raycaster;
	camera: Camera;
	plane: Plane;
	planeVec3: Vector3;
	arrow?: any;

	constructor(camera: Camera, planeVec?: Vector3, offset?: Vector3);
	getMousePos(clientX: number, clientY: number): Vector2;
	getIntersects(moPosX: number, moPosY: number, objList: Object3D[], goDeep?: boolean): any[];
	raycastFromObject(origin: Vector3, dir: Vector3, far: number, objList: Object3D[]): any[];
	showArrow(): void;
	getIntersect(moPosX: number, moPosY: number, obj: Object3D): any[];
	getPlaneIntersection(moX: number, moY: number): Vector3;
	screenXY(pos: Vector3, camera?: Camera): Vector2;
}

interface CreateBoxOptions {
	w?: number;
	h?: number;
	d?: number;
	x?: number;
	y?: number;
	z?: number;
	color?: string;
	addToScene?: boolean;
	customMat?: Material;
}

interface CreateSphereOptions {
	radius?: number;
	widthSegments?: number;
	heightSegments?: number;
	x?: number;
	y?: number;
	z?: number;
	color?: string;
	addToScene?: boolean;
	customMat?: Material;
}

interface CreatePlaneOptions {
	w?: number;
	h?: number;
	x?: number;
	y?: number;
	z?: number;
	color?: string;
	addToScene?: boolean;
	customMat?: Material;
}

export declare class threeHelper {
	constructor();

	// Static methods
	static simpleShader(obj: Mesh): void;
	static moveToScene(obj: Object3D): void;
	static getWorldPosition(obj: Object3D): Vector3;
	static modelToBox3(obj: Object3D, showBox3?: boolean): [Vector3, Vector3, Box3];
	static takeSnapshot(objectList?: Object3D[], addLights?: boolean, cameraPos?: Vector3, resolution?: number): string;
	static addTrail(target: Object3D, trailHeadGeometry: any[], trailColor?: string, startAlpha?: number, endAlpha?: number, trailLength?: number): any;
	static sortByNameIndex(objList: Object3D[]): Object3D[];
	static screenXY(pos: Vector3, camera?: Camera): Vector2;
	static createBox(options?: CreateBoxOptions): Mesh;
	static createSphere(options?: CreateSphereOptions): Mesh;
	static createPlane(options?: CreatePlaneOptions): Mesh;
	static distCheck2d(pos1: Vector3, pos2: Vector3): number;

	// Instance methods
	addSimpleOutline(obj: Object3D, thickness?: number, outlineColor?: number): void;
}

// Script exports
export { default as Script3D } from "../core/libs/common/script/Script3D";
