import * as PIXI from "pixi.js";
import Container from "./Container";
import { ShuraContainer } from "../utils/shura-particle-system/ShuraContainer";
import { FillGradient } from "../utils/shura-particle-system/helper/gradient";
import { ShuraParticleGC } from "../../common/components";
import { ShuraEmitterUpdateModuleBase } from "../utils/shura-particle-system/ShuraEmitterUpdateModuleBase";
import { ShuraParticleSpawnModuleBase } from "../utils/shura-particle-system/ShuraParticleSpawnModuleBase";
import { ShuraParticleUpdateModuleBase } from "../utils/shura-particle-system/ShuraParticleUpdateModuleBase";
import { NumberOrRange } from "../utils/shura-particle-system/types/ShuraContainerTypes";
import Cache2D from "../utils/Cache2D";
import {
	ColorOverLifetimeModule,
	ConformToPosition,
	DragModule,
	PositionOverLifetime,
	RotationOverLifetime,
	ScaleOverLifetime,
	ShuraParticleUpdateGravityModule,
	TurbulenceModule,
	VelocityOverLifetime,
} from "../utils/shura-particle-system/modules/particle-update";

import {
	ShuraParticleSpawnLifetime,
	ShuraSetBlendMode,
	ShuraSetColor,
	ShuraSetPosition,
	ShuraSetRotation,
	ShuraSetTexture,
	ShuraSetVelocity,
} from "../utils/shura-particle-system/modules/particle-spawn";

import { PeriodicSpawnBurstModule, SpawnRateModule } from "../utils/shura-particle-system/modules/emitter-update";
export class ShuraParticle extends Container {
	shuraContainer: ShuraContainer;
	emitterUpdateList: Array<any> = [];
	particleSpawnList: Array<any> = [];
	particleUpdateList: Array<any> = [];
	currentComponent?: ShuraParticleGC;
	textureCache: Map<string, any> = new Map();

	customEmitterUpdateList: Array<any> = [];
	customParticleSpawnList: Array<any> = [];
	customParticleUpdateList: Array<any> = [];

	updateEmitter = true
	emitParticles = true

	shuraContainerWorldPos: PIXI.Point;

	constructor({ x = 0, y = 0 }) {
		super(x, y);
		this.shuraContainer = new ShuraContainer({ lifetime: -1, autoDestroyAfterLifetime: false});
		this.shuraContainer.x = 50;
		this.shuraContainer.y = 50;
		this.shuraContainerWorldPos = this.shuraContainer.getGlobalPosition();

		this.shuraContainer.setParticleUpdateStack([]);

		this.addChild(this.shuraContainer);
	}

	private safeKey(name: string): string {
		return name.replace(/\s+/g, "_").toLowerCase();
	}

	private toPrimitiveArray<T = any>(value: any, fallback: T[] = []): T[] {
		if (Array.isArray(value)) return value as T[];
		if (value && typeof value === "object") {
			return Object.keys(value)
				.map((k) => ({ k: Number(k), v: (value as any)[k] }))
				.sort((a, b) => a.k - b.k)
				.map((p) => p.v as T);
		}
		return fallback;
	}

	private toNumberOrRange(value: any, fallback: NumberOrRange): NumberOrRange {
		if (typeof value === "number") return value as number;
		const arr = this.toPrimitiveArray<number>(value);
		if (arr.length >= 2) return [arr[0], arr[1]] as [number, number];
		if (arr.length === 1) return arr[0] as number;
		return fallback;
	}

	updateShuraComponent(component: ShuraParticleGC) {
		this.currentComponent = component;
		this.emitterUpdateList = component.emitterUpdateStack ?? [];
		this.updateEmitterUpdateList();

		this.particleSpawnList = component.particleSpawnStack ?? [];
		this.updateParticleSpawnList();

		this.particleUpdateList = component.particleUpdateStack ?? [];
		this.updateParticleUpdateList();
	}

