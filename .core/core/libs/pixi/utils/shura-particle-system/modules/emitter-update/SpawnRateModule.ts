import { ShuraEmitterUpdateModuleBase } from "../../ShuraEmitterUpdateModuleBase";
import { ShuraSystemFrameState } from "../../types/ShuraContainerTypes";

interface SpawnRateSettings {
    spawnRate: number;
} 

export class SpawnRateModule extends ShuraEmitterUpdateModuleBase {
    totalDelta = 0
    settings: SpawnRateSettings = {
        spawnRate : 10
    }

    constructor(settings?: SpawnRateSettings) {
        super()
        this.settings = {
            ...this.settings,
            ...settings
        }
    }
    override execute(state: ShuraSystemFrameState, delta: number): number {
        this.totalDelta += delta;
        if (this.totalDelta > 0.01) {
            state.spawnCount += 1 * this.settings.spawnRate;
            this.totalDelta = 0;
        }
        return 1;
    }
}