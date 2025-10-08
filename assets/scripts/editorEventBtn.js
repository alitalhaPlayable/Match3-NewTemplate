import Script2D from "core/libs/common/script/Script2D";
import globals from "@globals";
import data from "@data";
import gsap from "gsap";

export default class EditorEventBtn extends Script2D {
	_className = "EditorEventBtn";

	/**@@type{String}*/
	eventName = null;

	/**@@type{String}*/
	eventType = null;

	awake(props) {
		this.props = props;

		this.baseScale = this.node.scale.x;

		this.node.interactive = true;

		this.node.on("pointerdown", () => {
			this.clickAnim(this.node);
			globals.eventEmitter.emit(this.eventName, this.eventType);

			app.main.resizeNow();
		});
	}

	init() {}

	update(delta) {}

	resize(w, h) {}

	onAdd() {}

	onRemove() {}

	clickAnim(target) {
		gsap.killTweensOf(target);
		target.scale.set(this.baseScale);

		gsap.to(target, {
			pixi: { scaleX: this.baseScale * 0.9, scaleY: this.baseScale * 0.9 },
			duration: 0.1,
			ease: "sine.inOut",
			repeat: 1,
			yoyo: true,
		});
	}
}
