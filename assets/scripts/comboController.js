import data from "@data";
import globals, { LevelUpType } from "@globals";
import { SpecialWorks } from "./specialWorks";
import { BoardHelper } from "./BoardHelper";
import { AnimationController } from "./animationController";
import { SpecialsData } from "./specialsData";

export class ComboController {
	constructor(grid) {
		this.grid = grid;
	}

	checkCombo(tile_1, tile_2) {
		if (tile_1.item == null || tile_1.item.isDestroyed || tile_1.item.isGonnaDestroyed || tile_1.item.isInAnimation) {
			return false;
		}

		if (tile_2.item == null || tile_2.item.isDestroyed || tile_2.item.isGonnaDestroyed || tile_2.item.isInAnimation) {
			return false;
		}

		let tile_1Name = tile_1.item.level.name;
		let tile_2Name = tile_2.item.level.name;

		if (tile_1Name == LevelUpType.LightBall.name && tile_2Name == LevelUpType.LightBall.name) {
			this.playLightballCombo(tile_2, tile_1);

			return true;
		}

		if (tile_2Name == LevelUpType.LightBall.name && tile_1Name == LevelUpType.Propeller.name) {
			this.lightballPropellerMerge(tile_2, tile_1, true);

			return true;
		}

		if (tile_1Name == LevelUpType.LightBall.name && tile_2Name == LevelUpType.Propeller.name) {
			this.lightballPropellerMerge(tile_1, tile_2, false);

			return true;
		}

		if (tile_2Name == LevelUpType.LightBall.name && tile_1Name == LevelUpType.Bomb.name) {
			this.lightballBombMerge(tile_2, tile_1, true);

			return true;
		}
		if (tile_1Name == LevelUpType.LightBall.name && tile_2Name == LevelUpType.Bomb.name) {
			this.lightballBombMerge(tile_1, tile_2, false);

			return true;
		}

		if (tile_2Name == LevelUpType.LightBall.name && tile_1Name == LevelUpType.Rocket.name) {
			this.lighballRocketMerge(tile_2, tile_1, true);

			return true;
		}
		if (tile_1Name == LevelUpType.LightBall.name && tile_2Name == LevelUpType.Rocket.name) {
			this.lighballRocketMerge(tile_1, tile_2, false);

			return true;
		}
		if (tile_1Name == LevelUpType.Rocket.name && tile_2Name == LevelUpType.Rocket.name) {
			this.playRocketCombo(tile_1, tile_2);

			return true;
		}
		if (tile_1Name == LevelUpType.Bomb.name && tile_2Name == LevelUpType.Bomb.name) {
			this.playBombCombo(tile_1, tile_2);

			return true;
		}
		if ((tile_1Name == LevelUpType.Bomb.name || tile_1Name == LevelUpType.Rocket.name) && (tile_2Name == LevelUpType.Bomb.name || tile_2Name == LevelUpType.Rocket.name)) {
			this.playRocketBombCombo(tile_1, tile_2);

			return true;
		}

		if ((tile_1Name == LevelUpType.Propeller.name && tile_2Name == LevelUpType.Rocket.name) || (tile_1Name == LevelUpType.Rocket.name && tile_2Name == LevelUpType.Propeller.name)) {
			this.propellerRocketCombo(tile_1, tile_2);

			return true;
		}

		if ((tile_1Name == LevelUpType.Propeller.name && tile_2Name == LevelUpType.Bomb.name) || (tile_1Name == LevelUpType.Bomb.name && tile_2Name == LevelUpType.Propeller.name)) {
			this.propellerBombCombo(tile_1, tile_2);

			return true;
		}

		if (tile_1Name == LevelUpType.Propeller.name && tile_2Name == LevelUpType.Propeller.name) {
			this.propellerCombo(tile_1, tile_2);

			return true;
		}

		return false;
	}

