import { getPixiDimensions } from "core/libs/common/editorGlobals";
import * as PIXI from "pixi.js";

type TransformComponent = {
	position: { x: number; y: number };
	scale: { x: number; y: number };
	visible: boolean;
	alpha: number;
	angle: number;
	origin: { x: number; y: number };
	skew: { x: number; y: number };
	zIndex: number;
	label: string;
	eventMode: PIXI.EventMode;
	blendMode: PIXI.BLEND_MODES;
	dynamicResize?: boolean;
	dynamicResizeName?: string;
	enableMarketRedirection: boolean;
	dynamicOffset?: boolean;
	dynamicOffsetName?: string;
};

class Transform {
	readonly node: PIXI.Container;
	defaults: TransformComponent | null = null;
	enableMarketRedirection: boolean = false;

	dynamicResize: boolean = false;
	dynamicResizeName: string = "";
	dynamicResizeInited: boolean = false;

	dynamicOffset: boolean = false;
	dynamicOffsetName: string = "";
	dynamicOffsetInited: boolean = false;

	baseValues: {
		x: number;
		y: number;
		scaleX: number;
		scaleY: number;
	} = { x: 0, y: 0, scaleX: 1, scaleY: 1 };

	constructor(node: PIXI.Container) {
		this.node = node;
	}

	// eslint-disable-next-line class-methods-use-this
	redirectMarket(e: PIXI.FederatedEvent) {
		// @ts-ignore
		window?.app?.main.gotoLink();

		e?.stopPropagation?.();
	}

	update(component: TransformComponent) {
		if (!component) return;

		// if (!this.node.components.responsive) {
		this.node.x = component?.position?.x ?? 0;
		this.node.y = component?.position?.y ?? 0;
		this.node.setScale(component.scale?.x ?? 1, component.scale?.y ?? 1);
		// }

		this.node.visible = !!component.visible;
		this.node.alpha = component.alpha ?? 1;

		this.node.angle = component.angle ?? 0;
		this.node.setOrigin(component.origin?.x ?? 0, component.origin?.y ?? 0);
		// this.node.pivot.set(component.pivot?.x ?? 0, component.pivot?.y ?? 0);
		this.node.setSkew(component.skew?.x ?? 0, component.skew?.y ?? 0);
		this.node.zIndex = component.zIndex ?? 0;
		this.node.label = component.label ?? "";
		this.node.blendMode = component.blendMode || "inherit";
		this.node.eventMode = component.eventMode || "passive";
		this.enableMarketRedirection = component.enableMarketRedirection || false;

		this.updateBaseValues();

		this.dynamicResize = component.dynamicResize || false;
		this.dynamicResizeName = component.dynamicResizeName || "";

		this.dynamicOffset = component.dynamicOffset || false;

		if (component.enableMarketRedirection) {
			this.node.interactive = true;
			const eventName = app?.type === "moloco" ? "pointerup" : "pointerdown";
			this.node.off(eventName, this.redirectMarket);
			this.node.on(eventName, this.redirectMarket);
		}

		if (!this.defaults) {
			this.defaults = this.get();
		}
	}

	updateBaseValues() {
		this.baseValues = {
			x: this.node.x,
			y: this.node.y,
			scaleX: this.node.scale.x,
			scaleY: this.node.scale.y,
		};
	}

	get() {
		return {
			type: "node2D",
			label: this.node.label,
			visible: this.node.visible,
			alpha: this.node.alpha,
			position: { x: this.node.x, y: this.node.y },
			scale: { x: this.node.scale.x, y: this.node.scale.y },
			angle: this.node.angle,
			// pivot: { x: this.node.pivot.x, y: this.node.pivot.y },
			origin: { x: this.node.originX, y: this.node.originY },
			skew: { x: this.node.skewX, y: this.node.skewY },
			zIndex: this.node.zIndex,
			mask: null,
			invertAlpha: false,
			eventMode: this.node.eventMode || "passive",
			blendMode: this.node.blendMode || "inherit",
			enableMarketRedirection: this.enableMarketRedirection || false,
		};
	}

	applyDynamicPosition() {
		if (!this.dynamicResize) return;

		if (!this.dynamicResizeInited) {
			this.dynamicResizeInited = true;
			// add events
			const eventNames = ["Enabled", "PortraitEnabled", "LandscapeEnabled", "PortraitX", "PortraitY", "PortraitW", "PortraitH", "LandscapeX", "LandscapeY", "LandscapeW", "LandscapeH"];

			eventNames.forEach((eventName) => {
				const datajsID = this.node.id + "_dynamic_" + eventName;

				window.addEventListener("pf_" + datajsID, async (e: any) => {
					console.log(datajsID, e.detail.value);
					app.data[datajsID] = e.detail.value;
					const dimensions = getPixiDimensions();
					this.updateDynamicPosition(dimensions.width, dimensions.height);

					if (eventName === "Enabled" && !e.detail.value) {
						this.node.components.resize(this.node.parent.baseWidth, this.node.parent.baseHeight);
					}
				});
			});
		}
	}

