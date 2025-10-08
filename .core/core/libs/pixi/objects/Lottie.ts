// import { AnimatedSprite, Graphics, Loader, TextStyle, Text, Texture, utils, NineSlicePlane } from "pixi.js-legacy";
import * as PIXI from "pixi.js";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { StudioObject2D } from "./types";

import { LottieGC } from "../../common/components";
import Cache2D from "../utils/Cache2D";
import { getCanvasParent, isStudio } from "../../common/editorGlobals";
import globals from "@globals";

class Lottie extends PIXI.Container implements StudioObject2D {
	type: string = "sprite";
	id: string = "";

	selected: boolean = false;
	locked: boolean = false;
	debugRect: PIXI.Graphics = new PIXI.Graphics();

	animation: string;
	speed: number = 1;
	autoplay: boolean = true;
	loop: boolean = false;

	lottieObj?: DotLottie;
	lottieCanvas!: HTMLCanvasElement;
	lottieReady: boolean = false;
	canvasWidth: number = 400;
	canvasHeight: number = 400;
	renderTarget: "canvas" | "pixi" = "canvas";

	canvasTexture?: PIXI.Texture;
	canvasSprite?: PIXI.Sprite;

	interval: any;

	constructor(x: number, y: number, uuid: string, animation: string = "") {
		super({ x, y });
		this.initComponentSystem();
		this.initCanvas(uuid);

		this.animation = animation;

		if (isStudio()) {
			this.updateDebug();
			this.addChild(this.debugRect);
		}
	}

	initCanvas(uuid: string) {
		const id = `canvas-${uuid}`;
		const tempCanvas = document.getElementById(id);
		if (tempCanvas) {
			tempCanvas.remove();
		}

		const canvas = document.createElement("canvas");
		canvas.style.position = "absolute";
		canvas.style.pointerEvents = "none";
		getCanvasParent().appendChild(canvas);
		canvas.id = id;

		this.lottieCanvas = canvas;
	}

	updateDebug() {
		if (!isStudio()) return;
		this.debugRect.clear();
		this.debugRect.rect(0, 0, this.baseWidth, this.baseHeight);
		this.debugRect.fill({ color: 0x0ea5e9, alpha: 0.2 });
	}

	initLottieObject(lottieData: string) {
		if (this.lottieObj) {
			this.lottieObj.destroy();
		}

		const dotLottie = new DotLottie({
			canvas: this.lottieCanvas,
			autoplay: this.autoplay,
			loop: this.loop,
			speed: this.speed,
			mode: "forward", // 'forward' | 'reverse' | 'bounce' | 'reverse-bounce'
			segment: [0, 100],
			layout: {
				align: [0.5, 0.5],
				fit: "contain", // 'contain' | 'cover' | 'fill' | 'none' | 'fit-width' | 'fit-height'
			},
			renderConfig: {
				autoResize: false,
				devicePixelRatio: 1,
				freezeOnOffscreen: true,
			},
			// useFrameInterpolation: true,
			src: lottieData,
		});

		this.lottieObj = dotLottie;

		setTimeout(() => {
			this.lottieReady = true;
			this.onResizeCallback(this.parent.baseWidth, this.parent.baseHeight);
		}, 500);

		if (this.canvasTexture) {
			this.canvasTexture.destroy();
			this.canvasSprite?.destroy();
		}

		if (this.interval) {
			clearInterval(this.interval);
		}

		if (this.renderTarget === "pixi") {
			const canvasTexture = PIXI.Texture.from(this.lottieCanvas);
			const canvasSprite = new PIXI.Sprite(canvasTexture);
			this.canvasSprite = canvasSprite;
			canvasSprite.anchor.set(0.5);

			canvasSprite.x = this.baseWidth * 0.5;
			canvasSprite.y = this.baseHeight * 0.5;
			this.addChild(canvasSprite);

			this.canvasSprite = canvasSprite;
			this.canvasTexture = canvasTexture;
		}
	}

	loadLottie() {
		if (isStudio()) {
			return;
		}
		if (!this.animation) return;

		const lottieData = Cache2D.getLottie(this.animation, (data) => {
			this.initLottieObject(data);
		});

		if (lottieData) {
			this.initLottieObject(lottieData);
		}
	}

	play() {
		this.lottieObj?.play();
	}

	pause() {
		this.lottieObj?.pause();
	}

	stop() {
		this.lottieObj?.stop();
	}

	// COMPONENTS
	updateLottieComponent(component: LottieGC) {
		this.animation = component.animation;
		this.speed = component.speed;
		this.autoplay = component.autoplay;
		this.loop = component.loop;
		this.canvasWidth = component.width;
		this.canvasHeight = component.height;
		this.renderTarget = component.renderTarget;

		this.lottieCanvas.width = this.canvasWidth;
		this.lottieCanvas.height = this.canvasHeight;

		const transformComponent = this.components.get("transform");

		this.baseWidth = this.canvasWidth;
		this.baseHeight = this.canvasHeight;

		this.pivot.set(this.baseWidth * transformComponent.origin.x, this.baseHeight * transformComponent.origin.y);
		this.setOrigin(transformComponent.origin.x, transformComponent.origin.y);

		this.updateDebug();
		this.loadLottie();
	}

	getLottieComponent(): LottieGC {
		return {
			type: "lottie",
			width: this.canvasWidth,
			height: this.canvasHeight,
			animation: this.animation,
			speed: this.speed,
			loop: this.loop,
			autoplay: this.autoplay,
			renderTarget: this.renderTarget,
		};
	}

	updateComponents(components: { [key: string]: any }) {
		const lottie = components.lottie as LottieGC;
		if (lottie) {
			this.updateLottieComponent(lottie);
		}
		super.updateComponents(components);
	}

	onResizeCallback = (w: number, h: number) => {
		if (!this.lottieReady || isStudio()) return;
		const canvas = this.lottieCanvas;
		if (this.renderTarget === "canvas") {
			canvas.style.zIndex = "5";
			canvas.style.position = "absolute";

			const worldPos = this.getGlobalPosition(new PIXI.Point(0, 0));
			const pixiScale = globals.pixiScale;

			let scale = Math.min(this.baseWidth / this.canvasWidth, this.baseHeight / this.canvasHeight);
			scale *= pixiScale;

			canvas.style.transform = `scale(${scale})`;
			canvas.style.transformOrigin = `top left`;

			const x = worldPos.x * pixiScale - canvas.width * scale * 0.5;
			const y = worldPos.y * pixiScale - canvas.height * scale * 0.5;

			canvas.style.left = `${x}px`;
			canvas.style.top = `${y}px`;
		} else {
			canvas.style.zIndex = "-1";
		}
	};

	customUpdate() {
		if (this.renderTarget === "pixi" && this.lottieObj?.isPlaying) {
			this.canvasSprite?.texture.source.update();
		}
	}
}

export default Lottie;
