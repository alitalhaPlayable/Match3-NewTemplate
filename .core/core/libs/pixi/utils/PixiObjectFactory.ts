// import * as PIXI from "pixi.js";
import Sprite from "../objects/Sprite";
// import Node2d from "../objects/Node2d";
import { GameNode, PartialGameComponent } from "./../../common/scene";
import Container from "../objects/Container";
import AnimatedSprite from "../objects/AnimatedSprite";
import { defaultTexture } from "../utils/AssetDefaults2D";
import Spine from "../objects/Spine";
import Text from "../objects/Text";
import { StudioObject2D } from "../objects/types";
import Graphics from "../objects/Graphics";
import TilingSprite from "../objects/TilingSprite";
import Physics from "../objects/components/physics";
import Viewport from "../objects/Viewport";
// eslint-disable-next-line import/no-cycle
import Layout2D from "../objects/Layout2D";
import Cell2D from "../objects/Cell2D";
import NineSliceSprite from "../objects/NineSliceSprite";
import Tutorial from "../objects/Tutorial";
import Camera from "../objects/Camera";
import Feedback from "../objects/Feedback";
import HTMLText from "../objects/HtmlText";
import Cta from "../objects/Cta";
// import Lottie from "../objects/Lottie";
import ParticleEmitter from "../objects/ParticleEmitter";
import Layer from "../objects/Layer";
import Video from "../objects/Video";
import ObjectTypes from "core/libs/common/objectTypes";
import { ShuraParticle } from "../objects/ShuraParticle";

// import { getAnimationData } from "./utils/TextureUtils";

class PixiObjectFactory {
	static add(node: GameNode) {
		const { type, components } = node;

		if (node.type === "layer") {
			const layer = new Layer();
			layer.updateComponents(components);
			return layer;
		}

		let obj: StudioObject2D;

		if (type === "sprite") {
			obj = this.addSprite(components);
		} else if (type === "container") {
			obj = new Container();
		} else if (type === "animatedSprite") {
			obj = this.addAnimatedSprite(components);
		} else if (type === "spine") {
			obj = this.addSpine(components);
		} else if (type === "text") {
			obj = this.addText(components);
		} else if (type === "htmlText") {
			obj = this.addHtmlText(components);
		} else if (type === "graphics") {
			obj = this.addGraphics(components);
		} else if (type === "tilingSprite") {
			obj = this.addTilingSprite(components);
		} else if (type === "viewport") {
			obj = this.addViewport(components);
		} else if (type === "layout2D") {
			obj = this.addLayout2D(components);
		} else if (type === "cell2D") {
			obj = this.addCell2D(components);
		} else if (type === "nineSliceSprite") {
			obj = this.addNineSliceSprite(components);
		} else if (type === "tutorial") {
			obj = this.addTutorial(components);
		} else if (type === "camera") {
			obj = this.addCamera(node.name);
		} else if (type === "feedback") {
			obj = this.addFeedback(components);
		} else if (type === "cta") {
			obj = new Cta();
		} 
		// else if (type === "lottie") {
		// 	obj = this.addLottie(components, node.id);
		// }
		 else if (type === "particleEmitter") {
			obj = this.addParticleEmitter(components);
		} else if (type === "video") {
			obj = this.addVideo();
		} else if (type === ObjectTypes.SHURA_PARTICLE) {
			obj = this.addShuraSystem(components);
		} else {
			obj = this.addSprite(components);
		}

		if (components.responsive2D) {
			obj.components.add("responsive2D");
		}

		if (components.transitionFX) {
			obj.components.add("transitionFX");
		}

		if (components.filters2D) {
			obj.components.add("filters2D");
		}

		if (components?.physics) {
			obj.components.physics = new Physics(obj);
		}

		obj.componentsData = components;
		obj.nodeData = node;
		// obj.updateComponents(components);
		obj.isStudioObject = true;
		return obj;
	}

