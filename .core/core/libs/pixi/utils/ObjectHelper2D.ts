import { Responsive2DGC } from "../../common/components";
// eslint-disable-next-line import/no-cycle
import Layout2D from "../objects/Layout2D";
// eslint-disable-next-line import/no-cycle
import Scene2D from "../objects/Scene2D";
import { StudioObject2D } from "../objects/types";

class ObjectHelper2D {
	static objects: Map<string, StudioObject2D> = new Map();
	static maskObjects: any = [];
	static rootScene: any = null;
	static objectByScene: Map<Scene2D, StudioObject2D[]> = new Map();

	static setMaskObjects(objects: any[]) {
		objects.forEach((obj) => {
			if (this.maskObjects.indexOf(obj) === -1) {
				this.maskObjects.push(obj);
			}
		});
	}

	static addObject(obj: StudioObject2D, scene: Scene2D) {
		const { id } = obj;
		if (!id) {
			throw new Error("Object ID is not set");
		}

		this.objects.set(id, obj);
		if (!this.objectByScene.has(scene)) {
			this.objectByScene.set(scene, []);
		}
		this.objectByScene.get(scene)!.push(obj);
		obj.parentScene = scene;
	}

	static removeObject(obj?: StudioObject2D) {
		if (!obj) return;
		const res = this.objects.delete(obj.id);
		if (res) {
			const scene = obj.parentScene;
			this.objectByScene.get(scene)!.splice(this.objectByScene.get(scene)!.indexOf(obj), 1);
			obj.parentScene = null;
			obj.components.removeAll();

			// remove children
			if (obj.children) {
				obj.children.forEach((child) => {
					this.removeObject(child as StudioObject2D);
				});
			}
		}
		return res;
	}

	static removeObjectById(id: string) {
		this.removeObject(this.objects.get(id));
	}

	static getObjectById(id: string) {
		return this.objects.get(id);
	}

	static getNodeByLabel(label: string, scene?: Scene2D) {
		return this.getObjectByName(label, scene);
	}

	static getNodesByLabel(label: string, scene?: Scene2D) {
		let objs = [];
		if (scene) {
			objs = this.objectByScene.get(scene);
		} else { 
			objs = Array.from(this.objects.values());
		}
		return objs.filter((obj) => obj.label === label);
	}

	static getObjectByName(name: string, scene?: Scene2D): StudioObject2D | undefined {
		if (scene) {
			const objs = this.objectByScene.get(scene);
			if (objs) {
				for (const obj of objs) {
					if (obj.label === name) {
						return obj;
					}
				}
			}
		}
		let returnedObj: StudioObject2D | undefined;
		this.objects.forEach((obj) => {
			if (obj.label === name) {
				returnedObj = obj;
			}
		});

		return returnedObj;
	}

	static getObjectByType<T extends StudioObject2D>(type: new () => T): T | undefined {
		for (const obj of this.objects.values()) {
			if (obj instanceof type) {
				return obj;
			}
		}
		return undefined;
	}

	static getObjectsByType<T extends StudioObject2D>(type: new () => T): T[] | undefined {
		const objs: T[] = [];
		for (const obj of this.objects.values()) {
			if (obj instanceof type) {
				objs.push(obj);
			}
		}
		return objs;
	}

	static getSceneObjects(scene: Scene2D) {
		return this.objectByScene.get(scene);
	}

	static maskOfXObject(maskObj: any): number {
		let counter = 0;
		this.objects.forEach((obj) => {
			if (obj.mask && obj.mask === maskObj) {
				counter++;
			}
		});

		return counter;
	}

	static removeMaskObject(obj: any) {
		const index = this.maskObjects.indexOf(obj);
		if (index > -1) {
			this.maskObjects.splice(index, 1);
		}
	}

	static getNodeById(id: string) {
		return this.objects.get(id);
	}

	static getObjects() {
		return this.objects;
	}

	static getMaskObjects() {
		return this.maskObjects;
	}

	static resizeAll() {
		this.objects.forEach((obj) => {
			if (obj.components.responsive) {
				obj.components.responsive.update();
			}

			if (obj.type === "layout2D") {
				const layoutObj = obj as Layout2D;
				layoutObj.updateLayoutComponent(layoutObj.getLayoutComponent());
			}
		});
	}

	static resizeDependents(id: string) {
		const values = this.objects instanceof Map ? Array.from(this.objects.values()) : Object.values(this.objects);

		const filteredObj = values.filter((node: any) => {
			if (!node.components.responsive) return false;

			const componentData = node.components.responsive.componentData as Responsive2DGC;

			if (componentData) {
				const curData = Object.values(componentData.resizes).find((data) => data.isActive);
				if (!curData) return false;
				const orientedData = curData[curData.selected];
				const { referenceBottom, referenceTop, referenceLeft, referenceRight } = orientedData;
				if ([referenceBottom, referenceTop, referenceLeft, referenceRight].includes(id)) {
					return true;
				}
			}
			return false;
		});

		if (!filteredObj || filteredObj.length === 0) return;

		filteredObj.forEach((obj: any) => {
			if (obj.components.responsive) {
				obj.components.responsive.update(obj.components.responsive.componentData as Responsive2DGC);
			}
		});
	}

	static update(delta: number) {
		this.objects.forEach((obj) => {
			obj.customUpdate?.(delta);
		});
	}
}

export default ObjectHelper2D;
