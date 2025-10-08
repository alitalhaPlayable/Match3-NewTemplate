import { Application, Container } from "pixi.js";
import { StudioObject2D } from "../objects/types";
import PixiObjectFactory from "./PixiObjectFactory";
import Data2D from "./Data2D";
import ObjectHelper2D from "./ObjectHelper2D";
import Scene2D from "../objects/Scene2D";
import ScriptSystem from "../../common/script/ScriptSystem";
import { Script } from "../../common/components";
import { getRootScene } from "core/libs/common/editorGlobals";
import globals from "@globals";
import { resize2D } from "../main";

// #if process.projConfig.physics2DSettings.physicsType !== "none"
import Physics2D from "./Physics2D";
// #endif

interface SceneData {
	id: string;
	index: number;
	name: string;
	children: any[];
}

class SceneHelper2D {
	static list: any = {};
	static currentScene: Scene2D;
	static sceneList: Map<string, Scene2D> = new Map();
	static application: Application;

	static init(application: Application) {
		this.application = application;
	}

	static initSceneByIndex(index: number, removeActiveScenes = false, runScripts = false) {
		const data = Data2D.getSceneDataByIndex(index);
		return this.initScene(data, removeActiveScenes, runScripts);
	}

	static initSceneByName(name: string, removeActiveScenes = false, runScripts = false) {
		const data = Data2D.getSceneDataByName(name);
		return this.initScene(data, removeActiveScenes, runScripts);
	}

	static initScene(data: any, removeActiveScenes = false, runScripts = false) {
		if (removeActiveScenes) {
			this.removeActiveScenes();
		}

		const scene = new Scene2D();
		scene.name = data.name;
		scene.label = data.name;
		scene.id = data.id;
		ObjectHelper2D.objectByScene.set(scene, []);

		const isEndcardScene = data.settings?.isEndcard || data.settings?.sceneType === "endcard";

		if (isEndcardScene) {
			// @ts-ignore
			globals.end(!!globals[data.settings.winParameter]);
		}

		data.root.children.forEach((child: any) => {
			this.addGameObject(child, scene, scene, false);
		});

		const objects = ObjectHelper2D.objectByScene.get(scene)!;
		objects.forEach((obj) => {
			if (obj.componentsData) {
				obj!.updateComponents(obj.componentsData);
			}
		});
		// data.root.children.forEach((data: any) => {
		// 	const obj = ObjectHelper2D.getObjectById(data.id);
		// 	obj!.updateComponents(data.components);
		// });

		this.currentScene = scene;
		this.sceneList.set(scene.id, scene);
		this.application.stage.addChild(scene);

		scene.onSceneInited();

		if (data.settings.enablePhysics2D) {
			// #if process.projConfig.physics2DSettings.physicsType !== "none"
			const physicsWrapper = ObjectHelper2D.getObjectById(data.settings.physicsWorld2D);
			const physics2D = new Physics2D({ physicsParent: physicsWrapper || scene });
			physics2D.startPhysicsSystem("box2d");
			scene.physics2d = physics2D.getPhysicsSystem();
			// #endif
		}

		const rootScene = getRootScene();
		scene.resize(rootScene.baseWidth, rootScene.baseHeight);

		if (this.sceneList.size > 1 || runScripts) {
			ScriptSystem.script2d.awakeAll(scene);
			ScriptSystem.script2d.initAll(scene);
		}

		resize2D(globals.screenWidth, globals.screenHeight);
		return scene;
	}

	static getSceneByName(name: string) {
		return [...this.sceneList.values()].find((scene) => scene.name === name);
	}

	static removeScene(scene: Scene2D) {
		scene.destroy({ children: true });
		this.sceneList.delete(scene.id);
	}

	static removeSceneByName(name: string) {
		const scene = this.getSceneByName(name);
		if (scene) {
			this.removeScene(scene);
		}
	}

	static removeActiveScenes() {
		this.sceneList.forEach((scene) => {
			this.removeScene(scene);
		});
	}

	static addGameObject(data: any, parent: Container, parentScene: Scene2D, updateComponents = true) {
		const children = data.children;

		// @ts-ignore
		const obj: StudioObject2D = PixiObjectFactory.add(data);
		if (!obj) return;

		obj.id = data.id;
		parent.addChild(obj);
		if (updateComponents) {
			obj.updateComponents(data.components);
		}

		if (data.components.scripts) {
			obj.components.add("scripts");

			const scripts = data.components.scripts.scripts;
			const scriptList = Object.values(scripts);
			scriptList.sort((a: any, b: any) => a.order - b.order);
			for (const scriptData of scriptList) {
				ScriptSystem.script2d.createEntityFromData(obj, scriptData as Script);
			}
		}

		ObjectHelper2D.addObject(obj, parentScene);

		if (children) {
			children.forEach((child: any) => {
				this.addGameObject(child, obj, parentScene, updateComponents);
			});
		}
		return obj;
	}
}

export default SceneHelper2D;
