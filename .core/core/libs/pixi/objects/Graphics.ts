import * as PIXI from "pixi.js";

// eslint-disable-next-line import/no-cycle
import { StudioObject2D } from "./types";
import Components2D from "./components/components";
import { GraphicsGC, GraphicsShapeBase, GraphicsShapeCircle, GraphicsShapeEllipse, GraphicsShapeLine, GraphicsShapePolygon, GraphicsShapeRectangle, GraphicsShapeStar } from "../../common/components";

class Graphics extends PIXI.Graphics implements StudioObject2D {
	id: string = "";
	type: string = "graphics";
	components: Components2D;

	selected: boolean = false;
	locked: boolean = false;

	focusedShapeId: string | null = null;

	constructor() {
		super();

		this.components = new Components2D(this);
	}

	updateGraphicsComponent(graphics: GraphicsGC) {
		// console.log("graphics", graphics);
		this.focusedShapeId = graphics.focusedShapeId;

		this.clear();

		for (const shape in graphics.shapes) {
			if (Object.prototype.hasOwnProperty.call(graphics.shapes, shape)) {
				const shapeData = graphics.shapes[shape];
				// console.log("shape", shapeData);
				const { type } = shapeData;

				const { position, fill, stroke } = shapeData as GraphicsShapeBase;
				const { x, y } = position;
				if (type === "rectangle") {
					const { width, height, roundRadius } = shapeData as GraphicsShapeRectangle;
					if (roundRadius === 0) {
						this.rect(x, y, width, height);
					} else {
						this.roundRect(x, y, width, height, roundRadius);
					}
				} else if (type === "circle") {
					const { radius } = shapeData as GraphicsShapeCircle;
					this.circle(x, y, radius);
				} else if (type === "ellipse") {
					const { width, height } = shapeData as GraphicsShapeEllipse;
					this.ellipse(x, y, width, height);
				} else if (type === "star") {
					const { points, radius, innerRadius, rotation } = shapeData as GraphicsShapeStar;
					this.star(x, y, points, radius, innerRadius, rotation);
				} else if (type === "line") {
					const { moveTo, lines } = shapeData as GraphicsShapeLine;
					this.moveTo(moveTo.x, moveTo.y);
					for (const line in lines) {
						if (Object.prototype.hasOwnProperty.call(lines, line)) {
							this.lineTo(lines[line].x, lines[line].y);
						}
					}
				} else if (type === "polygon") {
					const { points, closePath } = shapeData as GraphicsShapePolygon;

					const arrPoints = [];
					for (const point in points) {
						if (Object.prototype.hasOwnProperty.call(points, point)) {
							arrPoints.push({
								x: points[point].x + x,
								y: points[point].y + y,
							});
						}
					}

					// arrPoints.forEach((point) => {
					// 	const rect = PIXI.Sprite.from(PIXI.Texture.WHITE);
					// 	rect.width = 10;
					// 	rect.height = 10;
					// 	rect.anchor.set(0.5);
					// 	rect.position.set(this.x + point.x, this.y + point.y);
					// 	setTimeout(() => {
					// 		this.parent.addChild(rect);
					// 	}, 100);
					// });

					this.poly(arrPoints, closePath);
				}

				if (fill.enabled) {
					const fillData = this.convertToFillStyle(fill.color, this.height, graphics.gradientBoxDataObject);
					if (fillData.fill) {
						fillData.alpha = fill.alpha;
						this.fill(fillData);
					} else {
						this.fill({
							color: fillData.color,
							alpha: fill.alpha,
						});
					}
				}

				if (stroke.enabled) {
					this.stroke({ width: stroke.width, color: stroke.color, alpha: stroke.alpha });
				}
			}
		}
	}

	updateComponents(components: { [key: string]: any }) {
		const graphics = components.graphics as GraphicsGC;
		if (graphics) {
			this.updateGraphicsComponent(graphics);
		}
		super.updateComponents(components);
		// this.components.update(components);
	}
}

export default Graphics;
