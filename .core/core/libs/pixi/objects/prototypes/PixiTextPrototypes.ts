import * as PIXI from "pixi.js";

function getGradientPoints(degree:number) {
  const radians = (degree - 90) * (Math.PI / 180); 
  const x = Math.cos(radians);
  const y = Math.sin(radians);

  const start = { x: 0.5 - x / 2, y: 0.5 - y / 2 };
  const end = { x: 0.5 + x / 2, y: 0.5 + y / 2 };
  return { start, end };
}

function convertToFillStyle(fillData: string | string[], height: number, gradientData: any): PIXI.FillStyle {
	let fill: PIXI.FillStyle;

	if (Array.isArray(fillData) && fillData.length > 1) {
		let fillGradient = new PIXI.FillGradient({
			type: "linear",
			start: { x: 0, y: 0 },
			end: { x: 0, y: 1 },
			textureSpace: "local",
		})

		if (gradientData) {
			if (gradientData.gradientType === "radial-gradient") {
				fillGradient = new PIXI.FillGradient({
					type: 'radial',
					center: { x: 0.5, y: 0.5 },
					innerRadius: 0,
					outerCenter: { x: 0.5, y: 0.5 },
					outerRadius: 0.5,
					textureSpace: 'local'
				})
			} else {
				fillGradient = new PIXI.FillGradient({
					type: 'linear',
					...getGradientPoints(gradientData.degrees.split("deg")[0]),
					textureSpace: 'local'
				})
			}
		}
		
		const colors = fillData.map((color) => PIXI.Color.shared.setValue(color).toNumber());
		colors.forEach((number, index) => {
			let ratio = (index+1) / colors.length;
			if (gradientData) {
				ratio = gradientData.colors[index].left / 100
			}
			fillGradient.addColorStop(ratio, number);
		});

		fill = {
			fill: fillGradient,
		};
	} else {
		const color = (Array.isArray(fillData) ? fillData[0] : fillData) as string;
		fill = {
			color: color || "#ffffff",
		};
	}

	return fill;
}

PIXI.Text.prototype.convertToFillStyle = convertToFillStyle;
PIXI.HTMLText.prototype.convertToFillStyle = convertToFillStyle;
PIXI.Graphics.prototype.convertToFillStyle = convertToFillStyle;

export default () => {
	return null;
};
