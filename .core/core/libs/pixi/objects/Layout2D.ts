import * as PIXI from "pixi.js";

import { StudioObject2D } from "./types";
import Components2D from "./components/components";

interface Layout2DGC {
	type: "layout2D";
	portrait: {
		data: {};
	};
	landscape: {
		enabled: false;
		data: {};
	};
	hasDebug: boolean;
}

class Layout2D extends PIXI.Container implements StudioObject2D {
	id: string = "";
	type: string = "layout2D";
	components: Components2D;

	selected: boolean = false;
	portrait: { data: {} };
	landscape: { enabled: false; data: {} };
	locked: boolean = false;

	hasDebug: boolean = true;

	constructor(config: { x: number; y: number } = { x: 0, y: 0 }) {
		super({
			x: config.x,
			y: config.y,
		});

		this.components = new Components2D(this);

		this.portrait = { data: {} };
		this.landscape = { enabled: false, data: {} };

		this.sortableChildren = true;
	}

	updateComponents(components: { [key: string]: any }) {
		const layout2D = components.layout2D as Layout2DGC;
		if (layout2D) {
			this.updateLayoutComponent(layout2D);
		}

		super.updateComponents(components);
		// this.components.update(components);

		if (this.parent) this.onResizeCallback(this.parent.baseWidth, this.parent.baseHeight);
		this.resizeChildren();
	}

	updateLayoutComponent(layout: Layout2DGC) {
		this.portrait = layout.portrait;
		this.landscape = layout.landscape;

		// const rootScene = getRootScene();
		// this.onResizeCallback(rootScene.baseWidth, rootScene.baseHeight);
		if (this.parent) {
			this.onResizeCallback(this.parent.baseWidth, this.parent.baseHeight);
		}
		this.resizeChildren();
	}

	removeCellByName(name: string) {
		const cell = this.getChildByLabel(name, true);
		if (cell) {
			this.removeChild(cell);
			cell.destroy();
		}
		this.resizeChildren();
	}

	getLayoutComponent(): Layout2DGC {
		return {
			type: "layout2D",
			portrait: {
				data: this.portrait.data,
			},
			landscape: {
				enabled: this.landscape.enabled,
				data: this.landscape.data,
			},
			hasDebug: this.hasDebug,
		};
	}

	resizeChildren() {
		if (this.parent) {
			this.children.forEach((child) => {
				if (child.type === "cell2D") {
					child.onResizeCallback(this.baseWidth, this.baseHeight);
				} else if (child?.components?.responsive) {
					child.components.responsive.update(child.components.get("responsive").data);
				}
			});
		}
	}

	onResizeCallback = (w: number, h: number) => {
		this.baseWidth = w;
		this.baseHeight = h;
	};
}

export default Layout2D;
