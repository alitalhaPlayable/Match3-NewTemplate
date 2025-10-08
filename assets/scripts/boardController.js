import Script2D from "core/libs/common/script/Script2D";
import globals, { LevelUpType } from "@globals";
import data from "@data";
import gsap from "gsap";
import { getObject2D, instantiatePrefab2D } from "core/libs/pixi/utils/utils2D";
import { Texture } from "pixi.js";
import { Tile } from "./Tile";
import { Item } from "./Item";
import MathFunctions from "./mathFunctions";
import { Animation } from "./Animation";
import { Tutorial } from "./tutorial";
import { MergeController } from "./mergeController";
import { BoardHelper } from "./BoardHelper";
import { BlastInputController, MatchInputController } from "./inputController";
import { MatchTutorialFinder } from "./matchTutorialFinder";
import { ItemFactory } from "./itemFactory";
import { BlastTutorialFinder } from "./blastTutorialFinder";
import { BoardShuffler } from "./boardShuffler";
import { AIOpponent } from "./aiController";

export default class BoardController extends Script2D {
	_className = "BoardController";

	/**@@type{Container} */
	particleDestination = null;

	awake(props) {
		this.props = props;

		globals.board = this;
		this.getItems();

		globals.particleDestination = this.particleDestination;

		this.boardSize = globals.data.editorData.size;
		this.oneGridLenghth = this.node.baseWidth / this.boardSize;
		this.grid = [];
		this.mergeController = new MergeController(this.grid);

		this.items = [];
		this.createBg(this.boardSize);
		ItemFactory.createAllBoardItems();
		this.createTileNeighbors();
		this.pickedTile = null;

		let tutorialHand = getObject2D("boardTutorial");
		this.tutorial = new Tutorial(tutorialHand);
		this.tutorial.setTutorialPositions();

		globals.animations = new Animation(this.node);
		if (!data.enableHardBlastMode) this.inputController = new MatchInputController(this.grid, this);
		else this.inputController = new BlastInputController(this.grid, this, true);

		window.addEventListener("keydown", (e) => {
			// if (!globals.debugMode) return;
			if (e.key == "q") {
				this.debugType = "rocket";
			}

			if (e.key == "w") {
				this.debugType = "bomb";
			}
			if (e.key == "1") {
				this.debugType = "rocketV";
			}
			if (e.key == "e") {
				this.debugType = "lightball";
			}
			if (e.key == "s") {
				BoardShuffler.shuffleBoard(this.grid);
			}

			if (e.key == "p") {
				this.debugType = "propeller";
			}

			if (e.key == "o") {
				this.tutorial.stopTutorial();
				AIOpponent.play();
			}

			console.warn("this.debugType", this.debugType, e.key);
		});

		this.canStartBoardCheck = false;

		gsap.delayedCall(1, () => {
			this.canStartBoardCheck = true;
		});
	}

	debug(tile) {
		if (this.debugType == "rocket") {
			let levelUpTxt = "rocket" + tile.item.type;
			tile.item.levelUp(levelUpTxt, [], tile.container, 0.01, LevelUpType.Rocket);
		}
		if (this.debugType == "rocketV") {
			let levelUpTxt = "rocket" + tile.item.type;
			tile.item.levelUp(levelUpTxt, [], tile.container, 0.01, LevelUpType.Rocket, 90);
		} else if (this.debugType == "bomb") {
			let levelUpTxt = "bomb" + tile.item.type;
			tile.item.levelUp(levelUpTxt, [], tile.container, 0.01, LevelUpType.Bomb);
		} else if (this.debugType == "lightball") {
			let levelUpTxt = "lightball" + tile.item.type;

			tile.item.levelUp(levelUpTxt, [], tile.container, 0.01, LevelUpType.LightBall);
		} else if (this.debugType == "propeller") {
			let levelUpTxt = "Propeller";
			tile.item.levelUp(levelUpTxt, [], tile.container, 0.01, LevelUpType.Propeller);
		}

		this.debugType = false;
	}

	init() {
		this.node.interactive = true;
	}

