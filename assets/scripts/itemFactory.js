import { instantiatePrefab2D } from "core/libs/pixi/utils/utils2D";
import { BoardHelper } from "./BoardHelper";
import { Item } from "./Item";
import globals, { LevelUpType } from "@globals";
import data from "@data";

export class ItemFactory {
	static createAllBoardItems() {
		let grid = BoardHelper.getGrid();

		let itemData = globals.data.editorData.boardData;
		this.convertItemData(itemData);

		let randomIndexes = [];
		for (let x = 0; x < globals.board.boardSize; x++) {
			for (let y = 0; y < globals.board.boardSize; y++) {
				if (itemData[x][y].type == 0) {
					let index = { x: x, y: y };
					randomIndexes.push(index);
					continue;
				}
				let texture = itemData[x][y].type;

				let item = this.createItem({ x: x, y: y }, texture);
				grid[x][y].setItem(item);
			}
		}
		for (let x = 0; x < randomIndexes.length; x++) {
			grid[randomIndexes[x].x][randomIndexes[x].y].setItem(this.createItem(randomIndexes[x]));
		}

		this.adjustStarterItems(grid);
	}

	static createRandomItemToTile(tile) {
		let tileIndex = tile.index;
		let item = this.createItem({ x: tileIndex.x, y: tileIndex.y });
		return item;
	}

	static adjustStarterItems(grid) {
		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				let level = globals.data.editorData.boardData[i][j].level;
				let angleAmount = globals.data.editorData.boardData[i][j].angle;

				if (level.name != LevelUpType.Rocket.name) angleAmount = 0;

				let tile = grid[i][j];

				if (level.name != LevelUpType.Base.name && level.name != LevelUpType.Block.name) {
					let item = grid[i][j].item;
					let name = level.name.toLowerCase();

					if (!data.specialsAreSpine) name += item.type;

					item.levelUp(name, [], tile.container, 0.01, level, angleAmount);
				} else if (level.name == LevelUpType.Block.name) {
					let item = grid[i][j].item;
					console.log(globals.data.editorData.boardData[i][j]);
					let type = globals.data.editorData.boardData[i][j].type;
					let blockLevel = globals.data.editorData.boardData[i][j].blockLevel;

					item.setBlock(type, blockLevel);
				}
			}
		}
	}

	static convertItemData(itemDataArray) {
		for (let i = 0; i < itemDataArray.length; i++) {
			for (let j = 0; j < itemDataArray[i].length; j++) {
				if (itemDataArray[i][j].type == 0) continue;

				if (itemDataArray[i][j].level.name == "Block") continue;

				let nmbr = itemDataArray[i][j].type - 1;
				itemDataArray[i][j].type = globals.itemIndicies[nmbr];
			}
		}
	}
	static createItem(index, customTexture = null) {
		let grid = BoardHelper.getGrid();

		let itemContainer = instantiatePrefab2D("Item");
		let texture = this.getRandomItemTypeForCreate(index);

		itemContainer.width = globals.board.oneGridLenghth;
		itemContainer.height = globals.board.oneGridLenghth;

		if (customTexture) texture = customTexture;

		let posX = grid[index.x][index.y].container.x;
		let posY = grid[index.x][index.y].container.y;

		let item = new Item(itemContainer, texture, posX, posY, texture);
		globals.board.node.addChild(itemContainer);
		globals.board.items.push(item);
		return item;
	}
	static getRandomItemTypeForCreate(index) {
		let randomIndex = Math.floor(Math.random() * globals.itemTypes.length);

		let type = globals.itemTypes[randomIndex];
		let valueCol = globals.board.mergeController.checkColumn(index, type);
		let valueRow = globals.board.mergeController.checkRow(index, type);

		if (!data.enableHardBlastMode) {
			if (valueRow.value >= 2 || valueCol.value >= 2) return this.getRandomItemTypeForCreate(index);
		}

		return type;
	}
	static createFallItems(indexY, nullCount) {
		let grid = BoardHelper.getGrid();

		let oneGridLenghth = grid[0][0].container.height;

		let fallPosition = grid[0][0].container.y - oneGridLenghth;
		let array = [];
		for (let x = nullCount; x >= 1; x--) {
			let item = this.createFallItem({ x: x - 1, y: indexY }, array);
			item.isInAnimation = true;
			grid[x - 1][indexY].setItem(item);
			item.container.y = fallPosition;
			item.move(grid[x - 1][indexY].container, 2, "sine.in", 0.05 * (nullCount - x));
			fallPosition -= oneGridLenghth;
			array.push(item);
		}
	}
	static createFallItem(index, array) {
		let grid = BoardHelper.getGrid();

		let itemContainer = instantiatePrefab2D("Item");
		let texture = this.getRandomItemTypeForFall(array, 0);

		itemContainer.width = globals.board.oneGridLenghth;
		itemContainer.height = globals.board.oneGridLenghth;

		let posX = grid[index.x][index.y].container.x;
		let posY = grid[index.x][index.y].container.y;
		let item = new Item(itemContainer, texture, posX, posY, texture);
		globals.board.node.addChild(itemContainer);
		globals.board.items.push(item);
		return item;
	}
	static getRandomItemTypeForFall(array, tryCount = 0) {
		let randomIndex = Math.floor(Math.random() * globals.itemTypes.length);

		let type = globals.itemTypes[randomIndex];
		let count = 0;

		for (let x = 0; x < array.length; x++) {
			if (array[x].type == type) count++;
		}
		if (tryCount < 20) {
			if (count >= 2) return this.getRandomItemTypeForFall(array, tryCount + 1);
		}

		return type;
	}
}
