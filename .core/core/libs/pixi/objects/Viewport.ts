import * as PIXI from "pixi.js";
import { Viewport as PixiViewport } from "./pixi_viewport";
import { StudioObject2D } from "./types";
import { getPixiApplication, isStudio } from "../../common/editorGlobals";
import ObjectHelper2D from "../utils/ObjectHelper2D";
import gsap from "gsap";

interface ViewportGC {
	type: "viewport";
	debug: boolean;
	worldSize: { x: number; y: number };
	direction: "both" | "horizontal" | "vertical" | "none";
	clampZoom: boolean;
	enableDrag: true;
	enableZoom: true;
	smoothing: 0.85;
	maxZoomMultiplier: 3;
	target: "";
	targetSmoothFollowStrength: 0;
}

const componentDirectionTranslation: Record<string, string> = {
	both: "all",
	horizontal: "x",
	vertical: "y",
};

class Viewport extends PixiViewport implements StudioObject2D {
	id: string = "";
	type: string = "viewport";
	debugRect: PIXI.Graphics;

	selected: boolean = false;
	locked: boolean = false;

	config: any;
	components: any;

	minScale: number = 1;

	constructor(config: any) {
		const pixiApp: PIXI.Application = getPixiApplication();
		super({
			events: pixiApp.renderer.events,
			worldWidth: config.viewport.worldSize.x,
			worldHeight: config.viewport.worldSize.y,
		});

		this.config = config;

		this.debugRect = new PIXI.Graphics();
		if (isStudio()) {
			this.addChild(this.debugRect);
		}

		this.initComponentSystem();

		if (this.config.viewport.enableDrag) 
			this.drag({ clampWheel: true }).decelerate({
				friction: this.config.viewport.smoothing,
			});
		

		if (this.config.viewport.enableZoom) 
			this.pinch({}).wheel({
				percent: 0.05,
				smooth: 1,
			});
		

		this.onResizeCallback = (w, h) => {
			this.resize(w, h);
		};

		if (this.config.viewport.direction != "none") this.setClampDirection()
	}

	setClampDirection() {
		this.clamp({
			direction: componentDirectionTranslation[this.config.viewport.direction],
			options: {
				top: 0,
				left: 0,
				right: this.worldWidth,
				bottom: this.worldHeight,
			},
		});
	}

	setZoomNormalized(normalizedZoom: number) {
		const clampedNormalizedZoom = Math.max(0, Math.min(1, normalizedZoom));
		
		if (!this.minScale) {
			this.minScale = this.findCover(this.worldWidth, this.worldHeight);
		}

		const maxScale = this.minScale * this.config.viewport.maxZoomMultiplier;
		
		const targetZoom = this.minScale + (maxScale - this.minScale) * clampedNormalizedZoom;

		const currentCenter = { ...this.center };
		this.zoom(targetZoom, true);
		this.moveCenter(currentCenter.x, currentCenter.y);
	}

	setOffset(offset: PIXI.Point) {
		this.removeAllListeners("moved");
		this.on("moved", (e)=>{
			if (e.type === "follow") {
				this.x += offset.x;
				this.y += offset.y;
			}
		})
	}

	update(delta: number) {
		super.update(delta);
	}

	setFollowAnimated(targetId: any) {
		let newTarget: any = null;

		if (typeof targetId === "string") {
			newTarget = ObjectHelper2D.getObjectById(targetId)
			if (!newTarget) {
				console.warn("Camera set follow animted new target is null!!")
				return;
			}
		} else {
			newTarget = targetId;
		}
		
		this.plugins.remove("follow")
		const startPos = {x: this.center.x, y: this.center.y}
		const temp = {x: 0}
		gsap.to(
			temp,
			{
				x: 1,
				onUpdate:()=>{
					const newX = (1 - temp.x) * startPos.x + temp.x * newTarget.x;
					const newY = (1 - temp.x) * startPos.y + temp.x * newTarget.y;
					this.moveCenter(newX, newY)
				},
				onComplete:()=>{
					this.setFollow(targetId)
				}
			}
		)
	}

	setFollow(targetId: string) {
		let newTarget: any = null;

		if (typeof targetId === "string") {
			newTarget = ObjectHelper2D.getObjectById(targetId)
			if (!newTarget) {
				console.warn("Camera set follow target is null!!")
				return;
			}
		} else {
			newTarget = targetId;
		}
		
		this.follow(newTarget, {
			speed: 0,
			radius: 0,
			acceleration: 0,
		});
	}

	updateDebug() {
		this.debugRect.clear();
		this.debugRect.rect(0, 0, this.config.viewport.worldSize.x, this.config.viewport.worldSize.y);
		this.debugRect.stroke({ color: 0x0ea5e9, alpha: 1, width: 5 });
	}

	updateViewportComponent(viewport: ViewportGC) {
		this.debugRect.visible = viewport.debug;
		if (this.config.viewport.target != "") {
			this.follow(ObjectHelper2D.getObjectById(this.config.viewport.target), {
				speed: this.config.viewport.targetSmoothFollowStrength,
				radius: 0,
				acceleration: 0,
			});
		}
		if (isStudio()) {
			this.updateDebug();
		}
	}

	updateComponents(components: { [key: string]: any }) {
		const viewport = components.viewport as ViewportGC;
		if (viewport) {
			this.updateViewportComponent(viewport);
		}
		super.updateComponents(components);
	}

	shakeCamera(duration: number, intensity: number) {
		duration *= 100;
		const original = { x: this.center.x, y: this.center.y };
		const shakeTimeline = gsap.timeline({
			onComplete: () => {
				gsap.to(
					{},
					{
						duration: 0.1,
						onUpdate: () => {
							this.moveCenter(original.x, original.y);
						},
					}
				);
			},
		});

		const shakes = Math.floor(duration / 10);

		for (let i = 0; i < shakes; i++) {
			const offset = { x: 0, y: 0 };

			shakeTimeline.to(offset, {
				x: (Math.random() - 0.5) * intensity,
				y: (Math.random() - 0.5) * intensity,
				duration: 0.05,
				onUpdate: () => {
					this.moveCenter(original.x + offset.x, original.y + offset.y);
				},
				ease: "power2.out",
			});
		}
	}

	resize(w: number, h: number) {
		const worldCenterBeforeResize = { ...this.center };

		this.screenHeight = h;
		this.screenWidth = w;

		//cache currently how much you are zoomed in compared to the minscale.
		const currentlyZoomedPerct = this.scale.x / this.minScale;

		//find new minscale
		this.minScale = this.findCover(this.worldHeight, this.worldHeight);

		this.clampZoom({
			minScale: this.minScale,
			maxScale: this.minScale * this.config.viewport.maxZoomMultiplier,
		});

		//then do the initial resize zoom in regards to the previous zoomed in percentage
		this.zoom(this.minScale * currentlyZoomedPerct, true);
		this.moveCenter(worldCenterBeforeResize.x, worldCenterBeforeResize.y);
	}

	get settings() {
		return this.config.viewport;
	}
}

export default Viewport;
