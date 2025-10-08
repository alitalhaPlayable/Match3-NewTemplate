import Scene3D from "../objects/Scene3D";
import { StudioObject3D } from "../objects/types";
import SceneHelper3D from "./SceneHelper3D";

class ObjectHelper3D {
	static objects: Map<string, StudioObject3D> = new Map();
	static objectByScene: Map<Scene3D, StudioObject3D[]> = new Map();

	static addObject(obj: StudioObject3D, scene: Scene3D) {
		if (!obj.sID) {
			obj.sID = obj.id.toString();
		}
		const sID = obj.sID;
		if (!sID) {
			throw new Error("Object ID is not set");
		}

		this.objects.set(sID, obj);
		if (!this.objectByScene.has(scene)) {
			this.objectByScene.set(scene, []);
		}

		if (obj.parentScene) {
			const oldScene = obj.parentScene;
			this.objectByScene.get(oldScene)!.splice(this.objectByScene.get(oldScene)!.indexOf(obj), 1);
		}

		this.objectByScene.get(scene)!.push(obj);
		obj.parentScene = scene;
	}

	static removeObject(obj?: StudioObject3D) {
		if (!obj) return;

		obj.destroy();
	}

	static removeFromList(obj?: StudioObject3D) {
		if (!obj) return;
		const res = this.objects.delete(obj.sID);
		if (res) {
			const scene = obj.parentScene;
			scene && this.objectByScene.get(scene)!.splice(this.objectByScene.get(scene)!.indexOf(obj), 1);
			obj.parentScene = null;
		}
		return res;
	}

	static removeObjectById(id: string) {
		this.removeObject(this.objects.get(id));
	}

	static getObjectById(id: string) {
		return this.objects.get(id);
	}

	static getObjectByName(name: string, scene?: Scene3D) {
		let objs;
		if (scene) {
			objs = this.objectByScene.get(scene);
			if (!objs) {
				console.log("Scene not found");
				return undefined;
			}
		}

		if (!objs) {
			objs = this.objects;
		}

		let returnedObj: StudioObject3D | undefined;
		for (const obj of objs.values()) {
			if (obj.name === name) {
				returnedObj = obj;
			}
		}
		return returnedObj;
	}

	static getObjectByType<T extends StudioObject3D>(type: new () => T, scene?: Scene3D): T | undefined {
		let objs;
		if (scene) {
			objs = this.objectByScene.get(scene);
			if (!objs) {
				console.log("Scene not found");
				return undefined;
			}
		}

		if (!objs) {
			objs = this.objects;
		}

		for (const obj of objs.values()) {
			if (obj instanceof type) {
				return obj;
			}
		}
		return undefined;
	}

	static getObjectsByType<T extends StudioObject3D>(type: new () => T, scene?: Scene3D): T[] | undefined {
		let objs;
		if (scene) {
			objs = this.objectByScene.get(scene);
			if (!objs) {
				console.log("Scene not found");
				return undefined;
			}
		}

		if (!objs) {
			objs = this.objects;
		}

		const exportedObjs: T[] = [];
		for (const obj of objs.values()) {
			if (obj instanceof type) {
				exportedObjs.push(obj);
			}
		}
		return exportedObjs;
	}

	static getSceneObjects(scene: Scene3D) {
		return this.objectByScene.get(scene);
	}

	static getNodeById(id: string) {
		return this.objects.get(id);
	}

	static getObjects() {
		return this.objects;
	}

	static DoNotDestroyOnLoad(obj: StudioObject3D) {
		SceneHelper3D.addPersistentGameObject(obj);
	}
}

export default ObjectHelper3D;
