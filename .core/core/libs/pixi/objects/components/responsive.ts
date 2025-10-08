import * as PIXI from "pixi.js";
import gsap from "gsap";
import { Responsive2DGC } from "../../../common/components";
import { getDeviceOrientation, getLockedOrientation, isStudio } from "../../../common/editorGlobals";
import ObjectHelper2D from "../../utils/ObjectHelper2D";

class Responsive {
	node: PIXI.Container;
	componentData?: Responsive2DGC;
	defaults: Responsive2DGC | null = null;
	constructor(node: PIXI.Container) {
		this.node = node;
	}

	update(component: Responsive2DGC = this.componentData as Responsive2DGC, skipUpdate: boolean = false) {
		if (!component) return;
		this.componentData = component;
		if (!this.node.parent) return;

		if (!this.defaults || isStudio()) {
			this.defaults = this.get().data || null;
		}

		let resizeData: any = null;
		if (component.resizes) {
			let activeKey = null;
			for (const key in component.resizes) {
				if (Object.prototype.hasOwnProperty.call(component.resizes, key)) {
					const _resizeData = component.resizes[key];
					if (_resizeData.isActive) {
						activeKey = key;
						break;
					}
				}
			}

			resizeData = component.resizes[activeKey || Object.keys(component.resizes)[0]];
		} else {
			resizeData = component;
		}

		// const resizeData = component;

		const boundsRect = new PIXI.Rectangle(0, 0, this.node.baseWidth, this.node.baseHeight);

		const selected = getLockedOrientation();
		const orientedData = selected === "landscape" && (resizeData as any).landscape.enabled ? (resizeData as any)?.landscape : (resizeData as any)?.portrait;

		let nodeX: number = 0;
		let nodeY: number = 0;
		let nodeScaleX: number = 1;
		let nodeScaleY: number = 1;

		if (orientedData) {
			const {
				/* enabled, */
				fitType,
				height,
				horizontalSpace,
				horizontalSpaceUnit,
				origin,
				referenceBottom,
				referenceLeft,
				referenceRight,
				referenceTop,
				verticalSpace,
				verticalSpaceUnit,
				width,
			} = orientedData;

			let top = 0;
			let left = 0;
			let right = 0;
			let bottom = 0;

			if (this.node.parent) {
				if (this.node.parent.label === "root" || this.node.parent.isScene) {
					const parent = this.node.parent as any;

					right = parent.baseWidth;
					bottom = parent.baseHeight;
				} else if (this.node.parent.label === "editor_viewport") {
					const parent = this.node.parent as any;
					if (parent.border.orientation === "portrait") {
						right = parent.border.device.width;
						bottom = parent.border.device.height;
					} else {
						right = parent.border.device.height;
						bottom = parent.border.device.width;
					}
				} else {
					right = this.node.parent.baseWidth;
					bottom = this.node.parent.baseHeight;
				}
			}

			if (referenceTop) {
				const refNode = ObjectHelper2D.getNodeById(referenceTop);

				if (refNode) {
					let { y } = refNode!;

					if (refNode?.components.responsive) {
						const data = refNode.components.responsive.update(refNode.components.get("responsive").data, true);
						if (data) {
							y = data!.y;
						}
					}

					const bounds = new PIXI.Rectangle(0, 0, refNode.baseWidth, refNode.baseHeight);
					top = y + (1 - refNode.originY) * bounds.height * refNode.scale.y;
				}
			}
			if (referenceBottom) {
				const refNode = ObjectHelper2D.getNodeById(referenceBottom);
				if (refNode) {
					let { y } = refNode!;

					if (refNode?.components.responsive) {
						const data = refNode.components.responsive.update(refNode.components.get("responsive").data, true);
						if (data) {
							y = data!.y;
						}
					}

					const bounds = new PIXI.Rectangle(0, 0, refNode.baseWidth, refNode.baseHeight);
					bottom = y - refNode.originY * bounds.height * refNode.scale.y;
				}
			}
			if (referenceLeft) {
				const refNode = ObjectHelper2D.getNodeById(referenceLeft);
				if (refNode) {
					let { x } = refNode!;
					if (refNode?.components.responsive) {
						const data = refNode.components.responsive.update(refNode.components.get("responsive").data, true);
						if (data) {
							x = data!.x;
						}
					}

					const bounds = new PIXI.Rectangle(0, 0, refNode.baseWidth, refNode.baseHeight);
					left = x + (1 - refNode.originX) * bounds.width * refNode.scale.x;
				}
			}
			if (referenceRight) {
				const refNode = ObjectHelper2D.getNodeById(referenceRight);
				if (refNode) {
					let { x } = refNode!;
					if (refNode?.components.responsive) {
						const data = refNode.components.responsive.update(refNode.components.get("responsive").data, true);
						if (data) {
							x = data!.x;
						}
					}

					const bounds = new PIXI.Rectangle(0, 0, refNode.baseWidth, refNode.baseHeight);

					right = x - refNode.originX * bounds.width * refNode.scale.x;
				}
			}

			const availableWidth = right - left;
			const availableHeight = bottom - top;

			let scaleX: number = 0;
			let scaleY: number = 0;
			if (fitType === "min") {
				const scale = Math.min((availableWidth * width) / 100 / boundsRect.width, (availableHeight * height) / 100 / boundsRect.height);
				scaleX = scale;
				scaleY = scale;
			} else if (fitType === "max") {
				const scale = Math.max((availableWidth * width) / 100 / boundsRect.width, (availableHeight * height) / 100 / boundsRect.height);
				scaleX = scale;
				scaleY = scale;
			} else if (fitType === "stretch") {
				scaleX = (availableWidth * width) / 100 / boundsRect.width;
				scaleY = (availableHeight * height) / 100 / boundsRect.height;
			}
			// this.node.scale.set(scaleX, scaleY);
			nodeScaleX = scaleX;
			nodeScaleY = scaleY;
			if (!skipUpdate) {
				if (!resizeData.settings || resizeData.settings.enableScale) {
					this.node.scale.set(nodeScaleX, nodeScaleY);
				}
			}

			const originMap: { [key: string]: { x: number; y: number } } = {
				"top-left": { x: 0, y: 0 },
				"top-right": { x: availableWidth, y: 0 },
				top: { x: availableWidth * 0.5, y: 0 },
				"bottom-left": { x: 0, y: availableHeight },
				"bottom-right": { x: availableWidth, y: availableHeight },
				bottom: { x: availableWidth * 0.5, y: availableHeight },
				left: { x: 0, y: availableHeight * 0.5 },
				right: { x: availableWidth, y: availableHeight * 0.5 },
				center: { x: availableWidth * 0.5, y: availableHeight * 0.5 },
			};

			const { x, y } = originMap[origin];

			nodeX = x;
			nodeY = y;

			nodeX += left;
			nodeY += top;

			let horSpace: number = 0;
			let verSpace: number = 0;

			if (horizontalSpaceUnit === "%") {
				horSpace = availableWidth * horizontalSpace * 0.01;
			} else if (horizontalSpaceUnit === "px") {
				horSpace = horizontalSpace;
			} else if (horizontalSpaceUnit === "self") {
				horSpace = boundsRect.width * horizontalSpace * 0.01 * this.node.scale.x;
			}
			nodeX += horSpace;

			if (verticalSpaceUnit === "%") {
				verSpace = availableHeight * verticalSpace * 0.01;
			} else if (verticalSpaceUnit === "px") {
				verSpace = verticalSpace;
			} else if (verticalSpaceUnit === "self") {
				verSpace = boundsRect.height * verticalSpace * 0.01 * this.node.scale.y;
			}
			nodeY += verSpace;
		}

		if (!skipUpdate) {
			if (!resizeData.settings || resizeData.settings.enablePosition) {
				this.node.x = nodeX;
				this.node.y = nodeY;
			}

			if (this.node.components.transitionFX) {
				this.node.components.transitionFX.transitionFXs.forEach((tween: any) => {
					tween.getStart();
					tween.invalidate();
				});
			}

			if (this.node.id) ObjectHelper2D.resizeDependents(this.node.id);
		}

		// Responsive.traverseChildren(this.node);

		return { x: nodeX, y: nodeY, scale: { x: nodeScaleX, y: nodeScaleY } };
	}

