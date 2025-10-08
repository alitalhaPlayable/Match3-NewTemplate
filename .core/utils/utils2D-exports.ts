// Type-only exports - this prevents TypeScript from scanning the implementation
// Only declare the function signatures you want to expose

import { Renderer2D } from "../core/libs/pixi/main";
import Scene2D from "../core/libs/pixi/objects/Scene2D";
import { Application } from "pixi.js";

export function getObject2D(name: string, scene?: any): any;
export function getTexture2D(key: string): any;
export function getAnimation2D(key: string): any;
export function getSpine2D(key: string): any;
export function instantiatePrefab2D(
	key: string,
	props?: any,
	transform?: {
		x: number;
		y: number;
		scale: number;
		rotation: number;
		angle: number;
		parent: string | any;
		categoryBits?: number;
		maskBits?: [number];
	}
): any;
export function addScript2D(obj: any, scripts: any[]): any;
export function getApplication(): Application;
export function setGlobalFont(id: string): void;
export function startScene2D(name: string, removeActiveScenes?: boolean): Scene2D;
export function startScene2DByIndex(index: number, removeActiveScenes?: boolean): Scene2D;
export function getScene2DByName(name: string): Scene2D;
export function getScene2DByIndex(index: number): Scene2D;
export function removeScene2D(scene: any): void;
export function removeActiveScenes2D(): void;
export function getCurrentScene2D(): Scene2D;
export function getRenderer2D(): Renderer2D | null;

// Script exports
export { default as Script2D } from "../core/libs/common/script/Script2D";
export { ShuraContainer, ShuraParticle, ShuraEmitterUpdateModuleBase, ShuraParticleSpawnModuleBase, ShuraParticleUpdateModuleBase } from "../core/libs/pixi/utils/shura-particle-system";
export { TutorialHandler } from "../core/libs/pixi/utils/TutorialHandler";
export type { TutorialHandlerSettings } from "../core/libs/pixi/utils/TutorialHandler";
