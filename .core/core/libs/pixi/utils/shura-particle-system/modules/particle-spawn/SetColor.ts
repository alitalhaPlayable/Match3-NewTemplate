import { FillGradient } from "../../helper/gradient";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleSpawnModuleBase } from "../../ShuraParticleSpawnModuleBase";

interface ShuraSetColorSettings {
    color?: FillGradient;
    alpha?: number;
}

export class ShuraSetColor extends ShuraParticleSpawnModuleBase {
    defaultSettings = {
        color: new FillGradient([
            { pos: 0, color: "#ffffff" }
        ]),
        alpha: 1
    }
    constructor(private settings: ShuraSetColorSettings = {}) {
        super();
        this.settings = {
            ...this.defaultSettings,
            ...settings
        }
    }

    public execute(particle: ShuraParticle): void {
        particle.alpha = this.settings.alpha ?? 1;
        particle.tint = parseInt(this.settings.color?.sample(Math.random())!.slice(1) ?? "#ffffff", 16)
    }
}
