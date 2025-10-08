//import Script2D from "core/libs/common/script/Script2D";
import Scene2D from "../objects/Scene2D";
import { StudioObject2D } from "../objects/types";
import Cache2D from "./Cache2D";
import Data2D from "./Data2D";
import ObjectHelper2D from "./ObjectHelper2D";
import PixiObjectFactory from "./PixiObjectFactory";
import SceneHelper2D from "./SceneHelper2D";
import globals from "@globals";
import { Container } from "pixi.js";
import { v4 as uuidv4 } from "uuid";
import { setGlobalFont as _setGlobalFont } from "../../common/editorGlobals";
import { getRenderer2D as getRenderer2DMain, Renderer2D } from "../main";

export function getObject2D(name: string, scene?: Scene2D) {
	return ObjectHelper2D.getNodeByLabel(name, scene); // ??
}
export function getTexture2D(key: string) {
	return Cache2D.getTexture(key);
}
export function getAnimation2D(key: string) {
	return Cache2D.getAnimation(key);
}
export function getSpine2D(key: string) {
	return Cache2D.getSpine(key);
}
export function instantiatePrefab2D(
	key: string,
	props?: any,
	transform?: {
		x: number;
		y: number;
		scale: number;
		rotation: number;
		angle: number;
		parent: string | Container;
		categoryBits?: number;
		maskBits?: [number];
	}
) {
	const prefabData = Data2D.getPrefab(key);
	if (!prefabData) {
		console.warn(`Prefab with key "${key}" not found.`);
		return null;
	}
	const lastScene = SceneHelper2D.currentScene;
	const data = JSON.parse(JSON.stringify(prefabData?.root.children[0]));
	data.id = uuidv4();

	const node2D = data.components?.node2D;

	if (node2D) {
		node2D.position.x = transform?.x ?? node2D.position.x;
		node2D.position.y = transform?.y ?? node2D.position.y;
		node2D.scale.x = transform?.scale ?? node2D.scale.x;
		node2D.scale.y = transform?.scale ?? node2D.scale.y;
		node2D.rotation = transform?.rotation ?? node2D.rotation;
		node2D.angle = transform?.angle ?? node2D.angle;

		let physics = data.components?.physics;

		if (physics) {
			// physics.shape.position = { x: node2D.position.x, y: node2D.position.y };
			// physics.shape.angle = node2D.angle;
			physics.shape.radius *= node2D.scale.x;
			physics.shape.width *= node2D.scale.x;
			physics.shape.height *= node2D.scale.y;

			if (transform?.categoryBits) {
				physics.categoryBits = transform.categoryBits;
			}
			if (transform?.maskBits) {
				physics.maskBits = transform.maskBits;
			}
		}
	}

	let parent: Container = lastScene;
	if (transform?.parent) {
		parent = (typeof transform.parent === "string" ? getObject2D(transform.parent, lastScene) : transform.parent) || lastScene;
	}

	const obj = SceneHelper2D.addGameObject(data, parent, lastScene);
	if (obj?.components.scripts) {
		obj.components.scripts.awake(props);
		//init called just before update for runtime generated objects
	}

	obj?.traverse((node) => {
		if (node.components?.defaults?.node2D) {
			node.updateComponents({
				node2D: node.components.defaults.node2D,
			});
		}
	});

	return obj;
}

export function addScript(obj: StudioObject2D, scripts: any[]) {
	//May broke something without null check of globals.pixiMain
	return (globals.pixiMain as Renderer2D).scriptSystem.createEntityWithComponents(obj as any, scripts);
}

export function getApplication() {
	return SceneHelper2D.application;
}

export function setGlobalFont(id: string) {
	_setGlobalFont(id);
}

/* SCENES */
export function startScene2D(name: string, removeActiveScenes = false) {
	return SceneHelper2D.initSceneByName(name, removeActiveScenes, true);
}

export function startScene2DByIndex(index: number, removeActiveScenes = false) {
	return SceneHelper2D.initSceneByIndex(index, removeActiveScenes, true);
}

export function getScene2DByName(name: string) {
	return SceneHelper2D.getSceneByName(name);
}

export function getScene2DByIndex(index: number) {
	const scenes = Array.from(SceneHelper2D.sceneList.values());
	return scenes[index];
}

export function removeScene2D(scene: Scene2D) {
	SceneHelper2D.removeScene(scene);
}

export function removeActiveScenes2D() {
	SceneHelper2D.removeActiveScenes();
}

export function getCurrentScene2D() {
	return SceneHelper2D.currentScene;
}

export function getRenderer2D() {
	return getRenderer2DMain();
}
