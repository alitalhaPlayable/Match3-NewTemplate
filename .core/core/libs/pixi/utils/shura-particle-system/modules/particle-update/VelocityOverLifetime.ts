import gsap from "gsap";
import { linearinterp } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";
import { Point } from "pixi.js";

interface VelocityOverLifetimeSettings {
    startVelocity: Array<number>;
    endVelocity: Array<number>;
    setStartVelocity: boolean;
    ease?: any;
}


export class VelocityOverLifetime extends ShuraParticleUpdateModuleBase {
    settings: VelocityOverLifetimeSettings = {
        startVelocity: [0, 1],
        endVelocity: [0, 1],
        setStartVelocity: true,
        ease: "sine.inOut",
    }
    constructor(settings: VelocityOverLifetimeSettings) {
        super();
        this.settings = {
            ...this.settings,
            ...settings,
            ease: gsap.parseEase(settings.ease ?? this.settings.ease)
        }
    }

    override execute(particle: ShuraParticle, delta: number): void {
        const ease = this.settings.ease(particle.normalizedLifetime)

        if (!this.settings.setStartVelocity) {
            particle.velocity.x *= ease;
            particle.velocity.y *= ease;
            return;
        }

        particle.velocity.x = linearinterp(
            this.settings.startVelocity[0], 
            this.settings.endVelocity[0], 
            1 - ease
        ) 

        particle.velocity.y = linearinterp(
            this.settings.startVelocity[1], 
            this.settings.endVelocity[1],
            1 - ease
        )  
    }
}