import * as PIXI from "pixi.js";

import { StudioLayer2D } from "./types";
import { LayerGC } from "../../common/components";

class Layer extends PIXI.RenderLayer implements StudioLayer2D {
	id: string = "";
	type: string = "layer";
	label: string = "";

	selected: boolean = false;
	locked: boolean = false;
	layerComponents: LayerGC = {
		type: "layer",
		label: "",
	};

	components: any;

	constructor() {
		super();
		this.components = {
			resize: () => {},
			update: () => {},
		};
	}

	updateComponents(components: { [key: string]: any }) {
		const layer = components.layer as LayerGC;

		if (layer) {
			this.layerComponents = layer;
			this.label = layer.label ?? this.label;
		}
		// 	// super.updateComponents(components);
	}

	getComponent(component: string) {
		return this.components.getComponent(component);
	}
}

export default Layer;
