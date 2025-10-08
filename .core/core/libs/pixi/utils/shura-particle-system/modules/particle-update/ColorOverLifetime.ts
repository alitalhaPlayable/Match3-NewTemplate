import { lerpColorHex } from "../../helper/math";
import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";

interface ShuraColorOverLifetimeModuleSettings {
    from?: string;
    to?: string;
    lifetimeAlpha?: boolean;
    setColor?: boolean;
}

export class ColorOverLifetimeModule extends ShuraParticleUpdateModuleBase {
    settings: ShuraColorOverLifetimeModuleSettings = {
        from: "#ffffff",
        to: "#ffffff",
        lifetimeAlpha: true,
        setColor: true
    }
    constructor(settings?: ShuraColorOverLifetimeModuleSettings) {
        super()
        this.settings = {
            ...this.settings,
            ...settings
        }
    }
    override execute(particle: ShuraParticle, delta: number): void {
        const newHexValue = lerpColorHex(this.settings.from ?? "#ffffff", this.settings.to ?? "#ffffff", 1-particle.normalizedLifetime);
        if (this.settings.setColor) particle.tint = parseInt(newHexValue.slice(1), 16)
        if (this.settings.lifetimeAlpha) particle.alpha = particle.normalizedLifetime
    }
}