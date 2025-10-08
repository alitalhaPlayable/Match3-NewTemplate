import gsap from "gsap";
import { Texture } from "pixi.js";
import globals from "@globals";
import AudioManager from "core/libs/common/general/audios/audios";
import data from "@data";
import { getSpine2D } from "core/libs/pixi/utils/utils2D";
import { SpecialWorks } from "./specialWorks";
import { BoardHelper } from "./BoardHelper";
import { AnimationController } from "./animationController";
import { SpecialsData } from "./specialsData";
import { LevelUpType } from "@globals";

const spineSpawnPos = { x: 50, y: 50 };

// export const LevelUpType = {
// 	Base: "Base",
// 	Rocket: "rocket",
// 	Bomb: "bomb",
// 	LightBall: "lightBall",
// 	Propeller: "propeller",
// };

export class Item {
	constructor(container, type, posX, posY, texture) {
		this.container = container;
		this.sprite = container.getChildByName("ItemSprite");

		if (texture) this.sprite.setTexture(texture);

		this.container.x = posX;
		this.container.y = posY;
		this.type = type;
		this.isBlock = false;
		this.blockLevel = 0;

		this.level = LevelUpType.Base;
		this.isInAnimation = false;
		this.isDestroyed = false;
		this.isGonnaDestroyed = false;
		this.oldLevel = LevelUpType.Base;

		this.starterX = null;
		this.starterY = null;

		this.finalAnimPlayed = false;

		this.lighBallOnDestroy = false;

		this.moveDuration = 0.2;
	}
	setTile(tile) {
		this.tile = tile;
	}
	setBlock(type, level) {
		this.isBlock = true;
		this.type = globals.notMergeType;

		let str = "block_" + type + level;

		if (type == -1) {
			str = "block";
		}

		console.error(str);
		this.type = type;
		this.blockLevel = level;

		this.sprite.setTexture(str);
	}

