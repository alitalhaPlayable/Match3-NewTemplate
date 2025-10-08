import globals, { LevelUpType } from "@globals";
import gsap from "gsap";
import { BoardHelper } from "./BoardHelper";

export class Tile {
	constructor(container, index) {
		this.container = container;
		this.index = index;
		this.item = null;
		this.neighborTiles = [];

		this.leftTutorialLight = container.getChildByName("left");
		this.rightTutorialLight = container.getChildByName("right");
		this.bottomTutorialLight = container.getChildByName("bottom");
		this.topTutorialLight = container.getChildByName("top");
	}
	setItem(item) {
		this.item = item;
		item?.setTile(this);
	}
	failMergeAnim(tile) {
		this.item.moveAndBack(tile.container);
	}
	checkMerge(resultColumn, resultRow, duration = 0, levelUp = true) {
		if (levelUp) {
			let allTiles = [...resultColumn.tiles, ...resultRow.tiles, this];
			let coreAllTiles = [...allTiles];

			let lvlUpResult = globals.board.mergeController.checkLevelUp(allTiles, true);

			if (lvlUpResult.type == LevelUpType.LightBall) {
				coreAllTiles.splice(allTiles.indexOf(this), 1);
				this.item.levelUp("lightball" + this.item.type, coreAllTiles, this.container, duration, LevelUpType.LightBall);
				return;
			}

			if (lvlUpResult.type == LevelUpType.Bomb) {
				coreAllTiles.splice(allTiles.indexOf(this), 1);
				this.item.levelUp("bomb" + this.item.type, coreAllTiles, this.container, duration, LevelUpType.Bomb);
				return;
			}

			if (lvlUpResult.type == LevelUpType.Rocket) {
				let angle = 0;
				if (resultColumn.value >= 3) angle = 90;

				coreAllTiles.splice(allTiles.indexOf(this), 1);
				this.item.levelUp("rocket" + this.item.type, coreAllTiles, this.container, duration, LevelUpType.Rocket, angle);
				return;
			}

			if (lvlUpResult.type == LevelUpType.Propeller) {
				allTiles.splice(allTiles.indexOf(this), 1);
				this.item.levelUp("propeller" + this.item.type, allTiles, this.container, duration, LevelUpType.Propeller);
				return;
			}
		}
		if (resultColumn.value >= 2 && resultRow.value >= 2) {
			let allTiles = [...resultColumn.tiles, ...resultRow.tiles];
			this.item.moveAndDestroy(this.container, allTiles, duration);
			return;
		}
		if (resultColumn.value < 2 && resultRow.value < 2) {
			this.item.move(this.container, 1);
			return;
		}
		if (resultColumn.value >= 2) {
			this.item.moveAndDestroy(this.container, resultColumn.tiles, duration);
			return;
		}
		if (resultRow.value >= 2) {
			this.item.moveAndDestroy(this.container, resultRow.tiles, duration);
			return;
		}
	}
	checkBlastMerge(resultTiles, duration = 0, levelUp = true) {
		if (levelUp) {
			if (resultTiles.length >= LevelUpType.LightBall.blastAmount) {
				let levelUpTxt = "lightball" + this.item.type;
				this.item.levelUp(levelUpTxt, resultTiles, this.container, duration, LevelUpType.LightBall);
				return true;
			}
			if (resultTiles.length >= LevelUpType.Bomb.blastAmount) {
				let levelUpTxt = "bomb" + this.item.type;
				this.item.levelUp(levelUpTxt, resultTiles, this.container, duration, LevelUpType.Bomb);
				return true;
			}

			if (resultTiles.length >= LevelUpType.Rocket.blastAmount) {
				let levelUpTxt = "rocket" + this.item.type;
				this.item.levelUp(levelUpTxt, resultTiles, this.container, duration, LevelUpType.Rocket);
				return true;
			}
		}
		if (resultTiles.length >= 2) {
			this.item.moveAndDestroy(this.container, resultTiles, duration);

			return true;
		}

		return false;
	}
	specialMerge(tiles) {
		this.item.moveAndDestroy(this.container, tiles, 0);
	}
	fall(value) {
		let grid = BoardHelper.getGrid();
		grid[this.index.x + value][this.index.y].setItem(this.item);
		this.item.setTile(grid[this.index.x + value][this.index.y]);
		this.item.move(grid[this.index.x + value][this.index.y].container, 2, "back.out");
		this.item = null;
	}
	addNeighborTile(tile) {
		this.neighborTiles.push(tile);
	}

