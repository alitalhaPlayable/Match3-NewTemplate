import Script2D from "core/libs/common/script/Script2D";
import globals, { LevelUpType } from "@globals";
import gsap from "gsap";
import { instantiatePrefab2D } from "core/libs/pixi/utils/utils2D";
import { Tile } from "./Tile";
import MathFunctions from "./mathFunctions";
import data from "@data";

const maxBoardSize = 8;
const minBoardSize = 5;
const randomItemTexture = "random";

const tweenDur = 0.2;
export default class LevelEditor extends Script2D {
	_className = "LevelEditor";

	awake(props) {
		this.props = props;

		let data = globals.data.editorData;
		this.boardSize = data.size;
		this.oneGridLenghth = this.node.baseWidth / maxBoardSize;

		this.grid = [];
		this.specialType = "";

		this.createBg();
		this.createItems();

		this.adjustBoardSize(false);
		this.adjustStarterItems();

		this.node.interactive = true;
		this.node.on("pointerdown", this.onPointerDown.bind(this));

		document.addEventListener("contextmenu", function (event) {
			window.wasRightClick = true;

			event.preventDefault(); // Sağ tıklama menüsünü iptal et
			//alert("Sağ tıklama devre dışı bırakıldı!"); // İsteğe bağlı bir mesaj
		});
	}

	init() {
		globals.eventEmitter.on("increaseBoardSize", () => {
			if (this.boardSize + 1 > maxBoardSize) return;

			this.boardSize++;
			this.adjustBoardSize();
		});

		globals.eventEmitter.on("decreaseBoardSize", () => {
			if (this.boardSize - 1 < minBoardSize) return;

			this.boardSize--;
			this.adjustBoardSize();
		});

		globals.eventEmitter.on("specialPick", (type) => {
			this.specialType = type;
		});

		globals.eventEmitter.on("resetBoard", () => {
			this.resetBoard();
		});
	}

	resetBoard() {
		for (let i = 0; i < maxBoardSize; i++) {
			for (let j = 0; j < maxBoardSize; j++) {
				let tile = this.grid[i][j];
				tile.item.type = 0;
				tile.item.level = LevelUpType.Base;
				tile.item.angleAmount = 0;
				tile.item.sprite.angle = 0;
				tile.item.blockLevel = 0;
				tile.item.sprite.setTexture(randomItemTexture);
			}
		}
		this.save();
	}

	onPointerDown(e) {
		let wasRightClick = e.data.originalEvent.button === 2;

		let pos = this.node.toLocal(e.data.global);

		for (let x = 0; x < this.boardSize; x++) {
			for (let y = 0; y < this.boardSize; y++) {
				let tile = this.grid[x][y];

				if (MathFunctions.rectangelePointCollisionV2(pos, tile, tile.height, tile.width)) {
					if (!wasRightClick) this.clickTile(tile);
					else this.rightClickTile(tile);
					return;
				}
			}
		}
	}

	clickTile(tile) {
		if (this.specialType == "block") {
			this.clickBlock(tile);
			return;
		}
		let type = tile.item.type;
		type++;
		if (type > globals.itemIndicies.length) type = 0;

		tile.item.type = type;
		tile.item.level = this.levelConverter(this.specialType);
		tile.item.angleAmount = 0;
		tile.item.sprite.angle = 0;
		tile.item.blockLevel = 0;

		if (!data.specialsAreSpine) {
			if (type == 0) {
				tile.item.sprite.setTexture(randomItemTexture);
			} else {
				console.log(type);
				tile.item.sprite.setTexture(this.specialType + globals.itemIndicies[type - 1]);
			}
		} else {
			if (this.specialType != "") {
				if (type > 1) {
					tile.item.sprite.setTexture(randomItemTexture);
					tile.item.type = 0;
					tile.item.level = LevelUpType.Base;
				} else {
					console.log(this.specialType + "_spine");
					tile.item.sprite.setTexture(this.specialType + "_spine");
				}
			} else {
				if (type == 0) {
					tile.item.sprite.setTexture(randomItemTexture);
				} else {
					tile.item.sprite.setTexture(this.specialType + globals.itemIndicies[type - 1]);
				}
			}
		}

		this.save();
	}

