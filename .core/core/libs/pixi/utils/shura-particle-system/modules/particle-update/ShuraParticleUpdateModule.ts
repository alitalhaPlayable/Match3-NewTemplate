import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";

export class ShuraParticleUpdateModule extends ShuraParticleUpdateModuleBase {
    override execute(particle: ShuraParticle, delta: number): void {
        particle.x += particle.velocity.x * delta * particle.unitScale;
        particle.y += particle.velocity.y * delta * particle.unitScale;

        if (particle.lifetime !== -1) {
            particle.lifetime -= delta;
            particle.normalizedLifetime = particle.lifetime / particle.maxLifetime
        }
    }
}