// This file contains the actual implementations
// It's not included in the main tsconfig, so TypeScript won't scan it

import {
	getObject3D as _getObject3D,
	cloneAsset as _cloneAsset,
	cloneAssetSkeleton as _cloneAssetSkeleton,
	getTexture3D as _getTexture3D,
	getMaterial as _getMaterial,
	instantiatePrefab3D as _instantiatePrefab3D,
	addScript as _addScript,
	Particle3D as _Particle3D,
	getRenderer3D as _getRenderer3D,
	getMainCamera3D as _getMainCamera3D,
	startScene3D as _startScene3D,
	startScene3DByIndex as _startScene3DByIndex,
	removeScene3D as _removeScene3D,
	removeActiveScenes3D as _removeActiveScenes3D,
	getCurrentScene3D as _getCurrentScene3D,
	getSceneByName as _getSceneByName,
	getSceneList as _getSceneList,
	restartScene3D as _restartScene3D,
	goToScene3D as _goToScene3D,
} from "../core/libs/three/utils/utils3D";

// #if process.projConfig.physics3DSettings.physicsType === "cannon"
import CannonHelpers from "../core/libs/three/utils/physics/cannon/cannonHelpers";
import Physics3DManager from "../core/libs/three/utils/physics/Physics3DManager";
const cannonPhysics = Physics3DManager.cannonPhysics;
export { CannonHelpers, cannonPhysics };
// #endif

// Re-export the actual implementations
export const getObject3D = _getObject3D;
export const cloneAsset = _cloneAsset;
export const cloneAssetSkeleton = _cloneAssetSkeleton;
export const getTexture3D = _getTexture3D;
export const getMaterial = _getMaterial;
export const instantiatePrefab3D = _instantiatePrefab3D;
export const addScript3D = _addScript;
export const getRenderer3D = _getRenderer3D;
export const getMainCamera3D = _getMainCamera3D;
export const Particle3D = _Particle3D;
export const startScene3D = _startScene3D;
export const startScene3DByIndex = _startScene3DByIndex;
export const removeScene3D = _removeScene3D;
export const removeActiveScenes3D = _removeActiveScenes3D;
export const getCurrentScene3D = _getCurrentScene3D;
export const getScene3DByName = _getSceneByName;
export const getScene3DList = _getSceneList;
export const restartScene3D = _restartScene3D;
export const goToScene3D = _goToScene3D;

export { default as Toucher } from "../core/libs/three/utils/toucher";
export { default as threeHelper } from "../core/libs/three/utils/threeHelper";

// Script exports
export { default as Script3D } from "../core/libs/common/script/Script3D";
