import { MotionPathPlugin } from "gsap/MotionPathPlugin"; // Import MotionPathPlugi
// import TrailHelper from "./trail";
import gsap from "gsap";
import { instantiatePrefab2D } from "core/libs/pixi/utils/utils2D";
import globals from "@globals";
import TrailHelper from "./trail";
import { GlowFilter } from "pixi-filters";
import Sprite from "core/libs/pixi/objects/Sprite";
import { Texture } from "pixi.js";
gsap.registerPlugin(MotionPathPlugin);

export class Animation {
	constructor(boardContain) {
		this.trail = [];
		this.trailCount = 0;

		this.boardContain = boardContain;
		this.particleCount = Math.pow(globals.board.boardSize, 2);
		this.particleTurn = 0;
		this.particles = [];
		this.createParticles();

		this.lightballAnimations = [];
		// this.lightballAnimTurn = 0;
		// this.lightballAnimCount = 50;
		// this.createLightballAnims();

		this.bombAnimations = [];
		this.bombAnimTurn = 0;
		this.bombAnimCount = 50;
		this.createBombAnims();

		this.rocketAnimations = [];
		this.rocketAnimTurn = 0;
		this.rocketAnimCount = 50;
		this.createRocketAnims();

		this.destroyAnimations = [];
		this.destroyAnimTurn = 0;
		this.destroyAnimCount = 50;
		this.createDestroyAnims();
	}
	createParticles() {
		for (let x = 0; x < this.particleCount; x++) {
			let particleContain = instantiatePrefab2D("destroyParticle");
			particleContain.alpha = 0;
			particleContain.zIndex = 10;
			this.particles.push(particleContain);
			this.boardContain.addChild(particleContain);
		}
	}
	playParticleContain(startingPos, endPos, type) {
		// let particle = this.particles[this.particleTurn];
		// particle.alpha = 1;

		let controlPointX = (startingPos.x + endPos.x) / 2 + Math.random() * 100 - 50;
		// Create vectors using Pixi.js
		let startPoint = new PIXI.Point(startingPos.x, startingPos.y);
		let controlPoint1 = new PIXI.Point(controlPointX, (startingPos.y + endPos.y) / 2);
		let endPoint = new PIXI.Point(endPos.x, endPos.y);

		let tempItem = new Sprite({ x: 0, y: 0, texture: Texture.WHITE });

		if (globals.itemTypes.includes(type)) tempItem = new Sprite.from(type);
		tempItem.width = globals.board.oneGridLenghth;
		tempItem.height = globals.board.oneGridLenghth;
		tempItem.anchor.set(0.5);

		this.trail[this.trailCount] = new TrailHelper(tempItem, this.boardContain.parent);
		this.trail[this.trailCount].colorName = type;
		this.trail[this.trailCount].setColor();
		let thisCount = this.trailCount;
		this.trailCount++;

		if (!globals.targetTypes.includes(type)) {
			tempItem.visible = false;
		}

		tempItem.x = startPoint.x;
		tempItem.y = startPoint.y;

		this.boardContain.parent.getChildByName("frontBoard").addChild(tempItem);

		let randAngle = Math.random() * 360;

		gsap.to(tempItem, {
			pixi: { angle: randAngle },
			duration: 0.8,
			ease: "sine.in",
		});

		gsap.to(tempItem, {
			pixi: { scale: 0 },
			ease: "sine.in",
			duration: 0.3,
			delay: 0.6,
		});

		gsap.to(tempItem, {
			motionPath: {
				path: [
					{ x: controlPoint1.x, y: controlPoint1.y },
					{ x: endPoint.x, y: endPoint.y },
				],
				curviness: 1.5,
				//autoRotate: true
			},
			ease: "sine.in",
			duration: 0.8,
			onUpdate: () => {
				this.trail[thisCount].update();
			},
			onComplete: () => {
				gsap.to(this.trail[thisCount], {
					duration: 1,
					onUpdate: () => {
						this.trail[thisCount].update();
					},
					onComplete: () => {
						this.trail[thisCount].graphics.destroy();
					},
				});
			},
		});

		this.particleTurn++;
		if (this.particleTurn >= this.particleCount) this.particleTurn = 0;
	}
	createLightballAnim() {
		let lightballContain = instantiatePrefab2D("lightballAnim");
		lightballContain.alpha = 0;
		lightballContain.zIndex = 10;

		this.boardContain.addChild(lightballContain);
		let glow = new GlowFilter({ distance: 10, outerStrength: 3, color: 0xffffff });
		lightballContain.filters = [glow];
		lightballContain.glow = glow;
		return lightballContain;
	}

