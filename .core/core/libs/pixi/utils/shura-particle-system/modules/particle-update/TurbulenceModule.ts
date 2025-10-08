import { ShuraParticle } from "../../ShuraParticle";
import { ShuraParticleUpdateModuleBase } from "../../ShuraParticleUpdateModuleBase";

interface TurbulenceModuleSettings {
    strength?: number;
    frequency?: number;
    noiseZAxisMoveSpeed?: number;
}


export class TurbulenceModule extends ShuraParticleUpdateModuleBase {
    // strength: number;
    // frequency: number;
    settings : TurbulenceModuleSettings = {
        strength: 10,
        frequency: 10,
        noiseZAxisMoveSpeed: 0.1,
    }
    constructor(settings: TurbulenceModuleSettings) {
        super();
        this.settings = {
            ...this.settings,
            ...settings!
        }
        
    }

    // Basic hash function for pseudo-random gradients
    private hash(x: number, y: number, z: number): number {
        const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return h - Math.floor(h); // fract
    }

    // 3D value noise with smooth interpolation
    private noise(x: number, y: number, z: number): number {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const zi = Math.floor(z);

        const xf = x - xi;
        const yf = y - yi;
        const zf = z - zi;

        const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const u = fade(xf);
        const v = fade(yf);
        const w = fade(zf);

        const get = (dx: number, dy: number, dz: number) =>
            this.hash(xi + dx, yi + dy, zi + dz);

        // Trilinear interpolation
        return lerp(
            lerp(
                lerp(get(0, 0, 0), get(1, 0, 0), u),
                lerp(get(0, 1, 0), get(1, 1, 0), u),
                v
            ),
            lerp(
                lerp(get(0, 0, 1), get(1, 0, 1), u),
                lerp(get(0, 1, 1), get(1, 1, 1), u),
                v
            ),
            w
        ) * 2 - 1; // convert from [0, 1] to [-1, 1]
    }

    override execute(particle: ShuraParticle, delta: number): void {
        const time = performance.now() * this.settings.noiseZAxisMoveSpeed;

        const nx = particle.x * this.settings.frequency;
        const ny = particle.y * this.settings.frequency;
        const nt = time * this.settings.frequency;

        const forceX = this.noise(nx, ny, nt);
        const forceY = this.noise(nx + 1000, ny + 1000, nt); // offset to decorrelate

        particle.velocity.x += forceX * this.settings.strength * delta;
        particle.velocity.y += forceY * this.settings.strength * delta;
    }
}