	updateDynamicPosition(w: number, h: number) {
		const datajsID = this.node.id + "_dynamic_";

		if (app.data[datajsID + "Enabled"]) {
			// const portrait = app.data[datajsID + "PortraitEnabled"];
			const landscape = app.data[datajsID + "LandscapeEnabled"];

			const portraitX = app.data[datajsID + "PortraitX"];
			const portraitY = app.data[datajsID + "PortraitY"];
			const portraitW = app.data[datajsID + "PortraitW"];
			const portraitH = app.data[datajsID + "PortraitH"];

			const landscapeX = app.data[datajsID + "LandscapeX"];
			const landscapeY = app.data[datajsID + "LandscapeY"];
			const landscapeW = app.data[datajsID + "LandscapeW"];
			const landscapeH = app.data[datajsID + "LandscapeH"];

			let x = portraitX;
			let y = portraitY;
			let width = portraitW;
			let height = portraitH;

			if (w > h && landscape) {
				x = landscapeX;
				y = landscapeY;
				width = landscapeW;
				height = landscapeH;
			}

			const widthRatio = width / 100;
			const heightRatio = height / 100;

			const scale = Math.min((w * widthRatio) / this.node.baseWidth, (h * heightRatio) / this.node.baseHeight);
			this.node.scale.set(scale);

			const nw = this.node.baseWidth * scale;
			const nh = this.node.baseHeight * scale;

			this.node.x = w * (x / 100);

			if (x < 50) {
				const leftMin = nw * this.node.originX;
				const leftMax = w * 0.5;

				this.node.x = leftMin + (leftMax - leftMin) * (x / 50);
			} else {
				const rightMin = w * 0.5;
				const rightMax = w - nw * (1 - this.node.originX);

				this.node.x = rightMin + (rightMax - rightMin) * ((x - 50) / 50);
			}

			this.node.y = h * (y / 100);

			if (y < 50) {
				const topMin = nh * this.node.originY;
				const topMax = h * 0.5;

				this.node.y = topMin + (topMax - topMin) * (y / 50);
			} else {
				const bottomMin = h * 0.5;
				const bottomMax = h - nh * (1 - this.node.originY);

				this.node.y = bottomMin + (bottomMax - bottomMin) * ((y - 50) / 50);
			}
		}
	}

	applyDynamicOffset(w: number, h: number) {
		if (!this.dynamicOffset) return;

		setTimeout(() => {
			this.updateDynamicOffset(w, h);
		}, 1);

		if (!this.dynamicOffsetInited) {
			this.dynamicOffsetInited = true;
			// add events
			const eventNames = ["LandscapeEnabled", "PortraitX", "PortraitY", "PortraitScale", "LandscapeX", "LandscapeY", "LandscapeScale"];

			eventNames.forEach((eventName) => {
				const datajsID = this.node.id + "_offset_" + eventName;

				window.addEventListener("pf_" + datajsID, async (e: any) => {
					console.log(datajsID, e.detail.value);
					app.data[datajsID] = e.detail.value;
					this.node.forceResize?.();
				});
			});
		}
	}

	updateDynamicOffset(w: number, h: number) {
		if (!this.dynamicOffset) return;
		if (!this.dynamicOffsetInited) {
			this.applyDynamicOffset(w, h);
		}
		const { node } = this;

		const datajsID = this.node.id + "_offset_";

		const landscape = app.data[datajsID + "LandscapeEnabled"];

		const portraitX = app.data[datajsID + "PortraitX"];
		const portraitY = app.data[datajsID + "PortraitY"];
		const portraitScale = app.data[datajsID + "PortraitScale"];

		const landscapeX = app.data[datajsID + "LandscapeX"];
		const landscapeY = app.data[datajsID + "LandscapeY"];
		const landscapeScale = app.data[datajsID + "LandscapeScale"];

		let x = portraitX;
		let y = portraitY;
		let scale = portraitScale;

		if (w > h && landscape) {
			x = landscapeX;
			y = landscapeY;
			scale = landscapeScale;
		}

		x = x || 0;
		y = y || 0;
		scale = scale || 1;

		console.log(x, y, scale);

		node.scaleX = this.baseValues.scaleX * scale;
		node.scaleY = this.baseValues.scaleY * scale;

		node.x = this.baseValues.x + node.baseWidth * node.scale.x * (x / 100);
		node.y = this.baseValues.y + node.baseHeight * node.scale.y * (y / 100);

		// node.x += node.baseWidth * node.scale.x * (x / 100);
		// node.y += node.baseHeight * node.scale.y * (y / 100);
	}
}

export default Transform;
