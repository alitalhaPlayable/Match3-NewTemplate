import { playSound, stopSound, playBgMusic, stopBgMusic, setBgMusicVolume } from "utils";

export class AudioManager {
	static playSound(id: string, loop = false, volume = 1, rate = 1): number {
		return playSound(id, loop, volume, rate);
	}

	static stopSound(id: number | string): void {
		return stopSound(id);
	}

	static playBgMusic(): void {
		return playBgMusic();
	}

	static stopBgMusic(): void {
		return stopBgMusic();
	}

	static setBgMusicVolume(volume: number): void {
		return setBgMusicVolume(volume);
	}
}

export class studioUtils {
	static audio = AudioManager;

	// Instance methods for interface compatibility
	get audio() {
		return studioUtils.audio;
	}
}

export default studioUtils;
