import * as PIXI from "pixi.js";
import ScriptBase from "../../../common/script/ScriptBase";
import Transform from "./transform";
import Responsive from "./responsive";
import EventEmitter from "../../../common/EventEmitter";
import Physics from "./physics";
import { ComponentManager } from "../../../common/components";
// eslint-disable-next-line import/no-cycle
import Scriptable from "../../../common/script/Scriptable";
import TransitionFX from "./transitionFX";
import { StudioObject2D } from "../types";
import Filters from "./filters";

const eventEmitter: EventEmitter = EventEmitter.getInstance();

class Components2D implements ComponentManager {
	node: PIXI.Container | null = null;
	transform: Transform;
	responsive?: Responsive;
	physics?: Physics;
	scripts?: Scriptable;
	transitionFX?: TransitionFX;
	filters?: Filters;

	defaults: any = null;

	core: {
		[key: string]: any;
	} = {};

	constructor(_node: PIXI.Container) {
		this.node = _node;
		this.transform = new Transform(this.node);
		if (this.node.body) {
			this.physics = new Physics(this.node as PIXI.Container);
		}
	}

	add(componentName: string, data?: any) {
		switch (componentName) {
			case "responsive2D":
				this.responsive = new Responsive(this.node as PIXI.Container);
				eventEmitter.emit("transformer_handles_are_dirty");
				break;
			case "physics":
				this.physics = new Physics(this.node as PIXI.Sprite);
				break;
			case "scripts":
				if (!this.scripts) {
					this.scripts = new Scriptable(this.node as StudioObject2D);
				}
				return this.scripts;
			case "transitionFX":
				this.transitionFX = new TransitionFX(this.node as PIXI.Container);
				break;
			case "filters2D":
				this.filters = new Filters(this.node as PIXI.Container);
				break;
			default:
				this.core[componentName] = data;
				break;
		}
	}

	remove(componentName: string) {
		switch (componentName) {
			case "responsive2D":
				this.responsive = undefined;
				eventEmitter.emit("transformer_handles_are_dirty");
				break;
			case "physics":
				this.physics = undefined;
				break;
			case "transitionFX":
				this.transitionFX = undefined;
				break;
			case "scripts":
				this.scripts?.scripts.forEach((script: ScriptBase) => {
					this.scripts?.remove(script);
				});
				this.scripts = undefined;
				break;
			case "filters2D":
				this.filters = undefined;
				break;
			default:
				break;
		}
	}

	removeAll() {
		this.remove("scripts");
	}

	updateComponents(components: any) {
		this.defaults = components;
		this.transform.update(components.node2D);
		if (this.responsive) this.responsive.update(components.responsive2D);
		if (this.physics) this.physics.update(components.physics);
		if (this.transitionFX) this.transitionFX.update(components.transitionFX);
		if (this.filters) this.filters.update(components.filters2D);
	}

	update(delta: number): void {
		if (this.scripts) {
			this.scripts.update(delta);
		}
	}

	resize(w: number, h: number) {
		if (this.node?.type === "container") {
			const containerComponent = (this.node as any).getContainerComponent();
			if (containerComponent && containerComponent.landscape) {
				(this.node as any).updateContainerComponent(containerComponent);
			}
		}

		if (this.node?.preResize) {
			this.node.preResize(w, h);
		}

		if (this.responsive) {
			this.responsive.update(this.get("responsive").data);
			this.transform.updateBaseValues();
		}

		if ((this.node as any)!.type === "layout2D") {
			(this.node as any)!.updateLayoutComponent((this.node as any)!.getLayoutComponent());
		}

		if (this.node?.parent?.type === "container" && this.node?.type === "cell2D") this.node?.onResizeCallback?.(w, h); // NEW

		if (this.scripts) {
			this.scripts.resize(w, h);
		}

		this.transform.applyDynamicPosition();
		this.transform.updateDynamicPosition(w, h);
		this.transform.updateDynamicOffset(w, h);
	}

	get(componentName: string) {
		switch (componentName) {
			case "transform":
				return this.transform.get();
			case "responsive":
				return this.responsive ? this.responsive.get() : null;
			case "physics":
				return this.physics ? this.physics.get() : null;
			case "scripts":
				return this.scripts;
			case "transitionFX":
				return this.transitionFX ? this.transitionFX.get() : null;
			case "filters2D":
				return this.filters ? this.filters.get() : null;
			default:
				return this.core[componentName];
		}
	}

	getAll() {
		return {
			transform: this.transform,
			responsive: this.responsive,
			physics: this.physics,
			transitionFX: this.transitionFX,
			filters: this.filters,
			core: this.core,
		};
	}

	setCoreComponent(componentName: string, component: any) {
		this.core[componentName] = component;
	}
}

export default Components2D;
