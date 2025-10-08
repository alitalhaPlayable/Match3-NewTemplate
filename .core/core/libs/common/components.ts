import * as PIXI from "pixi.js";
import { Button, FeedbackItem, Texture2D, Vector2, Vector3 } from "./types";
// eslint-disable-next-line import/no-cycle
import { Filters2DGC } from "./filterComponents";
import { ParticleData } from "./particleComponents";

// ! IMPORTANT ! Do not add any optional types or undefined as a value to components or any of its properties (recursive)
// ! IMPORTANT ! Arrays are only allowed for BaseType (primitive types) and not for ComponentValue, use objects with uuid keys if necesary.
// GC means GameComponent

export type BaseType = string | number | boolean | null;

export interface ComponentValue {
	[key: string]: ComponentValue | BaseType | Array<BaseType>;
}

export interface ComponentManager {
	node: any;
	updateComponents(components: any): void;
	update(delta: number): void;
	resize(w: number, h: number): void;
	get(componentName: string): any;
	add(componentName: string): void;
	remove(componentName: string): void;
}

export interface TextureLoadCallback {
	type: "uuid" | "path" | "missing";
	uuid?: string;
	path?: string;
	isTexture: false;
	texture?: PIXI.Texture;
}

export interface BaseGC {
	type: string;
}

// 2D Components
export interface Node2DGC extends BaseGC {
	type: "node2D";
	label: string;
	visible: boolean;
	alpha: number;
	position: Vector2;
	scale: Vector2;
	angle: number;
	// pivot: Vector2;
	origin: Vector2;
	skew: Vector2;
	zIndex: number;
	mask: string | null;
	invertAlpha: boolean;
	eventMode: PIXI.EventMode;
	optionalLoad: boolean;
	optionalLoadID: string;
	optionalLoadValue: string;
	blendMode: PIXI.BLEND_MODES;
	dynamicResize: boolean;
	dynamicResizeName: string;
	enableMarketRedirection: boolean;
	layer: string;
	dynamicOffset: boolean;
	dynamicOffsetName: string;
}

export interface SpriteGC extends BaseGC {
	type: "sprite";
	texture: Texture2D;
	landscapeTexture: Texture2D | null;
	landscape: boolean;
	tint: string;
	resizeOnTextureUpdate: boolean;
}

export interface PreStuffsGC extends BaseGC {
	type: "preStuffs";
	debug: boolean;
	width: number;
	height: number;
	stuffs?: string;
}

export interface ContainerGC extends BaseGC {
	type: "container";
	debug: boolean;
	width: number;
	height: number;
	landscape: boolean;
	landscapeWidth: number;
	landscapeHeight: number;
	stuffs?: string;
}

export interface AnimatedSpriteGC extends BaseGC {
	type: "animatedSprite";
	animationSpeed: number;
	loop: boolean;
	autoplay: boolean;
	// animationTexture: AnimationTexture2D;
	animationTexture: string;
	animation: string;
	tint: string;
	controller?: Button | null;
}

// 2D Physics Components
export type GraphicsShapeType = "circle" | "rectangle" | "ellipse" | "star" | "line" | "polygon";

export interface GraphicsShapeBase {
	id: string;
	type: GraphicsShapeType;
	position: Vector2;
	fill: {
		enabled: boolean;
		color: string;
		alpha: number;
	};
	stroke: {
		enabled: boolean;
		width: number;
		color: string;
		alpha: number;
	};
	// offset: Vector2;
}
export interface GraphicsShapeCircle extends GraphicsShapeBase {
	radius: number;
}
export interface GraphicsShapeRectangle extends GraphicsShapeBase {
	width: number;
	height: number;
	roundRadius: number;
}

export interface GraphicsShapeEllipse extends GraphicsShapeBase {
	width: number;
	height: number;
}

export interface GraphicsShapeStar extends GraphicsShapeBase {
	points: number;
	radius: number;
	innerRadius: number;
	rotation: number;
}

