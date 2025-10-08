import { Texture } from "pixi.js";
import { randomInRange, resolveRandomRangeArray } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleSpawnModuleBase } from "../../ShuraParticleSpawnModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";

interface ShuraSetBlendModeSettings {
    blendMode?: "normal" | "multiply" | "screen" | "add" | "subtract";
}

export class ShuraSetBlendMode extends ShuraParticleSpawnModuleBase {
    defaultSettings:ShuraSetBlendModeSettings = {
        blendMode: "normal"
    }
    constructor(private settings: ShuraSetBlendModeSettings = {}) {
        super();
        this.settings = {
            ...this.defaultSettings,
            ...settings
        }
    }

    public execute(particle: ShuraParticle): void {
        particle.blendMode = this.settings.blendMode ?? "normal"
    }
}
