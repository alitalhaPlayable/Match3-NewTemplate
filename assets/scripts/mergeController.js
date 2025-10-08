import data from "@data";
import globals, { LevelUpType } from "@globals";
import { ComboController } from "./comboController";
import { SpecialWorks } from "./specialWorks";
import gsap from "gsap";
import { BoardHelper } from "./BoardHelper";

export class MergeController {
	constructor(grid) {
		this.grid = grid;
		this.comboController = new ComboController(grid);
	}

	checkLevelUp(tiles, includeNewTiles = false) {
		for (let i = 0; i < globals.levelUpPatterns.length; i++) {
			let pattern = globals.levelUpPatterns[i].pattern;
			let patternType = globals.levelUpPatterns[i].type;

			if (!patternType.enabled) continue;

			let isMultiDimensional = Array.isArray(pattern[0]);
			for (let a = 0; a < tiles.length; a++) {
				let tile = tiles[a];
				if (tile.item.isDestroyed) continue;
				if (tile.item.level != LevelUpType.Base) continue;
				if (tile.item.isGonnaDestroyed) continue;

				let type = tile.item.type;

				let xOffset = 0;
				let yOffset = 0;
				let stopOffset = false;
				let changedXOffset = false;

				let otherTiles = [];
				if (isMultiDimensional) {
					outerLoop: for (let j = 0; j < pattern.length; j++) {
						for (let k = 0; k < pattern[j].length; k++) {
							let patternItem = pattern[j][k];
							if (patternItem == 0) {
								if (j == pattern.length - 1 && k == pattern[j].length - 1) {
									if (includeNewTiles) {
										for (let i = 0; i < otherTiles.length; i++) {
											if (tiles.includes(otherTiles[i])) continue;

											tiles.push(otherTiles[i]);
										}
									}

									return { hasLevelUp: true, type: patternType };
								}

								if (k == pattern[j].length - 1) {
									if (!stopOffset) {
										xOffset--;
										changedXOffset = true;
									}
								}

								if (!stopOffset) {
									yOffset--;
								}

								if (changedXOffset) {
									yOffset = 0;
									changedXOffset = false;
								}

								continue;
							}

							if (patternItem == 1) {
								stopOffset = true;
							}

							let x = tile.index.x + j + xOffset;
							let y = tile.index.y + k + yOffset;

							if (x < 0 || y < 0 || x >= this.grid.length || y >= this.grid[0].length) break outerLoop;

							if (this.grid[x][y].item == null) break outerLoop;
							if (this.grid[x][y].item.type != type) break outerLoop;
							if (this.grid[x][y].item.level != LevelUpType.Base) break outerLoop;
							if (this.grid[x][y].item.isGonnaDestroyed) continue;

							otherTiles.push(this.grid[x][y]);

							if (j == pattern.length - 1 && k == pattern[j].length - 1) {
								if (includeNewTiles) {
									for (let i = 0; i < otherTiles.length; i++) {
										if (tiles.includes(otherTiles[i])) continue;

										tiles.push(otherTiles[i]);
									}
								}

								return { hasLevelUp: true, type: patternType };
							}
						}
					}
				} else {
					for (let j = 0; j < pattern.length; j++) {
						let patternItem = pattern[j];
						if (patternItem == 0) {
							if (j == pattern.length - 1) return { hasLevelUp: true, type: patternType };
							continue;
						}

						let x = tile.index.x;
						let y = tile.index.y + j;

						if (y < 0 || y >= this.grid[0].length) break;

						if (this.grid[x][y].item == null) break;
						if (this.grid[x][y].item.type != type) break;
						if (this.grid[x][y].item.level != LevelUpType.Base) break;
						if (this.grid[x][y].item.isGonnaDestroyed) continue;

						if (j == pattern.length - 1) {
							return { hasLevelUp: true, type: patternType };
						}
					}
				}
			}
		}

		return { hasLevelUp: false };
	}

	checkMergeSingleTile(tile) {
		if (tile.item.isDestroyed) return;

		if (!data.enableHardBlastMode) {
			let resultCol = this.checkColumn(tile.index, tile.item.type);
			let resultRow = this.checkRow(tile.index, tile.item.type);

			if (resultCol.value >= 2 || resultRow.value >= 2) {
				tile.checkMerge(resultCol, resultRow, 0, data.enableSpecialItems);
				return true;
			}
			return false;
		} else {
			let comboResult = tile.findBlastCombo();

			if (comboResult.hasCombo) {
				let tile_1 = comboResult.mainTile;
				let tile_2 = comboResult.neighborTile;

				this.comboController.checkCombo(tile_1, tile_2);
				return true;
			} else {
				if (tile.item.level.name == LevelUpType.Base.name) {
					let mergeTiles = BoardHelper.getBlastResult(tile);
					let blasted = tile.checkBlastMerge(mergeTiles);

					return blasted;
				} else {
					tile.item.destroy();
					return true;
				}
			}
		}
	}

