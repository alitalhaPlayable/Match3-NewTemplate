import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";

interface DragModuleSettings {
    drag: number;
}

export class DragModule extends ShuraParticleUpdateModuleBase {
    settings: DragModuleSettings = {
        drag: 0.99
    }
    constructor(settings?: DragModuleSettings) {
        super();
        this.settings = {
            ...this.settings,
            ...settings
        }

    }
    override execute(particle: ShuraParticle, delta: number): void {
        particle.velocity.x *= this.settings.drag;
        particle.velocity.y *= this.settings.drag;
    }
}