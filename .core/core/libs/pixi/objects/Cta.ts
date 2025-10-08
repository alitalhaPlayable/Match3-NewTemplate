import * as PIXI from "pixi.js";

import gsap from "gsap";
import { CtaGC, SpriteGC } from "../../common/components";
import Container from "./Container";
import Cache2D from "../utils/Cache2D";
import Sprite from "./Sprite";
import Text from "./Text";
import { isStudio, isTemplate } from "../../common/editorGlobals";

class Cta extends Container {
	id: string = "";
	type: string = "cta";

	selected: boolean = false;
	locked: boolean = false;

	innerContainer: PIXI.Container;
	bgImage: Sprite;
	text: Text;

	ctaComponent!: CtaGC;
	pulseStarted: boolean = false;
	pulseTween: gsap.core.Tween | null = null;

	eventsInited: boolean = false;

	constructor(x: number = 0, y: number = 0) {
		super(x, y);
		this.innerContainer = new PIXI.Container();
		this.addChild(this.innerContainer);

		this.bgImage = new Sprite({ x: 0, y: 0, texture: "" });
		this.innerContainer.addChild(this.bgImage);

		this.text = new Text(0, 0, "");
		this.innerContainer.addChild(this.text);
	}

	updateText(component: CtaGC) {
		let { text, textColor, textStrokeThickness, textStrokeColor } = component;
		const { fontFamily } = component;

		let { textScaleX, textScaleY, textOffsetX, textOffsetY } = component;

		if (isTemplate()) {
			const { datajsID } = component;
			// @ts-ignore
			const data = window.app.data[datajsID + "_text"];
			if (datajsID && data) {
				text = data.text;
				textColor = data.color;
				textStrokeThickness = data.stroke.thickness;
				textStrokeColor = data.stroke.color;
			}
			textScaleX = app.data[datajsID + "_textScaleX"] ?? textScaleX;
			textScaleY = app.data[datajsID + "_textScaleY"] ?? textScaleY;
			textOffsetX = app.data[datajsID + "_textOffsetX"] ?? textOffsetX;
			textOffsetY = app.data[datajsID + "_textOffsetY"] ?? textOffsetY;

			this.visible = app.data[datajsID + "_enable"] ?? true;
		}

		this.text.updateTextComponent({
			...this.text.getTextComponent(),
			fontSize: 60,
			text,
			fill: textColor,
			strokeThickness: textStrokeThickness,
			strokeColor: textStrokeColor,
			fontFamily,
		});

		const textScale = Math.min((this.baseWidth * textScaleX) / 100 / this.text.baseWidth, (this.baseHeight * textScaleY) / 100 / this.text.baseHeight);
		this.text.setOrigin(0.5, 0.5);
		this.text.scale.set(textScale);
		this.text.x = this.baseWidth / 2 + (textOffsetX * this.baseWidth) / 100;
		this.text.y = this.baseHeight / 2 + (textOffsetY * this.baseHeight) / 100;
	}

	updatePulse(datajsID: string, enablePulse: boolean) {
		if (isTemplate()) {
			const pulseEnabled = app.data[datajsID + "_enablePulse"] ?? enablePulse;
			if (this.pulseTween) {
				this.pulseTween.kill();
				this.pulseTween = null;
			}

			if (pulseEnabled) {
				this.pulseStarted = true;

				this.innerContainer.scale.set(1);
				this.pulseTween = gsap.to(this.innerContainer.scale, {
					x: 0.95,
					y: 0.95,
					duration: 0.5,
					repeat: -1,
					yoyo: true,
					ease: "sine.inOut",
				});
			}
		}
	}

	updateCta(cta: CtaGC, origX: number, origY: number) {
		this.baseWidth = this.bgImage.baseWidth;
		this.baseHeight = this.bgImage.baseHeight;

		this.innerContainer.baseWidth = this.baseWidth;
		this.innerContainer.baseHeight = this.baseHeight;
		this.innerContainer.pivot.set(this.baseWidth / 2, this.baseHeight / 2);
		this.innerContainer.setOrigin(0.5, 0.5);
		this.innerContainer.x = this.baseWidth / 2;
		this.innerContainer.y = this.baseHeight / 2;

		try {
			this.pivot.set(this.baseWidth * origX, this.baseHeight * origY);
			this.setOrigin(origX, origY);
			this.updateDebug();
			this.updateText(cta);
		} catch (e) {
			//
		}
	}

	updateComponents(components: { [key: string]: any }) {
		super.updateComponents({
			...components,
		});

		const cta = (components.cta as CtaGC) || this.ctaComponent;
		const sprite = components.sprite as SpriteGC;

		if (sprite) {
			this.bgImage.updateSpriteComponent(sprite);
		}

		if (cta) {
			this.ctaComponent = cta;
			this.updateCtaComponent(cta);

			this.updatePulse(cta.datajsID, cta.enablePulse);
		}
	}

	updateCtaComponent(ctaRaw?: CtaGC) {
		const transform = this.components.get("transform");
		const origX = transform.origin.x;
		const origY = transform.origin.y;

		const cta = ctaRaw || this.ctaComponent;

		if (cta) {
			this.ctaComponent = cta;
			this.updateCta(cta, origX, origY);
			if (isStudio()) {
				const tempCta = JSON.parse(JSON.stringify(cta));
				setTimeout(() => {
					this.updateCta(tempCta, origX, origY);
				}, 500);
			}

			if (isTemplate()) {
				this.initEvents();
			}
		}
	}

	preResize() {
		this.bgImage.preResize();
		this.updateCtaComponent();
	}

	initEvents() {
		if (this.eventsInited) {
			return;
		}
		this.eventsInited = true;

		const datajsID = this.ctaComponent.datajsID;

		const datajsUpdateList = ["text", "textScaleX", "textScaleY", "textOffsetX", "textOffsetY"];

		datajsUpdateList.forEach((datajs) => {
			const id = datajsID + "_" + datajs;
			window.addEventListener("pf_" + id, async (e: any) => {
				console.log(datajsID, datajs, e.detail.value);
				app.data[id] = e.detail.value;
				this.updateCtaComponent();
			});
		});

		window.addEventListener("pf_" + datajsID + "_enablePulse", async (e: any) => {
			app.data[datajsID + "_enablePulse"] = e.detail.value;
			this.updatePulse(datajsID, this.ctaComponent.enablePulse);
		});

		window.addEventListener("pf_" + datajsID + "_enable", async (e: any) => {
			app.data[datajsID + "_enable"] = e.detail.value;
			this.visible = e.detail.value;
		});

		this.eventEmitter.on(this.id + "_image", () => {
			this.updateCtaComponent();
		});
	}
}

export default Cta;
