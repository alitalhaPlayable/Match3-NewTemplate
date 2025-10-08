import gsap from "gsap";
import { linearinterp } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";
import { NumberOrRange } from "../../types/ShuraContainerTypes";
import { Point } from "pixi.js";

interface PositionOverLifetimeSettings {
    startPosition: Array<number>;
    endPosition: Array<number>;
    setStartPosition: boolean;
    ease?: any;
}

export class PositionOverLifetime extends ShuraParticleUpdateModuleBase {
    settings: PositionOverLifetimeSettings = {
        startPosition: [0, 1],
        endPosition: [0, 1],
        setStartPosition: true,
        ease: "sine.inOut",
    }

    constructor(settings: PositionOverLifetimeSettings) {
        super();
        this.settings = {
            ...this.settings,
            ...settings,
            ease: gsap.parseEase(settings.ease ?? this.settings.ease)
        }
    }

    override execute(particle: ShuraParticle, delta: number): void {
        const ease = this.settings.ease(particle.normalizedLifetime)

        if (!this.settings.setStartPosition &&  particle.cachedStartPos) {
            particle.position.x = linearinterp(
                particle.cachedStartPos.x, 
                this.settings.endPosition[0], 
                1 - ease
            ) 

            particle.position.y = linearinterp(
                particle.cachedStartPos.y, 
                this.settings.endPosition[1],
                1 - ease
            )  
            return;
        }

        particle.position.x = linearinterp(
            this.settings.startPosition[0], 
            this.settings.endPosition[0], 
            1 - ease
        ) 

        particle.position.y = linearinterp(
            this.settings.startPosition[1], 
            this.settings.endPosition[1],
            1 - ease
        )  
    }
}