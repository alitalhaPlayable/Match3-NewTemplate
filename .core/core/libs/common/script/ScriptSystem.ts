import { StudioObject2D } from "../../pixi/objects/types";
import { StudioObject3D } from "../../three/objects/types";
import { Script, ScriptVariables } from "../components";
import ScriptBase from "./ScriptBase";
import Scriptable from "./Scriptable";
import ScriptPool from "./../../../../../assets/.core/templateScriptsData";
import { ObjectHelperBase, SceneHelperBase } from "../scene";
import Components3D from "core/libs/three/objects/components/components";
import globals from "@globals";

export default class ScriptSystem {
	static script3d: ScriptSystem;
	static script2d: ScriptSystem;

	sceneHelper: SceneHelperBase;
	objectManager: any;
	constructor(sceneHelper: SceneHelperBase, objectManager: any) {
		this.sceneHelper = sceneHelper;
		this.objectManager = objectManager;
	}

	//for in game object creation with scripts
	createEntityWithComponents(obj: StudioObject2D | StudioObject3D, components: any[]) {
		if (!obj.components) {
			obj.components = new Components3D(obj as any);
		}

		const scriptComp: Scriptable = obj.components.add("scripts")!;
		for (let i = 0; i < components.length; i++) {
			scriptComp.add(components[i]);
		}

		scriptComp.awake();

		this.objectManager.addObject(obj as StudioObject3D, globals.threeScene);

		return obj;
	}

	createEntityFromData(obj: StudioObject2D | StudioObject3D, scriptData: Script) {
		let loadedScript = ScriptPool[scriptData.id];
		if (!loadedScript) {
			console.log("Script not found", scriptData.id);
			return;
		}
		if (scriptData.isActive === false) return;
		loadedScript = loadedScript.default || loadedScript;
		const script: ScriptBase = new loadedScript();
		obj.components.add("scripts")!.add(script, (scriptData as Script).variables, this.objectManager);
	}

	awakeAll(scene?: any) {
		if (scene) {
			[...scene.gameObjects].forEach((obj) => {
				obj.components.scripts?.initEditorVariables();
			});
			[...scene.gameObjects].forEach((obj) => {
				obj.components.scripts?.awake();
			});
		} else {
			this.sceneHelper.sceneList.forEach((scene) => {
				[...scene.gameObjects].forEach((obj) => {
					obj.components.scripts?.initEditorVariables();
				});
			});

			this.sceneHelper.sceneList.forEach((scene) => {
				[...scene.gameObjects].forEach((obj) => {
					obj.components.scripts?.awake();
				});
			});
		}
	}

	initAll(scene?: any) {
		if (scene) {
			[...scene.gameObjects].forEach((obj) => {
				obj.components.scripts?.init();
			});
		} else {
			this.sceneHelper.sceneList.forEach((scene) => {
				[...scene.gameObjects].forEach((obj) => {
					obj.components.scripts?.init();
				});
			});
		}
	}
}
