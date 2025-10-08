import { getObject2D } from "core/libs/pixi/utils/utils2D";
import { BoardHelper } from "./BoardHelper";
import data from "@data";
import { MatchTutorialFinder } from "./matchTutorialFinder";
import globals, { LevelUpType } from "@globals";
import { BlastTutorialFinder } from "./blastTutorialFinder";

export class AIOpponent {
	static play() {
		let grid = BoardHelper.getGrid();

		if (data.enableHardBlastMode) {
			this.playBlast(grid);
		} else {
			this.playMatch(grid);
		}
	}

	static playBlast(grid) {
		let out = BlastTutorialFinder.checkTilesForTutorial();
		this.tapHand(out.mainTile);
		gsap.delayedCall(0.6, () => {
			globals.board.mergeController.checkMergeSingleTile(out.mainTile);
		});
	}

	static playMatch(grid) {
		let out = MatchTutorialFinder.checkTilesForTutorial();
		this.swipeHand(out.position_1.index, out.position_2.index, out.position_1, out.position_2);
		gsap.delayedCall(0.3, () => {
			globals.board.mergeController.checkMergeTilePair(out.position_1, out.position_2);
		});
	}

	static swipeHand(index_0, index_1, starterTile, destinationTile) {
		let hand = getObject2D("oppHand");

		hand.width = starterTile.container.width * data.oppHandScaler;
		hand.height = starterTile.container.height * data.oppHandScaler;

		let direction = index_0.y == index_1.y && index_0.x < index_1.x ? "down" : "up";

		direction = index_0.x == index_1.x && index_0.y < index_1.y ? "right" : direction;

		console.log("swipeHand", index_0, index_1, direction);

		hand.x = starterTile.container.x;
		hand.y = starterTile.container.y;

		let extraMoveAmount = 10;
		if (direction == "up" || direction == "left") extraMoveAmount = -extraMoveAmount;

		let dest = { x: destinationTile.container.x, y: destinationTile.container.y };
		if (direction == "up" || direction == "down") {
			dest.y += extraMoveAmount;
		} else {
			dest.x += extraMoveAmount;
		}

		gsap.killTweensOf(hand);
		hand.alpha = 0;

		gsap.to(hand, {
			alpha: 1,
			duration: 0.1,
			ease: "none",
			onComplete: () => {
				gsap.to(hand, {
					alpha: 0,
					delay: 0.3,
					duration: 0.4,
					ease: "none",
				});
			},
		});

		gsap.to(hand, {
			x: dest.x,
			y: dest.y,
			delay: 0.3,
			duration: 0.5,
			ease: "power2.out",
		});
	}

	static tapHand(tile) {
		let hand = getObject2D("oppHand");

		hand.width = tile.container.width * data.oppHandScaler;
		hand.height = tile.container.height * data.oppHandScaler;

		hand.x = tile.container.x;
		hand.y = tile.container.y;

		gsap.killTweensOf(hand);
		hand.alpha = 0;

		gsap.to(hand, {
			alpha: 1,
			duration: 0.1,
			ease: "none",
			onComplete: () => {
				gsap.to(hand, {
					pixi: { scaleX: hand.scale.x * 0.9, scaleY: hand.scale.y * 0.9 },
					duration: 0.2,
					repeat: 1,
					yoyo: true,
					delay: 0.2,
				});

				gsap.to(hand, {
					alpha: 0,
					delay: 0.4,
					duration: 0.3,
					ease: "none",
				});
			},
		});
	}
}
