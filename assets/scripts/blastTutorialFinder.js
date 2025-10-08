import data from "@data";
import { BoardHelper } from "./BoardHelper";
import { LevelUpType } from "@globals";

export class BlastTutorialFinder {
	static checkTilesForTutorial() {
		let grid = BoardHelper.getGrid();

		let maxValue = 0;
		let tile = null;
		let tiles = [];
		for (let x = 0; x < grid.length; x++) {
			for (let y = 0; y < grid[0].length; y++) {
				if (grid[x][y].item == null) continue;

				if (grid[x][y].item.level.name != LevelUpType.Base.name) {
					tile = grid[x][y];
					let comboResult = tile.findBlastCombo();
					tiles = [tile];
					maxValue = 99;

					if (comboResult.hasCombo) {
						return { value: 2, mainTile: tile, tiles: [tile, comboResult.neighborTile] };
					}
					continue;
				}

				let result = BoardHelper.getBlastResult(grid[x][y]);

				if (result.length > maxValue) {
					maxValue = result.length;
					tile = grid[x][y];
					tiles = result;
				}
			}
		}
		return { value: maxValue, mainTile: tile, tiles: tiles };
	}
}
