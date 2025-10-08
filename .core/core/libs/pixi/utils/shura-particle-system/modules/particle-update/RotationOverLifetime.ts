import gsap from "gsap";
import { linearinterp } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";
import { Point } from "pixi.js";

interface RotationOverLifetimeSettings {
    startRotation: number;
    endRotation: number;
    setStartRotation: boolean;
    ease?: any;
}

export class RotationOverLifetime extends ShuraParticleUpdateModuleBase {
    settings: RotationOverLifetimeSettings = {
        startRotation: 0,
        endRotation: 360,
        setStartRotation: true,
        ease: "sine.inOut",
    }

    constructor(settings: RotationOverLifetimeSettings) {
        super();
        this.settings = {
            ...this.settings,
            ...settings,
            ease: gsap.parseEase(settings.ease ?? this.settings.ease)
        }
    }

    override execute(particle: ShuraParticle, delta: number): void {
        const ease = this.settings.ease(particle.normalizedLifetime)

        if (!this.settings.setStartRotation && particle.cachedRotation) {
            particle.angle = linearinterp(
                particle.cachedRotation, 
                this.settings.endRotation, 
                1 - ease
            ) 

            return;
        }

        particle.angle = linearinterp(
            this.settings.startRotation, 
            this.settings.endRotation, 
            1 - ease
        ) 
    }
}