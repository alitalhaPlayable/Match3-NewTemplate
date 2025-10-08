import Cache3D from "core/libs/three/utils/Cache3D";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import Data3D from "./Data3D";
import SceneHelper3D from "./SceneHelper3D";
import Scene3D from "../objects/Scene3D";
import ObjectHelper3D from "./ObjectHelper3D";
import Script3D from "core/libs/common/script/Script3D";
import globals from "@globals";
import { StudioObject3D } from "../objects/types";
import { Object3D, Vector3, Camera } from "three";
import ParticlePool from "./quarks/ParticlePool.js";
import { getRenderer3D as getRenderer3DMain } from "core/libs/three/main";
import SceneManager3D from "core/libs/common/SceneManager3D";

export function getObject3D(name: string, scene?: Scene3D) {
	return ObjectHelper3D.getObjectByName(name, scene); // ??
}

export function cloneAsset(name: string, scale: number = 1) {
	const orgAsset = Cache3D.getModel(name);
	if (!orgAsset) {
		console.error("Asset not found", name);
		return null;
	}

	const clonedAsset = orgAsset.scene.clone();
	if (orgAsset.animations) {
		clonedAsset.animations = orgAsset.animations;
	}

	clonedAsset.scale.multiplyScalar(scale);
	return clonedAsset;
}

export function cloneAssetSkeleton(name: string, scale: number = 1) {
	const orgAsset = Cache3D.getModel(name);
	if (!orgAsset) {
		console.error("Asset not found", name);
		return null;
	}

	const clonedAsset = SkeletonUtils.clone(orgAsset.scene);
	if (orgAsset.animations) {
		clonedAsset.animations = orgAsset.animations;
	}
	clonedAsset.scale.multiplyScalar(scale);
	return clonedAsset;
}

export function getTexture3D(key: string) {
	const texture = Cache3D.getTexture(key);
	return texture;
}

export function getMaterial(key: string) {
	return Cache3D.getMaterial(key);
}

export function instantiatePrefab3D(key: string, props?: any) {
	const prefabData = Data3D.getPrefab(key);
	const lastScene = SceneHelper3D.currentScene;
	const obj = SceneHelper3D.addObjects(prefabData?.root.children[0], lastScene, lastScene);

	if (obj?.components.scripts) {
		obj.components.scripts.awake(props);
		//init called just before update for runtime generated objects
	}

	return obj;
}

export function addScript(obj: StudioObject3D, scripts: Script3D[]) {
	return globals.threeMain.scriptSystem.createEntityWithComponents(obj as any, scripts);
}

export function getRenderer3D() {
	return getRenderer3DMain();
}

export function getMainCamera3D(): Camera | undefined {
	return SceneHelper3D.currentScene?.mainCamera;
}

export class Particle3D {
	static spawnAt(key: string, position: Vector3, scale: number, scene: Object3D) {
		return ParticlePool.spawnAt(key, position, scale, scene);
	}
	static attachTo(key: string, target: Object3D, offset: Vector3, scale: number, force: number = 0) {
		return ParticlePool.attachTo(key, target, {
			offset,
			scale,
			force,
		});
	}
}

/* SCENES */
export function startScene3D(name: string, removeActiveScenes = false) {
	return SceneHelper3D.initSceneByName(name, removeActiveScenes, true);
}

export function startScene3DByIndex(index: number, removeActiveScenes = false) {
	return SceneHelper3D.initSceneByIndex(index, removeActiveScenes, true);
}

export function removeScene3D(scene: Scene3D) {
	SceneHelper3D.removeScene(scene);
}

export function removeActiveScenes3D() {
	SceneHelper3D.removeActiveScenes();
}

export function getCurrentScene3D() {
	return SceneHelper3D.currentScene;
}

export function getSceneByName(name: string) {
	return SceneHelper3D.getSceneByName(name);
}

export function getSceneList() {
	return Array.from(SceneHelper3D.sceneList.values());
}

export function restartScene3D() {
	SceneManager3D.restartScene();
}

export function goToScene3D(sceneName: string, scene2dIndex: number = 0) {
	SceneManager3D.goToScene(sceneName, scene2dIndex);
}
