import { MathUtils, CanvasTexture } from "three";

export default class CanvasMan {
	constructor(obj, texture, mapTypes, { flipY = false } = {}) {
		this.ctx = document.createElement("canvas").getContext("2d", {
			willReadFrequently: true,
			colorSpace: "srgb",
		});
		this.canvas = this.ctx.canvas;

		this.canvas.width = texture.image.width;
		this.canvas.height = texture.image.height;

		if (obj) {
			this.parentObject = obj;
		}

		this.ctx.drawImage(texture.image, 0, 0);
		//this.drawRandomDot();

		this.canvasTexture = new CanvasTexture(this.ctx.canvas);
		this.canvasTexture.flipY = flipY;
		this.canvasTexture.encoding = texture.encoding;
		this.originalTexture = this.cloneCanvas(this.canvas);

		this.canvasTexture.generateMipmaps = true;
		this.canvasTexture.premultiplyAlpha = false;

		if (obj) {
			if (!mapTypes) {
				this.parentObject.material["map"] = this.canvasTexture;
			} else {
				for (let mapType of mapTypes) {
					this.parentObject.material[mapType] = this.canvasTexture;
				}
			}
		}

		this.fullDrawn = false;

		this.isDirty = false;
	}

	getImageData(uv, radius) {
		let px = uv.x * this.canvas.width;
		let py = uv.y * this.canvas.height;

		let checkData = this.ctx.getImageData(px - radius, py - radius, radius * 2, radius * 2);
		return checkData;
	}

	getCanvasTexture() {
		return this.canvasTexture;
	}

	drawImage(uv, texture) {
		//let color = _color;
		let px = uv.x * this.canvas.width;
		let py = uv.y * this.canvas.height;

		this.ctx.drawImage(texture.image, px - 16, py - 16, 32, 32);
		this.canvasTexture.needsUpdate = true;
		//this.originalTexture.drawImage(this.canvas, 0, 0);
		/*  this.ctx.fillRect(px, py, 40, 40); */
		/*  this.ctx.strokeStyle = gradient; */
	}

	drawCircleSpreads(uv, _color) {
		let radlad = 30;
		this.drawCircleAt(uv, _color, radlad);
		radlad *= 1.1;
		for (let i = 0; i < 10; i++) {
			let ww = { val: 0 };
			anime({
				targets: ww,
				val: [0, 1],
				easing: "linear",
				duration: 100 * i,
				complete: () => {
					this.drawCircleAt(uv, _color, radlad);
					radlad *= 1.05;
				},
			});
		}
	}

	writeTextSimple(text, { fontSize = 40, x = 0, y = 0, fillColor = "#ffffff", strokeColor, fontName = "ui-font", lineWidth = 10 } = {}) {
		const ctx = this.ctx;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		x = x * this.canvas.width;
		y = y * this.canvas.height;

		ctx.fillStyle = fillColor;
		ctx.font = fontSize + "px " + fontName;
		ctx.lineWidth = lineWidth;
		ctx.textAlign = "center";

		if (strokeColor) {
			ctx.strokeStyle = strokeColor;
			ctx.strokeText(text, x, y);
		}
		ctx.fillText(text, x, y);

		this.canvasTexture.needsUpdate = true;
	}

	writeText(text, { fontSize = 40, x = 0, y = 0, simple = true, breakIndex = 15, useNewLine = true, fontName = "ui-font" } = {}) {
		this.drawAll("#ffffff");

		let ctx = this.ctx;
		ctx.fillStyle = "#000000";
		ctx.font = fontSize + "px " + fontName;

		if (!simple) {
			let tts = [];
			let tex = "";
			for (let i = 0; i < text.length; i++) {
				if (text[i] !== "#") {
					tex += text[i];
				}
				if ((!useNewLine && i !== 0 && i % breakIndex === 0) || (useNewLine && text[i] === "#") || i === text.length - 1) {
					tts.push(tex);
					ctx.fillText(tex, x, y * tts.length);
					tex = "";
				}
			}
			console.log(tts);
		} else {
			ctx.fillText(text, x, y);
		}

		this.canvasTexture.needsUpdate = true;
	}