export interface GraphicsShapeLine extends GraphicsShapeBase {
	moveTo: { x: number; y: number };
	lines: { [key: string]: { x: number; y: number } };
}

export interface GraphicsShapePolygon extends GraphicsShapeBase {
	closePath: boolean;
	points: { [key: string]: { x: number; y: number } };
}

export interface GraphicsGC extends BaseGC {
	type: "graphics";
	shapes: {
		[key: string]: GraphicsShapeCircle | GraphicsShapeRectangle | GraphicsShapeEllipse | GraphicsShapeStar | GraphicsShapeLine | GraphicsShapePolygon;
	};
	focusedShapeId: string | null;
	gradientBoxSaveData?: any;
	gradientBoxDataObject: any;
}

export interface SpineGC extends BaseGC {
	type: "spine";
	spineTexture: string;
	skin: string;
	animation: string;
	animationSpeed: number;
	autoplay: boolean;
	loop: boolean;
	tint: string;
}

export interface LottieGC extends BaseGC {
	type: "lottie";
	width: number;
	height: number;
	animation: string;
	autoplay: boolean;
	speed: number;
	loop: boolean;
	renderTarget: "canvas" | "pixi";
}

export type TextAlignment = "left" | "center" | "right";
export type TextShadow = {
	enabled: boolean;
	alpha: number;
	color: string;
	blur: number;
	angle: number;
	distance: number;
};

export interface TextGC extends BaseGC {
	type: "text";

	text: string;
	fontFamily: string;
	fontSize: number;
	resolution: number;
	align: TextAlignment;
	fill: string;

	lineHeight: number;
	leading: number;
	letterSpacing: number;
	padding: number;

	strokeColor: string;
	strokeThickness: number;

	shadow: TextShadow;

	wordWrap: boolean;
	wordWrapWidth: number;
	breakWords: boolean;

	autofit: boolean;
	autofitMultiline: boolean;
	autofitMaxFontSize: number;
	autofitWidthRatio: number;
	autofitHeightRatio: number;

	datajsID?: string;
	datajsName?: string;

	datajsColor?: boolean;
	datajsStroke?: boolean;
	datajsShadow?: boolean;
	datajsMultiline?: boolean;
	datajsTTS?: boolean;

	gradientBoxSaveData?: any;
	gradientBoxDataObject: any;
}

export interface TilingSpriteGC extends BaseGC {
	type: "tilingSprite";
	width: number;
	height: number;
	tilePosition: Vector2;
	tileScale: Vector2;
	tint: string;
	texture: Texture2D;
	landscapeTexture: Texture2D | null;
	landscape: boolean;
}

export interface ViewportGC extends BaseGC {
	type: "viewport";
	debug: boolean;
	worldSize: Vector2;
	direction: "both" | "horizontal" | "vertical" | "none";
	clampZoom: boolean;
	enableDrag: boolean;
	enableZoom: boolean;
	smoothing: number;
	maxZoomMultiplier: number;
	target: string;
	targetSmoothFollowStrength: number;
}

export interface Layout2DGC extends BaseGC {
	type: "layout2D";
	selected: "portrait" | "landscape";
	portrait: any;
	landscape: any & { enabled: boolean };
	hasDebug: boolean;
}

export interface Cell2DGC extends BaseGC {
	type: "cell2D";
	selected: "portrait" | "landscape";
	portrait: {
		fraction: number;
		order: number;
		zIndex: number;
		containType: "row" | "col";
		mask: boolean;
		width: number;
		height: number;
		fitUnit: "max" | "min" | "stretch";
		gap: number;
	};
	landscape: {
		enabled: boolean;
		fraction: number;
		order: number;
		zIndex: number;
		containType: "row" | "col";
		mask: boolean;
		width: number;
		height: number;
		fitUnit: "max" | "min" | "stretch";
		gap: number;
	};
}