	updateParticleUpdateList() {
		const tempArr: ShuraParticleUpdateModuleBase[] = [];
		this.particleUpdateList.forEach((element: string) => {
			const key = this.safeKey(element);
			const comp = this.currentComponent;
			switch (element) {
				case "Color Over Lifetime":
					{
						// settings: { from?: string; to?: string; lifetimeAlpha?: boolean; setColor?: boolean }
						const s = comp?.particleUpdateSettings?.[key] ?? ({} as any);
						tempArr.push(
							new ColorOverLifetimeModule({
								from: s.from ?? "#ffffff",
								to: s.to ?? "#ffffff",
								lifetimeAlpha: s.lifetimeAlpha ?? true,
								setColor: s.setColor ?? true,
							})
						);
					}
					break;

				case "Drag":
					{
						const s = comp?.particleUpdateSettings?.[key] ?? ({} as any);
						tempArr.push(new DragModule({ drag: s.drag ?? 0.99 }));
					}
					break;

				case "Gravity":
					{
						const s = comp?.particleUpdateSettings?.[key] ?? ({} as any);
						tempArr.push(new ShuraParticleUpdateGravityModule({ multiplier: s.multiplier ?? 1.0 }));
					}
					break;

				case "Scale Over Lifetime":
					{
						const s = comp?.particleUpdateSettings?.[key] ?? ({} as any);
						const scale = this.toNumberOrRange(s.scale, [1, 0.0]);
						tempArr.push(new ScaleOverLifetime({ scale, ease: s.ease ?? "sine.inOut" }));
					}
					break;

				case "Turbulence":
					{
						const s = comp?.particleUpdateSettings?.[key] ?? ({} as any);
						tempArr.push(
							new TurbulenceModule({
								strength: s.strength ?? 10,
								frequency: s.frequency ?? 10,
								noiseZAxisMoveSpeed: s.noiseZAxisMoveSpeed ?? 0.1,
							})
						);
					}
					break;

				case "Velocity Over Lifetime":
					{
						const s = comp?.particleUpdateSettings?.[key] ?? ({} as any);
						const start = this.toNumberOrRange(s.startVelocity, [0.0, 0.0]);
						const end = this.toNumberOrRange(s.endVelocity, [0.0, 0.0]);
						tempArr.push(
							new VelocityOverLifetime({
								startVelocity: start as Array<number>,
								endVelocity: end as Array<number>,
								ease: s.ease ?? "sine.inOut",
								setStartVelocity: s.setStartVelocity,
							})
						);
					}
					break;

				case "Position Over Lifetime":
					{
						const s = comp?.particleUpdateSettings?.[key] ?? ({} as any);
						const start = this.toNumberOrRange(s.startPosition, [0.0, 0.0]);
						const end = this.toNumberOrRange(s.endPosition, [0.0, 0.0]);
						tempArr.push(
							new PositionOverLifetime({
								startPosition: start as Array<number>,
								endPosition: end as Array<number>,
								ease: s.ease ?? "sine.inOut",
								setStartPosition: s.setStartPosition,
							})
						);
					}
					break;

				case "Rotation Over Lifetime":
					{
						const s = comp?.particleUpdateSettings?.[key] ?? ({} as any);
						tempArr.push(
							new RotationOverLifetime({
								startRotation: s.startRotation,
								endRotation: s.endRotation,
								ease: s.ease ?? "sine.inOut",
								setStartRotation: s.setStartRotation,
							})
						);
					}
					break;

				case "Conform to Position":
					{
						const s = comp?.particleUpdateSettings?.[key] ?? ({} as any);
						tempArr.push(new ConformToPosition({ position: s.position, strength: s.strength }));
					}
					break;
				default:
					break;
			}
		});

		this.shuraContainer.setParticleUpdateStack([...tempArr, ...this.customParticleUpdateList]);
	}

