import data from "@data";
import globals, { LevelUpType } from "@globals";
import { BoardHelper } from "./BoardHelper";
import MathFunctions from "./mathFunctions";
import gsap from "gsap";
import { instantiatePrefab2D } from "core/libs/pixi/utils/utils2D";
import ObjectHelper2D from "core/libs/pixi/utils/ObjectHelper2D";
import { AnimationController } from "./animationController";
import { SpecialsData } from "./specialsData";

export class SpecialWorks {
	//#region Rocket
	static addRocketTiles(index, array, angle) {
		let grid = BoardHelper.getGrid();

		if (index.x < 0 || index.y < 0 || index.x >= grid.length || index.y >= grid[0].length) return;
		if (angle == 0) {
			for (let y = 0; y < grid[0].length; y++) {
				if (!array.includes(grid[index.x][y])) {
					array.push(grid[index.x][y]);
				}
			}
		} else {
			for (let x = 0; x < grid.length; x++) {
				if (!array.includes(grid[x][index.y])) {
					array.push(grid[x][index.y]);
				}
			}
		}
	}
	static explodeRocket(item, index, dontKill) {
		let delay = 0.01;
		let gonnaKill = [];
		if (item.sprite.state) {
			item.sprite.state.timeScale = 0.7;
			item.sprite.state.setAnimation(0, SpecialsData.specialData.Rocket.actionAnimName);
			delay = LevelUpType.Rocket.destroyDelayWithSpine;

			gsap.delayedCall(0, () => {
				gsap.killTweensOf(item.container);
				item.container.alpha = 1;
			});

			if (item.container.play2Rocket) {
				let spineSpawnPos = { x: 50, y: 50 };

				let secRocket = BoardHelper.spawnSpine(LevelUpType.Rocket.name, spineSpawnPos, 1, item.container);

				secRocket.angle = 90;
				secRocket.state.timeScale = 0.7;
				secRocket.state.setAnimation(0, SpecialsData.specialData.Rocket.actionAnimName);
			}
		}

		if (item.container.destroyDelay) {
			delay = item.container.destroyDelay;
		}

		if (!item.container.play2Rocket) {
			if (item.container.angle == 0) {
				AnimationController.playRocketAnim(false, index.x);
				SpecialWorks.addRocketTiles(item.tile.index, gonnaKill, 0);
			} else {
				AnimationController.playRocketAnim(true, index.y);
				SpecialWorks.addRocketTiles(item.tile.index, gonnaKill, 90);
			}
			gsap.delayedCall(delay, () => {
				gonnaKill?.forEach((element) => {
					if (element.item != null) {
						if (dontKill != null) {
							if (!dontKill.includes(element)) element.item.destroy(false);
						} else {
							element.item.destroy(false);
						}
					}
				});
			});
		} else {
			AnimationController.playRocketAnim(false, index.x);
			AnimationController.playRocketAnim(true, index.y);
		}
		return delay;
	}
	//#endregion

