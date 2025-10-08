import { gsap } from "gsap";
import globals from "@globals";
import { Assets } from "pixi.js";
import { getTexture2D } from "core/libs/pixi/utils/utils2D";

const { Container, Graphics, Text, Sprite, Texture, TilingSprite } = require("pixi.js");

class Banner extends Container {
    constructor(scene) {
        super();
        this.scene = scene;
        scene.parent.addChild(this);
        this.zIndex = 1000;
        let config = {
            enable: globals.data.bannerEnable,
            width: globals.data.bannerWidthRatio,
            height: globals.data.bannerHeightRatio,
            alpha: globals.data.bannerAlpha,
            textAlpha: globals.data.bannerTextAlpha,
            offsetY: globals.data.bannerOffsetYRatio,
            borderRadius: globals.data.bannerBorderRadius,

            bgType: globals.data.bannerBgType,
            bgColor: globals.data.bannerBgColor,
            bgGradientColorTop: globals.data.bannerBgGradientColorTop,
            bgGradientColorBottom: globals.data.bannerBgGradientColorBottom,
            bgImage: globals.data.bannerBgImage,

            text: globals.data.bannerText.text,
            textColor: globals.data.bannerText.color,
            textFont: globals.data.bannerTextFont,
        };

        this.config = config;
        this.bannerBgImageTexture = getTexture2D("bannerBgImage");

        this.initBg(config);

        let text = new Text({
            text: config.text,
            style: {
                fontFamily: config.textFont,
                fontSize: 50,
                fill: config.textColor,
                align: "center",
            },
        });
        text.baseWidth = text.width;
        text.baseHeight = text.height;
        text.anchor.set(0.5);
        this.addChild(text);
        this.text = text;

        this.bg.alpha = config.alpha;
        text.alpha = config.textAlpha;

        this.onResizeCallback = (w, h) => {
            let bg = this.bg;
            let bgW = w * config.width * 0.01;
            let bgH = h * config.height * 0.01;
            let borderRadius = bgH * config.borderRadius * 0.01;

            bg.redraw(bgW, bgH, borderRadius);

            let textScale = Math.min((bgW * 0.9) / text.baseWidth, (bgH * 0.8) / text.baseHeight);
            text.scale.set(textScale);
            text.y = bgH / 2;

            this.x = w / 2;
            this.y = h * config.offsetY * 0.01;
        };
        this.onResizeCallback(scene.baseWidth, scene.baseHeight);

        this.initEvents();
        this.visible = config.enable;
    }

    initEvents() {
        let scene = this.scene;
        let eventList = [
            {
                name: "bannerEnable",
                callback: (value) => {
                    this.config.enable = value;
                    this.visible = value;
                },
            },
            {
                name: "bannerWidthRatio",
                callback: (value) => {
                    this.config.width = value;
                    this.onResizeCallback(scene.baseWidth, scene.baseHeight);
                },
            },
            {
                name: "bannerHeightRatio",
                callback: (value) => {
                    this.config.height = value;
                    this.onResizeCallback(scene.baseWidth, scene.baseHeight);
                },
            },
            {
                name: "bannerOffsetYRatio",
                callback: (value) => {
                    this.config.offsetY = value;
                    this.onResizeCallback(scene.baseWidth, scene.baseHeight);
                },
            },
            {
                name: "bannerBorderRadius",
                callback: (value) => {
                    this.config.borderRadius = value;
                    this.onResizeCallback(scene.baseWidth, scene.baseHeight);
                },
            },
            {
                name: "bannerAlpha",
                callback: (value) => {
                    this.config.alpha = value;
                    this.bg.alpha = value;
                },
            },
            //BG RELATED
            {
                name: "bannerBgType",
                callback: (value) => {
                    this.config.bgType = value;
                    if (this.curBgType != value) {
                        this.initBg(this.config);
                    }
                    this.onResizeCallback(scene.baseWidth, scene.baseHeight);
                },
            },
            {
                name: "bannerBgColor",
                callback: (value) => {
                    this.config.bgColor = value;
                    this.onResizeCallback(scene.baseWidth, scene.baseHeight);
                },
            },
            {
                name: "bannerBgGradientColorTop",
                callback: (value) => {
                    this.config.bgGradientColorTop = value;
                    this.onResizeCallback(scene.baseWidth, scene.baseHeight);
                },
            },
            {
                name: "bannerBgImage",
                callback: async (value) => {
                    this.config.bgImage = value;

                    //await Assets.unload("bannerBgImage");


                    Assets.add({
                        alias: "bannerBgImage",
                        src: value,
                    });
                    Assets.load("bannerBgImage").then((texture) =>
                    {
						this.bannerBgImageTexture = texture;
                        
                        this.initBg(this.config);
                        this.onResizeCallback(scene.baseWidth, scene.baseHeight);
                    });
                },
            },
            ///TEXT
            {
                name: "bannerText",
                callback: (value) => {
                    let text = this.text;

                    this.config.text = value.text;
                    this.config.textColor = value.color;
                    text.style.fill = value.color;
                    let tempScale = text.scale.x;
                    text.scale.set(1);
                    text.baseWidth = text.width;
                    text.baseHeight = text.height;
                    text.text = value.text;
                    text.scale.set(tempScale);

                    this.onResizeCallback(scene.baseWidth, scene.baseHeight);
                },
            },
            // {
            // 	name: "bannerTextColor",
            // 	callback: (value) => {
            // 		this.config.textColor = value;
            // 		this.text.style.fill = value;
            // 	},
            // },
            {
                name: "bannerTextAlpha",
                callback: (value) => {
                    this.config.textAlpha = value;
                    this.text.alpha = value;
                },
            },
        ];

        eventList.forEach((event) => {
            let name = "pf_" + event.name;
            window.addEventListener(name, (e) => {
                let value = e.detail.value;
                event.callback(value);
            });
        });
        // window.addEventListener("pf_bannerEnable", (e) => {
        // 	let originY = e.detail.value;
        // 	let joystickHand = app.globals.joystickHand;

        // 	if (joystickHand) {
        // 		joystickHand.setOrigin(joystickHand.originX, originY);
        // 	}
        // });
    }

