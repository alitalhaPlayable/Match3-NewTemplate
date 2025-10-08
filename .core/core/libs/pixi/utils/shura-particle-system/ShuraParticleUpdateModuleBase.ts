import { ShuraParticle } from "./ShuraParticle";

export abstract class ShuraParticleUpdateModuleBase {
    public abstract execute(particle: ShuraParticle, delta: number): void
}