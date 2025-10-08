import Script2D from "core/libs/common/script/Script2D";

export default class Temp2d extends Script2D {
	awake() {
		// console.log("AWAKE FROM 2D", this.node);
	}

	init() {
		// console.log("INIT FROM 2D", this.node);
	}

	update(delta) {}

	resize(w, h) {
		// console.log("RESIZE FROM 2D", this.node);
	}

	onRemove() {}
}
