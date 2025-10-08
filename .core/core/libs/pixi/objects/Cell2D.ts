import * as PIXI from "pixi.js";

import { StudioObject2D } from "./types";
import Components2D from "./components/components";
import Layout2D from "./Layout2D";
import ObjectHelper2D from "../utils/ObjectHelper2D";
import { getDeviceOrientation, isStudio } from "../../common/editorGlobals";

interface Cell2DGC {
	type: "cell2D";
	portrait: {
		order: number;
		zIndex: number;
		fraction: number;
		containType: "row" | "col";
		mask: boolean;
		width: number;
		height: number;
		fitUnit: "min" | "max";
		gap: number;
	};
	landscape: {
		enabled: boolean;
		order: number;
		zIndex: number;
		fraction: number;
		containType: "row" | "col";
		mask: boolean;
		width: 0;
		height: 0;
		fitUnit: "min";
		gap: 0;
	};
}

class Cell2D extends PIXI.Container implements StudioObject2D {
	id: string = "";
	type: string = "cell2D";
	debugRect: PIXI.Graphics = new PIXI.Graphics();
	// components: Components2D;

	selected: boolean = false;
	locked: boolean = false;

	hasPortraitMask: boolean = false;
	hasLandscapeMask: boolean = false;

	maskGraph: PIXI.Graphics = new PIXI.Graphics();

	portrait: {
		order: number;
		zIndex: number;
		fraction: number;
		containType: "row" | "col";
		fitUnit: "min" | "max";
		gap: number;
		width: number;
		height: number;
	} = {
		order: 0,
		zIndex: 0,
		fraction: 1,
		containType: "row",
		fitUnit: "min",
		gap: 0,
		width: 0,
		height: 0,
	};

	landscape: {
		enabled: boolean;
		order: number;
		zIndex: number;
		fraction: number;
		containType: "row" | "col";
		fitUnit: "min";
		gap: number;
		width: number;
		height: number;
	} = {
		enabled: false,
		order: 0,
		zIndex: 0,
		fraction: 1,
		containType: "row",
		fitUnit: "min",
		gap: 0,
		width: 0,
		height: 0,
	};

	isLandscapeEnabled: boolean = false;

	constructor(x: number = 0, y: number = 0) {
		super({
			x,
			y,
		});

		this.baseWidth = 0;
		this.baseHeight = 0;

		this.sortableChildren = true;

		if (isStudio()) {
			this.addChild(this.debugRect);
			this.updateDebug();
		}

		this.components = new Components2D(this);

		if (this.maskGraph) {
			this.addChild(this.maskGraph);
			this.maskGraph.visible = false;
		}
	}

	getLayout() {
		let { parent } = this;
		while (parent) {
			if (parent.type === "layout2D") {
				return parent as Layout2D;
			}

			if (parent.type === "container") {
				return null;
			}
			parent = parent.parent;
		}
	}

	updateDebug() {
		if (!isStudio()) return;
		const layout = this.getLayout();
		if (layout) {
			this.debugRect.visible = layout.hasDebug;
		}

		this.debugRect.clear();

		if (!this.debugRect.visible) {
			return;
		}

		this.debugRect.rect(0, 0, this.baseWidth, this.baseHeight);
		this.debugRect.fill({ color: 0x1864ab, alpha: 0.02 });
		this.debugRect.stroke({ color: 0x1864ab, width: 2 });
	}

	updateCellComponent(cell2D: Cell2DGC) {
		this.portrait = cell2D.portrait;
		this.landscape = cell2D.landscape;

		// const rootScene = getRootScene();
		const orientation = this.getOrientation();

		const isParentLayout = this.getLayout();
		if (!isParentLayout) {
			this.baseWidth = cell2D[orientation].width || 0;
			this.baseHeight = cell2D[orientation].height || 0;
		}

		this.updateMask(cell2D);

		ObjectHelper2D.resizeAll(); // TODO: Make this only for cell children
	}

	getOrientation(): "landscape" | "portrait" {
		const layout = this.getLayout();
		if (layout) {
			return getDeviceOrientation() === "landscape" && layout.landscape.enabled ? "landscape" : "portrait";
		}
		return getDeviceOrientation() === "landscape" && this.landscape.enabled ? "landscape" : "portrait";
	}

	updateMask(cell2D: Cell2DGC) {
		if (!cell2D) {
			return;
		}
		// const rootScene = getRootScene();
		const orientation = this.getOrientation();

		this.hasPortraitMask = cell2D.portrait.mask;
		this.hasLandscapeMask = cell2D.landscape.mask;

		if (cell2D[orientation].mask) {
			this.maskGraph.clear();
			this.maskGraph.visible = true;
			this.maskGraph.rect(0, 0, this.baseWidth, this.baseHeight);
			this.maskGraph.fill({ color: 0xff0000, alpha: 1 });
			this.mask = this.maskGraph;
		} else {
			this.maskGraph.visible = false;
			this.mask = null;
		}
	}