    initBg(config) {
        if (this.bg) {
            this.bg.destroy();
        }
        let bg;
        this.curBgType = config.bgType;

        if (config.bgType == 0) {
            bg = new Graphics();
            bg.redraw = (bgW, bgH, borderRadius) => {
                bg.clear();
                let color = Number(config.bgColor.replace("#", "0x"));
                bg.roundRect(0, 0, bgW, bgH, borderRadius);
                bg.fill({ color });
                bg.pivot.set(bgW / 2, 0);
            };
        } else if (config.bgType == 1) {
            const canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 64;
            // document.body.appendChild(canvas);
            // canvas.style.zIndex = 99;

            const ctx = canvas.getContext("2d");
            bg = new Sprite(Texture.from(canvas));

            // use canvas2d API to create gradient
            bg.redraw = (bgW, bgH, borderRadius) => {
                bgH = bgH || 20;
                canvas.width = bgW;
                canvas.height = bgH;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const grd = ctx.createLinearGradient(0, 0, 0, bgH);
                grd.addColorStop(0, config.bgGradientColorTop);
                grd.addColorStop(1, config.bgGradientColorBottom);

                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, bgW, bgH);
                ctx.globalCompositeOperation = "destination-in";
                // ctx.fillRect(0, 0, bgW * 0.5, bgH);
                roundRect(ctx, 0, 0, bgW, bgH, borderRadius, true, false);
                bg.texture.source.update();
            };

            bg.anchor.set(0.5, 0);
        } else if (config.bgType == 2) {
			//const bannerBgImageTexture = getTexture2D("bannerBgImage");
			//const texture = bannerBgImageTexture ? bannerBgImageTexture : Texture.WHITE;
			 const texture = this.bannerBgImageTexture ? this.bannerBgImageTexture : Texture.WHITE;

            bg = new TilingSprite(texture);

            bg.anchor.set(0.5, 0);

			let maskRect = new Graphics();
			this.addChild(maskRect);

            maskRect.isMask = true;
            bg.mask = maskRect;

            bg.redraw = (bgW, bgH, borderRadius) => {
                maskRect.clear();
                maskRect.roundRect(0, 0, bgW, bgH, borderRadius);
                maskRect.fill({
                    color: 0xff0000,
                });
                maskRect.pivot.set(bgW / 2, 0);

                bg.width = bgW;
                bg.height = bgH;
            };
        }
			

        this.addChild(bg);
        this.bg = bg;
        return bg;
    }

    show() {
        this.visible = true;
        this.alpha = 0;
        gsap.killTweensOf(this);
        gsap.to(this, { alpha: 1, duration: 0.5 });
    }

    hide(isQuick = false) {
        if (isQuick) {
            gsap.killTweensOf(this);
            this.visible = false;
            return;
        }
        gsap.killTweensOf(this);
        gsap.to(this, {
            alpha: 0,
            duration: 0.5,
            onComplete: () => {
                this.visible = false;
            },
        });
    }
}

export default Banner;

function roundRect(ctx, x, y, width, height, radius = 5, fill = false, stroke = true) {
    if (typeof radius === "number") {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

// // Now you can just call
// var ctx = document.getElementById("rounded-rect").getContext("2d");
// // Draw using default border radius,
// // stroke it but no fill (function's default values)
// roundRect(ctx, 5, 5, 50, 50);
// // To change the color on the rectangle, just manipulate the context
// ctx.strokeStyle = "rgb(255, 0, 0)";
// ctx.fillStyle = "rgba(255, 255, 0, .5)";
// roundRect(ctx, 100, 5, 100, 100, 20, true);
// // Manipulate it again
// ctx.strokeStyle = "#0f0";
// ctx.fillStyle = "#ddd";
// // Different radii for each corner, others default to 0
