import { BoardHelper } from "./BoardHelper";
import MathFunctions from "./mathFunctions";
import globals from "@globals";

export class AnimationController {
	static playRocketAnim(isIndexY, value) {
		let boardContain = globals.board.node;
		let grid = BoardHelper.getGrid();

		if (!isIndexY) {
			globals.animations.playRocketAnim({ x: boardContain.pivot.x, y: grid[value][0].container.y }, 0);
		} else {
			globals.animations.playRocketAnim({ x: grid[0][value].container.x, y: boardContain.pivot.y }, 90);
		}
	}
	static playBombAnim(index, extraScaler = 1) {
		let grid = BoardHelper.getGrid();

		globals.animations.playBombAnim(grid[index.x][index.y].container, extraScaler);
	}
	static playLightballAnim(point_lightball, point_item, type = null) {
		let angle = MathFunctions.getAngleBetweenPoints(point_lightball, point_item);
		let distance = Math.abs(MathFunctions.distanceBetweenPoints(point_lightball, point_item));
		globals.animations.playLightballAnim(point_lightball, angle, distance, type);
	}
	static playDestroyParticle(itemPos, type) {
		let boardContain = globals.board.node;

		let localPos = boardContain.toLocal(itemPos);
		let particleMoveContain = boardContain.toLocal(globals.particleDestination.getGlobalPosition());
		globals.animations.playParticleContain(localPos, particleMoveContain, type);
	}
}