	checkMergeTilePair(tile_1, tile_2) {
		if (tile_1.item.isDestroyed || tile_2.item.isDestroyed) return;

		let tempItem = tile_1.item;
		tile_1.setItem(tile_2.item);
		tile_2.setItem(tempItem);

		let { nonSpecialTiles, specialTiles } = this.findMergeSpecial([tile_1, tile_2]);
		if (data.enableBlastSpeciels) {
			if (nonSpecialTiles.length == 1 && specialTiles.length == 1) {
				let specialTile = specialTiles[0];
				let specialItem = specialTile.item;
				let specialType = specialTile.item.level.name;
				let nonSpecialTile = nonSpecialTiles[0];
				let nonSpecialItem = nonSpecialTiles[0].item;

				nonSpecialItem.move(nonSpecialTile.container, null);
				if (specialType == LevelUpType.Rocket.name) {
					let lineTiles = [];

					let angle = specialItem.container.angle;
					if (angle) {
						for (let y = 0; y < this.grid.length; y++) {
							lineTiles.push(this.grid[y][specialTile.index.y]);
						}
					} else {
						for (let y = 0; y < this.grid[0].length; y++) {
							lineTiles.push(this.grid[specialTile.index.x][y]);
						}
					}

					gsap.delayedCall(0.1, () => {
						specialTile.specialMerge(lineTiles);
					});

					return;
				}

				if (specialType == LevelUpType.Bomb.name) {
					let tiles = [];
					let gonnaDieTiles = [];
					SpecialWorks.addBombTiles(specialTile.index, gonnaDieTiles);

					specialTile.specialMerge(tiles);

					globals.eventEmitter.emit("movePlayed");

					return;
				}

				if (specialType == LevelUpType.LightBall.name) {
					specialItem.container.targetType = nonSpecialItem.type;
					let gonnaDieTiles = [];
					SpecialWorks.addLightBallItems(specialItem.type, gonnaDieTiles);

					specialItem.moveAndDestroy(specialTile.container, []);
					globals.eventEmitter.emit("movePlayed");

					return;
				}

				if (specialType == LevelUpType.Propeller.name) {
					specialTile.specialMerge();
					return;
				}
			} else {
				console.warn("2specials");
			}
		}

		if (this.comboController.checkCombo(tile_1, tile_2)) return;

		let result_1Col = this.checkColumn(tile_1.index, tile_1.item.type);
		let result_1Row = this.checkRow(tile_1.index, tile_1.item.type);

		let result_2Col = this.checkColumn(tile_2.index, tile_2.item.type);
		let result_2Row = this.checkRow(tile_2.index, tile_2.item.type);

		let tiles_0 = [...result_1Col.tiles, ...result_1Row.tiles, tile_1];
		let tiles_1 = [...result_2Col.tiles, ...result_2Row.tiles, tile_2];

		let lvlUpResult_0 = globals.board.mergeController.checkLevelUp(tiles_0, false);
		let lvlUpResult_1 = globals.board.mergeController.checkLevelUp(tiles_1, false);

		if (result_1Col.value < 2 && result_1Row.value < 2 && result_2Col.value < 2 && result_2Row.value < 2 && !lvlUpResult_0.hasLevelUp && !lvlUpResult_1.hasLevelUp) {
			tile_1.failMergeAnim(tile_1);
			tile_2.failMergeAnim(tile_2);
			let tempItem = tile_1.item;
			tile_1.setItem(tile_2.item);
			tile_2.setItem(tempItem);
		} else {
			tile_1.checkMerge(result_1Col, result_1Row, 0, data.enableSpecialItems);
			tile_2.checkMerge(result_2Col, result_2Row, 0, data.enableSpecialItems);
		}
	}

	findMergeSpecial(tiles) {
		let nonSpecialTiles = tiles.filter((e) => e.item && e.item.level.name == LevelUpType.Base.name);
		let specialTiles = tiles.filter((e) => e.item && e.item.level.name !== LevelUpType.Base.name);
		return {
			nonSpecialTiles,
			specialTiles,
		};
	}

	checkColumn(index, type) {
		if (type == globals.notMergeType) return { value: 0, tiles: [] };

		let value = 0;
		let tiles = [];

		const directions = [-1, 1]; // -1 for up, 1 for down

		directions.forEach((direction) => {
			let x = index.x + direction;
			while (x >= 0 && x < this.grid.length) {
				const currentTile = this.grid[x][index.y];
				if (currentTile.item == null) break; // stop if tile is empty
				if (currentTile.item.isDestroyed) break;
				if (currentTile.item.isGonnaDestroyed) break;
				// if (currentTile.item.isInAnimation) break;

				if (currentTile.item.type === type) {
					value++;
					tiles.push(currentTile);
					x += direction; // Move to the next tile in the given direction
				} else {
					break; // stop if types do not match
				}
			}
		});

		return { value, tiles };
	}

	checkRow(index, type) {
		if (type == globals.notMergeType) return { value: 0, tiles: [] };

		let value = 0;
		let tiles = [];

		const directions = [-1, 1]; // -1 for left, 1 for right

		directions.forEach((direction) => {
			let y = index.y + direction;
			while (y >= 0 && y < this.grid[0].length) {
				const currentTile = this.grid[index.x][y];
				if (currentTile.item == null) break; // stop if tile is empty
				if (currentTile.item.isDestroyed) break;
				if (currentTile.item.isGonnaDestroyed) break;

				if (currentTile.item.type === type) {
					value++;
					tiles.push(currentTile);
					y += direction; // Move to the next tile in the given direction
				} else {
					break; // stop if types do not match
				}
			}
		});

		return { value, tiles };
	}
}
