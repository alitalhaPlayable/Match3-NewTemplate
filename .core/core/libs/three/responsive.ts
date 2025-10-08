import { WebGLRenderer } from "three";
import globals from "@globals";
import { getDeviceOrientation } from "../common/editorGlobals";

class Responsive {
	config: any;
	renderer: WebGLRenderer;

	constructor(config: any, renderer: WebGLRenderer) {
		this.config = config;
		this.renderer = renderer;
	}

	setRenderer(renderer: WebGLRenderer) {
		this.renderer = renderer;
	}

	resize(iw: number, ih: number) {
		let renderer = this.renderer;
		let canvas = this.renderer.domElement;

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

		canvas.style.transform = "scale(" + scale + ")";
		canvas.style.transformOrigin = "top left";
		canvas.style.left = 0 + "px";
		canvas.style.top = 0 + "px";

		const lockScreen = globals.projectConfig.generalSettings.lockScreen;
		const orientation = getDeviceOrientation();

		if (lockScreen === "landscape") {
			if (orientation === "portrait") {
				canvas.style.transform = "scale(" + scale + ") rotate(90deg)";
				canvas.style.left = ih + "px";
			}
		} else if (lockScreen === "portrait") {
			if (orientation === "landscape") {
				canvas.style.transform = "scale(" + scale + ") rotate(-90deg)";
				canvas.style.left = 0 + "px";
				canvas.style.top = iw + "px";
			}
		}

		// let styleWidth = canvasWidth + "px";
		// let styleHeight = canvasHeight + "px";

		// canvas.style.maxWidth = styleWidth;
		// canvas.style.maxHeight = styleHeight;

		var aspect = canvasWidth / canvasHeight;
		renderer.setSize(canvasWidth, canvasHeight);

		return { width: canvasWidth, height: canvasHeight };
	}
}

export default Responsive;
