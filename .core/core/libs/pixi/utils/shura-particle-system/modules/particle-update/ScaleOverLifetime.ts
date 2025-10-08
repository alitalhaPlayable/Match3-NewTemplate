import gsap from "gsap";
import { linearinterp } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";

interface ScaleOverLifetimeSettings {
    scale: NumberOrRange;
    ease?: any;
}


export class ScaleOverLifetime extends ShuraParticleUpdateModuleBase {
    settings: ScaleOverLifetimeSettings = {
        scale: [0, 1],
        ease: "sine.inOut",
    }

    constructor(settings: ScaleOverLifetimeSettings) {
        super();
        this.settings = {
            ...this.settings,
            ...settings,
            ease: gsap.parseEase(settings.ease ?? this.settings.ease)
        }
    }

    override execute(particle: ShuraParticle, delta: number): void {
        const ease = this.settings.ease(particle.normalizedLifetime)
        const minimaTexScale = Math.min(particle.texture?.source?.width ?? 1, particle.texture?.source?.height ?? 1)
        if (!Array.isArray(this.settings.scale)) {
            particle.scaleX = this.settings.scale * particle.unitScale / minimaTexScale;
            particle.scaleY = this.settings.scale * particle.unitScale / minimaTexScale;
        } else {
            particle.scaleX = linearinterp(this.settings.scale[0], this.settings.scale[1], 1 - ease) * particle.unitScale /  minimaTexScale
            particle.scaleY = linearinterp(this.settings.scale[0], this.settings.scale[1], 1 - ease) * particle.unitScale /  minimaTexScale
        }

        // particle.scaleX = linearinterp(particle.scaleX, 10000, delta * 8)
        // console.log(particle.scaleX)
        // console.log(particle.scaleX, particle.scaleY)
    }
}