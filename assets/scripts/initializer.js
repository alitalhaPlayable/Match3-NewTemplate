import Script2D from "core/libs/common/script/Script2D";
import globals, { LevelUpType } from "@globals";
import data from "@data";
import gsap from "gsap";

export default class Initializer extends Script2D {
	_className = "Initializer";

	awake(props) {
		this.props = props;
		globals.levelUpPattern = [globals.lighballPatternV, globals.lighballPatternH, globals.rocketPatternH, globals.rocketPatternV];

		for (let i = 0; i < 100; i++) {
			if (globals["levelUpPattern_" + i]) globals.levelUpPatterns.push(globals["levelUpPattern_" + i]);
		}

		if (data.specialsAreSpine) {
			data.specielsHasColors = false;
			data.enableBlastSpeciels = true;
		} else {
			LevelUpType.Propeller.enabled = false;
			data.specielsHasColors = true;
		}

		if (data.enableHardBlastMode) {
			data.specialsAreSpine = true;
			data.specielsHasColors = false;
		}

		globals.targetTypes = [];
		for (let i = 0; i < data.target.length; i++) {
			globals.targetTypes.push(data.target[i].type);
		}
	}

	init() {}

	update(delta) {}

	resize(w, h) {}

	onAdd() {}

	onRemove() {}
}