	clickBlock(tile) {
		let type = tile.item.type;
		type++;

		if (tile.item.level.name != LevelUpType.Block.name) type = -1;

		if (type > globals.blockTypes.length - 1) type = -1;

		let str = "block";

		if (type != -1) {
			str = "block_" + type.toString() + tile.item.blockLevel;
		}

		tile.item.type = type;
		tile.item.level = this.levelConverter(this.specialType);
		tile.item.angleAmount = 0;
		tile.item.sprite.angle = 0;

		tile.item.sprite.setTexture(str);

		this.save();
	}

	rightClickTile(tile) {
		if (this.specialType == "block") {
			this.rightClickBlock(tile);
			return;
		}

		let level = tile.item.level;
		let angle = tile.item.angleAmount;
		tile.item.blockLevel = 0;

		if (level.name == LevelUpType.Rocket.name) {
			if (angle == 90) {
				tile.item.angleAmount = 0;
				tile.item.sprite.angle = 0;
			} else {
				tile.item.angleAmount = 90;
				tile.item.sprite.angle = 90;
			}
		}

		this.save();
	}

	rightClickBlock(tile) {
		if (tile.item.level.name != LevelUpType.Block.name) {
			this.clickBlock(tile);
			return;
		}

		let type = tile.item.type;
		let blockLevel = tile.item.blockLevel;
		if (type == -1) return;

		blockLevel++;

		if (blockLevel >= 3) blockLevel = 0;

		let str = "block";

		if (type != -1) {
			str = "block_" + type + blockLevel;
		}

		tile.item.blockLevel = blockLevel;

		tile.item.sprite.setTexture(str);

		this.save();
	}

	createBg() {
		let isWhiteTurn = true;
		for (let x = 0; x < maxBoardSize; x++) {
			let oneLine = [];
			for (let y = 0; y < maxBoardSize; y++) {
				let bg = instantiatePrefab2D("Tile");

				let tileBgSprite = bg.getChildByName("tileBg");

				if (isWhiteTurn) {
					isWhiteTurn = !isWhiteTurn;
					tileBgSprite.tint = 0xa505ff;
				} else {
					tileBgSprite.setTexture("black_piece_bg");
					tileBgSprite.tint = 0x000000;
					tileBgSprite.alpha = 0.35;
					isWhiteTurn = !isWhiteTurn;
				}
				bg.width = this.oneGridLenghth;
				bg.height = this.oneGridLenghth;

				bg.x = this.oneGridLenghth / 2 + y * this.oneGridLenghth;
				bg.y = this.oneGridLenghth / 2 + x * this.oneGridLenghth;
				this.node.addChild(bg);
				oneLine.push(bg);
			}
			this.grid.push(oneLine);
			if (maxBoardSize % 2 == 0) isWhiteTurn = !isWhiteTurn;
		}
	}

	adjustStarterItems() {
		for (let i = 0; i < maxBoardSize; i++) {
			for (let j = 0; j < maxBoardSize; j++) {
				let tile = this.grid[i][j];
				let type = globals.data.editorData.boardData[i][j].type;
				let lvl = "";
				if (globals.data.editorData.boardData[i][j].level.name != "Base") lvl = globals.data.editorData.boardData[i][j].level.name.toLowerCase();
				if (type == 0) {
					tile.item.sprite.setTexture(randomItemTexture);
				} else {
					if (!data.specialsAreSpine) tile.item.sprite.setTexture(lvl + globals.itemIndicies[type - 1]);
					else {
						if (lvl == "") {
							tile.item.sprite.setTexture(lvl + globals.itemIndicies[type - 1]);
						} else {
							tile.item.sprite.setTexture(lvl + "_spine");
						}
					}
				}
				tile.item.type = type;
				tile.item.level = globals.data.editorData.boardData[i][j].level;
				tile.item.angleAmount = globals.data.editorData.boardData[i][j].angle;
				tile.item.blockLevel = globals.data.editorData.boardData[i][j].blockLevel;

				if (tile.item.level.name == LevelUpType.Block.name) {
					let str = "block";

					if (tile.item.type != -1) {
						str = "block_" + tile.item.type.toString() + tile.item.blockLevel;
					}

					tile.item.sprite.setTexture(str);
				}

				if (tile.item.level.name == LevelUpType.Rocket.name) {
					tile.item.sprite.angle = tile.item.angleAmount;
				}
			}
		}
	}

