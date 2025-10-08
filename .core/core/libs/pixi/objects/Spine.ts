// import { AnimatedSprite, Graphics, Loader, TextStyle, Text, Texture, utils, NineSlicePlane } from "pixi.js-legacy";
import * as PIXI from "pixi.js";
import { Attachment, MeshAttachment, Spine as PixiSpine, RegionAttachment, SpineTexture, TextureRegion } from "@esotericsoftware/spine-pixi-v8";
import { StudioObject2D } from "./types";

import Cache2D from "../utils/Cache2D";
import { isTemplate } from "core/libs/common/editorGlobals";

interface SpineGC {
	type: "spine";
	spineTexture: string;
	skin: string;
	animation: string;
	animationSpeed: number;
	autoplay: boolean;
	loop: boolean;
	tint: string;
}

class Spine extends PIXI.Container implements StudioObject2D {
	type: string = "spine";
	id: string = "";

	selected: boolean = false;
	locked: boolean = false;

	spineTexture: string = "";
	animation: string;
	animationSpeed: number = 1;
	autoplay: boolean;
	loop: boolean;
	spineObj?: PixiSpine;

	constructor(x: number, y: number, spineTexture: string, animation: string = "", autoplay: boolean = true, loop: boolean = false) {
		super({ x, y });
		this.initComponentSystem();

		this.autoplay = autoplay;
		this.loop = loop;
		this.animation = animation;
		// this.spineTexture = spineTexture;

		// spineboy.state.data.defaultMix = 0.2;
		// spineboy.state.setAnimation(0, "run", true);
	}

	// COMPONENTS
	updateSpineComponent(component: SpineGC) {
		this.animation = component.animation;
		this.timescale = component.animationSpeed;
		this.autoplay = component.autoplay;
		this.loop = component.loop;
		this.tint = component.tint || "#FFFFFF";

		if (!component.spineTexture) {
			this.spineTexture = "";
			if (this.spineObj) {
				// this.spineObj.destroy();
				this.removeChild(this.spineObj);
			}
			return;
		}

		const skinName = component.skin || this.spineObj?.skeleton.skin?.name || this.spineObj?.skeleton.data.skins[0]?.name || "";

		if (isTemplate()) {
			if (!this.spineObj) {
				this.setSpineData(component.spineTexture, (spineData) => {
					this.setSkinByName(skinName);
					if (component.autoplay) {
						this.play(this.animation, this.loop);
					}
					this.setTimeScale(component.animationSpeed);
					return this;
				});
			}
			return;
		}

		if (component.spineTexture === this.spineTexture && this.spineObj) {
			this.setSkinByName(skinName);
			if (component.autoplay) {
				this.play(this.animation, this.loop);
			}
			this.setTimeScale(component.animationSpeed);
		} else {
			this.loadSpineTexture(component.spineTexture)
				.then(() => {
					this.setSkinByName(skinName);
					if (component.autoplay) {
						this.play(this.animation, this.loop);
					}
					this.setTimeScale(component.animationSpeed);
					return this;
				})
				.catch((e) => {
					return e;
				});
		}
		this.updateHitArea();
	}

	private updateHitArea() {
		const data = this.spineObj?.skeleton.data;
		this.hitArea = new PIXI.Rectangle(data?.x, -(data?.y ?? 0) - (data?.height ?? 0), data?.width ?? 0, data?.height ?? 0);
	}

	addSpineObj(spineData: any) {
		if (this.spineObj) {
			// this.spineObj.destroy();
			this.removeChild(this.spineObj);
		}
		this.spineObj = PixiSpine.from(spineData);
		this.addChild(this.spineObj);

		this.spineObj.state.data.defaultMix = 0.3;

		this.updateHitArea();
	}

	async loadSpineTexture(spineTexture: string) {
		return new Promise((resolve) => {
			if (spineTexture === this.spineTexture) {
				resolve(true);
			}

			this.spineTexture = spineTexture;
			this.setSpineData(spineTexture, (spineData) => {
				resolve(true);
			});
		});
	}

