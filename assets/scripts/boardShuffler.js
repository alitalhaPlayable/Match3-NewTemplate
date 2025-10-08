import data from "@data";
import { MatchTutorialFinder } from "./matchTutorialFinder";
import { BlastTutorialFinder } from "./blastTutorialFinder";
import globals, { LevelUpType } from "@globals";
import { ItemFactory } from "./itemFactory";

export class BoardShuffler {
	static getMinMergeCount() {
		// if (data.enableHardBlastMode) return 3;
		// else return 3;

		return 3;
	}

	static shuffleBoard(grid) {
		this.fillBoard(grid);

		let tryShuffleCount = 0;

		tryShuffleCount++;
		if (tryShuffleCount > 100) {
			this.resetBoard();
			this.tryShuffleCount = 0;
			return;
		}

		let gridFlat = grid.flat();
		let types = shuffleArray(gridFlat.map((tile) => tile.item.type));

		gridFlat.forEach((tile) => {
			tile.item.oldType = tile.item.type;
			tile.newType = types.pop();
			tile.item.type = tile.newType;
		});

		if (this.checkTilesValues(grid) < this.getMinMergeCount()) {
			gridFlat.forEach((tile) => {
				tile.item.type = tile.item.oldType;
			});
			this.shuffleBoard(grid);
			return;
		}

		gridFlat.forEach((tile, i) => {
			tile.item.type = tile.item.oldType;
		});
		gridFlat.forEach((tile, i) => {
			let itemTile = gridFlat.find((e) => e.item.type == tile.newType && !e.selected);
			tile.newItem = itemTile.item;
			itemTile.selected = true;
		});

		gridFlat.forEach((tile, i) => {
			let item = tile.newItem;
			gsap.to(item.container, {
				x: tile.container.x,
				y: tile.container.y,
				duration: 0.4,
				ease: "back.out(1.7)",
				onComplete: () => {
					tile.item = item;
					item.tile = tile;
				},
			});
			tile.selected = false;
		});

		gsap.delayedCall(0.5, () => {
			globals.resetingBoard = false;
			let checkCount = 0;
			for (let row of grid) {
				for (let item of row) {
					globals.board.mergeController.checkMergeSingleTile(item);
				}
			}
		});
	}

	static fillBoard(grid) {
		for (let x = 0; x < grid.length; x++) {
			for (let y = 0; y < grid[0].length; y++) {
				if (grid[x][y].item == null || grid[x][y].item.isDestroyed) {
					let item = ItemFactory.createRandomItemToTile(grid[x][y]);
					grid[x][y].item = item;
				}
			}
		}
	}

	static checkTilesValues(grid) {
		let maxValue = 0;

		for (let x = 0; x < grid.length; x++) {
			for (let y = 0; y < grid[0].length; y++) {
				if (!data.enableHardBlastMode) {
					let check = MatchTutorialFinder.getMaxCombination(grid[x][y], grid[x][y].neighborTiles);
					if (check.out == null) continue;

					if (check.out.val > maxValue) {
						maxValue = check.out.val;
					}
				} else {
					let check = BlastTutorialFinder.checkTilesForTutorial();

					if (check.value > maxValue) maxValue = check.value;
				}
			}
		}
		return { maxValue };
	}
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