	playLightballAnim(position, angle, distance, type = null) {
		let color = globals.getColorFromString(type);
		let currLightball = this.createLightballAnim();
		//let currLightball = this.lightballAnimations[this.lightballAnimTurn];
		let newXscale = distance / currLightball.baseWidth;
		let additional = newXscale * 0.15;
		currLightball.alpha = 1;
		currLightball.angle = angle;
		currLightball.scale.x = newXscale + additional;
		currLightball.scale.y = newXscale + additional;
		currLightball.x = position.x;
		currLightball.y = position.y;
		currLightball.getChildAt(0).gotoAndStop(0);
		currLightball.getChildAt(0).play();
		currLightball.glow.color = color;

		// let thisTurn = this.lightballAnimTurn;
		// this.lightballAnimTurn++;
		// if (this.lightballAnimTurn >= this.lightballAnimCount) this.lightballAnimTurn = 0;

		gsap.delayedCall(0.5, () => {
			currLightball.destroy();
		});
	}
	createBombAnims() {
		for (let x = 0; x < this.bombAnimCount; x++) {
			let bombContain = instantiatePrefab2D("bombAnimation");
			bombContain.alpha = 0;
			bombContain.zIndex = 10;
			this.bombAnimations.push(bombContain);
			this.boardContain.addChild(bombContain);
		}

		this.bombBaseScale = this.bombAnimations[0].scale.x;
	}
	playBombAnim(position, extraScaler) {
		this.bombAnimations[this.bombAnimTurn].scale.x = this.bombBaseScale * extraScaler;
		this.bombAnimations[this.bombAnimTurn].scale.y = this.bombBaseScale * extraScaler;
		this.bombAnimations[this.bombAnimTurn].alpha = 1;
		this.bombAnimations[this.bombAnimTurn].x = position.x;
		this.bombAnimations[this.bombAnimTurn].y = position.y;
		this.bombAnimations[this.bombAnimTurn].getChildAt(0).gotoAndStop(0);
		this.bombAnimations[this.bombAnimTurn].getChildAt(0).play();
		//let thisTurn = this.bombAnimTurn;
		this.bombAnimTurn++;
		if (this.bombAnimTurn >= this.bombAnimCount) this.bombAnimTurn = 0;
	}
	createRocketAnims() {
		for (let x = 0; x < this.rocketAnimCount; x++) {
			let rocketContain = instantiatePrefab2D("rocketAnim");
			rocketContain.alpha = 0;
			rocketContain.zIndex = 10;
			this.rocketAnimations.push(rocketContain);
			this.boardContain.addChild(rocketContain);
		}
	}
	playRocketAnim(position, angle) {
		this.rocketAnimations[this.rocketAnimTurn].alpha = 1;
		this.rocketAnimations[this.rocketAnimTurn].angle = angle;
		this.rocketAnimations[this.rocketAnimTurn].x = position.x;
		this.rocketAnimations[this.rocketAnimTurn].y = position.y;
		this.rocketAnimations[this.rocketAnimTurn].getChildAt(0).gotoAndStop(0);
		this.rocketAnimations[this.rocketAnimTurn].getChildAt(0).play();
		let thisTurn = this.rocketAnimTurn;
		this.rocketAnimTurn++;
		if (this.rocketAnimTurn >= this.rocketAnimCount) this.rocketAnimTurn = 0;

		gsap.delayedCall(0.2, () => {
			this.rocketAnimations[thisTurn].alpha = 0;
		});
	}
	createDestroyAnims() {
		for (let x = 0; x < this.destroyAnimCount; x++) {
			let destroyContain = instantiatePrefab2D("destroyAnim");
			destroyContain.alpha = 0;
			this.destroyAnimations.push(destroyContain);
			this.boardContain.addChild(destroyContain);
		}
	}
	playDestroyAnim(position) {
		if (position == null) return;

		let turn = this.destroyAnimTurn;
		this.destroyAnimations[this.destroyAnimTurn].alpha = 1;
		this.destroyAnimations[this.destroyAnimTurn].x = position.x;
		this.destroyAnimations[this.destroyAnimTurn].y = position.y;
		this.destroyAnimations[this.destroyAnimTurn].getChildAt(0).gotoAndStop(0);
		this.destroyAnimations[this.destroyAnimTurn].getChildAt(0).play();
		this.destroyAnimTurn++;
		gsap.delayedCall(0.5, () => {
			this.destroyAnimations[turn].alpha = 0;
		});
		if (this.destroyAnimTurn >= this.destroyAnimCount) this.destroyAnimTurn = 0;
	}
}
