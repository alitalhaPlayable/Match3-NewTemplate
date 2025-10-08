import data from "@data";
import { BoardHelper } from "./BoardHelper";
import { LevelUpType } from "@globals";

export class MatchTutorialFinder {
	static checkTilesForTutorial() {
		let grid = BoardHelper.getGrid();

		let maxValue = 0;
		let tile = null;
		let neighborTile = null;
		let type;
		let tiles = [];
		for (let x = 0; x < grid.length; x++) {
			for (let y = 0; y < grid[0].length; y++) {
				if (grid[x][y].item == null || grid[x][y].item.isDestroyed) continue;
				let check = this.getMaxCombination(grid[x][y], grid[x][y].neighborTiles);
				if (check.out == null) continue;

				// for (let i = 0; i < check.out.tiles.length; i++) {
				// 	if (check.out.tiles[i].item == null || check.out.tiles[i].item.isDestroyed) continue;
				// }

				if (check.out.val > maxValue) {
					maxValue = check.out.val;
					tile = grid[x][y];
					neighborTile = check.neighborTile;
					type = check.out.tiles[0].item.type;
					tiles = check.out.tiles;
				}
			}
		}
		return { position_1: tile, position_2: neighborTile, type: type, tiles: tiles };
	}

	static getMaxCombination(tile, neighbors) {
		let value = 0;
		let neighborTile = null;
		let out;
		for (let x = 0; x < neighbors.length; x++) {
			if (neighbors[x].item == null || neighbors[x].item.isDestroyed) continue;
			if (this.getPairForTutorial(tile, neighbors[x]).val > value) {
				out = this.getPairForTutorial(tile, neighbors[x]);
				neighborTile = neighbors[x];
				value = out.val;
			}
		}
		return { out, neighborTile };
	}
	static getPairForTutorial(tile_1, tile_2) {
		if (tile_1.item == null || tile_2.item == null) return { val: 0, tiles: [] };
		if (tile_1.item.isDestroyed || tile_2.item.isDestroyed) return { val: 0, tiles: [] };
		if (tile_1.item.isBlock || tile_2.item.isBlock) return { val: 0, tiles: [] };

		if (data.enableBlastSpeciels) {
			if (!tile_1.item || !tile_2.item) return { val: 0, tiles: [] };
			if (tile_1.item.level != LevelUpType.Base && tile_2.item.level != LevelUpType.Base) return { val: 6, tiles: [tile_1, tile_2] };

			if (tile_1.item.level != LevelUpType.Base || tile_2.item.level != LevelUpType.Base) return { val: 5, tiles: [tile_1, tile_2] };
		}

		let tempItem = tile_1.item;
		tile_1.setItem(tile_2.item);
		tile_2.setItem(tempItem);

		let result_1Col = this.checkRawColumn(tile_1.index, tile_1.item.type);
		let result_1Row = this.checkRawRow(tile_1.index, tile_1.item.type);
		let result_1;
		let result_1tiles;

		let result_2Col = this.checkRawColumn(tile_2.index, tile_2.item.type);
		let result_2Row = this.checkRawRow(tile_2.index, tile_2.item.type);
		let result_2;
		let result_2tiles;

		let tempItem_2 = tile_1.item;
		tile_1.setItem(tile_2.item);
		tile_2.setItem(tempItem_2);

		if (result_1Col.value > result_1Row.value) {
			result_1 = result_1Col.value;
			result_1tiles = result_1Col.tiles;
		} else {
			result_1 = result_1Row.value;
			result_1tiles = result_1Row.tiles;
		}

		if (result_2Col.value > result_2Row.value) {
			result_2 = result_2Col.value;
			result_2tiles = result_2Col.tiles;
		} else {
			result_2 = result_2Row.value;
			result_2tiles = result_2Row.tiles;
		}

		if (result_1 >= result_2 && this.checkIsItemsValid(result_1tiles)) return { val: result_1, tiles: result_1tiles };
		else if (this.checkIsItemsValid(result_2tiles)) return { val: result_2, tiles: result_2tiles };

		return { val: 0, tiles: [] };
	}

	static checkIsItemsValid(array) {
		for (let i = 0; i < array.length; i++) {
			if (array[i].item == null || array[i].item.isDestroyed) return false;
		}

		return true;
	}

	static checkRawColumn(index, type) {
		let grid = BoardHelper.getGrid();

		let value = 0;
		let tiles = [];
		if (index.x - 1 >= 0) {
			for (let x = index.x - 1; x >= 0; x--) {
				if (grid[x][index.y].item == null) break;
				if (type == grid[x][index.y].item.type) {
					value++;
					tiles.push(grid[x][index.y]);
				} else break;
			}
		}
		if (index.x + 1 < grid.length) {
			for (let x = index.x + 1; x < grid.length; x++) {
				if (grid[x][index.y].item == null) break;
				if (type == grid[x][index.y].item.type) {
					value++;
					tiles.push(grid[x][index.y]);
				} else break;
			}
		}
		return { value: value, tiles: tiles };
	}
	static checkRawRow(index, type) {
		let grid = BoardHelper.getGrid();

		let value = 0;
		let tiles = [];
		if (index.y - 1 >= 0) {
			for (let y = index.y - 1; y >= 0; y--) {
				if (grid[index.x][y].item == null) break;
				if (type == grid[index.x][y].item.type) {
					value++;
					tiles.push(grid[index.x][y]);
				} else break;
			}
		}
		if (index.y + 1 < grid[0].length) {
			for (let y = index.y + 1; y < grid[0].length; y++) {
				if (grid[index.x][y].item == null) break;
				if (type == grid[index.x][y].item.type) {
					value++;
					tiles.push(grid[index.x][y]);
				} else break;
			}
		}

		return { value: value, tiles: tiles };
	}
}