	adjustBoardSize(gonnaSave = true) {
		this.oneGridLenghth = this.node.baseWidth / this.boardSize;

		for (let i = 0; i < this.boardSize; i++) {
			for (let j = 0; j < this.boardSize; j++) {
				let tile = this.grid[i][j];

				gsap.killTweensOf(tile);
				gsap.killTweensOf(tile.item);

				let dest = { x: this.oneGridLenghth / 2 + j * this.oneGridLenghth, y: this.oneGridLenghth / 2 + i * this.oneGridLenghth };

				tile.alpha = 1;
				tile.item.alpha = 1;

				gsap.to(tile, {
					x: dest.x,
					y: dest.y,
					width: this.oneGridLenghth,
					height: this.oneGridLenghth,
					duration: tweenDur,
				});

				gsap.to(tile.item, {
					x: dest.x,
					y: dest.y,
					width: this.oneGridLenghth,
					height: this.oneGridLenghth,
					duration: tweenDur,
				});
			}
		}

		for (let i = this.boardSize; i < maxBoardSize; i++) {
			for (let j = 0; j < this.grid[i].length; j++) {
				let tile_0 = this.grid[i][j];
				let tile_1 = this.grid[j][i];

				gsap.killTweensOf(tile_0);
				gsap.killTweensOf(tile_0.item);

				gsap.killTweensOf(tile_1);
				gsap.killTweensOf(tile_1.item);

				gsap.to(tile_0, {
					alpha: 0,
					duration: tweenDur,
				});

				gsap.to(tile_0.item, {
					alpha: 0,
					duration: tweenDur,
				});

				gsap.to(tile_1, {
					alpha: 0,
					duration: tweenDur,
				});

				gsap.to(tile_1.item, {
					alpha: 0,
					duration: tweenDur,
				});
			}
		}

		if (gonnaSave) this.save();
	}

	createItems() {
		for (let i = 0; i < maxBoardSize; i++) {
			for (let j = 0; j < maxBoardSize; j++) {
				let item = instantiatePrefab2D("Item");

				let tile = this.grid[i][j];

				tile.item = item;

				item.width = this.oneGridLenghth;
				item.height = this.oneGridLenghth;

				item.x = tile.x;
				item.y = tile.y;

				item.level = this.levelConverter(this.specialType);

				item.sprite = item.getChildByName("ItemSprite");
				item.type = 0;

				this.node.addChild(item);
			}
		}
	}

	save() {
		let data = {
			size: this.boardSize,
			boardData: [],
		};

		for (let i = 0; i < maxBoardSize; i++) {
			let oneLine = [];
			for (let j = 0; j < maxBoardSize; j++) {
				let tile = this.grid[i][j];
				oneLine.push({ type: tile.item.type, level: tile.item.level, angle: tile.item.angleAmount, blockLevel: tile.item.blockLevel });
			}
			data.boardData.push(oneLine);
		}

		globals.data.editorData = data;
	}

	levelConverter(level) {
		switch (level) {
			case "":
				return LevelUpType.Base;
			case "rocket":
				return LevelUpType.Rocket;
			case "bomb":
				return LevelUpType.Bomb;
			case "lightball":
				return LevelUpType.LightBall;
			case "block":
				return LevelUpType.Block;
		}
	}
}