	// static traverseChildren(parent: any) {
	// 	const traverseRecursive = (obj: any) => {
	// 		if (obj.children && obj.children.length > 0) {
	// 			for (const child of obj.children) {
	// 				if (child.components && child.components.responsive) {
	// 					child.components.responsive.update(child.components.get("responsive").data);
	// 				}
	// 				traverseRecursive(child);
	// 			}
	// 		}
	// 	};

	// 	traverseRecursive(parent);
	// }

	get() {
		return {
			type: "reponsive2D",
			label: this.node.label,
			data: this.componentData,
		};
	}

	changeResizeByIndex(
		index: number,
		config: {
			duration: number;
			ease: string;
			onComplete: () => void;
			onUpdate: () => void;
			delay: number;
			repeat: number;
			yoyo: boolean;
			repeatDelay: number;
		} = {
			duration: 0.6,
			ease: "sine.inOut",
			onComplete: () => {},
			onUpdate: () => {},
			delay: 0,
			repeat: 0,
			yoyo: false,
			repeatDelay: 0,
		}
	) {
		if (!this.componentData) return;
		const { resizes } = this.get().data as Responsive2DGC;
		if (!resizes) return;
		const keys = Object.keys(resizes);
		const key = keys[index];
		if (!key) return;

		const curResize = Object.values(resizes).find((r) => r.isActive);
		if (curResize) curResize.isActive = false;

		const newResize = resizes[key];
		if (newResize) newResize.isActive = true;

		this.componentData = {
			...this.componentData,
			resizes,
		};

		const getTransformData = () => {
			return this.update(this.componentData, true);
		};

		let transformData = getTransformData();

		let tween: any = null;
		if (transformData) {
			tween = gsap.to(this.node, {
				x: () => getTransformData()!.x,
				y: () => getTransformData()!.y,
				scaleX: () => getTransformData()!.scale.x,
				scaleY: () => getTransformData()!.scale.y,
				duration: config.duration || 0.6,
				ease: config.ease || "sine.inOut",
				delay: config.delay || 0,
				repeat: config.repeat || 0,
				yoyo: config.yoyo || false,
				repeatDelay: config.repeatDelay || 0,
				onUpdate: () => {
					if (this.node.id) ObjectHelper2D.resizeDependents(this.node.id);
					config.onUpdate ? config.onUpdate() : null;
				},
				onComplete: () => {
					tween = null;
					config.onComplete ? config.onComplete() : null;
				},
			});

			this.node.onResizeCallback = () => {
				if (tween) {
					curResize!.isActive = true;
					newResize.isActive = false;
					transformData = getTransformData();
					if (transformData) {
						this.node.x = transformData.x;
						this.node.y = transformData.y;
						this.node.scale.set(transformData.scale.x, transformData.scale.y);
					}
					curResize!.isActive = false;
					newResize.isActive = true;

					tween.invalidate();
				}
			};
		}
	}

	public setResizePropertiesByIndex(
		index: number,
		orientation: "portrait" | "landscape",
		updates: Partial<{
			fitType: string;
			width: number;
			height: number;
			origin: string;
			horizontalSpace: number;
			horizontalSpaceUnit: string;
			verticalSpace: number;
			verticalSpaceUnit: string;
			enabled: boolean;
		}>,
		animate: boolean = false
	) {
		if (!this.componentData) return;
		const { resizes } = this.componentData;
		const keys = Object.keys(resizes);
		if (index < 0 || index >= keys.length) return;
		const key = keys[index];
		const target = (resizes[key] as any)[orientation];
		Object.assign(target, updates);
		this.componentData = { ...this.componentData, resizes };
		if (animate) {
			this.changeResizeByIndex(index);
		} else {
			this.update(this.componentData);
		}
	}
}

export default Responsive;
