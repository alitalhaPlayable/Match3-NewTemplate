import Scene3D from ".core/core/libs/three/objects/Scene3D";
import {
	getObject3D,
	getTexture3D,
	getMaterial,
	cloneAsset,
	cloneAssetSkeleton,
	instantiatePrefab3D,
	startScene3D,
	startScene3DByIndex,
	removeScene3D,
	removeActiveScenes3D,
	getCurrentScene3D,
	getScene3DByName,
	getScene3DList,
} from "utils3D";

export class SceneManager3D {
	static start(name: string, removeActiveScenes = false): any {
		return startScene3D(name, removeActiveScenes);
	}
	static startByIndex(index: number, removeActiveScenes = false): any {
		return startScene3DByIndex(index, removeActiveScenes);
	}
	static remove(scene: any): void {
		return removeScene3D(scene);
	}
	static removeActiveScenes(): void {
		return removeActiveScenes3D();
	}
	static getByName(name: string): Scene3D {
		return getScene3DByName(name);
	}
	static getList(): Scene3D[] {
		return getScene3DList();
	}
	get current(): Scene3D {
		return getCurrentScene3D();
	}
}

export class studio3D {
	static getObject(name: string, scene?: any): any {
		return getObject3D(name, scene);
	}

	static assets = {
		getTexture: (name: string): any => {
			return getTexture3D(name);
		},
		getMaterial: (name: string): any => {
			return getMaterial(name);
		},
		cloneAsset: (name: string, scale?: number): any => {
			return cloneAsset(name, scale);
		},
		cloneAssetSkeleton: (name: string, scale?: number): any => {
			return cloneAssetSkeleton(name, scale);
		},
		instantiatePrefab: (name: string, props?: any): any => {
			return instantiatePrefab3D(name, props);
		},
	};

	static scene = SceneManager3D;

	// Instance methods for interface compatibility
	getObject(name: string, scene?: any): any {
		return studio3D.getObject(name, scene);
	}

	get assets() {
		return studio3D.assets;
	}

	get scene() {
		return studio3D.scene;
	}
}

export default studio3D;