	findBlastCombo() {
		let myLevel = this.item.level.name;
		if (myLevel == LevelUpType.Base.name) return { hasCombo: false, mainTile: this, neighborTile: null };

		let result = { hasCombo: false, mainTile: this, neighborTile: null };
		let currentNeighborLevel = LevelUpType.Base.name;

		for (let i = 0; i < this.neighborTiles.length; i++) {
			if (this.neighborTiles[i].item && this.neighborTiles[i].item.level.name == LevelUpType.LightBall.name) {
				result.hasCombo = true;
				result.neighborTile = this.neighborTiles[i];
				currentNeighborLevel = LevelUpType.LightBall.name;
			}
			if (currentNeighborLevel == LevelUpType.LightBall.name) continue;

			if (this.neighborTiles[i].item && this.neighborTiles[i].item.level.name == LevelUpType.Bomb.name) {
				result.hasCombo = true;
				result.neighborTile = this.neighborTiles[i];
				currentNeighborLevel = LevelUpType.Bomb.name;
			}

			if (currentNeighborLevel == LevelUpType.Bomb.name) continue;

			if (this.neighborTiles[i].item && this.neighborTiles[i].item.level.name == LevelUpType.Rocket.name) {
				result.hasCombo = true;
				result.neighborTile = this.neighborTiles[i];
				currentNeighborLevel = LevelUpType.Rocket.name;
			}
		}

		return result;
	}

	findBlastMerges() {
		let arr = [];
		arr.push(this);

		for (let i = 0; i < this.neighborTiles.length; i++) {
			let tile = this.neighborTiles[i];
			if (tile.item == null || tile.item.isDestroyed || tile.item.isGonnaDestroyed || tile.item.isInAnimation) {
				break;
			}

			if (tile.item && tile.item.type == this.item.type) {
				arr.push(tile);
				tile.findOtherBlastMerges(arr);
			}
		}

		return arr;
	}
	findOtherBlastMerges(arr) {
		for (let i = 0; i < this.neighborTiles.length; i++) {
			let tile = this.neighborTiles[i];
			if (tile.item && tile.item.type == this.item.type && !arr.includes(tile)) {
				if (tile.item == null || tile.item.isDestroyed || tile.item.isGonnaDestroyed || tile.item.isInAnimation) {
					arr = [];
					return;
				}
				arr.push(tile);
				tile.findOtherBlastMerges(arr);
			}
		}
	}

	checkForBlockDestroy(type) {
		for (let i = 0; i < this.neighborTiles.length; i++) {
			if (this.neighborTiles[i].item) {
				let item = this.neighborTiles[i].item;

				if (item.isBlock) {
					if (item.type == -1 || globals.blockTypes[item.type] == type) {
						item.destroy();
					}
				}
			}
		}
	}

	//#region Tutorial
	stopLight() {
		this.leftTutorialLight.visible = false;
		this.rightTutorialLight.visible = false;
		this.bottomTutorialLight.visible = false;
		this.topTutorialLight.visible = false;
	}
	checkLight(tiles) {
		let left = true;
		let right = true;
		let bottom = true;
		let top = true;

		for (let x = 0; x < tiles.length; x++) {
			if (tiles[x].index.x == this.index.x && tiles[x].index.y == this.index.y) continue;
			if (tiles[x].index.x == this.index.x && tiles[x].index.y == this.index.y + 1) right = false;
			else if (tiles[x].index.x == this.index.x && tiles[x].index.y == this.index.y - 1) left = false;
			else if (tiles[x].index.y == this.index.y && tiles[x].index.x == this.index.x + 1) bottom = false;
			else if (tiles[x].index.y == this.index.y && tiles[x].index.x == this.index.x - 1) top = false;
		}
		this.lightLeft(left);
		this.lightRight(right);
		this.lightBottom(bottom);
		this.lightTop(top);
	}
	lightLeft(canLight) {
		if (!canLight) return;

		this.leftTutorialLight.visible = true;
	}
	lightRight(canLight) {
		if (!canLight) return;

		this.rightTutorialLight.visible = true;
	}
	lightBottom(canLight) {
		if (!canLight) return;

		this.container.getChildAt(3).visible = true;
	}
	lightTop(canLight) {
		if (!canLight) return;

		this.container.getChildAt(4).visible = true;
	}
	//#endregion

	setFailed(delayTime, gonnaCallendCard) {
		gsap.delayedCall(delayTime, () => {
			this.item?.setFailed(gonnaCallendCard);
		});
	}
	setWon(delayTime, gonnaCallendCard) {
		gsap.delayedCall(delayTime, () => {
			this.item?.setWon(gonnaCallendCard);
		});
	}
}
