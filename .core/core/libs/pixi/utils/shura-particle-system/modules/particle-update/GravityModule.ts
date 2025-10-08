import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";

interface GravityModuleSettings {
    multiplier?: number;
}

export class ShuraParticleUpdateGravityModule extends ShuraParticleUpdateModuleBase {
    settings: GravityModuleSettings = {
        multiplier: 1.0
    }

    constructor(settings?: GravityModuleSettings) {
        super()
        this.settings = {
            ...this.settings,
            ...settings
        }
    }
    override execute(particle: ShuraParticle, delta: number): void {
        particle.velocity.y += 9.81 * delta * particle.unitScale * (this.settings.multiplier ?? 1);
    }
}