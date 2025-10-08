import { Particle, ParticleOptions, Point, Sprite, Texture } from "pixi.js";

export class ShuraParticle extends Sprite {
    public velocity: Point = new Point(0, 0);
    public maxLifetime: number = 2;
    public lifetime: number = 2;
    public unitScale: number = 1;
    public normalizedLifetime: number = 1;
    public cachedStartPos: Point = new Point(0,0)
    public cachedRotation: number = 0;
    public emittedPos: Point = new Point(0, 0)
    constructor(options: Texture | ParticleOptions) {
        super(options);
    }

    public setLifetime(lifetime :number) {
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.normalizedLifetime = 1;
    }
}