	resizeChildren() {
		if (this.parent) {
			const isParentLayout = this.getLayout();
			if (isParentLayout) {
				this.children.forEach((child) => {
					if (child instanceof Cell2D) {
						child.onResizeCallback(this.baseWidth, this.baseHeight);
					}
				});
			} else {
				const orientation = this.getOrientation();
				const orientedData = this[orientation];

				this.baseWidth = orientedData.width || 0;
				this.baseHeight = orientedData.height || 0;

				const filteredChildren = this.children.filter((c) => c.components && !c.components.responsive);
				const totalGap = orientedData.gap * (filteredChildren.length - 1);

				filteredChildren.forEach((child, ind) => {
					if (orientedData.containType === "row") {
						const totalSpace = this.baseWidth - totalGap;
						const perAreaSize = totalSpace / filteredChildren.length;
						const scaleUnit = orientedData.fitUnit;

						const childMaxSide = Math.max(child.baseWidth, child.baseHeight);
						const sizeY = Math[scaleUnit](perAreaSize, this.baseHeight);

						child.scale.set(Math.max(0.01, Math.min(sizeY / childMaxSide)));
						if (scaleUnit === "min") {
							const startX = (perAreaSize + orientedData.gap) * ind;
							child.x = startX + perAreaSize * 0.5 - child.width * (0.5 - child.originX);
						} else {
							const startX = (childMaxSide * child.scale.x + orientedData.gap) * ind;
							child.x =
								startX +
								childMaxSide * child.scale.x * 0.5 -
								childMaxSide * child.scale.x * (0.5 - child.originX);
						}
						child.y = this.baseHeight * 0.5 - child.height * (0.5 - child.originY);
					} else {
						const totalSpace = this.baseHeight - totalGap;
						const perAreaSize = totalSpace / filteredChildren.length;
						const scaleUnit = orientedData.fitUnit;

						const childMaxSize = Math.max(child.baseWidth, child.baseHeight);
						const sizeX = Math[scaleUnit](perAreaSize, this.baseWidth);

						child.scale.set(Math.max(0.01, Math.min(sizeX / childMaxSize)));
						if (scaleUnit === "min") {
							const startY = (perAreaSize + orientedData.gap) * ind;
							child.y = startY + perAreaSize * 0.5 - child.height * (0.5 - child.originY);
						} else {
							const startY = (childMaxSize * child.scale.y + orientedData.gap) * ind;
							child.y =
								startY +
								childMaxSize * child.scale.y * 0.5 -
								childMaxSize * child.scale.y * (0.5 - child.originY);
						}

						child.x = this.baseWidth * 0.5 - child.width * (0.5 - child.originX);
					}
				});
			}
		}
	}

	updateComponents(components: { [key: string]: any }) {
		const cell2D = components.cell2D as Cell2DGC;
		if (cell2D) {
			// this.components.add("cell2D", cell2D);
			this.updateCellComponent(cell2D);
		}
		super.updateComponents(components);
		// this.components.update(components);

		if (cell2D) {
			const orientation = this.getOrientation();
			this.zIndex = cell2D[orientation].zIndex;
		}

		const layout = this.getLayout();
		if (layout) {
			layout.resizeChildren();
		} else {
			this.onResizeCallback(this.baseWidth, this.baseHeight);
		}
		this.resizeChildren();
	}

	getTotalFraction(orientation: "portrait" | "landscape" = "portrait") {
		const cellList = this.parent.children.filter((child) => (child as Cell2D).type === "cell2D"); // Add type assertion
		return cellList.reduce((acc, cell) => {
			return acc + (cell as Cell2D)[orientation].fraction;
		}, 0);
	}

	// eslint-disable-next-line class-methods-use-this
	layoutDataFindChildren(layout: Layout2D, parentId: string) {
		let foundParent;
		const recursive = (nodeData: any, parentId2: string) => {
			nodeData.children.forEach((child: any) => {
				if (child.id === parentId2) {
					foundParent = child;
				} else if (child.children) {
					recursive(child, parentId2);
				}
			});
		};
		// @ts-ignore
		recursive(layout.nodeData, parentId);

		return foundParent;
	}

	onResizeCallback = (w: number, h: number) => {
		const layout = this.getLayout();
		const orientation = this.getOrientation();

		if (layout) {
			const totalFraction = this.getTotalFraction(orientation);

			const parentData: any = this.layoutDataFindChildren(layout, this.parent.id);
			const cells = this.parent.children.filter((child) => (child as Cell2D).type === "cell2D"); // Add type assertion

			if (parentData) {
				cells.sort((a: any, b: any) => {
					// use parentData to sort cells
					return (
						parentData.children.findIndex((child: any) => child.id === a.id) -
						parentData.children.findIndex((child: any) => child.id === b.id)
					);
				});
				this.parent.children.sort((a: any, b: any) => {
					// sort if zindex is same use parentData, otherwise use zIndex
					return a.zIndex === b.zIndex
						? parentData.children.findIndex((child: any) => child.id === a.id) -
								parentData.children.findIndex((child: any) => child.id === b.id)
						: a.zIndex - b.zIndex;
				});
			}

			// sort cells by order
			cells.sort((a: any, b: any) => {
				return a[orientation].order - b[orientation].order;
			});

			const index = cells.indexOf(this);

			const prevCell = cells[index - 1] as Cell2D;

			if (this.parent.type === "layout2D") {
				// so, it is layout root cell
				this.baseWidth = w;
				this.baseHeight = h;

				this.x = 0;
				this.y = 0;
			} else if (this.parent instanceof Cell2D) {
				if (this.parent[orientation].containType === "row") {
					const ratio = this[orientation].fraction / totalFraction;
					this.baseWidth = w;
					this.baseHeight = h * ratio;

					this.x = 0;
					this.y = prevCell ? prevCell.y + prevCell.baseHeight : 0;
				} else {
					const ratio = this[orientation].fraction / totalFraction;
					this.baseWidth = w * ratio;
					this.baseHeight = h;

					this.x = prevCell ? prevCell.x + prevCell.baseWidth : 0;
					this.y = 0;
				}
			}
		} else {
			this.baseWidth = w;
			this.baseHeight = h;
		}

		this.updateDebug();
		this.resizeChildren();
		this.updateMask({ portrait: this.portrait, landscape: this.landscape } as Cell2DGC);

		this.children.forEach((child: any) => {
			if (child?.components?.responsive) {
				child.components.responsive.update(child.components.get("responsive").data);
			}
		});
	};
}

export default Cell2D;
