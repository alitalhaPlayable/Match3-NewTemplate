// import { AnimatedSprite, Graphics, Loader, TextStyle, Text, Texture, utils, NineSlicePlane } from "pixi.js-legacy";
import * as PIXI from "pixi.js";

import Cache2D from "../utils/Cache2D";
import { StudioObject2D } from "./types";
import { VideoGC } from "../../common/components";
import EventEmitter from "../../common/EventEmitter";
import { isTemplate } from "core/libs/common/editorGlobals";

class Video extends PIXI.Sprite implements StudioObject2D {
	type: string = "sprite";
	id: string = "";

	selected: boolean = false;
	locked: boolean = false;
	eventEmitter: EventEmitter = EventEmitter.getInstance();

	videoComponent: VideoGC = {
		type: "video",
		src: "",
		loop: true,
		autoplay: true,
		muted: true,
		unmuteOnTouch: false,
		useUniqueTexture: false,
		uploadId: "",
		uploadName: "",
		srcType: "video",
	};

	videoElement: HTMLVideoElement | null = null;
	videoSrc: string = "";

	constructor() {
		super({
			texture: PIXI.Texture.EMPTY,
		});

		this.initComponentSystem();
	}

	updateVideoParams() {
		if (!this.videoElement) return;
		const component = this.videoComponent;

		this.videoElement.autoplay = component.autoplay;
		this.videoElement.loop = component.loop;
		this.videoElement.muted = component.muted;

		if (this.videoElement.autoplay) {
			this.play();
		} else {
			this.stop();
		}
	}

	async changeVideoTexture(component: VideoGC) {
		if (!component.src) return;

		let key = component.src;

		if (component.useUniqueTexture) {
			key += `_${this.id}`;
		}

		if (this.videoSrc === key && this.videoElement) {
			this.updateVideoParams();
			return;
		}

		this.videoSrc = key;
		let videoSrcToLoad = component.src;
		if (component.srcType === "uploadable" && isTemplate()) {
			videoSrcToLoad = `___uploaded_${component.uploadId}` as any;
			key = videoSrcToLoad;
		}
		const texture = await Cache2D.getVideo(videoSrcToLoad, key, false, {
			loop: component.loop,
			autoplay: component.autoplay,
			muted: component.muted,
		});
		if (!texture) return;

		this._setTextureFrame(texture);

		this.videoElement = texture.source.resource as HTMLVideoElement;
		this.updateVideoParams();

		this.baseWidth = texture.width;
		this.baseHeight = texture.height;
	}

	// COMPONENTS
	updateVideoComponent(component: VideoGC) {
		this.videoComponent = component;

		if (component.src) {
			this.changeVideoTexture(component);
			// const useTexture = Cache2D.getVideo(component.src, (textureRef: PIXI.Texture) => {
			// 	this.changeVideoTexture(textureRef);
			// });

			// if (useTexture) {
			// 	this.changeVideoTexture(useTexture);
			// }
		}
	}

	updateComponents(components: { [key: string]: any }) {
		const video = components.video as VideoGC;

		if (video) {
			this.updateVideoComponent(video);
		}

		super.updateComponents(components);
	}

	// HELPER FUNCTIONS
	play() {
		this.videoElement?.play();
	}
	pause() {
		this.videoElement?.pause();
	}
	stop() {
		if (this.videoElement) {
			this.videoElement.pause();
			this.videoElement.currentTime = 0;
		}
	}
	set muted(muted: boolean) {
		if (this.videoElement) {
			this.videoElement.muted = muted;
		}
	}
	get muted() {
		return this.videoElement?.muted || false;
	}

	set src(src: string) {
		this.videoSrc = src;
		this.videoComponent.src = src;
		this.changeVideoTexture(this.videoComponent);
	}
	get src() {
		return this.videoSrc;
	}

	set autoplay(autoplay: boolean) {
		if (this.videoElement) {
			this.videoElement.autoplay = autoplay;
		}
	}
	get autoplay() {
		return this.videoElement?.autoplay || false;
	}

	set loop(loop: boolean) {
		if (this.videoElement) {
			this.videoElement.loop = loop;
		}
	}
	get loop() {
		return this.videoElement?.loop || false;
	}

	set currentTime(time: number) {
		if (this.videoElement) {
			this.videoElement.currentTime = time;
		}
	}
	get currentTime() {
		return this.videoElement?.currentTime || 0;
	}
}

export default Video;