	updateParticleSpawnList() {
		const tempArr: ShuraParticleSpawnModuleBase[] = [];
		this.particleSpawnList.forEach((element: string) => {
			const key = this.safeKey(element);
			const comp = this.currentComponent;
			switch (element) {
				case "Set Color":
					{
						// Expect settings: { colorStops?: string[]; alpha?: number }
						const s = comp?.particleSpawnSettings?.[key] ?? ({} as any);
						const colorStops: string[] = this.toPrimitiveArray<string>(s.colorStops, ["#ffffff"]);
						const stops = colorStops.map((c: string, i: number) => ({
							pos: colorStops.length === 1 ? 0 : i / (colorStops.length - 1),
							color: c,
						}));
						const gradient = new FillGradient(stops);
						tempArr.push(new ShuraSetColor({ color: gradient, alpha: s.alpha ?? 1 }));
					}
					break;

				case "Spawn Lifetime":
					{
						// settings: { lifetime: number | [number, number] } but we store array [min,max]
						const s = comp?.particleSpawnSettings?.[key] ?? ({} as any);
						const lifetime = this.toNumberOrRange(s.lifetime, [0.2, 2]);
						tempArr.push(new ShuraParticleSpawnLifetime({ lifetime }));
					}
					break;

				case "Set Velocity":
					{
						// settings: { velocityX?: NumberOrRange; velocityY?: NumberOrRange; radial?: boolean }
						const s = comp?.particleSpawnSettings?.[key] ?? ({} as any);
						tempArr.push(
							new ShuraSetVelocity({
								velocityX: this.toNumberOrRange(s.velocityX, [-20, 20]),
								velocityY: this.toNumberOrRange(s.velocityY, [-80, -20]),
								radial: !!s.radial,
							})
						);
					}
					break;

				case "Set Position":
					{
						// settings: { x?: NumberOrRange; y?: NumberOrRange }
						const s = comp?.particleSpawnSettings?.[key] ?? ({} as any);
						tempArr.push(
							new ShuraSetPosition({
								x: this.toNumberOrRange(s.x, [0, 0]),
								y: this.toNumberOrRange(s.y, [0, 0]),
							})
						);
					}
					break;

				case "Set Texture":
					{
						const s = comp?.particleSpawnSettings?.[key] ?? ({} as any);
						let texture = PIXI.Texture.WHITE;
						if (s.texture) {
							texture = Cache2D.getTexture(s.texture)
						}
						tempArr.push(
							new ShuraSetTexture({
								texture,
							})
						);
					}
					break;

				case "Set Rotation":
					{
						const s = comp?.particleSpawnSettings?.[key] ?? ({} as any);
						tempArr.push(
							new ShuraSetRotation({
								x: this.toNumberOrRange(s.x, [0, 0]),
							})
						);
					}
					break;

				case "Set Blend Mode":
					{
						const s = comp?.particleSpawnSettings?.[key] ?? ({} as any);
						tempArr.push(
							new ShuraSetBlendMode({
								blendMode: s.blendMode,
							})
						);
					}
					break;

				default:
					break;
			}
		});

		this.shuraContainer.setParticleSpawnStack([...tempArr, ...this.customParticleSpawnList]);
	}

	updateEmitterUpdateList() {
		const tempArr: ShuraEmitterUpdateModuleBase[] = [];
		this.emitterUpdateList.forEach((element: string) => {
			const key = this.safeKey(element);
			const comp = this.currentComponent;
			switch (element) {
				case "Spawn Rate":
					{
						// settings: { spawnRate: number }
						const s = comp?.emitterUpdateSettings?.[key] ?? ({} as any);
						tempArr.push(new SpawnRateModule({ spawnRate: s.spawnRate ?? 10 }));
					}
					break;

				case "Spawn Burst":
					{
						// settings: { period: number; amount: number }
						const s = comp?.emitterUpdateSettings?.[key] ?? ({} as any);
						tempArr.push(new PeriodicSpawnBurstModule({ period: s.period ?? 1.0, amount: s.amount ?? 50 }));
					}
					break;

				default:
					break;
			}
		});

		this.shuraContainer.setEmitterUpdateStack([...tempArr, ...this.customEmitterUpdateList]);
	}

	updateComponents(components: { [key: string]: any }) {
		const shuraComponent = components.shuraParticle as ShuraParticleGC;

		if (shuraComponent) {
			this.updateShuraComponent(shuraComponent);
		}

		super.updateComponents(components);
	}

	customUpdate(delta: number) {
		if (this.updateEmitter) {
			this.shuraContainer.updateEmitter(delta, this.emitParticles)
		}
	}

	setEmitPosition(x: number, y: number) {
		this.shuraContainer.emitPos.x = x - 50;
		this.shuraContainer.emitPos.y = y - 50;
	}
}
