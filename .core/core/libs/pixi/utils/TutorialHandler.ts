import gsap from "gsap";
import globals from "@globals";
import { Container, IRenderLayer, Point, RenderLayer } from "pixi.js";

export type TutorialHandlerSettings = {
	idleTime: number;
	startDelay: number;
	repeatDelay: number;
	stopAfterGameOver: boolean;
	resetOnPointerDown: boolean;
	resetOnResize: boolean;
	handOffset: { x: number; y: number };
	alwaysOnTop: boolean;
};

export class TutorialHandler {
	target: Container | null = null;
	settings: TutorialHandlerSettings = {
		idleTime: 1.0,
		startDelay: 1.0,
		repeatDelay: 0.4,
		stopAfterGameOver: true,
		resetOnPointerDown: true,
		resetOnResize: true,
		handOffset: { x: 0, y: 0 },
		alwaysOnTop: true,
	};

	alreadyWorking = false;
	finished = false;
	tutorialTimeline = gsap.timeline();
	countdown: gsap.core.Tween | null = null;

	isBuilding = false;
    animQueue: any[] = []
	renderLayer: IRenderLayer = new RenderLayer();

	onHideTutorial: () => void = () => {};
	onStartTutorial: ()=> void = () => {};

	constructor(settings?: TutorialHandlerSettings) {
		this.settings = {
			...this.settings,
			...settings,
		};

		if (this.settings.resetOnPointerDown) {
			window.addEventListener("pointerdown", this.onPointerDown.bind(this));
		}

        gsap.delayedCall(this.settings.startDelay, ()=>{
            this.startTutorial();
        })

		if (this.settings.resetOnResize) {
			window.addEventListener("resize",()=>{
				this.resetTutorial();
			})
		}

		if (this.settings.stopAfterGameOver) {
			globals.eventEmitter.on("_internal_gameOver",()=>{
				this.finishTutorial();
			})
		}

	}
	
	onGameOver() {
		this.finishTutorial();
		window.removeEventListener("pointerdown", this.onPointerDown.bind(this));
	}
	
	onPointerDown() {
		this.resetTutorial();
	}
	
	setHand(hand: Container) {
		this.target = hand;
		hand.alpha = 0;
		if (this.target) this.target.eventMode = "none";
		if (this.settings.alwaysOnTop) {
			let root = this.target;
			while (root.parent) {
				root = root.parent;
			}
	
			root.addChild(this.renderLayer)
			this.renderLayer.attach(this.target);
		}
	}

	resetTutorial() {
		if (this.finished) return;
		this.onHideTutorial?.();
		//reset hand and hand anims
		this.tutorialTimeline && this.tutorialTimeline.kill();
		const tweens = gsap.getTweensOf(this.target);
		tweens.forEach(element=>element.progress(0))
		gsap.killTweensOf(this.target);
		
		if (this.target) this.target.alpha = 0;

		//reset countdown
		this.countdown && this.countdown.kill();

		this.alreadyWorking = false;
		this.startTutorialCountdown();
	}

	finishTutorial() {
		this.finished = true;
		this.onHideTutorial?.();

		this.tutorialTimeline && this.tutorialTimeline.kill();
		if (this.target) this.target.alpha = 0;

		gsap.killTweensOf(this.target);

		if (this.target) this.target.visible = false;
		this.alreadyWorking = false;

		//kill countdown
		this.countdown && this.countdown.kill();
	}

	startTutorialCountdown(immediate = false) {
		if (this.finished) return;
		this.countdown = gsap.delayedCall(immediate ? 0 : this.settings.idleTime, () => {
			this.startTutorial();
		});
	}

	resetAnimations() {
		this.animQueue.length = 0;
	}

    clickOn(node: any, settings?: gsap.TweenVars) {
        this.animQueue.push({type: "clickon", settings: {node, settings}})   
        return this;
    }

    goto(node: any, settings?: gsap.TweenVars) {
        this.animQueue.push({type: "goto", settings: {node, settings}})   
        return this;
    }

	async _clickOn(node: any, settings?: gsap.TweenVars) {
        return new Promise<void>(async (resolve, err)=>{
            if (!this.target) return;
            this.raiseBuildingFlag();
            const nodeLocalPos = this.target?.parent.toLocal(node, node.parent);
            
            this.target.x = (nodeLocalPos?.x ?? this.target.x) + this.settings.handOffset.x;
            this.target.y = (nodeLocalPos?.y ?? this.target.y) + this.settings.handOffset.y;
    
            const defaultSettings = {
                pixi: {
                    scale: "-=0.1",
                },
                duration: 0.2,
                yoyo: true,
                repeat: 3,
                ease: "sine.inOut",
            };
    
    
            await gsap.to(this.target, {
                ...defaultSettings,
                ...settings,
            });

            resolve();
        })
	}

    async _goto(node: any, settings?: gsap.TweenVars) {
        return new Promise<void>(async (resolve, err)=>{
            if (!this.target) return;
            this.raiseBuildingFlag();
            const nodeLocalPos = this.target?.parent.toLocal(node, node.parent);

            const defaultSettings = {
                x: (nodeLocalPos?.x ?? this.target.x) + this.settings.handOffset.x,
                y: (nodeLocalPos?.y ?? this.target.y) + this.settings.handOffset.y,
                duration: 0.3,
                ease: "sine.inOut",
            };

            await gsap.to(this.target, {
                ...defaultSettings,
                ...settings,
            });

            resolve()
        })
	}

	async _fadein() {
		return new Promise<void>(async (resolve, err)=>{
            if (!this.target) return;
            const defaultSettings = {
				alpha: 1,
                duration: 0.2,
                ease: "sine.inOut",
            };

            await gsap.to(this.target, {
                ...defaultSettings,
            });

            resolve()
        })
	}

	async _fadeout() {
		return new Promise<void>(async (resolve, err)=>{
            if (!this.target) return;
            const defaultSettings = {
				alpha: 0,
                duration: 0.2,
                ease: "sine.inOut",
            };

            await gsap.to(this.target, {
                ...defaultSettings,
            });

            resolve()
        })
	}


	raiseBuildingFlag() {
		if (!this.isBuilding) {
			this.isBuilding = true;
			//reset timeline
			this.tutorialTimeline = gsap.timeline({ repeat: -1, repeatDelay: this.settings.repeatDelay });
		} 
	}

	async play() {
        return new Promise<void>(async (resolve, err)=>{
            for (let i = 0;i<this.animQueue.length;i++) {
                const element = this.animQueue[i];
				if (i === 0) {
                    this._fadein()
				}
    
                switch (element.type) {
                    case "clickon":
                        await this._clickOn(element.settings.node, element.settings.settings)
                        break;
                    case "goto":
                        await this._goto(element.settings.node, element.settings.settings)
                        break;
                }

				if (!this.alreadyWorking) break;
            }

			await this._fadeout();
			resolve()
        })
    }

	async playLoop() {
		const temp = {x: 0}
		while (this.alreadyWorking) {
			temp.x = 0;
			await this.play();
			await gsap.to(temp, {x: 1, duration: this.settings.repeatDelay})
		}
	}

	async startTutorial() {
		if (this.finished) return;
		if (this.alreadyWorking) return;

		this.alreadyWorking = true;
		
		this.onStartTutorial?.();
		//todo: start the already built timeline
        await this.playLoop();
	}
}
