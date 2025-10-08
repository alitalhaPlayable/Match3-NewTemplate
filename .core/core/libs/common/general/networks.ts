import Time from "./time";

export interface MainConfig {
	totalTime?: number;
	nucleo?: any;
	tapjoy?: any;
	enableCustomPreloader?: boolean;
	networkReady?: () => void;
	gamePaused?: () => void;
	gameContinue?: () => void;
	soundChanged?: (soundEnabled: boolean) => void;
	gameResized?: (w: number, h: number) => void;
	timeUp?: () => void;
}

class TemplateMain {
	soundEnabled: boolean = true;
	config: MainConfig;
	time: Time;
	sysTime: Time;
	networkHelper: any;
	isNetworkReady: boolean = false;
	gamePaused: boolean = false;
	timeStarted: boolean = false;
	state: number = 0;
	firstInteracted: boolean = false;
	wentMarket: boolean = false;

	constructor(config: MainConfig) {
		this.config = config;

		this.time = new Time(config.totalTime || 0);
		this.sysTime = new Time(0);

		if (window.pfNetworkHelper) {
			const callbacks = {
				gameStart: () => {
					this.networkReady();
				},
				pauseGame: () => {
					this.pauseGame();
				},
				resumeGame: () => {
					this.resumeGame();
				},
				soundChange: (soundEnabled: boolean) => {
					this.soundChange(soundEnabled);
				},
				resize: (w: number, h: number) => {
					this.resize(w, h);
				},
				showEndCard: () => {
					// show end card here
				},
			};

			const networkData = {
				nucleo: config.nucleo,
				tapjoy: config.tapjoy,
			};

			const cons = window.pfNetworkHelper.default || window.pfNetworkHelper;

			this.networkHelper = new cons(window.app.type, null, callbacks, networkData);
		} else {
			// this.isNetworkReady = true;

			setTimeout(() => {
				this.networkReady();
			}, 250);

			window.addEventListener("resize", () => {
				const width = window.innerWidth;
				const height = window.innerHeight;

				this.resize(width, height);
			});

			window.addEventListener("blur", this.pauseGame.bind(this));
			window.addEventListener("focus", this.resumeGame.bind(this));
		}
	}

	hidePreloader() {
		let preloader: HTMLElement | null;

		if (window.app.data.enableCustomPreloader) {
			preloader = document.getElementById("custom-preloader-pf");
		} else {
			preloader = document.getElementById("preloader-pf") || document.getElementById("preloader-gear");
		}
		if (preloader) {
			preloader.classList.add("hide");

			setTimeout(() => {
				preloader?.remove();
			}, 500);
		}
	}

	networkReady() {
		this.isNetworkReady = true;
		this.config.networkReady && this.config.networkReady();
	}

	gameInited() {
		if (this.networkHelper) {
			this.networkHelper.gameInited();
			this.networkHelper.startResponsive();
		}
	}

	gameStarted() {
		if (this.networkHelper) {
			this.networkHelper.gameStarted();
		}
	}

	pauseGame() {
		this.time.stop();
		this.sysTime.stop();
		this.gamePaused = true;

		this.config.gamePaused && this.config.gamePaused();
	}

	resumeGame() {
		this.time.resume();
		this.sysTime.resume();
		this.gamePaused = false;

		this.config.gameContinue && this.config.gameContinue();
	}

	soundChange(soundEnabled: boolean) {
		this.soundEnabled = soundEnabled;

		this.config.soundChanged && this.config.soundChanged(this.soundEnabled);
	}

	resize(w: number, h: number) {
		this.config.gameResized && this.config.gameResized(w, h);
	}

	startTimer() {
		if (this.timeStarted) return;
		this.time.start();
		this.timeStarted = true;
	}

	resizeNow() {
		if (this.networkHelper) {
			this.networkHelper.resize();
		} else {
			this.resize(window.innerWidth, window.innerHeight);
		}
	}

	update() {
		this.time.update();
		// let timeIncreased = this.sysTime.update(this.networkHelper);

		if (this.state === 3 && this.time.checkTimeUp()) {
			this.state = 4;
			this.config.timeUp && this.config.timeUp();
		}
	}

	restartGame(newTime: number = 0) {
		this.time.reset(newTime);
		this.sysTime.reset(0);
		this.state = 3;

		this.networkHelper && this.networkHelper.gameRestarted();
	}

	interacted() {
		this.networkHelper && this.networkHelper.interacted();

		if (!this.firstInteracted) {
			this.firstInteracted = true;
			this.time.start();
		}
	}

	gameFinished(didWon: boolean, reason?: string, autoRedirect: boolean = false) {
		const analyticsTime = this.sysTime.getAnalyticsTime();
		this.networkHelper && this.networkHelper.gameFinished(didWon, reason, analyticsTime, autoRedirect);
	}

	openMarket() {
		if (this.networkHelper) {
			this.networkHelper.openMarket();
		} else {
			window.open(window.lp_url);
		}
	}

	openMarketFinal() {
		if (this.networkHelper) {
			this.networkHelper.openMarketFinal();
		} else {
			window.open(window.lp_url);
		}
	}

	gotoLink(goMarketOnce: boolean = false) {
		if (window.app.data.gotoMarketOnce && this.wentMarket && goMarketOnce) {
			return;
		}
		this.wentMarket = true;
		this.openMarket();
	}
}

export default TemplateMain;
