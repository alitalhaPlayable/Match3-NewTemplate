import globals from "@globals";
import { Sprite } from "pixi.js";
import { addGuiHelper, GUIHelper } from "utils";

class Game {
	constructor() {}

	init() {
		//addGuiHelper({ stats: true });
	}

	update(delta: number) {}

	resize2D(w: number, h: number) {}

	resize3D(w: number, h: number) {}
}

export default Game;

const sprite = new Sprite();
