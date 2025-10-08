import globals, { LevelUpType } from "@globals";
import { Item } from "./Item";
import { Texture } from "pixi.js";
import { getSpine2D } from "core/libs/pixi/utils/utils2D";
import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { SpecialsData } from "./specialsData";

export class BoardHelper {
	static checkisInAnimation() {
		let grid = this.getGrid();

		for (let x = 0; x < grid.length; x++) {
			for (let y = 0; y < grid[0].length; y++) {
				if (grid[x][y].item == null) continue;

				if (grid[x][y].item.isInAnimation) return true;
			}
		}
		return false;
	}

	static getGrid() {
		return globals.board.grid;
	}

	static getAllTypes(type) {
		let grid = globals.board.grid;

		let result = [];
		for (let x = 0; x < grid.length; x++) {
			for (let y = 0; y < grid[0].length; y++) {
				if (grid[x][y].item == null) continue;
				if (grid[x][y].item.type == type) result.push(grid[x][y].item);
			}
		}
		return result;
	}

	static getRandomTile(notIncludeArray, includeSender = false) {
		let grid = this.getGrid();

		let x = Math.floor(Math.random() * grid.length);
		let y = Math.floor(Math.random() * grid[0].length);

		let tile = grid[x][y];

		if (!includeSender) {
			if (notIncludeArray.includes(tile)) {
				return this.getRandomTile(notIncludeArray, includeSender);
			}
		}

		return tile;
	}

	static clonePropeller(item) {
		let newContainer = new PIXI.Container();
		newContainer.width = item.container.baseWidth;
		newContainer.height = item.container.baseHeight;
		newContainer.x = item.container.x;
		newContainer.y = item.container.y;

		let sprite = new PIXI.Sprite(Texture.WHITE);
		sprite.anchor.set(0.5);
		sprite.width = item.container.baseWidth;
		sprite.height = item.container.baseHeight;
		sprite.visible = true;
		newContainer.addChild(sprite);

		let itemClone = new Item(newContainer, globals.notMergeType, item.tile.x, item.tile.y, null);
		itemClone.level = LevelUpType.Propeller;
		itemClone.sprite = sprite;
		itemClone.addSpineSpecial(LevelUpType.Propeller);
		item.container.parent.addChild(newContainer);

		newContainer.scale.x = item.container.scale.x;
		newContainer.scale.y = item.container.scale.y;

		newContainer.targetScale = item.container.targetScale;

		newContainer.x = item.container.x;
		newContainer.y = item.container.y;

		newContainer.zIndex = 1000;

		return itemClone;
	}

	static getBlastResult(tile) {
		let result = [];

		result = tile.findBlastMerges();

		return result;
	}

	static spawnSpine(spineName, position, timeScale, parent) {
		let spineData = getSpine2D(spineName);

		let scale = SpecialsData.getData(spineName).scale;

		let newSpine = Spine.from(spineData);
		parent.addChild(newSpine);
		newSpine.zIndex = 1;
		newSpine.scale.set(scale);
		newSpine.x = position.x;
		newSpine.y = position.y;
		newSpine.state.timeScale = timeScale;
		return newSpine;
	}
}