export interface NineSliceSpriteGC extends BaseGC {
	type: "nineSliceSprite";
	texture: Texture2D;
	landscapeTexture: Texture2D | null;
	landscape: boolean;
	tint: string;
	width: number;
	height: number;
	leftWidth: number;
	rightWidth: number;
	topHeight: number;
	bottomHeight: number;
}

export interface TutorialGC extends BaseGC {
	type: "tutorial";
	tutorials: {
		[name: string]: {
			name: string;
			tutorialType: "choose" | "infinity" | "path";
			chooseType: {
				chooseOrder: "random" | "sequential" | "reverse";
				behaviors: ("movement" | "scale" | "rotation" | "alpha" | "drag")[];
				alpha: {
					duration: number;
					startDelay: number;
					endDelay: number;
					easeStart: string;
					easeEnd: string;
				};
				scale: {
					duration: number;
					scaleRatio: number;
					startDelay: number;
					endDelay: number;
					easeStart: string;
					easeEnd: string;
				};
				rotation: {
					duration: number;
					angleAmount: number;
					startDelay: number;
					endDelay: number;
					easeStart: string;
					easeEnd: string;
				};
				movement: {
					duration: number;
					startDelay: number;
					endDelay: number;
					easeStart: string;
					easeEnd: string;
				};
				drag: {
					dragTheObjectsClone: boolean;
					duration: number;
				};
				delay: number;
				ease: string;
				repeat: number;
				repeatDelay: number;
			};
			infinityType: {
				behaviors: ("scale" | "rotation" | "alpha")[];
				behaviorsDuration: number;
				infinityMovementWidth: number;
				infinityMovementHeight: number;
				scale: {
					scaleRatio: number;
					speed: number;
					ease: string;
				};
				rotation: {
					angleAmount: number;
					speed: number;
					ease: string;
				};
				duration: number;
				delay: number;
				repeat: number;
				repeatDelay: number;
				ease: string;
			};
			pathType: {
				behaviors: ("scale" | "rotation" | "alpha")[];
				pathGraphics: string;
				alpha: {
					timeline: [number, number];
					speed: number;
					easeStart: string;
					easeEnd: string;
					disableAt: "none" | "start" | "end";
				};
				scale: {
					scaleRatio: number;
					timeline: [number, number];
					speed: number;
					easeStart: string;
					easeEnd: string;
					disableAt: "none" | "start" | "end";
				};
				rotation: {
					angleAmount: number;
					timeline: [number, number];
					speed: number;
					easeStart: string;
					easeEnd: string;
					disableAt: "none" | "start" | "end";
				};
				pathDuration: number;
				curviness: number;
				duration: number;
				delay: number;
				repeat: number;
				yoyo: boolean;
				repeatDelay: number;
				ease: string;
			};
			showEvents: string[];
			hideEvents: string[];
		};
	};
	debug: boolean;
	width: number;
	height: number;
	hand: string | null;
}

export interface CameraGC extends BaseGC {
	type: "camera";
	debug: boolean;
	clamp: boolean;
	world: string;
	width: number;
	height: number;
	offset: Vector2;
	worldPosition: Vector2;
	worldWidth: number;
	worldHeight: number;
	lerp: Vector2;
	target: string;
	isFit: boolean;
	fitScale: Vector2;
}

export interface FeedbackGC extends BaseGC {
	type: "feedback";
	fontFamily: string;
	debug: boolean;
	width: number;
	height: number;
	feedbacks: {
		[name: string]: FeedbackItem;
	};
}

export interface CtaGC extends BaseGC {
	type: "cta";
	bgTexture: string | null;
	text: string;
	fontFamily: string;
	textColor: string;
	textStrokeThickness: number;
	textStrokeColor: string;
	textScaleX: number;
	textScaleY: number;
	textOffsetX: number;
	textOffsetY: number;
	datajsID: string;
	datajsName: string;
	enablePulse: boolean;
	enableInDatajs: boolean;
}

