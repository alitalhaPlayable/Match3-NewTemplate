import { resolveRandomRangeArray } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleSpawnModuleBase } from "../../ShuraParticleSpawnModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";
interface LifetimeSettings {
    lifetime: NumberOrRange
}
export class ShuraParticleSpawnLifetime extends ShuraParticleSpawnModuleBase {
    constructor(private settings: LifetimeSettings) {
        super();
    }
    public execute(particle: ShuraParticle): void {
        particle.setLifetime(resolveRandomRangeArray(this.settings.lifetime, 1.0));
    }
}