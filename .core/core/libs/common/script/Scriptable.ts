import ScriptBase from "./ScriptBase";
import { StudioObject2D } from "../../pixi/objects/types";
import { StudioObject3D } from "../../three/objects/types";

export default class Scriptable {
	node: StudioObject2D | StudioObject3D;
	scripts: ScriptBase[];
	awoken: boolean;
	inited: boolean;

	constructor(node: StudioObject2D | StudioObject3D) {
		this.node = node;
		this.scripts = [];
		// @ts-ignore
		this.node.scripts = this.scripts;
		this.inited = false;
		this.awoken = false;
	}

	initEditorVariables() {
		if (this.inited) return;
		this.scripts.forEach((script) => {
			script._initVariables();
		});
	}

	awake(props?: any) {
		if (this.inited) return;
		if (this.awoken) return;
		this.scripts.forEach((script) => {
			script.awake(props);
		});
		this.awoken = true;
	}

	init() {
		if (this.inited) return;
		this.scripts.forEach((script) => {
			script.init();
			script.inited = true;
		});
		this.inited = true;
	}

	add(script: ScriptBase, data?: any, objectManager?: any) {
		script._initDefault(this.node, data, objectManager);
		script.onAdd();
		this.scripts.push(script);
	}

	remove(script: any) {
		this.scripts = this.scripts.filter((s) => s !== script);
		script.onRemove();
	}

	update(delta: number) {
		if (!this.inited) {
			this.init();
		}

		this.scripts.forEach((script) => {
			if (!script.inited) {
				script.init();
				script.inited = true;
			}

			script.update(delta);
		});
	}

	resize(w: number, h: number) {
		if (!this.inited) return;

		this.scripts.forEach((script) => {
			script.resize(w, h);
		});
	}

	destroy() {
		this.scripts.forEach((script) => {
			script.onRemove();
		});
		this.scripts = [];
		this.inited = false;
	}

	get<T extends ScriptBase>(type: new () => T): T | undefined {
		return this.scripts.find((script) => script instanceof type) as T;
	}

	getByName(name: string) {
		return this.scripts.find((script) => script._className.toLowerCase() === name.toLowerCase());
	}
}
