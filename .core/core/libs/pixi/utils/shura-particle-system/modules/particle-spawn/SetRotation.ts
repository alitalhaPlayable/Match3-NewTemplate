import { randomInRange, resolveRandomRangeArray } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleSpawnModuleBase } from "../../ShuraParticleSpawnModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";

interface ShuraSetRotationSettings {
    x?: NumberOrRange;
    y?: NumberOrRange;
}

export class ShuraSetRotation extends ShuraParticleSpawnModuleBase {
    defaultSettings = {
        x:0,
    }
    constructor(private settings: ShuraSetRotationSettings = {}) {
        super();
        this.settings = {
            ...this.defaultSettings,
            ...settings
        }
    }

    public execute(particle: ShuraParticle): void {
        particle.angle = resolveRandomRangeArray(this.settings.x, 0);
        particle.cachedRotation = particle.angle;
    }
}
