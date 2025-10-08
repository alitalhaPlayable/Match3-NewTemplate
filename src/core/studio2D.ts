import Scene2D from "../../.core/core/libs/pixi/objects/Scene2D";
import { getAnimation2D, getObject2D, getScene2DByIndex, getScene2DByName, getSpine2D, getTexture2D, removeActiveScenes2D, removeScene2D, startScene2D, startScene2DByIndex } from "utils2D";

export interface IStudio2D {
	getObject(name: string, scene?: any): any;
	assets: {
		getTexture(name: string): any;
		getSpine(name: string): any;
		getAnimation(name: string): any;
	};
	scene: {
		start(name: string, removeActiveScenes?: boolean): any;
		startByIndex(index: number, removeActiveScenes?: boolean): any;
		getByName(name: string): Scene2D;
		getByIndex(index: number): Scene2D;
		remove(scene: any): void;
		removeActiveScenes(): void;
		current: any;
	};
}

export class SceneManager2D {
	static start(name: string, removeActiveScenes = false): Scene2D {
		return startScene2D(name, removeActiveScenes);
	}
	static startByIndex(index: number, removeActiveScenes = false): Scene2D {
		return startScene2DByIndex(index, removeActiveScenes);
	}
	static getByName(name: string): Scene2D {
		return getScene2DByName(name);
	}
	static getByIndex(index: number): Scene2D {
		return getScene2DByIndex(index);
	}
	static remove(scene: any): void {
		return removeScene2D(scene);
	}
	static removeActiveScenes(): void {
		return removeActiveScenes2D();
	}
	get current(): Scene2D {
		return getObject2D("currentScene");
	}
}

export class studio2D {
	static getObject(name: string, scene?: any): any {
		return getObject2D(name, scene);
	}

	static assets = {
		getTexture: (name: string): any => {
			return getTexture2D(name);
		},
		getSpine: (name: string): any => {
			return getSpine2D(name);
		},
		getAnimation: (name: string): any => {
			return getAnimation2D(name);
		},
	};

	static scene = SceneManager2D;

	// Instance methods for interface compatibility
	getObject(name: string, scene?: any): any {
		return studio2D.getObject(name, scene);
	}

	get assets() {
		return studio2D.assets;
	}
}

export default studio2D;