	//#region Bomb-Bomb Combo
	playBombCombo(tile_1, tile_2) {
		let tiles = [];

		tile_1.item.type = LevelUpType.Base;
		tile_1.item.container.alpha = 0;
		tile_1.item.container.playedAnimation = true;

		tile_2.item.container.extraScaler = SpecialsData.comboData.Bomb_Bomb.extraScaler;
		tile_2.item.container.extraDelay = SpecialsData.comboData.Bomb_Bomb.extraDelay;
		tile_2.item.container.playedAnimation = true;
		tile_2.item.container.zIndex += 100;

		let destroyDelay = 0.2;

		if (data.specialsAreSpine) {
			let data = SpecialsData.comboData.Bomb_Bomb;

			destroyDelay = data.effectDelay;

			tile_2.item.container.destroyDelay = data.destroyDelay;
			tile_2.item.sprite.state.setAnimation(0, data.comboAnimName, false);
			tile_2.item.sprite.state.timeScale = data.comboAnimTimescale;
		}

		gsap.delayedCall(destroyDelay, () => {
			tile_2.item.container.alpha = 0;
			AnimationController.playBombAnim(tile_2.index, 2);
		});

		tiles = this.getComboBombTiles(tile_2.index);
		tile_2.specialMerge(tiles);
	}
	getComboBombTiles(index) {
		let tiles = [];
		const directions = [
			//Top
			[-2, -1],
			[-1, -1],
			[0, -1],
			[1, -1],
			[2, -1],
			[-1, -2],
			[0, -2],
			[1, -2],
			[0, -3],

			//Bottom
			[-2, 1],
			[-1, 1],
			[0, 1],
			[1, 1],
			[2, 1],
			[-1, 2],
			[0, 2],
			[1, 2],
			[0, 3],

			//Left
			[-1, -2],
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[-1, 2],
			[-2, -1],
			[-2, 0],
			[-2, 1],
			[-3, 0],

			//Right
			[1, -2],
			[1, -1],
			[1, 0],
			[1, 1],
			[1, 2],
			[2, -1],
			[2, 0],
			[2, 1],
			[3, 0],
		];

		let gridSize = this.grid.length;
		for (const [dx, dy] of directions) {
			const newX = index.y + dx;
			const newY = index.x + dy;

			// Sınırları kontrol et
			if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && !tiles.includes(this.grid[newY][newX])) {
				tiles.push(this.grid[newY][newX]);
			}
		}
		return tiles;
	}
	//#endregion

	//#region Rocket-Rocket Combo
	playRocketCombo(tile_1, tile_2) {
		let lineTiles = [];

		lineTiles = this.getRocketComboTiles(tile_2.index);

		tile_2.item.container.play2Rocket = true;
		tile_2.item.container.destroyDelay = SpecialsData.comboData.Rocket_Rocket.destroyDelay;
		tile_2.item.container.extraScaler = SpecialsData.comboData.Rocket_Rocket.extraScaler;
		tile_2.item.container.extraDelay = SpecialsData.comboData.Rocket_Rocket.extraDelay;

		tile_1.item.level = LevelUpType.Base;

		tile_2.specialMerge(lineTiles);
		globals.eventEmitter.emit("movePlayed");
	}
	getRocketComboTiles(index) {
		let tiles = [];

		for (let i = 0; i < this.grid.length; i++) {
			tiles.push(this.grid[i][index.y]);
		}

		for (let i = 0; i < this.grid[0].length; i++) {
			tiles.push(this.grid[index.x][i]);
		}

		return tiles;
	}
	//#endregion

	//#region Rocket-Bomb Combo
	playRocketBombCombo(tile_1, tile_2) {
		let rocket = tile_1.item.level.name == LevelUpType.Rocket.name ? tile_1 : tile_2;
		let bomb = tile_1.item.level.name == LevelUpType.Bomb.name ? tile_1 : tile_2;

		let rocketAngle = rocket.item.container.angle;
		let isRocketVertical = rocketAngle == 90;

		let isSameRow = rocket.index.x == bomb.index.x;

		rocket.item.container.alpha = 0;
		bomb.item.container.zIndex = 1000;

		let specialData = SpecialsData.comboData.Rocket_Bomb;

		if (data.specialsAreSpine) {
			let animationName = isRocketVertical ? (isSameRow ? specialData.dikeyAnimName : specialData.dikey2AnimName) : isSameRow ? specialData.yatayAnimName : specialData.yatay2AnimName;
			bomb.item.sprite.state.setAnimation(0, animationName, false);
		}

		let tiles = this.getRocketBombComboTiles(tile_2.index);
		if (tile_1.item.level.name == LevelUpType.Bomb.name) {
			let tempItem = tile_1.item;
			tile_1.item = tile_2.item;
			tile_2.item = tempItem;

			tile_1.item.tile = tile_2;
			tile_2.item.tile = tile_1;

			tile_1.item.container.x = tile_1.container.x;
			tile_1.item.container.y = tile_1.container.y;

			tile_2.item.container.x = tile_2.container.x;
			tile_2.item.container.y = tile_2.container.y;

			let tempTile = rocket;
			rocket = bomb;
			bomb = tempTile;
		}

		rocket.item.type = LevelUpType.Base;
		rocket.item.level = LevelUpType.Base;
		rocket.item.container.visible = false;

		bomb.item.type = LevelUpType.Base;
		bomb.item.level = LevelUpType.Base;
		bomb.item.container.extraScaler = specialData.extraScaler;
		bomb.item.container.destroyDelay = specialData.destroyDelay;
		bomb.item.container.playedAnimation = true;
		bomb.item.container.zIndex += 100;
		bomb.item.container.play2Rocket = true;
		bomb.item.container.extraDelay = SpecialsData.comboData.Rocket_Bomb.extraDelay;

		tile_2.specialMerge(tiles);

		let effectDelay = specialData.effectDelay;

		gsap.delayedCall(effectDelay, () => {
			AnimationController.playBombAnim(tile_2.index);
			AnimationController.playRocketAnim(false, tile_2.index.x);
			AnimationController.playRocketAnim(true, tile_2.index.y);

			bomb.item.sprite.alpha = 0;
		});
	}

	getRocketBombComboTiles(index) {
		let bombTiles = [];
		let rocketTiles = [];
		let additionalRocketTiles = [];

		if (!data.enableHardBlastMode) {
			SpecialWorks.addBombTiles(index, bombTiles);
			rocketTiles = this.getRocketComboTiles(index);
		} else {
			SpecialWorks.addBombTiles(index, bombTiles);
			rocketTiles = this.getRocketComboTiles(index);
			SpecialWorks.addRocketTiles({ x: index.x + 1, y: index.y }, additionalRocketTiles, 0);
			SpecialWorks.addRocketTiles({ x: index.x - 1, y: index.y }, additionalRocketTiles, 0);
			SpecialWorks.addRocketTiles({ x: index.x, y: index.y + 1 }, additionalRocketTiles, 90);
			SpecialWorks.addRocketTiles({ x: index.x, y: index.y - 1 }, additionalRocketTiles, 90);
		}

		let allTiles = [...bombTiles, ...rocketTiles, ...additionalRocketTiles];
		let uniqueArray = [...new Set(allTiles)];

		return uniqueArray;
	}
	//#endregion

	//#region Lightball Combos
	playLightballCombo(tile_1, tile_2) {
		let isSameRow = tile_1.index.x == tile_2.index.x;
		let specialData = SpecialsData.comboData.Lightball_Lightball;

		let delay = specialData.destroyDelay;

		let tiles = [];
		for (let i = 0; i < this.grid.length; i++) {
			for (let j = 0; j < this.grid[i].length; j++) {
				if (this.grid[i][j].item == null) continue;
				tiles.push(this.grid[i][j].item);
				this.grid[i][j].item.level = LevelUpType.Base;
			}
		}

		tile_1.item.container.visible = false;
		tile_1.item.isInAnimation = true;
		tile_1.item.type = LevelUpType.Base;
		tile_1.item.level = LevelUpType.Base;
		tile_1.item.zIndex = 500;

		tile_2.item.isInAnimation = true;
		tile_2.item.type = LevelUpType.Base;
		tile_2.item.level = LevelUpType.Base;
		tile_2.item.zIndex = 500;
		tile_2.item.container.playedAnimation = true;
		tile_2.item.lightballCombo(tiles, delay);
		tile_2.item.container.extraDelay = specialData.extraDelay;

		if (data.specialsAreSpine) {
			let animationName = isSameRow ? specialData.comboAnimName_0 : specialData.comboAnimName_1;
			tile_2.item.sprite.state.setAnimation(0, animationName, false);
		}

		gsap.delayedCall(delay, () => {
			tile_2.item.container.visible = false;
		});
	}

	lighballRocketMerge(lightballTile, rocketTile, isLightballFirst) {
		let randomIndex = Math.floor(Math.random() * globals.itemTypes.length);

		let type = globals.itemTypes[randomIndex];
		if (data.specielsHasColors) {
			type = lightballTile.item.type;
		}

		let items = BoardHelper.getAllTypes(type);

		lightballTile.item.isInAnimation = true;

		rocketTile.item.isInAnimation = true;
		rocketTile.item.container.visible = false;
		rocketTile.item.type = LevelUpType.Base;
		rocketTile.item.level = LevelUpType.Base;

		if (isLightballFirst) {
			gsap.to(lightballTile.item.container, {
				x: lightballTile.container.x,
				y: lightballTile.container.y,
				duration: 0.2,
				onComplete: () => {
					items.push(rocketTile.item);
					lightballTile.item.lightRockets(items);
				},
			});
		} else {
			gsap.to(rocketTile.item.container, {
				x: rocketTile.container.x,
				y: rocketTile.container.y,
				duration: 0.2,
				onComplete: () => {
					items.push(rocketTile.item);
					lightballTile.item.lightRockets(items);
				},
			});
		}
	}

	lightballBombMerge(lightballTile, bombTile, isLightballFirst) {
		let randomIndex = Math.floor(Math.random() * globals.itemTypes.length);

		let type = globals.itemTypes[randomIndex];
		if (data.specielsHasColors) {
			type = lightballTile.item.type;
		}
		let items = BoardHelper.getAllTypes(type);

		lightballTile.item.isInAnimation = true;

		bombTile.item.isInAnimation = true;
		bombTile.item.container.visible = false;
		bombTile.item.type = LevelUpType.Base;
		bombTile.item.level = LevelUpType.Base;

		if (isLightballFirst) {
			gsap.to(lightballTile.item.container, {
				x: lightballTile.container.x,
				y: lightballTile.container.y,
				duration: 0.2,
				onComplete: () => {
					items.push(bombTile.item);
					lightballTile.item.lightBombs(items);
				},
			});
		} else {
			gsap.to(bombTile.item.container, {
				x: bombTile.container.x,
				y: bombTile.container.y,
				duration: 0.2,
				onComplete: () => {
					items.push(bombTile.item);
					lightballTile.item.lightBombs(items);
				},
			});
		}
	}

	lightballPropellerMerge(lightballTile, propellerTile, isLightballFirst) {
		let randomIndex = Math.floor(Math.random() * globals.itemTypes.length);

		let type = globals.itemTypes[randomIndex];
		if (data.specielsHasColors) {
			type = lightballTile.item.type;
		}
		let items = BoardHelper.getAllTypes(type);

		lightballTile.item.isInAnimation = true;

		propellerTile.item.isInAnimation = true;
		propellerTile.item.container.visible = false;
		propellerTile.item.type = LevelUpType.Base;
		propellerTile.item.level = LevelUpType.Base;

		if (isLightballFirst) {
			gsap.to(lightballTile.item.container, {
				x: lightballTile.container.x,
				y: lightballTile.container.y,
				duration: 0.2,
				onComplete: () => {
					items.push(propellerTile.item);
					lightballTile.item.preparePropellers(items);
				},
			});
		} else {
			gsap.to(propellerTile.item.container, {
				x: propellerTile.container.x,
				y: propellerTile.container.y,
				duration: 0.2,
				onComplete: () => {
					items.push(propellerTile.item);
					lightballTile.item.preparePropellers(items);
				},
			});
		}
	}

	//#endregion

	//#region Propeller Rocket Combo

	propellerRocketCombo(tile_1, tile_2) {
		let rocketTile = tile_1.item.level.name == LevelUpType.Rocket.name ? tile_1 : tile_2;
		let propellerTile = tile_1.item.level.name == LevelUpType.Propeller.name ? tile_1 : tile_2;

		rocketTile.item.type = LevelUpType.Base;
		rocketTile.item.level = LevelUpType.Base;

		let angle = rocketTile.item.container.angle;

		propellerTile.item.isInAnimation = true;
		propellerTile.item.container.comboType = { type: LevelUpType.Rocket, angle: angle };
		propellerTile.item.destroy(true, true);
	}

	//#endregion

	//#region Propeller Bomb Combo

	propellerBombCombo(tile_1, tile_2) {
		let bombTile = tile_1.item.level.name == LevelUpType.Bomb.name ? tile_1 : tile_2;
		let propellerTile = tile_1.item.level.name == LevelUpType.Propeller.name ? tile_1 : tile_2;

		bombTile.item.type = LevelUpType.Base;
		bombTile.item.level = LevelUpType.Base;

		propellerTile.item.isInAnimation = true;
		propellerTile.item.container.comboType = { type: LevelUpType.Bomb };
		propellerTile.item.container.extraDelay = 0;
		propellerTile.item.destroy(true, true);
	}

	//#endregion

	//#region Propeller Combo

	propellerCombo(tile_1, tile_2) {
		tile_1.item.type = LevelUpType.Base;
		tile_1.item.level = LevelUpType.Base;

		tile_2.item.isInAnimation = true;
		tile_2.item.container.comboType = { type: LevelUpType.Propeller, angle: 0 };

		tile_2.item.container.extraDelay = 0;
		tile_2.item.destroy(true, true);
	}

	//#endregion
}
