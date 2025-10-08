import Responsive from "core/libs/pixi/responsive";
import Cache2D from "core/libs/pixi/utils/Cache2D";
import { Application, ApplicationOptions, Container, Sprite, Texture } from "pixi.js";

class VersionIntro {
	readyCallback: () => void;
	selectCallback?: (id: string) => void;
	application: Application = new Application();
	updateIntro?: () => void;
	cont?: Container;
	btn?: Container;
	closest: any;

	constructor(callback: () => void) {
		this.readyCallback = callback;
		this.initRenderer();
		// this.init();
	}

	async initRenderer() {
		// INITIALIZE PIXI
		const application = this.application;

		const config: Partial<ApplicationOptions> = {
			preference: "webgl" as "webgl" | "webgpu",
			clearBeforeRender: true,
			backgroundAlpha: 1,
			backgroundColor: 0x000000,
			resolution: 1,
			antialias: true,
			autoDensity: false,
			width: window.innerWidth,
			height: window.innerHeight,
		};

		const canvas = document.createElement("canvas");
		document.body.appendChild(canvas);

		canvas.addEventListener("touchstart", (e) => {
			e.preventDefault();
		});
		config.canvas = canvas;

		await application.init(config);

		const responsiveConfig = {
			maxDimension: 1000,
			resolution: 2,
		};
		const responsive = new Responsive(responsiveConfig, application);

		app.pfResizeVersionIntro = (width: number, height: number) => {
			const rd = responsive.resize(width, height);

			const w = rd.width;
			const h = rd.height;

			if (this.cont) {
				this.cont.x = w * 0.5;
				this.cont.y = h * 0.5;
				const scale = Math.min((w * 1.1) / 600, (h * 0.5) / 400);
				this.cont.scale.set(scale);
			}

			if (this.btn) {
				this.btn.x = w * 0.5;
				this.btn.y = h * 0.85;
				this.btn.scale.set(Math.min((w * 0.45) / this.btn.baseWidth, (h * 0.12) / this.btn.baseHeight));
			}
		};

		// LOAD ASSETS
		const assetsToLoad: any[] = [];

		app.data.___versionIntro.forEach((dt: any, index: number) => {
			dt.no = index;
			assetsToLoad.push({
				type: "image",
				key: "___intro_img_" + index,
				src: dt.image || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAAtJREFUCNdjGOQAAACgAAH4BzM6AAAAAElFTkSuQmCC",
			});
		});

		await Cache2D.load(assetsToLoad);

		this.readyCallback();
	}

