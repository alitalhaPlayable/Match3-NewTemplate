export type Vector2 = {
	x: number;
	y: number;
	linked: boolean;
};

export type Vector3 = {
	x: number;
	y: number;
	z: number;
	linked: boolean;
};

export type Vector4 = {
	x: number;
	y: number;
	z: number;
	w: number;
	linked: boolean;
};

export type TextureFromCondition = "texture" | "uploadable" | "stuffs";
export type Texture2D = {
	type: TextureFromCondition;
	path: string;
	uploadId: string;
	stuffs: string | null;
	stuffsDataId: string;
	localPath: string;
};

export type AnimationTexture2D = {
	imagePath: string;
	jsonPath: string;
};

export type SpineTexture2D = {
	uuid: string;
	imagePath: string;
	jsonPath: string;
	atlasPath: string;
};

export type Model3D = {
	uuid: string;
	gltfPath: string;
	binPath: string;
	textures: string[];
	// atlasPath: string;
};

export type Cubemap = {
	uuid: string;
	textures: string[];
};

export type Button = {
	label: string;
	icon?: string;
};

export interface GeneralSettings {
	library: "2D" | "2D/3D";
	enableAudio: boolean;
	convertFontsToWoff2: boolean;
}

export interface Resize2DSettings {
	wRatioMax: number;
	hRatioMax: number;
	vSpaceMax: number;
	hSpaceMax: number;
}

export interface EventNames {
	value: string;
	label: string;
}

export interface EventsSettings {
	eventNames: EventNames[];
}

export interface BitmapFontSettings {
	bitmapFonts: {
		[name: string]: {};
	};
}

export type CollisionCategories2D = {
	value: string;
	label: string;
};

export type Physics2DWorldBoundsSides = {
	top: boolean;
	right: boolean;
	bottom: boolean;
	left: boolean;
};

export type Physics2DWorldBounds = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export interface Physics2DSettings {
	physicsType: "none" | "box2d";
	enableDebug: boolean;
	enableSimulation: boolean;
	enableWorldBounds: boolean;
	worldBounds: Physics2DWorldBounds;
	worldBoundsSides: Physics2DWorldBoundsSides;
	collisionCategories: CollisionCategories2D[];
	outlinerOpacityThreshold: number;
	outlinerSimplifyThreshold: number;
}

export interface Scene2DSettings {
	type: "scene";
	enablePhysics2D: boolean;
	physicsWorld2D: string;
	optionalLoad: boolean;
	optionalLoadID: string;
}

export interface Scene3DSettings {
	type: "scene";
	backgroundType: "solid" | "gradient" | "image" | "cubemap" | "hdr";
	backgroundColor1: string;
	backgroundColor2: string; // gradient seçilirse ikinci renk geliyor
	backgroundImage: string | null;
	hdrFile: string | null;
	cubemap: string | null;
	fog: boolean;
	fogType: "linear" | "exp2";
	fogColor: string;
	fogNear: number;
	fogFar: number;
	fogDensity: number; // near ve far linear'de var, exp2'de sadece density var
	environment: string | null; // texture
	environmentIntensity: number;
	optionalLoad: boolean;
	optionalLoadID: string;
}

export interface Renderer3DSettings {
	antialias: boolean;
	alpha: boolean;
	resolution: number;
	toneMapping: "NoToneMapping" | "LinearToneMapping" | "ReinhardToneMapping" | "CineonToneMapping" | "ACESFilmicToneMapping" | "AgXToneMapping" | "NeutralToneMapping" | "CustomToneMapping";
	toneMappingExposure: number;
	shadowMapEnabled: boolean;
	shadowMapType: "BasicShadowMap" | "PCFShadowMap" | "PCFSoftShadowMap" | "VSMShadowMap";
	logarithmicDepthBuffer: boolean;
	outputColorSpace: "NoColorSpace" | "SRGBColorSpace" | "LinearSRGBColorSpace";
	preserveDrawingBuffer: boolean;
}

export interface Physics3DSettings {
	physicsType: "none" | "cannon" | "rapier3d";
}

export const defaultGeneralSettings: GeneralSettings = {
	library: "2D/3D",
	enableAudio: false,
	convertFontsToWoff2: true,
};

export const defaultResize2DSettings: Resize2DSettings = {
	wRatioMax: 150,
	hRatioMax: 150,
	vSpaceMax: 150,
	hSpaceMax: 150,
};

export const defaultPhysics2DSettings: Physics2DSettings = {
	physicsType: "none",
	enableDebug: false,
	enableSimulation: false,
	enableWorldBounds: false,
	worldBounds: {
		x: 0,
		y: 0,
		width: 1920,
		height: 1080,
	},
	worldBoundsSides: {
		top: true,
		right: true,
		bottom: true,
		left: true,
	},
	collisionCategories: [{ value: "1", label: "default" }],
	outlinerOpacityThreshold: 50,
	outlinerSimplifyThreshold: 50,
};

export const defaultEventsSettings: EventsSettings = {
	eventNames: [
		/* { value: "1", label: "default" } */
	],
};

