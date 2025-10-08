// import { AnimatedSprite, Graphics, Loader, TextStyle, Text, Texture, utils, NineSlicePlane } from "pixi.js-legacy";
import * as PIXI from "pixi.js";

import { StudioObject2D } from "./types";
import { getGlobalFont, isTemplate } from "core/libs/common/editorGlobals";
import { TextAlignment, TextGC, TextShadow } from "core/libs/common/components";
import { getCustomFonts } from "@src/assets";
// import Cache2D from "../utils/Cache2D";

type TextData = {
	text: string;
	multiline?: {
		enabled: boolean;
		lineHeight: number;
	};
	align?: "left" | "center" | "right";
	color?: string;
	stroke?: {
		color: string;
		thickness: number;
	};
	shadow?: {
		color: string;
		alpha: number;
		angle: number;
		distance: number;
		blur: number;
	};
};

class Text extends PIXI.Text implements StudioObject2D {
	type: string = "text";
	id: string = "";

	selected: boolean = false;
	locked: boolean = false;

	fontFamily: string = "Arial";
	// text: string = "Text";
	align: TextAlignment = "left";
	fontSize: number = 26;
	fill: string = "#ffffff";

	lineHeight: number = 0;
	leading: number = 0;
	letterSpacing: number = 0;
	padding: number = 0;

	strokeColor: string = "#000000";
	strokeThickness: number = 0;
	initShadowAngle: number = 0;

	shadow: TextShadow = {
		enabled: false,
		alpha: 1,
		color: "#000000",
		blur: 0,
		angle: 0,
		distance: 5,
	};

	wordWrap: boolean = false;
	wordWrapWidth: number = 100;
	breakWords: boolean = true;

	autofit: boolean = false;
	autofitMultiline: boolean = false;
	autofitMaxFontSize: number = 60;
	autofitWidthRatio: number = 80;
	autofitHeightRatio: number = 80;

	gradientBoxDataObject: any = null;

	constructor(x: number, y: number, str: string) {
		super({});
		this.initComponentSystem();

		this.text = str;
		this.x = x;
		this.y = y;
	}

	setText(text: string | TextData) {
		if (typeof text === "string") {
			this.text = text;
		} else {
			this.text = text.text;
			this.setTextStyles(text);
		}

		const lb = this.getLocalBounds();
		this.baseWidth = lb.width;
		this.baseHeight = lb.height;

		if (this.components.responsive) {
			this.components.responsive.update(this.components.get("responsive").data);
		}
	}

	setFont(font: string) {
		if (typeof font === "string") {
			const fontList = getCustomFonts(window.app.data);
			if (fontList[font]) {
				this.style.fontFamily = font;
			} else {
				console.error("Font not found", font);
			}
		}
	}

	updatePixiObject() {
		let { fontFamily } = this;
		if (fontFamily === "__global__") {
			fontFamily = getGlobalFont();
		}

		const styleParams: PIXI.TextStyleOptions = {
			fontFamily: fontFamily || "Arial",
			fontSize: this.fontSize,
			fill: "#ffffff  ",
			align: this.align,
			lineHeight: this.lineHeight,
			leading: this.leading,
			letterSpacing: this.letterSpacing,
			padding: this.padding,
			stroke: {
				width: this.strokeThickness,
				color: new PIXI.Color(+this.strokeColor.replace("#", "0x")),
				join: "round",
			},
			// strokeThickness: this.strokeThickness,
			dropShadow: {
				alpha: this.shadow.alpha,
				color: new PIXI.Color(+this.shadow.color.replace("#", "0x")),
				blur: this.shadow.blur,
				angle: this.shadow.angle,
				distance: this.shadow.distance,
			},
			wordWrap: this.wordWrap,
			wordWrapWidth: this.wordWrapWidth,
			breakWords: this.breakWords,
		};

		styleParams.fill = this.convertToFillStyle(this.fill, this.fontSize, this.gradientBoxDataObject);

		if (!this.shadow.enabled) {
			// @ts-ignore
			delete styleParams.dropShadow;
		}

		this.style = new PIXI.TextStyle(styleParams);

		const bounds = this.getLocalBounds();
		this.baseWidth = bounds.width;
		this.baseHeight = bounds.height;

		if (this.autofit) {
			this.fitText();
		}

		if (this.components.responsive) {
			this.components.responsive.update();
		}
	}

