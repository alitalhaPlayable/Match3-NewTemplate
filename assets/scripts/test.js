import Script2D from "core/libs/common/script/Script2D";
import globals from "@globals";
import data from "@data";
import gsap from "gsap";

export default class Test extends Script2D {
	_className = "Test";

	awake(props = {}) {
		this.props = props;

		console.log("Test script awake", this.props);
	}

	init() {
		console.log("Test script init");
	}

	update(delta) {}

	resize(w, h) {}

	onAdd() {}

	onRemove() {}
}
