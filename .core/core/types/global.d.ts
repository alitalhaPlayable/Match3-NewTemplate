import TemplateMain from "core/libs/common/general/networks";

declare global {
	var app: {
		type: string | null;
		data: any;
		globals: any;
		main: TemplateMain;
		resizeNow: () => void;
		templateVersion: string;
		[key: string]: any;
	};
	var type: string | null;
	var globals: any;
	var jsStuffs: any;
	var dashboardParams: any;
	var pfNetworkHelper: any;
	var lp_url: string;
	var pfSetData: (data: any) => void;
	var pfGetData: () => any;
	var pfTakeSnapshotPixi: () => string;
	var pfTakeSnapshotThree: () => string;
	var pfTakeSnapshot: () => Promise<string>;
	var editorMeta: {
		isEditing: boolean;
	};
	var Box2D: any;
	interface Window {
		/**
		 * Global object for PixiJS particle emitter utilities.
		 */
		particles: {
			/**
			 * The main Particle Emitter class.
			 */
			Emitter: typeof import("../../.core/core/libs/pixi/utils/particle-emitter/particle-emitter").Emitter;
			/*
			 * The Particle class, representing individual particles in the emitter.
			 */
			Particle: typeof import("../../.core/core/libs/pixi/utils/particle-emitter/particle-emitter").Particle;
			PropertyList: typeof import("../../.core/core/libs/pixi/utils/particle-emitter/particle-emitter").PropertyList;
			PropertyNode: typeof import("../../.core/core/libs/pixi/utils/particle-emitter/particle-emitter").PropertyNode;
			upgradeConfig: typeof import("../../.core/core/libs/pixi/utils/particle-emitter/particle-emitter").upgradeConfig;
			// Add other classes you want autocompletion for
		};
	}
}
