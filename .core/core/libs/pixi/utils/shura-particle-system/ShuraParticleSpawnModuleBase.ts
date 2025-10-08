import { ShuraParticle } from "./ShuraParticle";

export abstract class ShuraParticleSpawnModuleBase {
    public abstract execute(particle: ShuraParticle): void;
}