	update(delta) {
		if (!this.canStartBoardCheck) return;

		this.checkItemsFall();

		if (globals.resetingBoard || BoardHelper.checkisInAnimation()) return;

		if (!data.enableHardBlastMode) {
			if (MatchTutorialFinder.checkTilesForTutorial().tiles.length < 2) {
				globals.resetingBoard = true;
				this.tutorial.stopTutorial();
				BoardShuffler.shuffleBoard(this.grid);
			}
		} else {
			if (BlastTutorialFinder.checkTilesForTutorial().value < 2) {
				globals.resetingBoard = true;
				this.tutorial.stopTutorial();
				BoardShuffler.shuffleBoard(this.grid);
			}
		}
	}

	checkItemsFall() {
		if (BoardHelper.checkisInAnimation()) {
			return;
		}

		for (let x = 0; x < this.grid.length; x++) {
			for (let y = 0; y < this.grid[x].length; y++) {
				if (this.grid[x][y].item?.lighBallOnDestroy) return;
			}
		}

		for (let y = 0; y < this.grid[0].length; y++) {
			let nullCount = 0;
			for (let x = this.grid.length - 1; x >= 0; x--) {
				if (this.grid[x][y].item == null) {
					nullCount++;
					continue;
				}

				if (this.grid[x][y].item.isDestroyed) {
					nullCount++;
					continue;
				}

				if (nullCount == 0) continue;

				if (this.grid[x][y].item.isBlock) {
					nullCount = 0;
					continue;
				}

				this.grid[x][y].fall(nullCount);
			}
			if (nullCount > 0) {
				ItemFactory.createFallItems(y, nullCount);
			}
		}
	}

	getItems() {
		globals.itemTypes = [];
		for (let x = 0; x < data.itemSelect.length; x++) {
			if (data.itemSelect[x] == 0) {
				globals.itemTypes.push("blue");
			}
			if (data.itemSelect[x] == 1) {
				globals.itemTypes.push("green");
			}
			if (data.itemSelect[x] == 2) {
				globals.itemTypes.push("orange");
			}
			if (data.itemSelect[x] == 3) {
				globals.itemTypes.push("purple");
			}
			if (data.itemSelect[x] == 4) {
				globals.itemTypes.push("red");
			}
			if (data.itemSelect[x] == 5) {
				globals.itemTypes.push("yellow");
			}
		}
	}
	//#region Create Works
	createBg() {
		let isWhiteTurn = true;
		for (let x = 0; x < this.boardSize; x++) {
			let oneLine = [];
			for (let y = 0; y < this.boardSize; y++) {
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
				let tile = new Tile(bg, { x: x, y: y });
				oneLine.push(tile);
			}
			this.grid.push(oneLine);
			if (this.boardSize % 2 == 0) isWhiteTurn = !isWhiteTurn;
		}

		this.adjustTileBg();
	}

	adjustTileBg() {
		for (let i = 0; i < this.grid.length; i++) {
			for (let j = 0; j < this.grid[i].length; j++) {
				let tileBgSprite = this.grid[i][j].container.getChildByName("tileBg");

				let resizeKey = Object.keys(tileBgSprite.components.responsive.componentData.resizes);
				let resize = tileBgSprite.components.responsive.componentData.resizes[resizeKey[0]];
				let portrait = resize.portrait;

				portrait.width = data.tileBgScaler;
				portrait.height = data.tileBgScaler;
			}
		}
	}

	createTileNeighbors() {
		for (let x = 0; x < this.grid.length; x++) {
			for (let y = 0; y < this.grid[x].length; y++) {
				this.setNeighborTiles(x, y);
			}
		}
	}
	setNeighborTiles(indexX, indexY) {
		let directions = [
			{ x: indexX - 1, y: indexY },
			{ x: indexX, y: indexY - 1 },
			{ x: indexX, y: indexY + 1 },
			{ x: indexX + 1, y: indexY },
		];
		directions.forEach((element) => {
			if (element.x >= 0 && element.x < this.grid.length && element.y >= 0 && element.y < this.grid[indexX].length) {
				this.grid[indexX][indexY].addNeighborTile(this.grid[element.x][element.y]);
			}
		});
	}

	//#endregion
	resetBoard() {
		gsap.to(this.node, {
			pixi: { scaleX: 0, scaleY: 0 },
			duration: 0.2,
			onComplete: () => {
				this.items.forEach((element) => {
					element.clear();
				});
				ItemFactory.createAllBoardItems();
				gsap.to(this.node, {
					pixi: { scaleX: 1, scaleY: 1 },
					duration: 0.2,
					onComplete: () => {
						globals.resetingBoard = false;
						this.tutorial.setTutorialPositions();
					},
				});
			},
		});
	}
}
