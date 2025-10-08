// This file contains the actual implementations
// It's not included in the main tsconfig, so TypeScript won't scan it

import { Event as _Event } from "../core/libs/pixi/utils/EventHelper";
import { redirectToStore as _redirectToStore, gameFinished as _gameFinished } from "../core/libs/pixi/utils/Utils";

import AudioManager from "../core/libs/common/general/audios/audios";

import GUIHelper from "../core/libs/common/general/guiHelper";

// Re-export the actual implementations
export const Event = _Event;
export const redirectToStore = _redirectToStore;
export const gameFinished = _gameFinished;

export const playSound = AudioManager.playSound.bind(AudioManager);
export const stopSound = AudioManager.stopSound.bind(AudioManager);
export const playBgMusic = AudioManager.playBgMusic.bind(AudioManager);
export const stopBgMusic = AudioManager.stopBgMusic.bind(AudioManager);
export const setBgMusicVolume = AudioManager.setBgMusicVolume.bind(AudioManager);

export { GUIHelper };

export function addGuiHelper({ stats = false, lights = false, background = false }: { stats?: boolean; lights?: boolean; background?: boolean }) {
	GUIHelper.init();

	setTimeout(() => {
		if (stats) GUIHelper.initStats();
		if (background) GUIHelper.addBackgroundThings();
		if (lights) GUIHelper.addLightsGui();
	}, 1);
}
