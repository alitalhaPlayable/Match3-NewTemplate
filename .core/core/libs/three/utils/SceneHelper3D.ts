import { StudioObject3D } from "../objects/types";
import ThreeObjectFactory from "./ThreeObjectFactory";
import Scene3D from "../objects/Scene3D";
import Data3D from "./Data3D";
import { SceneHelperBase } from "../../common/scene";
import { Script } from "../../common/components";
import ScriptSystem from "../../common/script/ScriptSystem";
import { Object3D } from "three";
import ObjectHelper3D from "./ObjectHelper3D";
import { Scene3DSettings } from "../../common/types";
import { resize3D } from "../main";
import ObjectTypes from "core/libs/common/objectTypes";
import Cache3D from "./Cache3D";

class SceneHelper3D {
	static list: any = {};
	static currentScene: Scene3D;
	static sceneList: Map<string, Scene3D> = new Map();
	static persistentScene: Scene3D;

	static init() {}

	static initPersistentScene() {
		this.persistentScene = this.initScene(
			{
				name: "persistentScene",
				id: "persistentScene",
				persistent: true,
				root: {
					children: [],
				},
			},
			false,
			false
		);
		this.persistentScene.persistent = true;
	}

	static initSceneByIndex(index: number, removeActiveScenes = true, runScripts = false) {
		const data = Data3D.getSceneDataByIndex(index);
		this.currentScene = this.initScene(data, removeActiveScenes, runScripts);
	}

	static initSceneByName(name: string, removeActiveScenes = true, runScripts = false) {
		const data = Data3D.getSceneDataByName(name);
		this.currentScene = this.initScene(data, removeActiveScenes, runScripts);
	}

	static initScene(data: any, removeActiveScenes = true, runScripts = false) {
		if (removeActiveScenes) {
			this.removeActiveScenes();
		}

		const isPersistent = data.persistent;
		const scene = new Scene3D(isPersistent);
		scene.name = data.name;
		scene.sID = data.id;
		ObjectHelper3D.objectByScene.set(scene, []);
		this.currentScene = scene;

		data.root.children.forEach((child: any) => {
			this.addObjects(child, scene, scene);
		});

		data.root.children.forEach((data: any) => {
			const obj = ObjectHelper3D.getObjectById(data.id)!;
			obj.updateComponents(data.components);
		});

		this.sceneList.set(scene.sID, scene);

		scene.onSceneInited(data.settings as Scene3DSettings);

		resize3D();

		if (this.persistentScene) {
			this.sceneList.delete(this.persistentScene.sID);
			this.sceneList.set(this.persistentScene.sID, this.persistentScene);
		}

		if (this.sceneList.size > 2 || runScripts) {
			ScriptSystem.script3d.awakeAll(scene);
			ScriptSystem.script3d.initAll(scene);
		}

		return scene;
	}

	static getSceneByName(name: string) {
		for (const scene of this.sceneList.values()) {
			if (scene.name === name) {
				return scene;
			}
		}
		return null;
	}

	static removeScene(scene: Scene3D) {
		scene.destroy();
	}

	static removeSceneByName(name: string) {
		const scene = this.getSceneByName(name);
		if (scene) {
			this.removeScene(scene);
		}
	}

	static removeActiveScenes() {
		const keys = [...this.sceneList.keys()];
		keys.forEach((key) => {
			const scene = this.sceneList.get(key);
			if (scene && scene !== this.persistentScene) {
				this.removeScene(scene!);
			}
		});
		this.sceneList.clear();
	}

	static buildInlineModelCacheMap(node: any, inheritedCache: any = null, map = new Map<string, any>()) {
		let currentCache = inheritedCache;

		// If this node is an INLINE_MODEL, update the inheritance
		if (node.type === ObjectTypes.INLINE_MODEL) {
			const modelUUID = node.components.inlineModel?.modelUUID ?? "";
			currentCache = Cache3D.getModel(modelUUID);
			map.set(node.id, currentCache); // Use this as the new inherited cache
		} else if (node.type === ObjectTypes.MESH && node.components.mesh?.parentUUID) {
			// MESH nodes get their own cache, but do NOT affect inheritance
			const meshCache = Cache3D.getModel(node.components.mesh.parentUUID);
			map.set(node.id, meshCache); // Store specific cache for this node only
		} else {
			// Other nodes inherit from parent INLINE_MODEL
			map.set(node.id, currentCache);
		}

		// Recurse
		for (const child of node.children ?? []) {
			this.buildInlineModelCacheMap(child, currentCache, map);
		}

		return map;
	}

	static addObjects(node: any, parent: Object3D, parentScene: Scene3D) {
		const cacheMap = SceneHelper3D.buildInlineModelCacheMap(node);
		return SceneHelper3D.addGameObject(node, parent, parentScene, cacheMap);
	}

	static addGameObject(data: any, parent: Object3D, parentScene: Scene3D, cacheMap?: any) {
		let obj: Object3D;
		if (cacheMap) {
			const cachedObject = cacheMap.get(data.id);
			obj = ThreeObjectFactory.add(data, cachedObject);
		} else {
			obj = ThreeObjectFactory.add(data);
		}
		if (!obj) return;

		obj.sID = data.id;
		obj.name = data.name;
		parent.add(obj);
		obj.updateComponents(data.components);

		if (data.components.scripts) {
			obj.components.add("scripts");

			const scripts = data.components.scripts.scripts;
			const scriptList = Object.values(scripts);
			scriptList.sort((a: any, b: any) => a.order - b.order);
			for (const scriptData of scriptList) {
				ScriptSystem.script3d.createEntityFromData(obj, scriptData as Script);
			}
		}

		if (data.type === ObjectTypes.QUARKS_PARTICLE) {
			if (parentScene.quarksScene) {
				parentScene.quarksScene.add(obj);
			}
		}

		ObjectHelper3D.addObject(obj, parentScene);

		if (data.children) {
			data.children.forEach((child: any) => {
				this.addGameObject(child, obj, parentScene, cacheMap);
			});
		}
		return obj;
	}

	static addPersistentGameObject(obj: StudioObject3D) {
		ObjectHelper3D.addObject(obj, this.persistentScene);
		this.persistentScene.add(obj);
	}
}

export default SceneHelper3D;
