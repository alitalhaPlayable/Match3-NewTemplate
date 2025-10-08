import * as PIXI from "pixi.js";
import { PhysicsGC } from "../../../common/components";
import { isStudio } from "../../../common/editorGlobals";

// #if process.projConfig.physics2DSettings.physicsType !== "none"
import Box2DBody from "../../physics/box2d/Box2DBody";
import { getPhysicsDefaults } from "core/libs/common/physicsDefaults";
// #endif

class Physics {
	node: PIXI.Container;
	componentData?: PhysicsGC;
	defaults: PhysicsGC | null = null;
	constructor(node: PIXI.Container) {
		this.node = node;
	}

	update(component: any) {
		if (!component) return;

		this.componentData = component;

		if (!this.defaults || isStudio()) {
			this.defaults = this.get().data || null;
		}

		if (this.node.body) {
			this.node.body.updateBody(this.node, component);
		} else {
			this.node.body = new Box2DBody(
				{
					...component,
					node: this.node,
				},
				true
			);
			// this.node.body.updateBody(this.node, component);
		}

		// if (!this.node.components.responsive) {
		// 	this.node.x = component?.position?.x ?? 0;
		// 	this.node.y = component?.position?.y ?? 0;
		// 	this.node.setScale(component.scale?.x ?? 1, component.scale?.y ?? 1);
		// }

		// this.node.angle = component.angle ?? 0;
		// // this.node.setOrigin(component.origin?.x ?? 0.5, component.origin?.y ?? 0.5);
		// this.node.pivot.set(component.pivot?.x ?? 0, component.pivot?.y ?? 0);
		// this.node.setSkew(component.skew?.x ?? 0, component.skew?.y ?? 0);
		// this.node.zIndex = component.zIndex ?? 0;
		// this.node.label = component.label ?? "";
	}

	get() {
		return {
			type: "physics",
			data: this.componentData,
		};
	}
}

export default Physics;