	static addSprite(components: PartialGameComponent) {
		const textureData = components?.sprite?.texture || defaultTexture;

		const obj: Sprite = new Sprite({
			x: components?.node2D?.position?.x || 0,
			y: components?.node2D?.position?.y || 0,
			texture: textureData?.path || defaultTexture.path,
		});

		return obj;
	}

	static addShuraSystem(components: PartialGameComponent) {
		const obj = new ShuraParticle({x: components?.node2D?.position?.x || 0, y: components?.node2D?.position?.y || 0})
		return obj;
	}
	
	static addAnimatedSprite(components: PartialGameComponent) {
		// const textureData = defaultAnimationTexture;

		// if (components?.animatedSprite?.animationTexture) {
		// 	textureData = getAnimationData(components.animatedSprite.animationTexture);
		// }

		const obj: AnimatedSprite = new AnimatedSprite(components?.animatedSprite?.animationTexture || "");
		return obj;
	}

	static addSpine(components: PartialGameComponent) {
		const textureData = components?.spine?.spineTexture || "";

		const obj: Spine = new Spine(components?.node2D?.position?.x || 0, components?.node2D?.position?.y || 0, textureData);
		return obj;
	}

	static addText(components: PartialGameComponent) {
		const obj = new Text(components?.node2D?.position?.x || 0, components?.node2D?.position?.y || 0, components?.text?.text || "");

		if (components.text) {
			obj.updateTextComponent(components.text);
		}
		return obj;
	}

	static addHtmlText(components: PartialGameComponent) {
		const obj = new HTMLText(components?.node2D?.position?.x || 0, components?.node2D?.position?.y || 0, components?.text?.text || "");

		if (components.text) {
			obj.updateTextComponent(components.text);
		}
		return obj;
	}

	static addGraphics(components: PartialGameComponent) {
		const obj = new Graphics();

		if (components.graphics) {
			obj.updateGraphicsComponent(components.graphics);
		}

		return obj;
	}

	static addTilingSprite(components: PartialGameComponent) {
		const textureData = components?.sprite?.texture || defaultTexture;

		const obj = new TilingSprite({
			x: components?.node2D?.position?.x || 0,
			y: components?.node2D?.position?.y || 0,
			texture: textureData?.path || defaultTexture.path,
		});

		return obj;
	}

	static addViewport(components: PartialGameComponent) {
		const obj = new Viewport(components);
		return obj;
	}

	static addLayout2D(components: PartialGameComponent) {
		const obj = new Layout2D({
			x: components?.node2D?.position?.x || 0,
			y: components?.node2D?.position?.y || 0,
			...components,
		});
		return obj;
	}

	static addCell2D(components: PartialGameComponent) {
		const obj = new Cell2D();
		return obj;
	}

	static addNineSliceSprite(components: PartialGameComponent) {
		const textureData = components?.sprite?.texture;

		const obj = new NineSliceSprite({
			texture: textureData?.path,
		});

		return obj;
	}

	static addTutorial(components: PartialGameComponent) {
		const obj: Tutorial = new Tutorial({
			x: components?.node2D?.position?.x || 0,
			y: components?.node2D?.position?.y || 0,
		});

		return obj;
	}

	static addCamera(name: string) {
		const obj = new Camera(name);
		return obj;
	}

	static addFeedback(components: PartialGameComponent) {
		const obj = new Feedback();

		return obj;
	}

	// static addLottie(components: PartialGameComponent, uuid: string) {
	// 	const obj: Lottie = new Lottie(components?.node2D?.position?.x || 0, components?.node2D?.position?.y || 0, uuid);

	// 	if (components.physics) {
	// 		obj.components.physics = new Physics(obj);
	// 	}

	// 	return obj;
	// }

	static addParticleEmitter(components: PartialGameComponent) {
		const obj = new ParticleEmitter(components?.node2D?.position?.x || 0, components?.node2D?.position?.y || 0, components.particleEmitter);
		return obj;
	}

	static addVideo() {
		const obj: Video = new Video();

		return obj;
	}
}

export default PixiObjectFactory;
