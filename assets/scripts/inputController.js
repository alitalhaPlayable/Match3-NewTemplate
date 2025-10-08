import data from "@data";
import { BoardHelper } from "./BoardHelper";
import MathFunctions from "./mathFunctions";
import globals from "@globals";
import { LevelUpType } from "@globals";

export class MatchInputController {
	constructor(grid, board) {
		this.grid = grid;
		this.board = board;

		board.node.on("pointerdown", this.onPointerDown.bind(this));
		board.node.on("pointerup", this.onPointerUp.bind(this));
		board.node.on("pointermove", this.onPointerMove.bind(this));
		board.node.on("pointerup", this.onPointerTap.bind(this));
	}

	onPointerDown(e) {
		if (globals.resetingBoard) return;

		let pos = this.board.node.toLocal(e.data.global);

		for (let x = 0; x < this.grid.length; x++) {
			for (let y = 0; y < this.grid[x].length; y++) {
				if (this.grid[x][y].item == null) continue;

				if (this.grid[x][y].item.isBlock) continue;

				if (MathFunctions.rectangelePointCollisionV2(pos, this.grid[x][y].container, this.grid[x][y].container.height, this.grid[x][y].container.width)) {
					if (this.grid[x][y].item.isInAnimation || this.grid[x][y].item.isDestroyed || this.grid[x][y].item.isGonnaDestroyed) return;

					this.board.pickedTile = this.grid[x][y];

					if (this.board.debugType) {
						this.board.debug(this.board.pickedTile);
						this.board.pickedTile = null;
						return;
					}
				}
			}
		}
	}

	onPointerUp(e) {
		if (globals.resetingBoard) return;

		this.board.pickedTile = null;
		this.board.tutorial.setTutorialPositions();
	}

	onPointerMove(e) {
		if (!this.board.pickedTile || globals.resetingBoard) return;

		let pos = this.board.node.toLocal(e.data.global);

		for (let x = 0; x < this.grid.length; x++) {
			for (let y = 0; y < this.grid[x].length; y++) {
				if (this.grid[x][y].item == null) continue;

				if (this.grid[x][y].item.isBlock) continue;

				if (MathFunctions.rectangelePointCollisionV2(pos, this.grid[x][y].container, 20, 20))
					if (
						this.grid[x][y] != this.board.pickedTile &&
						Math.abs(this.board.pickedTile.index.x - x) <= 1 &&
						Math.abs(this.board.pickedTile.index.y - y) <= 1 &&
						(this.board.pickedTile.index.x == x || this.board.pickedTile.index.y == y)
					) {
						if (this.grid[x][y].item.isInAnimation || this.grid[x][y].item.isDestroyed || this.grid[x][y].item.isGonnaDestroyed) {
							this.board.pickedTile = null;
							return;
						}

						this.board.tutorial.stopTutorial();
						this.board.mergeController.checkMergeTilePair(this.board.pickedTile, this.grid[x][y]);
						this.board.pickedTile = null;
						return;
					}
			}
		}
	}

	onPointerTap(e) {
		if (!data.enableBlastSpeciels || globals.resetingBoard) return;

		let pos = this.board.node.toLocal(e.data.global);
		for (let x = 0; x < this.grid.length; x++) {
			for (let y = 0; y < this.grid[x].length; y++) {
				let tile = this.grid[x][y];
				if (tile.item == null) continue;

				if (tile.item.isBlock) continue;

				if (MathFunctions.rectangelePointCollisionV2(pos, tile.container, tile.container.height, tile.container.width)) {
					if (this.grid[x][y].item.isInAnimation || this.grid[x][y].item.isDestroyed || this.grid[x][y].item.isGonnaDestroyed) {
						return;
					}

					if (tile.item.level != LevelUpType.Base) {
						if (tile.item.isInAnimation) return;

						this.board.tutorial.stopTutorial();
						tile.item.destroy();
					}
				}
			}
		}
	}
}

export class BlastInputController {
	constructor(grid, board) {
		this.grid = grid;
		this.board = board;

		board.node.on("pointerup", this.onPointerTap.bind(this));
	}
	onPointerTap(e) {
		if (globals.resetingBoard) return;

		if (data.enableHardBlastMode) {
			let pos = this.board.node.toLocal(e.data.global);
			for (let x = 0; x < this.grid.length; x++) {
				for (let y = 0; y < this.grid[x].length; y++) {
					let tile = this.grid[x][y];

					if (tile.item == null) continue;

					if (tile.item.isBlock) continue;

					if (MathFunctions.rectangelePointCollisionV2(pos, tile.container, tile.container.height, tile.container.width)) {
						if (tile.item == null || tile.item.isBlock) return;

						if (tile.item.isInAnimation || tile.item.isDestroyed || tile.item.isGonnaDestroyed) {
							return;
						}

						let isMerged = this.board.mergeController.checkMergeSingleTile(tile);

						if (isMerged) this.board.tutorial.stopTutorial();

						this.board.tutorial.setTutorialPositions();
					}
				}
			}
			return;
		}
	}
}
