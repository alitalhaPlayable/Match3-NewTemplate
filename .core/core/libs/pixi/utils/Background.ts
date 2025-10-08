import { Sprite, Texture } from "pixi.js";

export default class Background extends Sprite {
	constructor() {
		super({
			texture: Texture.WHITE,
		});
		this.init();
	}

	init() {
		this.onResizeCallback = (w: number, h: number) => {
			this.width = w;
			this.height = h;
		};
	}

	setGradient(topColor: string, bottomColor: string) {
		const gradientCanvas = document.createElement("canvas");
		gradientCanvas.width = 256;
		gradientCanvas.height = 256;
		const gradientCtx = gradientCanvas.getContext("2d");

		const gradient = gradientCtx!.createLinearGradient(0, 0, 0, gradientCanvas.height);

		gradient.addColorStop(0, topColor);
		gradient.addColorStop(1, bottomColor);

		gradientCtx!.fillStyle = gradient;
		gradientCtx!.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);

		this.texture = Texture.from(gradientCanvas);
		this.baseWidth = gradientCanvas.width;
		this.baseHeight = gradientCanvas.height;
	}
}