export interface ParticleEmitterGC extends BaseGC {
	type: "particleEmitter";
	width: number;
	height: number;
	debug: boolean;
	particleData: ParticleData;
	particleUUID?: string;
}
export interface LayerGC extends BaseGC {
	type: "layer";
	label: string;
}

export interface GifGC extends BaseGC {
	type: "gif";
	src: string;
}

export interface VideoGC extends BaseGC {
	type: "video";
	src: string;
	srcType: "video" | "uploadable";
	uploadId: string;
	uploadName: string;
	autoplay: boolean;
	loop: boolean;
	muted: boolean;
	unmuteOnTouch: boolean;
	useUniqueTexture: boolean;
}

// 2D Physics Components
export type PhysicsShapeType = "circle" | "rectangle" | "polygon";

interface PhysicsShapeBase {
	type: PhysicsShapeType;
	// offset: { x: number; y: number };
}

export interface PhysicsShapeCircle extends PhysicsShapeBase {
	radius: number;
}

export interface PhysicsShapeRectangle extends PhysicsShapeBase {
	width: number;
	height: number;
}

export interface PhysicsShapePolygon extends PhysicsShapeBase {
	points: { [key: string]: { x: number; y: number } };
}

export interface PhysicsShape extends PhysicsShapeBase {
	type: PhysicsShapeType;
	uuid?: string;
	width?: number;
	height?: number;
	radius?: number;
	points?: { [key: string]: { x: number; y: number } };
	offset: { x: number; y: number };
}

export interface PhysicsGC extends BaseGC {
	type: "physics";
	physicsLabel: string;
	bodyType: "static" | "dynamic" | "kinematic";
	sensor: boolean;
	friction: number;
	restitution: number;
	density: number;
	shape: PhysicsShape;
	categoryBits: string;
	maskBits: string[];
	lockUpdate?: boolean;
	nodeID?: string;
	compounds: PhysicsShape[];
}

// 3D Physics Components
export type Physics3DShapeType = "box" | "sphere" | "cylinder" | "plane" | "capsule" | "cone" | "trimesh";

interface Physics3DShapeBase {
	type: Physics3DShapeType;
	offset: { x: number; y: number; z: number };
}

export interface Physics3DShapeBox extends Physics3DShapeBase {
	width: number;
	height: number;
	depth: number;
}

export interface Physics3DShapeSphere extends Physics3DShapeBase {
	radius: number;
}

export interface Physics3DShapeCylinder extends Physics3DShapeBase {
	radius: number;
	height: number;
}

export interface Physics3DShapePlane extends Physics3DShapeBase {
	width: number;
	height: number;
}

export interface Physics3DShapeCapsule extends Physics3DShapeBase {
	radius: number;
	height: number;
}

export interface Physics3DShapeCone extends Physics3DShapeBase {
	radius: number;
	height: number;
}

export interface Physics3DShapeTrimesh extends Physics3DShapeBase {
	vertices: { x: number; y: number; z: number }[];
	indices: number[];
}

export interface Physics3DShape extends Physics3DShapeBase {
	type: Physics3DShapeType;
	uuid?: string;
	width?: number;
	height?: number;
	depth?: number;
	radius?: number;
	vertices?: { x: number; y: number; z: number }[];
	indices?: number[];
	offset: { x: number; y: number; z: number };
}

export interface Physics3DGC extends BaseGC {
	type: "physics3D";
	physicsLabel: string;
	bodyType: "static" | "dynamic" | "kinematic";
	sensor: boolean;
	friction: number;
	restitution: number;
	density: number;
	shape: Physics3DShape;
	categoryBits: string;
	maskBits: string[];
	lockUpdate?: boolean;
	nodeID?: string;
	compounds: Physics3DShape[];
	mass?: number;
	linearDamping?: number;
	angularDamping?: number;
	linearVelocity?: { x: number; y: number; z: number };
	angularVelocity?: { x: number; y: number; z: number };
}