	setSpineData(spineTexture: string, callback: (spineData: any) => void) {
		const spineData = Cache2D.getSpine(spineTexture, (spineDataNew) => {
			this.addSpineObj(spineDataNew);
			callback(spineData);
		});

		if (spineData) {
			this.addSpineObj(spineData);
			callback(spineData);
		}
	}

	getSpriteComponent(): SpineGC {
		return {
			type: "spine",
			spineTexture: this.spineTexture,
			skin: this.skin,
			animation: this.animation,
			animationSpeed: this.animationSpeed,
			loop: this.loop,
			autoplay: this.autoplay,
			tint: "#FFFFFF",
		};
	}

	updateComponents(components: { [key: string]: any }) {
		const spine = components.spine as SpineGC;
		if (spine) {
			this.updateSpineComponent(spine);
		}
		super.updateComponents(components);
	}

	setSkinByName(skinName: string) {
		if (!this.spineObj) return;
		if (!skinName) {
			skinName = this.spineObj.skeleton.data.skins[0]?.name || "";
			if (!skinName) {
				console.warn("No skin found for spine object");
				return;
			}
		}
		// this.spineObj.skeleton.setSkin(null);
		this.spineObj.skeleton.setSkinByName(skinName);
		this.spineObj.skeleton.setSlotsToSetupPose();

		const bounds = this.spineObj.getLocalBounds().rectangle;
		this.baseWidth = bounds.width;
		this.baseHeight = bounds.height;

		return this;
	}

	set skin(skin: string) {
		this.setSkinByName(skin);
	}

	get skin() {
		return this.spineObj?.skeleton.skin?.name || "";
	}

	play(animationName: string, loop: boolean, callback: (() => void) | null = null, duration: number = 0) {
		if (!this.spineObj) return;
		if (!animationName) return;

		if (!this.hasAnimation(animationName)) {
			this.resetAnimation();
			return;
		}

		if (duration) {
			const animation = this.spineObj.state.data.skeletonData.findAnimation(animationName);
			if (animation) {
				const fullLength = animation?.originalDuration || animation?.duration;
				if (!fullLength) {
					console.warn(`Animation ${animationName} has no duration.`);
					return;
				}

				animation.originalDuration = fullLength;
				animation.duration = fullLength * duration;
				this.spineObj.state.addListener({
					end: (entry) => {
						if (entry?.animation?.name === animationName) {
							animation.duration = animation.originalDuration;
						}
					},
				});
			} else {
				console.warn(`Animation not found: ${animationName}`);
				return;
			}
		}

		this.spineObj.state.setAnimation(0, animationName, loop);
		if (this.spineObj.state.tracks[0] && callback) {
			this.spineObj.state.tracks[0].listener = {
				complete: callback,
			};
		}
		this.loop = loop;
		return this;
	}

	playAnimation(animationName: string, loop: boolean, callback: (() => void) | null = null, duration: number) {
		return this.play(animationName, loop, callback, duration);
	}

	addAnimation(animationName: string, loop: boolean, callback: (() => void) | null = null) {
		if (!this.spineObj) return;
		if (!animationName) return;

		if (!this.hasAnimation(animationName)) {
			this.resetAnimation();
			return;
		}

		this.spineObj.state.addAnimation(0, animationName, loop, 0);
		if (this.spineObj.state.tracks[0] && callback) {
			this.spineObj.state.tracks[0].listener = {
				complete: callback,
			};
		}
		this.loop = loop;
		return this;
	}

	resetAnimation() {
		if (!this.spineObj) return;

		this.spineObj.state.clearTracks();
		this.spineObj.state.setEmptyAnimation(0, 0);
	}

	// TIMESCALE
	set timescale(value: number) {
		if (!this.spineObj) return;
		this.spineObj.state.timeScale = value;
	}