	moveAndBack(positions) {
		this.isInAnimation = true;
		gsap.to(this.container, {
			x: positions.x,
			y: positions.y,
			duration: this.moveDuration,
			yoyo: true,
			ease: "power1.inOut",
			repeat: 1,
			onComplete: () => {
				this.isInAnimation = false;
				globals.board.isInAnimation = false;
			},
		});
	}
	moveAndDestroy(position, tiles, duration) {
		if (duration == 0) duration = this.moveDuration;

		let extraScale = 1;

		if (this.container.extraScaler) {
			extraScale = this.container.extraScaler;
		}

		let checkGone = false;
		this.isInAnimation = true;

		if (this.level.name != LevelUpType.Propeller.name) {
			tiles.forEach((element) => {
				if (element.item) element.item.isGonnaDestroyed = true;
			});
		}

		let delay = 0;
		if (this.container.destroyDelay) {
			delay = this.container.destroyDelay;
		}

		gsap.delayedCall(duration + delay, () => {
			AudioManager.playSfx("earn_token");
			tiles?.forEach((element) => {
				if (element.item != null && element.item.container != this.container && !element.item.isDestroyed) {
					if (element.item.level.name == LevelUpType.LightBall.name) {
						checkGone = true;
						element?.item?.destroy(true);
					}
					element?.item?.destroy(false);
				}
			});
			if (!checkGone) {
				this.destroy(true);
			} else this.destroy(false);
		});

		gsap.to(this.container, {
			x: position.x,
			y: position.y,
			pixi: { scale: this.container.scale.x * extraScale },
			duration: duration,
			ease: "power1",
		});
	}
	move(position, durScaler = 1, ease = "power1", delay = 0) {
		this.isInAnimation = true;
		gsap.to(this.container, {
			x: position.x,
			y: position.y,
			delay: delay,
			duration: this.moveDuration * 1.5,
			ease: ease,
			onComplete: () => {
				if (data.enableHardBlastMode) {
					this.isInAnimation = false;
					return;
				}
				if (!globals.board.mergeController.checkMergeSingleTile(this.tile)) this.isInAnimation = false;

				globals.board.checkItemsFall();
			},
		});
	}
	levelUp(texture, tiles, position, duration, level, angle = 0) {
		if (duration == 0) duration = this.moveDuration;

		let gonnaPlayAnim = false;
		if (this.level.name != LevelUpType.Base.name) {
			this.oldLevel = this.level;
			gonnaPlayAnim = true;
		}
		this.isInAnimation = true;

		if (!data.specielsHasColors) {
			this.type = globals.notMergeType;
		}

		tiles.forEach((element) => {
			if (element.item.container != this.container) element.item.isGonnaDestroyed = true;
		});

		tiles.forEach((element) => {
			if (element.item != null && element.item.container != this.container) {
				gsap.to(element.item.container, {
					x: position.x,
					y: position.y,
					duration: duration,
					ease: "power1",
				});
			}
		});

		gsap.delayedCall(this.moveDuration, () => {
			tiles.forEach((element) => {
				if (element.item != null && element.item.container != this.container) {
					element?.item?.destroy(false);
				}
			});
		});

		gsap.to(this.container, {
			x: position.x,
			y: position.y,
			duration: this.moveDuration,
			ease: "power1",
			onComplete: () => {
				AudioManager.playSfx("booster_select");
				if (gonnaPlayAnim) this.playDestroyAnim(this.oldLevel, this.tile.index, null, false);

				this.level = level;
				this.container.getChildAt(0).texture = Texture.from(texture);
				this.container.x = position.x;
				this.container.y = position.y;

				if (data.specialsAreSpine) this.addSpineSpecial(level);

				this.container.angle = angle;
				gsap.to(this.container, {
					pixi: { scaleX: this.container.scale.x + 0.05, scaleY: this.container.scale.y + 0.05 },
					repeat: 1,
					yoyo: true,
					duration: 0.2,
					onComplete: () => {
						gsap.delayedCall(0.2, () => {
							this.isInAnimation = false;
							globals.board.checkItemsFall();
						});
					},
				});
			},
		});
	}
	addSpineSpecial(type) {
		this.sprite.visible = false;

		let spine;

		let name = type;
		if (type.name) name = type.name;

		spine = BoardHelper.spawnSpine(name, spineSpawnPos, 1, this.container);

		let specialData = SpecialsData.getData(name);

		gsap.delayedCall(0, () => {
			spine.state.setAnimation(0, specialData.createAnimName, false);
			spine.state.addAnimation(0, specialData.idleAnimName, true);
			this.sprite.visible = true;
		});

		this.sprite = spine;
	}
	destroy(gonnaCheckBoard, gonnaPlayAnim = true) {
		if (this.isDestroyed && !gonnaCheckBoard) return;

		if (this.isDestroyed && this.level != LevelUpType.Base) return;

		this.checkForBlockDestroy();

		if (this.isBlock && this.blockLevel != 0) {
			this.blockLevel--;
			this.sprite.setTexture("block_" + this.type + this.blockLevel);
			return;
		}

		this.isDestroyed = true;
		if (this?.level.name == LevelUpType.LightBall.name) {
			this.stopCheck = true;
		}
		if (this?.level.name == LevelUpType.LightBall.name) {
			globals.board.canCheckFall = false;
			this.isInAnimation = true;
			this.lighBallOnDestroy = true;
		}
		let delayTime = 0;

		if (gonnaPlayAnim) delayTime = this.playDestroyAnim(this.level, this.tile.index);

		if (this.level.name != LevelUpType.Propeller.name) gsap.killTweensOf(this.container);

		globals.animations.playDestroyAnim(this.container, this.type);

		AudioManager.playSfx("match");
		let scale = 0;
		gsap.to(this.container, {
			duration: delayTime,
			onComplete: () => {
				gsap.to(this.container, {
					pixi: { scaleX: scale, scaleY: scale },
					duration: 0.2,
					onComplete: () => {
						AnimationController.playDestroyParticle(this.container.getGlobalPosition(), this.type);
					},
				});
			},
		});

		let extraDelay = 0.2;

		if (this.container.extraDelay) {
			extraDelay = extraDelay + this.container.extraDelay;
		}

		let newDelay = extraDelay + delayTime;
		gsap.delayedCall(newDelay, () => {
			this.container.alpha = scale;
			globals.eventEmitter.emit("feedback");
			this.isInAnimation = false;
			this.lighBallOnDestroy = false;
			this.isGonnaDestroyed = false;

			if (this?.level.name == LevelUpType.LightBall.name) {
				this.stopCheck = false;
			}
			if (this.dontCheck) return;

			if (this.level.name == LevelUpType.LightBall.name || this.oldLevel.name == LevelUpType.LightBall.name) {
				globals.board.canCheckFall = true;
				globals.board.checkItemsFall();
				globals.board.isInAnimation = false;
			}
			if (gonnaCheckBoard || delayTime != 0) {
				globals.board.checkItemsFall();
				globals.board.isInAnimation = false;
			}
		});
	}
	startTutorialAnim(position) {
		let difX = position.x - this.container.x;
		let difY = position.y - this.container.y;

		this.starterX = this.container.x;
		this.starterY = this.container.y;

		let timeline = gsap.timeline({
			repeat: -1,
		});

		timeline.to(this.container, {
			x: this.starterX + difX / 4,
			y: this.starterY + difY / 4,
			duration: 0.4,
			repeat: 3,
			yoyo: true,
			ease: "power1.inOut",
		});
		timeline.to(this.container, {
			duration: 1,
		});
	}
	stopTutorialAnim() {
		if (this.starterX == null || this.isDestroyed) return;
		gsap.killTweensOf(this.container);
		this.container.x = this.starterX;
		this.container.y = this.starterY;
	}
	playDestroyAnim(itemType, index, dontKill) {
		// console.log(itemType);

		if (itemType.name == LevelUpType.Rocket.name) {
			return SpecialWorks.explodeRocket(this, index, dontKill);
		} else if (itemType.name == LevelUpType.Bomb.name) {
			return SpecialWorks.explodeBomb(this);
		} else if (itemType.name == LevelUpType.LightBall.name) {
			return SpecialWorks.explodeLightBall(this);
		} else if (itemType.name == LevelUpType.Propeller.name) {
			return SpecialWorks.explodePropeller(this);
		}
		return 0;
	}