	//experimental
	drawCircleAtWithAlphaMask(uv, _color, _radius, maskTexture) {
		let color = _color;
		//console.log(color);

		let px = uv.x * this.canvas.width;
		let py = uv.y * this.canvas.height;
		//console.log(px, py);

		let radius = _radius; //Globals.data.brushRadius;
		let brushStrength = 1; //Globals.data.brushStrength;
		let gradient = this.ctx.createRadialGradient(px, py, radius * 0.5, px, py, radius);
		gradient.addColorStop(0, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${brushStrength})`);

		gradient.addColorStop(1, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0)`);
		this.ctx.beginPath();
		this.ctx.arc(px, py, radius, 0, Math.PI * 2);
		this.ctx.fillStyle = gradient;
		this.ctx.fill();
		this.ctx.closePath();

		let oldy = this.ctx.globalCompositeOperation;
		this.ctx.globalCompositeOperation = "xor";
		this.ctx.drawImage(maskTexture.image, 0, 0);

		this.canvasTexture.needsUpdate = true;
		this.isDirty = true;
		this.ctx.globalCompositeOperation = oldy;
	}

	drawCircleAt(uv, _color, _radius = 30, bStr = 0.1) {
		let color = _color;
		//console.log(color);

		let px = uv.x * this.canvas.width;
		let py = uv.y * this.canvas.height;
		//console.log(px, py);

		let radius = _radius; //Globals.data.brushRadius;
		let brushStrength = bStr; //Globals.data.brushStrength;
		let gradient = this.ctx.createRadialGradient(px, py, radius * 0.5, px, py, radius);
		gradient.addColorStop(0, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${brushStrength})`);

		gradient.addColorStop(1, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0)`);
		this.ctx.beginPath();

		this.ctx.arc(px, py, radius, 0, Math.PI * 2);
		this.ctx.fillStyle = gradient;
		this.ctx.fill();

		if (!this.timer) {
			this.timer = 0;
		}
		this.timer++;
		if (this.timer > 1) {
			this.timer = 0;
			this.canvasTexture.needsUpdate = true;
		}
		//this.canvasTexture.needsUpdate = true;
		//this.originalTexture.drawImage(this.canvas, 0, 0);
		this.isDirty = true;
	}

	drawCircleHard(uv, _color, _radius = 30) {
		let color = _color;
		//console.log(color);

		let px = uv.x * this.canvas.width;
		let py = uv.y * this.canvas.height;
		//console.log(px, py);

		let radius = _radius; //Globals.data.brushRadius;
		let brushStrength = 1; //Globals.data.brushStrength;

		this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${1})`;
		this.ctx.beginPath();

		this.ctx.arc(px, py, radius, 0, Math.PI * 2);
		this.ctx.fill();

		if (!this.timer) {
			this.timer = 0;
		}
		this.timer++;
		if (this.timer > 1) {
			this.timer = 0;
			this.canvasTexture.needsUpdate = true;
		}
		//this.canvasTexture.needsUpdate = true;
		//this.originalTexture.drawImage(this.canvas, 0, 0);
		this.isDirty = true;
	}

	drawAllWithOpacity(_colorRgb, opacity) {
		let color = _colorRgb;
		this.drawAll(`rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
	}

	drawRandomDot() {
		this.ctx.fillStyle = `#${this.randInt(0x1000000).toString(16).padStart(6, "0")}`;
		this.ctx.beginPath();
		this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fill();

		this.canvasTexture.needsUpdate = true;
	}

	drawAll(color) {
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fill();

		this.canvasTexture.needsUpdate = true;
	}

	applyTexture(texture) {
		this.ctx.drawImage(texture.image, 0, 0);
		this.canvasTexture.needsUpdate = true;
	}

	returnOriginal() {
		this.ctx.drawImage(this.originalTexture.canvas, 0, 0);
		this.canvasTexture.needsUpdate = true;
	}

	randInt(min, max) {
		if (max === undefined) {
			max = min;
			min = 0;
		}
		return (Math.random() * (max - min) + min) | 0;
	}

	cloneCanvas(oldCanvas) {
		//create a new canvas
		let ctx = document.createElement("canvas").getContext("2d");
		let canvas = ctx.canvas;

		//set dimensions
		canvas.width = oldCanvas.width;
		canvas.height = oldCanvas.height;

		//apply the old canvas to the new one
		ctx.drawImage(oldCanvas, 0, 0);

		//return the new canvas
		return ctx;
	}
}
