import gsap from "gsap";
import globals from "@globals";
import data from "@src/params";
import { BoardHelper } from "./BoardHelper";
import { MatchTutorialFinder } from "./matchTutorialFinder";
import { BlastTutorialFinder } from "./blastTutorialFinder";

export class Tutorial {
	constructor(container) {
		this.container = container;
		container.alpha = 0;
		this.isInAnimation = false;
		this.animDuration = 0.3;
		this.tutorialCheckTime = data.tutorialCheckTime;
		this.event;
		this.btnEvent;
		this.btnTutorialDelay = 1;
		this.tutorialItem;
		this.isStopped = true;
		this.tiles = [];
	}
	setTutorialPositions(hasDelay = true) {
		if (!this.isStopped || !data.hasTutorial || this.isInAnimation) return;

		gsap.killTweensOf(this.container);
		this.isInAnimation = false;
		this.event?.kill();
		let delay = 0;

		if (hasDelay) delay = this.tutorialCheckTime;

		this.event = gsap.delayedCall(delay, () => {
			if (BoardHelper.checkisInAnimation()) {
				this.setTutorialPositions(true);
				return;
			}

			if (BoardHelper.checkisInAnimation()) return;

			if (!data.enableHardBlastMode) {
				this.checkMatchTutorial();
			} else {
				this.checkBlastTutorial();
			}
		});
	}

	//#region BlastTutorial

	checkBlastTutorial() {
		let check = BlastTutorialFinder.checkTilesForTutorial();
		let mainTile = check.mainTile;
		let tiles = check.tiles;

		this.tiles = tiles;

		tiles.forEach((element) => {
			element.checkLight(check.tiles);
		});

		this.startBlastTutorialAnim(mainTile.container);
	}

	startBlastTutorialAnim(position) {
		if (this.isInAnimation) return;

		this.isInAnimation = true;
		this.isStopped = false;

		this.container.x = position.x;
		this.container.y = position.y;

		gsap.killTweensOf(this.container);
		gsap.to(this.container, {
			alpha: 1,
			duration: 0.2,
			ease: "none",
			onComplete: () => {
				gsap.to(this.container, {
					pixi: { scaleX: 0.95, scaleY: 0.95 },
					duration: 0.5,
					ease: "sine.inOut",
					yoyo: true,
					repeat: -1,
				});
			},
		});
	}

	//#endregion

	//#region MatchTutorial
	checkMatchTutorial() {
		let check = MatchTutorialFinder.checkTilesForTutorial();
		let pos1 = check.position_1.container;
		let pos2 = check.position_2.container;
		this.tiles = check.tiles;

		this.tutorialItem = check.position_1.item;
		if (this.tutorialItem.isInAnimation) {
			this.tutorialItem = null;
			this.event?.kill();

			this.setTutorialPositions();
			return;
		}
		if (this.tutorialItem.type != check.type) {
			this.tutorialItem = check.position_2.item;
			let temp = pos1;
			pos1 = pos2;
			pos2 = temp;
			this.tiles.push(check.position_1);
		} else {
			this.tiles.push(check.position_2);
		}
		this.tutorialItem.startTutorialAnim(pos2);
		this.tiles.forEach((element) => {
			element.checkLight(check.tiles);
		});
		this.container.x = pos1.x;
		this.container.y = pos1.y;
		this.startMatchTutorialAnim(pos2);
	}

	startMatchTutorialAnim(position) {
		if (this.isInAnimation) return;

		this.isInAnimation = true;
		this.isStopped = false;
		let timeline = gsap.timeline({
			repeat: -1,
		});
		timeline.to(this.container, {
			duration: 0.1,
			alpha: 1,
		});
		timeline.to(this.container, {
			x: position.x,
			y: position.y,
			duration: this.animDuration,
		});
		timeline.to(this.container, {
			alpha: 0,
			duration: 0.1,
		});
		timeline.to(this.container, {
			duration: 0.3,
		});
	}

	//#endregion

	stopTutorial() {
		if (!data.hasTutorial) return;

		this.tiles.forEach((element) => {
			element.stopLight();
		});
		this.tiles = [];

		this.tutorialItem?.stopTutorialAnim();
		this.tutorialItem = null;
		this.isInAnimation = false;
		gsap.killTweensOf(this.container);
		this.container.alpha = 0;
		this.container.scale.set(1);
		this.event?.kill();
		this.isStopped = true;
	}
}
