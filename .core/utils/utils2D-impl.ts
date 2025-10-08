// This file contains the actual implementations
// It's not included in the main tsconfig, so TypeScript won't scan it

import {
	getObject2D as _getObject2D,
	getTexture2D as _getTexture2D,
	getAnimation2D as _getAnimation2D,
	getSpine2D as _getSpine2D,
	instantiatePrefab2D as _instantiatePrefab2D,
	addScript as _addScript,
	getApplication as _getApplication,
	setGlobalFont as _setGlobalFont,
	startScene2D as _startScene2D,
	startScene2DByIndex as _startScene2DByIndex,
	getScene2DByName as _getScene2DByName,
	getScene2DByIndex as _getScene2DByIndex,
	removeScene2D as _removeScene2D,
	removeActiveScenes2D as _removeActiveScenes2D,
	getCurrentScene2D as _getCurrentScene2D,
	getRenderer2D as _getRenderer2D,
} from "../core/libs/pixi/utils/utils2D";

// Re-export the actual implementations
export const getObject2D = _getObject2D;
export const getTexture2D = _getTexture2D;
export const getAnimation2D = _getAnimation2D;
export const getSpine2D = _getSpine2D;
export const instantiatePrefab2D = _instantiatePrefab2D;
export const addScript2D = _addScript;
export const getApplication = _getApplication;
export const setGlobalFont = _setGlobalFont;
export const startScene2D = _startScene2D;
export const startScene2DByIndex = _startScene2DByIndex;
export const getScene2DByName = _getScene2DByName;
export const getScene2DByIndex = _getScene2DByIndex;
export const removeScene2D = _removeScene2D;
export const removeActiveScenes2D = _removeActiveScenes2D;
export const getCurrentScene2D = _getCurrentScene2D;
export const getRenderer2D = _getRenderer2D;

// Script exports
export { default as Script2D } from "../core/libs/common/script/Script2D";
export { ShuraContainer, ShuraParticle, ShuraEmitterUpdateModuleBase, ShuraParticleSpawnModuleBase, ShuraParticleUpdateModuleBase } from "../core/libs/pixi/utils/shura-particle-system";
export { TutorialHandler } from "../core/libs/pixi/utils/TutorialHandler";
export type { TutorialHandlerSettings } from "../core/libs/pixi/utils/TutorialHandler";