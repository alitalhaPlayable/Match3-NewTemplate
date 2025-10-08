import { ShuraEmitterUpdateModuleBase } from "../../ShuraEmitterUpdateModuleBase";
import { ShuraSystemFrameState } from "../../types/ShuraContainerTypes";

interface ShuraPeriodicSpawnBurstModuleSettings {
    period: number;
    amount: number;
}
export class PeriodicSpawnBurstModule extends ShuraEmitterUpdateModuleBase {
    totalDelta = 100000 //at first insta-spawn
    settings: ShuraPeriodicSpawnBurstModuleSettings = {
        period: 1,
        amount: 50
    };
    constructor(settings?: ShuraPeriodicSpawnBurstModuleSettings) {
        super();
        this.settings = {
            ...this.settings,
            ...settings
        }
    }

    override execute(state: ShuraSystemFrameState, delta: number): number {
        this.totalDelta += delta;
        if (this.totalDelta > this.settings.period) {
            state.spawnCount += this.settings.amount;
            this.totalDelta = 0;
        }
        return 1;
    }
}