import { Point } from "pixi.js";
import { randomInRange, resolveRandomRangeArray } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleSpawnModuleBase } from "../../ShuraParticleSpawnModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";

interface ShuraSetPositionSettings {
    x?: NumberOrRange;
    y?: NumberOrRange;
}

export class ShuraSetPosition extends ShuraParticleSpawnModuleBase {
    defaultSettings = {
        x: 1,
        y: 1,
    }
    constructor(private settings: ShuraSetPositionSettings = {}) {
        super();
        this.settings = {
            ...this.defaultSettings,
            ...settings
        }
    }

    public execute(particle: ShuraParticle): void {
        particle.x = resolveRandomRangeArray(this.settings.x, 0) + particle.emittedPos.x;
        particle.y = resolveRandomRangeArray(this.settings.y, 0) + particle.emittedPos.y;

        particle.cachedStartPos = new Point(particle.x, particle.y)
    }
}
