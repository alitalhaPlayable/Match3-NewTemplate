import { ShuraSystemFrameState } from "./types/ShuraContainerTypes";

export abstract class ShuraEmitterUpdateModuleBase {
    abstract execute(state: ShuraSystemFrameState, delta: number): number;
}