	setFailed(gonnaCallEndCard) {
		if (this.finalAnimPlayed) return;
		this.finalAnimPlayed = true;

		let oldPos = { x: this.container.x, y: this.container.y };
		this.container.getChildAt(0).texture = Texture.from("red");
		this.container.getChildAt(0).angle = 0;
		this.container.x = oldPos.x;
		this.container.y = oldPos.y;
		gsap.to(this.container, {
			pixi: { scaleX: this.container.scale.x + 0.02, scaleY: this.container.scale.x + 0.02 },
			duration: 0.2,
			yoyo: true,
			repeat: 1,
			onComplete: () => {
				if (gonnaCallEndCard) globals.eventEmitter.emit("EndCard");
			},
		});
	}
	setWon(gonnaCallEndCard) {
		if (this.finalAnimPlayed) return;

		this.finalAnimPlayed = true;

		let oldPos = { x: this.container.x, y: this.container.y };
		this.container.getChildAt(0).texture = Texture.from("blue");
		this.container.getChildAt(0).angle = 0;
		this.container.x = oldPos.x;
		this.container.y = oldPos.y;
		gsap.to(this.container, {
			pixi: { scaleX: this.container.scale.x + 0.02, scaleY: this.container.scale.x + 0.02 },
			duration: 0.2,
			yoyo: true,
			repeat: 1,
			onComplete: () => {
				if (gonnaCallEndCard) globals.eventEmitter.emit("EndCard");
			},
		});
	}
	clear() {
		this.container.alpha = 0;
	}

	lightballCombo(items, delay) {
		items.forEach((element) => {
			element.isGonnaDestroyed = true;
		});

		gsap.delayedCall(delay, () => {
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				if (item.container != this.container) {
					AnimationController.playLightballAnim(item.tile.container, this.container, item.type);

					gsap.delayedCall(0.4, () => {
						if (i == items.length - 1) {
							item.destroy(true);
						} else item.destroy(false);
					});
				}
			}
		});

