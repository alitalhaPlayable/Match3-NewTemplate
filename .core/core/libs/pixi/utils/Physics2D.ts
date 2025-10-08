import { Rectangle } from "pixi.js";
import { StudioObject2D } from "../objects/types";
import Scene2D from "../objects/Scene2D";

// #if process.projConfig.physics2DSettings.physicsType !== "none"
import Box2DPhysics from "../physics/box2d/Box2dPhysics";
// #endif

import globals from "@globals";
export default class Physics2D {
	private physics2d!: Box2DPhysics;
	physicsParent!: StudioObject2D | Scene2D;

	constructor(config: { physicsParent: StudioObject2D | Scene2D }) {
		this.physicsParent = config.physicsParent;
	}

	startPhysicsSystem(library: "none" | "box2d") {
		if (library === "box2d") {
			this.startBox2D();
		}
	}

	getPhysicsSystem() {
		return Box2DPhysics.getInstance();
	}

	private startBox2D(): Box2DPhysics {
		this.physics2d = Box2DPhysics.getInstance();
		const { enableWorldBounds, worldBounds, worldBoundsSides, enableDebug } = globals.projectConfig.physics2DSettings;

		if (enableWorldBounds) {
			this.physics2d.setWorldBounds({
				bounds: new Rectangle(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height),
				strokeWidth: 12,
				left: worldBoundsSides.left,
				right: worldBoundsSides.right,
				top: worldBoundsSides.top,
				bottom: worldBoundsSides.bottom,
				categoryBits: "1",
				maskBits: ["1", "2", "4", "8", "16", "32", "64", "128", "256", "512", "1024", "2048", "4096", "8192", "16384", "32768"],
				parentCont: this.physicsParent,
				showWallSprite: enableDebug,
			});
		}

		if (enableDebug) {
			this.physics2d.drawDebug(this.physicsParent, 32);

			if (enableDebug) {
				this.physics2d.showDebug();
			}
		}

		return this.physics2d;
	}
}