	get timescale() {
		return this.spineObj?.state.timeScale || 1;
	}

	setTimeScale(value: number) {
		if (!this.spineObj) return;
		this.spineObj.state.timeScale = value;
		return this;
	}

	getAnimationList() {
		return this.spineObj?.state.data.skeletonData.animations.map((animation: any) => animation.name) || [];
		// spineData.animations.map((animation: any) => animation.name);
	}

	hasAnimation(animationName: string) {
		return this.getAnimationList().includes(animationName);
	}

	replaceSlotTexture(slotName: string, pixiTexture: PIXI.Texture) {
		if (!this.spineObj) {
			console.warn("Spine object is not initialized.");
			return;
		}
		const slot = this.spineObj.skeleton.findSlot(slotName);
		if (!slot) {
			console.warn(`Slot not found: ${slotName}`);
			return;
		}
		const attachment = slot.getAttachment();
		if (!attachment) {
			console.warn(`No attachment found on slot: ${slotName}`);
			return;
		}
		const spineTexture = SpineTexture.from(pixiTexture.source);
		const region = this._createTextureRegion(spineTexture, pixiTexture);
		const handler = this._getAttachmentUpdateHandler(attachment);
		if (!handler) {
			console.warn(`No handler found for attachment type: ${attachment.constructor.name}`);
			return;
		}
		handler(attachment as any, region, pixiTexture);
		this.spineObj.skeleton.setSlotsToSetupPose();
		// this.spineObj.update(0);
	}

	private _createTextureRegion(spineTexture: SpineTexture, pixiTexture: PIXI.Texture): TextureRegion {
		const region = new TextureRegion();
		region.texture = spineTexture;
		region.u = 0;
		region.v = 0;
		region.u2 = 1;
		region.v2 = 1;
		region.width = pixiTexture.width;
		region.height = pixiTexture.height;
		region.originalWidth = pixiTexture.width;
		region.originalHeight = pixiTexture.height;
		// region.rotate = false;
		region.offsetX = 0;
		region.offsetY = 0;
		return region;
	}
	private _getAttachmentUpdateHandler(attachment: Attachment) {
		if (attachment instanceof RegionAttachment) {
			return this._updateRegionAttachment;
		}
		if (attachment instanceof MeshAttachment) {
			return this._updateMeshAttachment;
		}

		return null;
	}
	private _updateRegionAttachment(attachment: RegionAttachment, region: TextureRegion, pixiTexture: PIXI.Texture) {
		attachment.region = region;
		attachment.width = pixiTexture.width;
		attachment.height = pixiTexture.height;
		attachment.updateRegion();
	}
	private _updateMeshAttachment(attachment: MeshAttachment, region: TextureRegion, _pixiTexture: PIXI.Texture) {
		attachment.region = region;
		attachment.updateRegion();
	}

	// getSkinList() {
	// 	return this.spineObj?.spineData.skins.map((skin:Skin) => skin.name);
	// }

	// getAnimationList() {
	// 	return this.spineObj?.spineData.animations.map((animation:Animation) => animation.name);
	// }

	// addListener(
	// 	props = {
	// 		event: function (entry: { trackIndex: string }, event: { data: string }) {
	// 		},
	// 		complete: function (entry: { trackIndex: string; loopsCount: () => string }) {
	// 		},
	// 		start: function (entry: { trackIndex: string }) {
	// 		},
	// 		end: function (entry: { trackIndex: string }) {
	// 		},
	// 		dispose: function (entry: { trackIndex: string }) {
	// 		},
	// 		interrupted: function (entry: { trackIndex: string }) {
	// 		},
	// 	}
	// ) {
	// 	if (!this.spineObj) return;
	// 	// this.spineObj.state.addListener(props);
	// 	this.spineObj.state.listeners[0];
	// }
}

export default Spine;