export interface ScriptVariables {
	name: string;
	type: string;
	value: any;
	order: number;
}
export interface Script {
	[x: string]: any;
	id: string;
	name: string;
	variables: {
		[variableName: string]: ScriptVariables;
	};
	order: number;
	isActive: boolean;
}
export interface ScriptsGC extends BaseGC {
	type: "scripts";
	scripts: Script[];
}

export interface SkinnedMeshGC extends BaseGC {
	type: "skinnedMesh";
	name: string;
	geometry: string;
	material: string;
	geometryUUID?: string;
}

export interface BoneGC extends BaseGC {
	type: "bone";
	name: string;
	skeleton: string;
	index: number;
}

export type SpaceUnit = "px" | "%" | "self";
export type OriginOptions = "top" | "bottom" | "left" | "right" | "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type FitTypeUnit = "max" | "min" | "stretch";

export interface ResponsiveType {
	width: number;
	height: number;
	fitType: FitTypeUnit;
	origin: OriginOptions;
	referenceBottom: string | null;
	referenceLeft: string | null;
	referenceRight: string | null;
	referenceTop: string | null;
	verticalSpace: number;
	horizontalSpace: number;
	verticalSpaceUnit: SpaceUnit;
	horizontalSpaceUnit: SpaceUnit;
}

export interface ResponsiveSettingsType {
	enablePosition: boolean;
	enableScale: boolean;
}

export interface Responsive2DGC extends BaseGC {
	type: "responsive2D";
	resizes: {
		[name: string]: {
			isActive: boolean;
			selected: "portrait" | "landscape";
			portrait: ResponsiveType;
			landscape: ResponsiveType & { enabled: boolean };
			settings: ResponsiveSettingsType;
		};
	};
}

export interface TransitionFXGC extends BaseGC {
	type: "transitionFX";
	effects: {
		[name: string]: {
			name: string;
			transitionType:
				| "fadeIn"
				| "fadeOut"
				| "rotate"
				| "scaleIn"
				| "scaleOut"
				| "scaleUp"
				| "scaleDown"
				| "fromTop"
				| "fromBottom"
				| "fromLeft"
				| "fromRight"
				| "toTop"
				| "toBottom"
				| "toLeft"
				| "toRight"
				| "pulse"
				| "blur"
				| "brightness"
				| "tint"
				| "shake"
				| "custom";
			pulseScalar: number;
			alphaFadeIn: number;
			alphaFadeOut: number;
			scaleRatio: number;
			blur?: number;
			brightness?: number;
			tint?: number;
			shakeAmount?: number;
			duration: number;
			delay: number;
			ease: string;
			autoplay: boolean;
			eventNames: string[];
			completeEventNames: string[];
			angle?: number;
			repeat?: number;
			repeatDelay?: number;
			yoyo?: boolean;
			hideOnComplete?: boolean;
			nextFxs?: string[];
			easeCurve?: string;
			custom?: string;
		};
	};
}

export interface ShuraParticleGC extends BaseGC {
	emitterUpdateStack: Array<any>;
	particleSpawnStack: Array<any>;
	particleUpdateStack: Array<any>;
	emitterUpdateSettings?: { [moduleName: string]: any };
	particleSpawnSettings?: { [moduleName: string]: any };
	particleUpdateSettings?: { [moduleName: string]: any };
}

// 3D Components
export interface Node3DGC extends BaseGC {
	type: "node3D";
	label: string;
	visible: boolean;
	position: Vector3;
	scale: Vector3;
	rotation: Vector3;
	renderOrder: number;
	optionalLoad: boolean;
	optionalLoadID: string;
	optionalLoadValue: string;
}

export interface InlineModelGC extends BaseGC {
	type: "inlineModel";
	modelUUID: string;
	animations: {
		[key: string]: {
			state: AnimationState;
			loop: "none" | "loop" | "pingpong";
		};
	};
	morphs: {
		name: string;
		targets: number[];
	}[];
}

export interface MeshGC extends BaseGC {
	type: "mesh";
	geometry: string;
	material: string;
	castShadow: boolean;
	receiveShadow: boolean;
	parentUUID?: string;
	geometryUUID?: string;
}