	//#region Bomb
	static addBombTiles(index, array) {
		let grid = BoardHelper.getGrid();

		for (let x = index.x - 1; x <= index.x + 1; x++) {
			for (let y = index.y - 1; y <= index.y + 1; y++) {
				if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length || array.includes(grid[x][y])) continue;

				array.push(grid[x][y]);
			}
		}
	}
	static explodeBomb(item) {
		let gonnaKill = [];
		SpecialWorks.addBombTiles(item.tile.index, gonnaKill);

		if (!item.container.playedAnimation) {
			AnimationController.playBombAnim(item.tile.index);
		}

		if (item.container.play2Rocket) {
			if (data.specialsAreSpine) {
				let spineSpawnPos = { x: 50, y: 50 };

				let rocketH = BoardHelper.spawnSpine(LevelUpType.Rocket.name, spineSpawnPos, 1, item.container);
				let rocketV = BoardHelper.spawnSpine(LevelUpType.Rocket.name, spineSpawnPos, 1, item.container);

				gsap.delayedCall(0, () => {
					item.container.parent.reparentChild(rocketH);
					item.container.parent.reparentChild(rocketV);
				});

				rocketH.angle = 0;
				rocketV.angle = 90;

				rocketH.state.setAnimation(0, SpecialsData.specialData.Rocket.actionAnimName);
				rocketV.state.setAnimation(0, SpecialsData.specialData.Rocket.actionAnimName);

				rocketH.state.addListener({
					complete: (entry) => {
						if (entry.animation.name === SpecialsData.specialData.Rocket.actionAnimName) {
							rocketH.visible = false;
						}
					},
				});

				rocketV.state.addListener({
					complete: (entry) => {
						if (entry.animation.name === SpecialsData.specialData.Rocket.actionAnimName) {
							rocketV.visible = false;
						}
					},
				});
			}
		}

		gonnaKill?.forEach((element) => {
			if (element.item != null) {
				element.item.destroy(false);
			}
		});
		return 0.01;
	}
	//#endregion

	//#region LightBall
	static addLightBallItems(type, array) {
		let grid = BoardHelper.getGrid();

		for (let x = 0; x < grid.length; x++) {
			for (let y = 0; y < grid[0].length; y++) {
				if (grid[x][y]?.item?.type == type && !array.includes(grid[x][y])) {
					array.push(grid[x][y].item);
				}
			}
		}
	}
	static explodeLightBall(item) {
		globals.board.tutorial.stopTutorial();
		let gonnaKill = [];
		let index = 0;

		let targetType = item.type;
		if (targetType == globals.notMergeType) {
			if (item.container.targetType) {
				targetType = item.container.targetType;
			} else {
				let randomIndex = Math.floor(Math.random() * globals.itemTypes.length);

				let type = globals.itemTypes[randomIndex];
				targetType = type;
			}
		}

		if (item.sprite.state) {
			item.sprite.state.setAnimation(0, SpecialsData.specialData.LightBall.actionAnimName, true);
		}

		SpecialWorks.addLightBallItems(targetType, gonnaKill);
		let delayTotal = gonnaKill.length * 0.1 + 0.5;
		let indexAnim = 0;

		gonnaKill.forEach((element) => {
			element.isGonnaDestroyed = true;
		});

		for (let i = 0; i < gonnaKill.length; i++) {
			gsap.delayedCall(indexAnim * 0.1, () => {
				if (gonnaKill[i] != null && !gonnaKill[i].isDestroyed) {
					AnimationController.playLightballAnim(item.container, gonnaKill[i].tile.container, gonnaKill[i].type);
				}
			});
			if (gonnaKill[i] != null && !gonnaKill[i].isDestroyed) indexAnim++;

			delayTotal = indexAnim * 0.1 + 0.5;
		}

		gonnaKill.forEach((element) => {
			if (element != null) {
				element.isGonnaDestroyed = true;
			}
		});

		gonnaKill?.forEach((element) => {
			if (element != null) {
				let item = element;
				// element?.tile.clearItem();
				gsap.delayedCall(delayTotal, () => {
					if (!item.isDestroyed) {
						if (index == 0) item?.destroy(true, true);
						else item?.destroy(false, true);
					}
					index++;
				});
			}
		});
		return delayTotal + 0.2;
	}
	//#endregion

	//#region Propeller

	static addPropellerTilesAndGetTarget(index, array, target) {
		let grid = BoardHelper.getGrid();

		let tile = grid[index.x][index.y];

		for (let i = 0; i < tile.neighborTiles.length; i++) {
			let neighbor = tile.neighborTiles[i];
			if (neighbor.item) {
				array.push(neighbor);
			}
		}

		let targetTile = BoardHelper.getRandomTile([...array, tile], false);

		return targetTile;
	}

	static explodePropeller(item) {
		let comboType = { type: LevelUpType.Base, angle: 0 };

		if (item.container.comboType) {
			comboType = item.container.comboType;
		}

		if (comboType.type == LevelUpType.Propeller) {
			let propeller_1 = BoardHelper.clonePropeller(item);
			let propeller_2 = BoardHelper.clonePropeller(item);

			propeller_1.container.scale.set(0);
			propeller_2.container.scale.set(0);

			propeller_1.tile = item.tile;
			propeller_2.tile = item.tile;

			let allPropellers = [propeller_1, propeller_2];

			for (let i = 0; i < allPropellers.length; i++) {
				this.sendPropellerToRandomTile(allPropellers[i], LevelUpType.Base, 0);
			}

			return this.sendPropellerToRandomTile(item, LevelUpType.Base, 0);
		} else {
			if (item) return this.sendPropellerToRandomTile(item, comboType.type, comboType.angle);
		}
	}

	static sendPropellerToRandomTile(item, explodeType = LevelUpType.Base, angle = 0) {
		let gonnaKill = [];
		let targetTile = SpecialWorks.addPropellerTilesAndGetTarget(item.tile.index, gonnaKill);
		let delay = 0.2;
		item.container.zIndex = 100;

		if (targetTile.item) targetTile.item.isGonnaDestroyed = true;

		gonnaKill.forEach((element) => {
			if (element.item) element.item.destroy(false);
		});
		item.sprite.state.setAnimation(0, SpecialsData.specialData.Propeller.actionAnimName, true);
		if (targetTile) {
			gsap.to(item.container, {
				pixi: { x: targetTile.container.x, y: targetTile.container.y },
				ease: "power1.inOut",
				duration: 1,
				onComplete: () => {
					let gonnaDieTiles = [];

					if (explodeType.name == LevelUpType.Base.name) {
						gonnaDieTiles.push(targetTile);
					} else if (explodeType.name == LevelUpType.Rocket.name) {
						SpecialWorks.addRocketTiles(targetTile.index, gonnaDieTiles, angle);
					} else if (explodeType.name == LevelUpType.Bomb.name) {
						SpecialWorks.addBombTiles(targetTile.index, gonnaDieTiles);
					}

					gonnaDieTiles.forEach((element) => {
						if (element.item) element.item.destroy(false);
					});
				},
			});

			let destryoScaleMultiplier = SpecialsData.specialData.Propeller.destroyScaleMultiplier;
			gsap.to(item.container, {
				pixi: { scaleX: targetTile.container.scale.x * destryoScaleMultiplier, scaleY: targetTile.container.scale.y * destryoScaleMultiplier },
				duration: 0.2,
				ease: "none",
				onComplete: () => {
					gsap.to(item.container, {
						pixi: { scaleX: 0, scaleY: 0 },
						duration: 0.3,
						delay: 0.5,
						ease: "none",
					});
				},
			});
		}

		return delay + 1;
	}

	//#endregion
}