		gsap.delayedCall(delay, () => {
			this.destroy(false, false);
		});
	}

	rockFly(gonnaCheckBoard, angle, delay = 0, type) {
		this.isInAnimation = true;
		gsap.delayedCall(delay, () => {
			let oldPos = { x: this.container.x, y: this.container.y };
			let txt = "rocket" + this.type;

			this.levelUp(txt, [], oldPos, 0, LevelUpType.Rocket, angle);

			this.container.x = oldPos.x;
			this.container.y = oldPos.y;
		});
	}

	lightRockets(items) {
		if (this.sprite.state) {
			this.sprite.state.setAnimation(0, SpecialsData.specialData.LightBall.actionAnimName, true);
		}

		items.forEach((element) => {
			element.isGonnaDestroyed = true;
		});

		let index = 0;
		items.forEach((element) => {
			if (element.container != this.container) {
				if (index == items.length - 1) {
					element.rockFly(true, 0, index * 0.1, 1);
					for (let i = 0; i < items.length; i++) {
						gsap.delayedCall(0.1 * i, () => {
							AnimationController.playLightballAnim(this.container, items[i].tile.container);
						});
						gsap.delayedCall(0.1 * index + 0.5, () => {
							for (let i = 0; i < items.length; i++) {
								if (i == items.length - 1) items[i].destroy(true);
								else items[i].destroy(false);
							}
						});
					}
				} else {
					let rand = Math.random();
					if (rand > 0.5) element.rockFly(false, 0, index * 0.1, 1);
					else element.rockFly(false, 90, index * 0.1, 1);
				}
			}
			index++;
		});
		gsap.delayedCall(0.6, () => {
			this.destroy(false, false);
		});
	}

	lightBombs(items) {
		if (this.sprite.state) {
			this.sprite.state.setAnimation(0, SpecialsData.specialData.LightBall.actionAnimName, true);
		}

		items.forEach((element) => {
			element.isGonnaDestroyed = true;
		});

		let index = 0;
		items.forEach((element) => {
			if (element.container != this.container) {
				// globals.board.playLightballAnim(this.container, element.tile.container);
				if (index == items.length - 1) {
					element.bombTime(index * 0.1);
					for (let i = 0; i < items.length; i++) {
						gsap.delayedCall(0.1 * i, () => {
							AnimationController.playLightballAnim(this.container, items[i].tile.container);
						});
						gsap.delayedCall(0.1 * index + 0.5, () => {
							for (let i = 0; i < items.length; i++) {
								if (i == items.length - 1) items[i].destroy(true);
								else items[i].destroy(false);
							}
						});
					}
				} else {
					let rand = Math.random();
					if (rand > 0.5) element.bombTime(index * 0.1);
					else element.bombTime(index * 0.1);
				}
			}
			index++;
		});
		gsap.delayedCall(0.6, () => {
			this.destroy(false, false);
		});
	}

	bombTime(delay = 0) {
		this.isInAnimation = true;
		gsap.delayedCall(delay, () => {
			let oldPos = { x: this.container.x, y: this.container.y };
			let txt = "bomb" + this.type;

			this.levelUp(txt, [], oldPos, 0, LevelUpType.Bomb, 0);
			this.container.x = oldPos.x;
			this.container.y = oldPos.y;
		});
	}

	preparePropellers(items) {
		if (this.sprite.state) {
			this.sprite.state.setAnimation(0, SpecialsData.specialData.LightBall.actionAnimName, true);
		}

		items.forEach((element) => {
			element.isGonnaDestroyed = true;
		});

		let index = 0;
		items.forEach((element) => {
			if (element.container != this.container) {
				if (index == items.length - 1) {
					element.propellerTime(index * 0.1);
					for (let i = 0; i < items.length; i++) {
						gsap.delayedCall(0.1 * i, () => {
							AnimationController.playLightballAnim(this.container, items[i].tile.container);
						});
						gsap.delayedCall(0.1 * index + 0.5, () => {
							for (let i = 0; i < items.length; i++) {
								if (i == items.length - 1) items[i].destroy(true);
								else items[i].destroy(false);
							}
						});
					}
				} else {
					let rand = Math.random();
					if (rand > 0.5) element.propellerTime(index * 0.1);
					else element.propellerTime(index * 0.1);
				}
			}
			index++;
		});
		gsap.delayedCall(0.6, () => {
			this.destroy(false, false);
		});
	}
	propellerTime(delay = 0) {
		this.isInAnimation = true;
		gsap.delayedCall(delay, () => {
			let oldPos = { x: this.container.x, y: this.container.y };
			let txt = "Propeller";

			this.levelUp(txt, [], oldPos, 0, LevelUpType.Propeller, 0);
			this.container.x = oldPos.x;
			this.container.y = oldPos.y;
		});
	}

	checkForBlockDestroy() {
		if (!this.isBlock) this.tile.checkForBlockDestroy(this.type);
	}
}
