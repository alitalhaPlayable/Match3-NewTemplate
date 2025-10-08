import globals from "@globals";
import gsap from "gsap";

export function redirectToStore() {
	app.main.gotoLink();
}

export function gameFinished(didWon: boolean) {
	app.main.gameFinished(didWon);
	const handlePointerDown = () => {
		if (app.data.endCardFullScreenClick) {
			globals.pixiScene.eventMode = "static";
			globals.pixiScene.hitArea = globals.pixiApp.screen;
			const eventType = app.type === "moloco" ? "pointerup" : "pointerdown";
			globals.pixiScene.on(eventType, () => {
				app.main.gotoLink();
			});
		}
	};

	const handleGoToMarket = () => {
		if (app.data.goToMarketDirectly) {
			app.main.gotoLink();
		}
	};

	gsap.delayedCall(0.2, handlePointerDown);
	gsap.delayedCall(2, handleGoToMarket);

	if (app.data.bannerHideOnEndCard) {
		if (globals.topBanner) {
			globals.topBanner.hide(app.data.bannerHideOnEndCardIsQuick);
		}
	}
} 