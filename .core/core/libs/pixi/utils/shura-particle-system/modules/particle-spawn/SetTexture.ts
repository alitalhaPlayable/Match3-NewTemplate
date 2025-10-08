import { Texture } from "pixi.js";
import { randomInRange, resolveRandomRangeArray } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleSpawnModuleBase } from "../../ShuraParticleSpawnModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";

interface ShuraSetTextureSettings {
    texture?: any;
}

export class ShuraSetTexture extends ShuraParticleSpawnModuleBase {
    defaultSettings = {
        texture: Texture.WHITE
    }
    constructor(private settings: ShuraSetTextureSettings = {}) {
        super();
        this.settings = {
            ...this.defaultSettings,
            ...settings
        }
    }

    public execute(particle: ShuraParticle): void {
        particle.originalTextureDescriptor?.set?.call(particle, this.settings.texture);
        particle.scaleX /= this.settings.texture?.source?.width ?? 1
        particle.scaleY /= this.settings.texture?.source?.height ?? 1
    }
}
