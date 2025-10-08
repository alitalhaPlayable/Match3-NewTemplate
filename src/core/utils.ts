import { Sprite, Texture } from "pixi.js";
import globals from "@globals";

function addGif() {
	const data = app.data;
	const scene = globals.pixiScene;
	let base = new Sprite(Texture.WHITE);
	console.log(base);
	base.visible = false;
	base.anchor.set(0.5);
	scene.addChild(base);
	let gif = document.createElement("img");
	gif.src = app.data.gifSrc; ////
	document.body.appendChild(gif);
	gif.style.position = "absolute";
	gif.style.left = "0px";
	gif.style.top = "0px";
	gif.style.zIndex = "99";
	// gif.style.opacity = 0;
	let once = false;
	gif.onload = () => {
		if (!once) {
			base.onResizeCallback(scene.baseWidth, scene.baseHeight);
			once = true;
		}
	};
	gif.ondragstart = () => {
		return false;
	};
	gif.style.pointerEvents = "none";

	base.onResizeCallback = (w, h) => {
		w = scene.baseWidth;
		h = scene.baseHeight;

		base.scale.set(Math.min((w * data.gifScale) / 1, (h * data.gifScale) / 1));
		if (w > h) {
			base.x = w * data.gifPosXHorizontal;
			base.y = h * data.gifPosYHorizontal;
		} else {
			base.x = w * data.gifPosX;
			base.y = h * data.gifPosY;
		}
		base.x *= 2;
		base.y *= 2;

		gif.style.transformOrigin = "top left";
		let scale = Math.min(base.width / gif.width, base.height / gif.height);

		const pixiScale = app.pixiScale;
		console.log(pixiScale);
		scale *= pixiScale;
		gif.style.transform = `scale(${scale})`;
		gif.style.left = base.x * pixiScale - gif.width * scale * 0.5 + "px";
		gif.style.top = base.y * pixiScale - gif.height * scale * 0.49 + "px";
	};
	//base.onResizeCallback(scene.baseWidth, scene.baseHeight);
	gif.remove = () => {
		gif.style.display = "none";
	};
	app.updateGif = () => {
		base.onResizeCallback(scene.baseWidth, scene.baseHeight);
	};

	// @ts-ignore
	globals.gif = gif;
}

export { addGif };