	init(selectCallback?: (id: string) => void) {
		this.selectCallback = selectCallback;

		const cont = new Container();
		this.cont = cont;

		this.application.stage.addChild(cont);

		cont.x = 500;
		cont.y = 500;

		const cardWidth = 200;
		const cardHeight = 400;

		let list: any[] = [];

		const versionData = app.data.___versionIntro;
		let no = 0;

		while (versionData.length < 4) {
			versionData.push(versionData[no]);
			no++;
		}

		app.data.___versionIntro.forEach((dt: any, index: number) => {
			const card = new Container();
			cont.addChild(card);

			const cardImg = new Sprite(Cache2D.get("___intro_img_" + dt.no));
			cardImg.anchor.set(0.5, 0.5);
			card.addChild(cardImg);

			const scale = Math.min(cardWidth / cardImg.width, cardHeight / cardImg.height);
			cardImg.scale.set(scale, scale);

			list.push(card);
			// @ts-ignore
			card.dt = dt;
		});

		let total = list.length;
		let curRot = Math.PI / 2;
		let rotDif = (Math.PI * 2) / total;
		let canDrag = true;

		let dist = 300;
		let ratX = 0.62; ///0.55
		let ratZ = 0.2; //1.2

		let updateRotation = () => {
			list = list.sort((a, b) => a.y - b.y);
			// return;
			let maxY = dist * ratZ;

			list.forEach((obj) => {
				let rot = curRot + obj.rotStep;
				obj.x = dist * ratX * Math.cos(rot);
				obj.y = -dist * ratZ * Math.sin(rot);

				obj.curRot = rot;

				let curY = maxY + obj.y;
				let topY = maxY * 2;

				obj.targetScale = 0.4 + (curY / topY) * 0.9;

				if (obj.y < maxY * 0.8) {
					obj.targetScale *= 0.85;
				}

				if (Math.abs(obj.scale - obj.targetScale) < 0.05) {
					obj.scale = obj.targetScale;
				}

				cont.addChild(obj);
			});

			let closestDist = 999;
			let closest;

			list.forEach((obj) => {
				let dif = Math.sqrt(obj.x * obj.x + obj.y * obj.y);

				if (dif < closestDist && obj.y > 0) {
					closestDist = dif;
					closest = obj;
					this.closest = obj;
				}
			});
		};

		for (let i = 0; i < total; i++) {
			let rotStep = (Math.PI * 2 * i) / total + 0; //0.7
			let obj = list[i];
			obj.rotStep = rotStep;
		}

		updateRotation();
		setTimeout(() => {
			updateRotation();
		}, 1);

		list.forEach((char) => {
			char.scale = char.targetScale;
		});

		let isDown = false;
		let prevX: number = 0;
		let prevY: number = 0;

		let noMoreDrag = false;

		const stage = this.application.stage;
		stage.interactive = true;

		const bg = new Sprite(Texture.EMPTY);
		bg.width = 5000;
		bg.height = 5000;
		stage.addChild(bg);

		stage.on("pointerdown", (pointer) => {
			if (isDown) return;
			if (noMoreDrag) return;
			isDown = true;

			prevX = pointer.x;
			prevY = pointer.y;
		});

		stage.on("pointermove", (pointer) => {
			if (!isDown || !canDrag) return;
			if (noMoreDrag) return;

			let dx = pointer.x - prevX;
			let dy = pointer.y - prevY;

			curRot += dx * 0.002;

			curRot = curRot > Math.PI * 2 ? curRot - Math.PI * 2 : curRot;
			curRot = curRot < 0 ? curRot + Math.PI * 2 : curRot;

			prevX = pointer.x;
			prevY = pointer.y;

			updateRotation();

			// if (!tutCont.done) {
			// 	tutCont.done = true;

			// 	scene.tweens.add({
			// 		targets: tutCont,
			// 		alpha: 0,
			// 		duration: 500,
			// 		ease: "Sine.easeInOut",
			// 		onComplete: () => {},
			// 	});
			// }
		});

		let closest = list[2];

		stage.on("pointerup", (pointer) => {
			if (!isDown) return;
			if (noMoreDrag) return;
			isDown = false;

			let closestDist = 999;

			list.forEach((obj) => {
				// let dif = obj.position.distanceTo(frontPos);
				let dif = Math.sqrt(obj.x * obj.x + obj.y * obj.y);

				if (dif < closestDist && obj.y > 0) {
					closestDist = dif;
					closest = obj;
				}
			});

			let dt = {
				curRot,
			};

			let mult = Math.round((curRot - Math.PI / 2) / rotDif);

			canDrag = false;

			gsap.to(dt, {
				curRot: mult * rotDif + Math.PI / 2,
				duration: 0.25,
				ease: "Sine.easeInOut",
				onComplete: () => {
					canDrag = true;
				},
				onUpdate: () => {
					curRot = dt.curRot;
					updateRotation();
				},
			});
		});

		const updateIntro = () => {
			list.forEach((char) => {
				char.scaleX += (char.targetScale - char.scaleX) * 0.1;
				char.scaleY = char.scaleX;
			});

			requestAnimationFrame(() => {
				updateIntro();
			});
		};

		updateIntro();

		this.addButton();

		app.main.resizeNow();
	}

	fillParams(id: string) {
		const versionNo = app.data.___versionIntro.find((dt: any) => dt.id === id)?.no;

		const newData = app.data.___versionIntroData[versionNo];

		const traverse = (obj: any) => {
			for (const key in obj) {
				if (typeof obj[key] === "object" && obj[key] !== null) {
					traverse(obj[key]);
				} else {
					const value = obj[key];
					if (typeof value === "string" && value.startsWith("___dataItem")) {
						const dataItemId = value.split(".")[1];
						const newValue = app.data.___versionIntroAssets[dataItemId];
						obj[key] = newValue;
					}
				}
			}
		};
		traverse(newData);

		if (newData) {
			for (let prop in newData) {
				if (newData[prop] !== undefined && newData[prop] !== null) {
					app.data[prop] = newData[prop];
				}
			}
		}
	}

	addButton() {
		const btn = new Container();
		this.btn = btn;

		const bg = new Sprite(Texture.WHITE);
		bg.anchor.set(0.5, 0.5);
		bg.width = 200;
		bg.height = 100;
		bg.tint = 0x00ff00;

		btn.addChild(bg);
		btn.baseWidth = bg.width;
		btn.baseHeight = bg.height;

		this.application.stage.addChild(btn);

		btn.interactive = true;
		btn.on("pointerdown", () => {
			const id = this.closest.dt.id;
			console.log("Button clicked!", id);
			this.fillParams(id);
			this.selectCallback?.(id);
		});
	}
}

export default VersionIntro;
