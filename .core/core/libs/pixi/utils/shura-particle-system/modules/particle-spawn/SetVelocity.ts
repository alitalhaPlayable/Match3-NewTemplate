import { randomInRange, resolveRandomRangeArray } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleSpawnModuleBase } from "../../ShuraParticleSpawnModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";

interface ShuraSetVelocitySettings {
    velocityX?: NumberOrRange;
    velocityY?: NumberOrRange;
    radial?: boolean;
}

export class ShuraSetVelocity extends ShuraParticleSpawnModuleBase {
    defaultSettings = {
        velocityX: 1,
        velocityY: 1,
        radial: false
    }
    constructor(private settings: ShuraSetVelocitySettings = {}) {
        super();
        this.settings = {
            ...this.defaultSettings,
            ...settings
        }
    }

    public execute(particle: ShuraParticle): void {
        particle.velocity.x = resolveRandomRangeArray(this.settings.velocityX, 0);
        particle.velocity.y = resolveRandomRangeArray(this.settings.velocityY, 0);
        if (this.settings.radial) {
            const angle = Math.random() * Math.PI * 2;

            particle.velocity.x *= Math.cos(angle);
            particle.velocity.y *= Math.sin(angle);
        }
    }
}