export type AnimationState = "play" | "stop";
export type QuarksParticleEmitterSettings = {
	name: string;
	worldSpace: boolean;
};

export interface ModelGC extends BaseGC {
	type: "model";
	stuffs: string | null;
	modelUUID: string;
	modelPath: string;
	stuffsDataId: string;
	animations: {
		[key: string]: {
			state: AnimationState;
			loop: "none" | "loop" | "pingpong";
		};
	};
	morphs: {
		name: string;
		targets: number[];
	}[];
}

export interface ModelTreeGC extends BaseGC {
	type: "modelTree";
	modelUUID: string;
	modelData: {
		[key: string]: {
			visible: boolean;
			castShadow: boolean;
			receiveShadow: boolean;
			material: string | null;
		};
	};
}

export interface Sprite3DGC extends BaseGC {
	type: "sprite3D";
	center: Vector2;
	material: string;
}

// CAMERAS
export interface PerspectiveCameraGC extends BaseGC {
	type: "perspectiveCamera";
	fov: number;
	aspect: number;
	near: number;
	far: number;
	debug?: boolean;
}

export interface OrthographicCameraGC extends BaseGC {
	type: "orthographicCamera";
	left: number;
	right: number;
	top: number;
	bottom: number;
	near: number;
	far: number;
	debug?: boolean;
}

// LIGHTS
export interface LightGC extends BaseGC {
	type: "light" | "ambientLight" | "directionalLight" | "pointLight" | "spotLight" | "hemisphereLight";
	color: string;
	intensity: number;
}

export interface AmbientLightGC extends LightGC {
	type: "ambientLight";
}

export interface DirectionalLightGC extends LightGC {
	type: "directionalLight";
	target: Vector3;
	debug: boolean;

	castShadow: boolean;
	bias: number;
	shadowAreaSize: number;
	shadowMapSize: number;
}

export interface PointLightGC extends LightGC {
	type: "pointLight";
	debug: boolean;
	castShadow: boolean;
	distance: number;
	decay: number;
}

export interface SpotLightGC extends LightGC {
	type: "spotLight";
	target: Vector3;
	distance: number;
	decay: number;
	angle: number;
	penumbra: number;
	debug: boolean;
	castShadow: boolean;
	shadowMapSize: number;
}

export interface HemisphereLightGC extends LightGC {
	type: "hemisphereLight";
	groundColor: string;
	debug?: boolean;
}

export interface QuarksParticleGC extends BaseGC {
	type: "quarksParticle";
	modelUUID: string;
	scale: number;
	autoplay: boolean;
	animations: {
		[key: string]: {
			state: AnimationState;
		};
	};
	emitters: QuarksParticleEmitterSettings[];
}

export type GameComponent =
	| AnimatedSpriteGC
	| SpriteGC
	| SpineGC
	| LottieGC
	| TextGC
	| TilingSpriteGC
	| NineSliceSpriteGC
	| Layout2DGC
	| Cell2DGC
	| TutorialGC
	| GraphicsGC
	| Node2DGC
	| ContainerGC
	| CameraGC
	| FeedbackGC
	| CtaGC
	| ParticleEmitterGC
	| LayerGC
	| GifGC
	| VideoGC
	| PreStuffsGC
	| ViewportGC
	| PhysicsGC
	| Responsive2DGC
	| Filters2DGC
	| TransitionFXGC
	| Node3DGC
	| MeshGC
	| ModelGC
	| ModelTreeGC
	| Sprite3DGC
	| ScriptsGC
	| LightGC
	| AmbientLightGC
	| HemisphereLightGC
	| DirectionalLightGC
	| PointLightGC
	| SpotLightGC
	| PerspectiveCameraGC
	| OrthographicCameraGC
	| QuarksParticleGC
	| SkinnedMeshGC
	| BoneGC
	| InlineModelGC
	| ShuraParticleGC
	| Physics3DGC;
