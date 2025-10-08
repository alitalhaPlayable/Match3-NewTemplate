// import { AnimatedSprite, Graphics, Loader, TextStyle, Text, Texture, utils, NineSlicePlane } from "pixi.js-legacy";
import * as PIXI from "pixi.js";

import { StudioObject2D } from "./types";
import Cache2D from "../utils/Cache2D";

interface AnimatedSpriteGC {
	type: "animatedSprite";
	animationSpeed: number;
	loop: boolean;
	autoplay: boolean;
	animationTexture: string;
	animation: string;
	tint: string;
}

class AnimatedSprite extends PIXI.AnimatedSprite implements StudioObject2D {
	type: string = "animatedSprite";
	id: string = "";

	selected: boolean = false;
	locked: boolean = false;

	animationKey: string;
	animationTexture: string;
	autoplay: boolean;

	isAnimatedSprite: boolean = true;

	constructor(animationTexture: string, animationKey: string = "", autoplay: boolean = true, loop: boolean = false) {
		const animData = Cache2D.getAnimation(animationTexture, (animData2) => {
			this.changeAnimationTexture(animData2);
		});

		let animationFrames;

		if (animData) {
			const [animationKeyRef] = animationKey ? [animationKey] : Object.keys(animData.animations);
			animationFrames = animData.animations[animationKeyRef];
		} else {
			animationFrames = [PIXI.Texture.EMPTY];
		}

		super(animationFrames);
		this.initComponentSystem();

		this.autoplay = autoplay;
		this.loop = loop;
		this.animationKey = animationKey;
		this.animationTexture = animationTexture;
	}

	changeAnimationTexture(animData: any) {
		const [animationKeyRef] = this.animationKey ? [this.animationKey] : Object.keys(animData.animations);
		this.textures = animData.animations[animationKeyRef];

		this.baseWidth = this.texture.orig.width;
		this.baseHeight = this.texture.orig.height;

		if (this.components.responsive) {
			this.components.responsive.update();
		}
	}

	playAnim(animation: string, reverse: boolean = false) {
		if (reverse) this.gotoAndStop(this.totalFrames - 1);
		this.animationSpeed = (reverse ? -1 : 1) * Math.abs(this.animationSpeed);

		if (animation !== this.animationKey) {
			this.changeTextureAndPlay(this.animationTexture, animation);
			return;
		}
		this.play();
	}

	changeTextureAndPlay(animationTexture: string, animationKey: string) {
		this.animationKey = animationKey;
		const play = () => {
			if (this.autoplay) {
				this.gotoAndPlay(0);
				this.playAnim(this.animationKey);
			} else {
				this.stop();
			}
		};

		// if (!checkIfAnimationTextureMatch(this.animationTexture, animationTexture)) {
		const animData = Cache2D.getAnimation(animationTexture, (animData2) => {
			this.changeAnimationTexture(animData2);
			play();
		});

		if (animData) {
			this.changeAnimationTexture(animData);
			play();
		}
	}

	// COMPONENTS
	updateAnimatedSpriteComponent(component: AnimatedSpriteGC) {
		this.animationSpeed = component.animationSpeed;
		this.loop = component.loop;
		this.autoplay = component.autoplay;

		this.changeTextureAndPlay(component.animationTexture, component.animation);

		this.tint = component.tint;
	}

	getAnimatedSpriteComponent(): AnimatedSpriteGC {
		return {
			type: "animatedSprite",
			animationSpeed: this.animationSpeed,
			loop: this.loop,
			autoplay: this.autoplay,
			animation: this.animationKey,
			animationTexture: this.animationTexture,
			tint: "#FFFFFF",
		};
	}

	updateComponents(components: { [key: string]: any }) {
		const animatedSprite = components.animatedSprite as AnimatedSpriteGC;

		if (animatedSprite) {
			this.updateAnimatedSpriteComponent(animatedSprite);
		}

		super.updateComponents(components);
	}
}

export default AnimatedSprite;