	fitText() {
		this.scale.set(1);

		this.style.fontSize = this.autofitMaxFontSize;
		this.style.wordWrap = this.autofitMultiline;

		if (this.parent) {
			const targetWidth = this.parent.baseWidth * (this.autofitWidthRatio / 100);
			const targetHeight = this.parent.baseHeight * (this.autofitHeightRatio / 100);

			this.style.wordWrapWidth = targetWidth * (this.autofitWidthRatio / 100);

			let fontSize = this.autofitMaxFontSize;
			while (fontSize > 10) {
				this.style.fontSize = fontSize;

				if (this.width < targetWidth && this.height < targetHeight) {
					break;
				}
				fontSize -= 2;
			}
		}
	}

	// COMPONENTS
	updateTextComponent(component: TextGC) {
		this.fontFamily = component.fontFamily;
		this.resolution = component.resolution;
		this.text = component.text;
		this.align = component.align;
		this.fontSize = component.fontSize;
		this.fill = component.fill;
		this.lineHeight = component.lineHeight;
		this.leading = component.leading;
		this.letterSpacing = component.letterSpacing;
		this.padding = component.padding;
		this.strokeColor = component.strokeColor;
		this.strokeThickness = component.strokeThickness;
		this.shadow = component.shadow;
		this.initShadowAngle = component.shadow.angle;
		this.wordWrap = component.wordWrap;
		this.wordWrapWidth = component.wordWrapWidth;
		this.breakWords = component.breakWords;

		this.autofit = component.autofit;
		this.autofitMultiline = component.autofitMultiline;
		this.autofitMaxFontSize = component.autofitMaxFontSize;
		this.autofitWidthRatio = component.autofitWidthRatio;
		this.autofitHeightRatio = component.autofitHeightRatio;
		this.gradientBoxDataObject = component.gradientBoxDataObject;

		if (isTemplate()) {
			if (component.datajsID && window.app.data[component.datajsID]) {
				const data = window.app.data[component.datajsID];

				this.text = data.text;
				if (component.datajsColor) {
					this.fill = data.color;
				}

				if (component.datajsStroke) {
					this.strokeColor = data.stroke.color;
					this.strokeThickness = data.stroke.thickness;
				}

				if (component.datajsShadow) {
					this.shadow = {
						...this.shadow,
						...data.shadow,
					};
				}

				if (component.datajsMultiline) {
					this.lineHeight = data.multiline.lineHeight;
				}
			}
		}

		this.updatePixiObject();
	}

	getTextComponent(): TextGC {
		return {
			type: "text",
			fontFamily: this.fontFamily,
			resolution: this.resolution,
			text: this.text,
			align: this.align,
			fontSize: this.fontSize,
			fill: this.fill,
			lineHeight: this.lineHeight,
			leading: this.leading,
			letterSpacing: this.letterSpacing,
			padding: this.padding,
			strokeColor: this.strokeColor,
			strokeThickness: this.strokeThickness,
			shadow: this.shadow,
			wordWrap: this.wordWrap,
			wordWrapWidth: this.wordWrapWidth,
			breakWords: this.breakWords,
			autofit: this.autofit,
			autofitMultiline: this.autofitMultiline,
			autofitMaxFontSize: this.autofitMaxFontSize,
			autofitWidthRatio: this.autofitWidthRatio,
			autofitHeightRatio: this.autofitHeightRatio,
			gradientBoxDataObject: this.gradientBoxDataObject,
		};
	}

	updateComponents(components: { [key: string]: any }) {
		const text = components.text as TextGC;

		if (text) {
			this.updateTextComponent(text);
		}

		super.updateComponents(components);
	}

	setTextStyles(_textData: TextData) {
		let textData = /* _textData || */ {
			text: "text",
			color: "#ffffff",
			multiline: {
				enabled: false,
				lineHeight: 1.2,
			},
			stroke: {
				color: "#000000",
				thickness: 0,
			},
			shadow: {
				color: "#000000",
				distance: 0,
				blur: 0,
				angle: 0,
				alpha: 0,
			},
		};

		if (_textData) {
			textData = { ...textData, ..._textData };
			if (_textData?.shadow?.angle && !this.initShadowAngle) {
				this.initShadowAngle = _textData.shadow.angle;
			}
		}

		const style = this.style as PIXI.TextStyle;
		style.fill = textData.color!;
		if (textData.stroke) {
			style.stroke = {
				color: textData.stroke.color,
				width: textData.stroke.thickness,
				join: "round",
			};
		}

		if (textData.shadow && textData.shadow.distance) {
			textData.shadow.angle = this.initShadowAngle * (180 / Math.PI);
			style.dropShadow = { ...textData.shadow };
		} else {
			style.dropShadow = false;
		}

		if (textData.multiline && textData.multiline.enabled) {
			style.lineHeight = textData.multiline.lineHeight * style.fontSize;
		}
		this.style = style;
	}
}

export default Text;
