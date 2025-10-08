import * as PIXI from "pixi.js";
import { AdjustmentFilter, AdvancedBloomFilter, ColorOverlayFilter, GlowFilter, KawaseBlurFilter, OutlineFilter } from "pixi-filters";
import { Filter2D } from "../../../common/filterComponents";

type FiltersComponent = {
	filters: {
		[key: string]: Filter2D;
	};
};

class Filters {
	readonly node: PIXI.Container;
	defaults: FiltersComponent | null = null;
	filters: {
		[key: string]: Filter2D;
	} = {};

	constructor(node: PIXI.Container) {
		this.node = node;
	}

	update(component: FiltersComponent) {
		if (!component) return;

		// remove deleted filters
		if (this.node.filters && Array.isArray(this.node.filters)) {
			this.node.filters = this.node.filters.filter((f) => {
				if (f.isStudioFilter) {
					if (f.type && component.filters[f.type]) {
						return true;
					}
					return false;
				}
				return true;
			});
		}

		Object.values(component.filters).forEach((filterData) => {
			let filterItem;
			if (!Array.isArray(this.node.filters)) {
				this.node.filters = [];
			}

			if (Array.isArray(this.node.filters)) {
				filterItem = this.node.filters.find((f) => f.type === filterData.type && f.isStudioFilter);
			}

			if (!filterItem) {
				if (filterData.type === "adjustment") {
					filterItem = new AdjustmentFilter(filterData);
				} else if (filterData.type === "advancedBloom") {
					filterItem = new AdvancedBloomFilter(filterData);
				} else if (filterData.type === "kawaseBlur") {
					filterItem = new KawaseBlurFilter(filterData);
				} else if (filterData.type === "outline") {
					filterItem = new OutlineFilter(filterData);
				} else if (filterData.type === "glow") {
					filterItem = new GlowFilter(filterData);
				} else if (filterData.type === "colorOverlay") {
					filterItem = new ColorOverlayFilter();
				}

				if (filterItem) {
					filterItem.type = filterData.type;
					filterItem.isStudioFilter = true;
					this.node.filters = [...this.node.filters, filterItem];
				}
			}

			if (filterItem) {
				Object.assign(filterItem, filterData);
			}
		});

		// this.node.visible = !!component.visible;

		if (!this.defaults) {
			this.defaults = this.get();
		}
	}

	get() {
		return {
			type: "filters2D",
			filters: this.filters,
		};
	}
}

export default Filters;
