import { Application } from "pixi.js";
import globals from "@globals";

class Responsive {
	config: any;
	application: Application;

	constructor(config: any, application: Application) {
		this.config = config;
		this.application = application;
	}

	setApplication(application: Application) {
		this.application = application;
	}

	resize(iw: number, ih: number) {
		let application = this.application;
		let canvas = this.application.canvas;

		const config = this.config;
		let resolution = config.resolution || 1;
		let scale = 1 / resolution;

		let canvasWidth, canvasHeight;

		if (config.maxDimension && iw * resolution > config.maxDimension && ih * resolution > config.maxDimension) {
			var maxWidth = config.maxDimension;

			scale = Math.min(iw / maxWidth, ih / maxWidth) + 0.0015;
			resolution = 1;

			canvasWidth = Math.ceil(iw / scale);
			canvasHeight = Math.ceil(ih / scale);
		} else {
			canvasWidth = iw * resolution;
			canvasHeight = ih * resolution;
		}

		app.pixiScale = scale;
		globals.pixiScale = scale;

		// @ts-ignore
		canvas.style["-ms-transform"] = "scale(" + scale + ")";
		// @ts-ignore
		canvas.style["-webkit-transform"] = "scale3d(" + scale + ", 1)";
		// @ts-ignore
		canvas.style["-moz-transform"] = "scale(" + scale + ")";
		// @ts-ignore
		canvas.style["-o-transform"] = "scale(" + scale + ")";
		canvas.style.transform = "scale(" + scale + ")";
		canvas.style.transformOrigin = "top left";

		// let styleWidth = canvasWidth + "px";
		// let styleHeight = canvasHeight + "px";

		// canvas.style.maxWidth = styleWidth;
		// canvas.style.maxHeight = styleHeight;

		var aspect = canvasWidth / canvasHeight;
		// renderer.setSize(canvasWidth, canvasHeight);
		application.renderer.resize(canvasWidth, canvasHeight);
		globals.pixiWidth = canvasWidth;
		globals.pixiHeight = canvasHeight;

		return { width: canvasWidth, height: canvasHeight };
	}
}

export default Responsive;
