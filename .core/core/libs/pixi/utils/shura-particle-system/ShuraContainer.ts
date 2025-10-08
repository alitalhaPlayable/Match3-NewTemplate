import gsap from "gsap";
import * as PIXI from "pixi.js"
import { ShuraParticle } from "./ShuraParticle";
import { ShuraEmitterUpdateModuleBase } from "./ShuraEmitterUpdateModuleBase";
import { ShuraParticleSpawnModuleBase } from "./ShuraParticleSpawnModuleBase";
import { ShuraParticleUpdateModuleBase } from "./ShuraParticleUpdateModuleBase";
import { ShuraParticleUpdateModule } from "./modules/particle-update/ShuraParticleUpdateModule";
import { ShuraContainerSettings, ShuraSystemFrameState } from "./types/ShuraContainerTypes";
import Container from "../../objects/Container";


export class ShuraContainer extends Container {
    private settings: ShuraContainerSettings = {
        lifetime: -1,
        autoDestroyAfterLifetime: true,
    };

    private emitterUpdateStack: ShuraEmitterUpdateModuleBase[] = [];
    private particleSpawnStack: ShuraParticleSpawnModuleBase[] = [];
    private particleUpdateStack: ShuraParticleUpdateModuleBase[] = [];

    private particles: ShuraParticle[] = [];
    private elapsedTime: number = 0;
    public isKilled: boolean = false;
    public unitScale = 10;
    public emitPos = new PIXI.Point(0,0)

    constructor(settings?: ShuraContainerSettings, options?: PIXI.ParticleContainerOptions) {
        super();
        this.settings = {
            ...this.settings,
            ...settings
        };

        this.initialize();
    }

    private initialize() {
        gsap.registerEase("bellCurve", gsap.parseEase("M0,0 C0.28,0 0.282,1 0.5,1 0.679,1 0.779,0 1,0"))
    }

    public setEmitterUpdateStack(updateStackArray: ShuraEmitterUpdateModuleBase[]) {
        this.emitterUpdateStack = [...updateStackArray]
    }

    public setParticleSpawnStack(particleSpawnStackArray: ShuraParticleSpawnModuleBase[]) {
        this.particleSpawnStack = [...particleSpawnStackArray]
    }

    public setParticleUpdateStack(particleUpdateStack: ShuraParticleUpdateModuleBase[]) {
        this.particleUpdateStack = [...particleUpdateStack, new ShuraParticleUpdateModule()]
    }

    public spawnParticles(amount: number) {
        for (let i = 0; i < amount; i++) {
            this.spawnSingleParticle();
        }
    }

    public updateEmitter(delta: number, shouldSpawnParticles=true) {
        if (this.settings.autoDestroyAfterLifetime && !this.destroyed && this.isKilled && this.particles.length === 0) 
            this.destroy();

        //@ts-ignore
        if (this.settings.lifetime != -1 && this.elapsedTime >= this.settings.lifetime)
            this.isKilled = true;

        this.elapsedTime += delta;

        const frameState: ShuraSystemFrameState = {
            spawnCount: 0
        }; 

        this._internal_handleEmitterUpdate(frameState, delta)
        //now spawn stuff
        if (shouldSpawnParticles) this._internal_SpawnParticles(frameState);

        this._internal_handleUpdateParticle(delta);

        // this.update();
    }

    private _internal_handleEmitterUpdate(frameState: ShuraSystemFrameState, delta: number) {
        this.emitterUpdateStack.forEach(element => {
            if (!this.isKilled)
                element.execute(frameState, delta); 
        });
    }

    private _internal_handleUpdateParticle(delta: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            this.particleUpdateStack.forEach(updateModule => {
                updateModule.execute(particle, delta);
            });

            if (particle.lifetime !== -1 && particle.lifetime < 0) {
                this.removeChild(particle); 
                this.particles.splice(i, 1);  
            }
        }
    }

    private _internal_SpawnParticles(frameState: ShuraSystemFrameState) {
        if (this.isKilled) return;
        for (let i = 0; i < frameState.spawnCount; i++) {
            this.spawnSingleParticle();
        }
    }

    spawnSingleParticle() {
        const particle = new ShuraParticle({
            texture: PIXI.Texture.WHITE,
            x: this.emitPos.x,
            y: this.emitPos.y,
        });

        particle.anchor.set(0.5, 0.5) 
        particle.scaleX = 10
        particle.scaleY = 10
        particle.unitScale = this.unitScale
        particle.emittedPos = this.emitPos;

        this.particleSpawnStack.forEach(spawnModule => {
            spawnModule.execute(particle);
        });

        this.particles.push(particle);
        this.addChild(particle)
    }
}