export const defaultBitmapFontSettings: BitmapFontSettings = {
	bitmapFonts: {
		default: {
			label: "default",
			fontFamily: "__global__",
			color: "#ffffff",
			stroke: {
				width: 0,
				color: "#000000",
			},
			dropShadow: {
				alpha: 0.5,
				color: "#000000",
				blur: 0,
				angle: 0,
				distance: 0,
			},
		},
	},
};

export const defaultRenderer3DSettings: Renderer3DSettings = {
	antialias: true,
	alpha: false,
	resolution: 2,
	toneMapping: "NoToneMapping",
	toneMappingExposure: 1.0,
	shadowMapEnabled: false,
	shadowMapType: "VSMShadowMap",
	logarithmicDepthBuffer: true,
	outputColorSpace: "SRGBColorSpace",
	preserveDrawingBuffer: false,
};

export const defaultScene2DSettings: Scene2DSettings = {
	type: "scene",
	enablePhysics2D: false,
	physicsWorld2D: "",
	optionalLoad: false,
	optionalLoadID: "",
};

export const defaultScene3DSettings: Scene3DSettings = {
	type: "scene",
	backgroundType: "solid",
	backgroundColor1: "#FFFFFF",
	backgroundColor2: "#FFFFFF",
	backgroundImage: null,
	fog: false,
	fogType: "linear",
	fogColor: "#FF0000",
	fogNear: 10,
	fogFar: 20,
	fogDensity: 0.02,
	environment: null,
	environmentIntensity: 1,
	hdrFile: null,
	cubemap: null,
	optionalLoad: false,
	optionalLoadID: "",
};

export const defaultPhysics3dSettings: Physics3DSettings = {
	physicsType: "none",
};

export interface FeedbackItem {
	name: string;
	texts: string;
	letterSpacing: number;
	wordSpacing: number;
	textsContext: "letter" | "word" | "line" | "all";
	letterOrigin: Vector2;
	wordOrigin: Vector2;
	behaviors: ("alpha" | "scale" | "rotation" | "skew" | "position" | "blur" | "tint")[];
	behaviorOptions: {
		betweenDelay: number;
		intro: {
			perDelay: number;
			order: "random" | "sequential" | "reverse" | "once";
			ease: string;
		};
		outro: {
			perDelay: number;
			order: "random" | "sequential" | "reverse" | "once";
			ease: string;
		};
	};
	colors: string[];
	colorOrder: "random" | "sequential" | "reverse";
	alphaBehavior: {
		intro: {
			fromAlpha: number;
			toAlpha: number;
			duration: number;
			repeat: number;
			delay: number;
			ease: string;
		};
		outro: {
			enabled: boolean;
			alpha: number;
			delay: number;
			ease: string;
			duration: number;
		};
	};
	scaleBehavior: {
		intro: {
			fromScaleX: number;
			toScaleX: number;
			fromScaleY: number;
			toScaleY: number;
			duration: number;
			repeat: number;
			delay: number;
			ease: string;
		};
		outro: {
			enabled: boolean;
			scaleX: number;
			scaleY: number;
			delay: number;
			ease: string;
			duration: number;
		};
	};
	rotationBehavior: {
		intro: {
			fromAngle: number;
			toAngle: number;
			duration: number;
			repeat: number;
			delay: number;
			ease: string;
		};
		outro: {
			enabled: boolean;
			angle: number;
			delay: number;
			ease: string;
			duration: number;
		};
	};
	skewBehavior: {
		intro: {
			fromSkewX: number;
			toSkewX: number;
			fromSkewY: number;
			toSkewY: number;
			duration: number;
			repeat: number;
			delay: number;
			ease: string;
		};
		outro: {
			enabled: boolean;
			skewX: number;
			skewY: number;
			delay: number;
			ease: string;
			duration: number;
		};
	};
	positionBehavior: {
		intro: {
			fromX: number;
			toX: number;
			fromY: number;
			toY: number;
			duration: number;
			repeat: number;
			delay: number;
			ease: string;
		};
		outro: {
			enabled: boolean;
			x: number;
			y: number;
			delay: number;
			ease: string;
			duration: number;
		};
	};
	tintBehavior: {
		intro: {
			fromTint: string;
			toTint: string;
			duration: number;
			repeat: number;
			delay: number;
			ease: string;
		};
		outro: {
			enabled: boolean;
			tint: string;
			delay: number;
			ease: string;
			duration: number;
		};
	};
	blurBehavior: {
		intro: {
			fromBlur: number;
			toBlur: number;
			duration: number;
			repeat: number;
			delay: number;
			ease: string;
		};
		outro: {
			enabled: boolean;
			blur: number;
			delay: number;
			ease: string;
			duration: number;
		};
	};
	// brightnessBehavior: {
	// 	brightness: number;
	// 	duration: number;
	// 	delay: number;
	// 	repeat: number;
	// 	yoyo: boolean;
	// 	ease: string;
	// };
	showEvents: string[];
	hideEvents: string[];
}
