import * as PIXI from "pixi.js";

import { StudioObject2D } from "./types";
import { getDeviceOrientation, isStudio } from "../../common/editorGlobals";
import { ContainerGC } from "../../common/components";

class Container extends PIXI.Container implements StudioObject2D {
	id: string = "";
	type: string = "container";
	debugRect: PIXI.Graphics = new PIXI.Graphics();

	selected: boolean = false;
	locked: boolean = false;

	containerComponent: ContainerGC = {
		type: "container",
		debug: false,
		width: 0,
		height: 0,
		landscape: false,
		landscapeWidth: 0,
		landscapeHeight: 0,
	};

	transformComponent: any = {};

	constructor(x: number = 0, y: number = 0) {
		super({
			x,
			y,
		});

		if (isStudio()) {
			this.updateDebug();
			this.addChild(this.debugRect);
		}

		this.initComponentSystem();
	}

	updateDebug() {
		if (!isStudio()) return;
		this.debugRect.clear();
		this.debugRect.rect(0, 0, this.baseWidth, this.baseHeight);
		this.debugRect.fill({ color: 0x0ea5e9, alpha: 0.2 });
	}

	updateContainerComponent(container: ContainerGC) {
		if (isStudio()) this.debugRect.visible = container.debug;

		this.transformComponent = this.components.get("transform");

		const { width, height, landscape, landscapeWidth, landscapeHeight } = container;
		this.containerComponent = container;

		const orientation = getDeviceOrientation();
		if (landscape && orientation === "landscape") {
			this.baseWidth = landscapeWidth || width;
			this.baseHeight = landscapeHeight || height;
		} else {
			this.baseWidth = width;
			this.baseHeight = height;
		}

		this.pivot.set(this.baseWidth * this.transformComponent.origin.x, this.baseHeight * this.transformComponent.origin.y);
		this.setOrigin(this.transformComponent.origin.x, this.transformComponent.origin.y);

		if (landscape) {
			this.children.forEach((child) => {
				if (child.components && child.components.responsive) {
					child.components.responsive.update();
				}
			});
		}

		this.updateDebug();
	}

	updateComponents(components: { [key: string]: any }) {
		const container = components.container as ContainerGC;

		if (container) {
			this.updateContainerComponent(container);
		}

		super.updateComponents(components);
	}

	getContainerComponent(): ContainerGC {
		return this.containerComponent;
	}

	/**
	 * Computes the global scale
	 * @returns global scale
	 */
	getGlobalScale() {
		let globalScale = { x: this.scale.x, y: this.scale.y };
		let currentObj = this.parent;
		
		while (currentObj) {
			console.log(currentObj.scale.x)
			globalScale.x *= currentObj.scale.x;
			globalScale.y *= currentObj.scale.y;
			currentObj = currentObj.parent;
		}
		
		return globalScale;
	}

	/**
	 * Computes the local scale of THIS container given object. 
	 * @param obj Scale this container would have if it was given obj's child.
	 * @returns Local scale given object.
	 */
	getLocalScale(obj: PIXI.Container<PIXI.ContainerChild>) {
		let globalScale = this.getGlobalScale()

		let localScale = { x: globalScale.x, y: globalScale.y };
		let currentObj = obj;
	
		while (currentObj) {
			localScale.x /= currentObj.scale.x;
			localScale.y /= currentObj.scale.y;
			currentObj = currentObj.parent;
		}
	
		return {x: localScale.x, y: localScale.y}
	}
}

export default Container;
