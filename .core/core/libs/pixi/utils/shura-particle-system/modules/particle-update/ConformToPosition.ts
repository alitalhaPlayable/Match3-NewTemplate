import { linearinterp } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";

interface ConformToPositionSettings {
    position: Array<number>;
    strength: number;
}

export class ConformToPosition extends ShuraParticleUpdateModuleBase {
    settings: ConformToPositionSettings = {
        position: [0,0],
        strength: 1
    }
    constructor(settings?: ConformToPositionSettings) {
        super();
        this.settings = {
            ...this.settings,
            ...settings
        }

    }
    override execute(particle: ShuraParticle, delta: number): void {
        particle.position.x = linearinterp(particle.position.x, this.settings.position[0], delta*this.settings.strength*(1-particle.normalizedLifetime));
        particle.position.y = linearinterp(particle.position.y, this.settings.position[1], delta*this.settings.strength*(1-particle.normalizedLifetime));
    }
}