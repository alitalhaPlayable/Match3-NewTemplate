import globals from "@globals";
import Music from "./music";
import SoundSprite from "./soundSprite";

// @ts-ignore
import { Howler } from "howler";
import data from "@src/params";
window.Howler = Howler;

type AudioItem = {
	id: string;
	key: string;
	type: "sound" | "audioSprite";
	src: string;
	json?: any;
	loop?: boolean | undefined;
	fromDataJs?: boolean;
	isBgMusic?: boolean;
};

class AudioManager {
	static bgMusic: Music | null = null;
	static oldSFX: SoundSprite | null = null;
	static ttsList: any = {};
	static customSfxList: any = {};

	static musics: { [key: string]: Music } = {};
	static sfx: SoundSprite | null = null;

	static init() {
		const data = globals.data;

		if (!data.soundEnabled) {
			return;
		}

		if (data.musicSrc) {
			const music = new Music(data.musicSrc, true, data.musicVolume);
			this.bgMusic = music;
		}

		if (data.sfxSrc) {
			this.oldSFX = new SoundSprite(data.sfxSrc, data.sfxJson, data.sfxVolume);
		}

		// #if process.projConfig.generalSettings.enableAudio
		this.loadSounds();
		// #endif

		const customSounds: { [key: string]: { src: string | null; volume: number } } = {
			/* win: {
				src: data.winSoundSrc,
				volume: data.winSoundVolume,
			}, */
		};

		for (let key in customSounds) {
			let sound = customSounds[key] as any;
			if (!sound.src) {
				continue;
			}

			let soundData = new Howl({
				src: [sound.src],
				loop: false,
				volume: sound.volume ?? 1,
			});
			this.customSfxList[key] = soundData;
		}

		this.initTTS(data.ttsVolume);
	}

	static loadSounds() {
		const audioToLoad: AudioItem[] = [];
		const audioData = app.data.___audioData || {};
		audioToLoad.push(...(Object.values(audioData) as AudioItem[]));

		const bgMusicNames = ["bgm", "music", "bgMusic", "backgroundMusic", "bg"];

		audioToLoad.forEach((audio: AudioItem) => {
			if (audio.type === "sound") {
				if (audio.fromDataJs && !audio.src.startsWith("data:")) {
					audio.src = app.data[audio.src];
				}
				const music = new Music(audio.src, audio.loop, 1);
				music.key = audio.key;
				this.musics[audio.id] = music;
				if (!this.bgMusic && (bgMusicNames.includes(audio.key) || audio.isBgMusic)) {
					this.bgMusic = music;
				}
			} else if (audio.type === "audioSprite") {
				this.sfx = new SoundSprite(audio.src, audio.json, app.data.sfxVolume);
			}
		});
	}

	static initTTS(ttsVolume: number = 1) {
		const data = globals.data;

		const list = [];

		for (let prop in data) {
			// @ts-ignore
			if (data[prop] && data[prop].tts) {
				list.push(prop);
			}
		}

		for (let name of list) {
			let rawName = name;
			// @ts-ignore
			let src = data[name].tts.data as string;

			if (src) {
				var sound = new Howl({
					src: [src],
					loop: false,
					volume: ttsVolume,
				});

				let sd = {
					sound,
					name,
					rawName,
				};

				this.ttsList[rawName] = sd;
				this.ttsList[name] = sd;
			}
		}
	}

	static playTTS = (name: string, completeCallback: () => {}) => {
		let soundData = this.ttsList[name];

		if (soundData) {
			let fullName = soundData.name;
			let count = window.app.data[fullName + "Count"] || 1;

			let sound = soundData.sound;
			sound.play();

			sound.on("end", () => {
				count--;
				if (count > 0) {
					sound.play();
				} else {
					completeCallback && completeCallback();
				}
			});
			return sound;
		} else {
			completeCallback && completeCallback();
		}

		return;
	};

	static changeBgMusic(key: string, resume: boolean = false, loop: boolean = true, volume: number = 1) {
		let musicTime;

		if (resume && this.bgMusic) {
			musicTime = this.bgMusic.seek();
			this.bgMusic.stop();
		}

		const music = Object.values(this.musics).find((music) => music.key === key);
		if (music) {
			this.bgMusic = music;
			this.bgMusic.canPlayMultipleTimes = false;
			this.bgMusic.volume(volume);
			this.bgMusic.loop(loop);
			this.bgMusic.play();
			if (musicTime) {
				this.bgMusic.seek(musicTime);
			}
		} else {
			console.error("[Change Bg Music] Music not found", key);
		}
	}

	static playBgMusic() {
		if (this.bgMusic) {
			this.bgMusic.canPlayMultipleTimes = false;
			this.bgMusic.volume(app.data.musicVolume);
			this.bgMusic.loop(true);
			this.bgMusic.play();
		}
	}

	static setBgMusicVolume(volume: number) {
		if (this.bgMusic) {
			this.bgMusic.volume(volume);
		}
	}

	static stopBgMusic() {
		if (this.bgMusic) {
			this.bgMusic.stop();
		}
	}

	static playSfx(spriteId: string, loop: boolean = false, volume: number | undefined = undefined, rate: number = 1): number {
		return this.playSound(spriteId, loop, volume, rate);
	}

	static stopSfx(id: number | string) {
		this.stopSound(id);
	}

	static isSoundPlaying(id: string): boolean {
		if (this.customSfxList[id]) {
			return this.customSfxList[id].playing();
		}

		if (this.sfx && this.sfx.has && this.sfx.has(id)) {
			const playedIds = this.sfx.playedList?.[id];
			if (Array.isArray(playedIds) && playedIds && playedIds.length > 0) {
				return playedIds.some((pid: number) => this.sfx?.sound.playing(pid));
			}
		}

		if (this.oldSFX && this.oldSFX.has && this.oldSFX.has(id)) {
			const playedIds = this.oldSFX.playedList?.[id];
			if (Array.isArray(playedIds) && playedIds && playedIds.length > 0) {
				return playedIds.some((pid: number) => this.oldSFX?.sound.playing(pid));
			}
		}

		const music = Object.values(this.musics).find((music) => music.key === id);
		if (music && music.playing) {
			return music.playing();
		}

		return false;
	}

	static playSoundInternal(id: string, loop: boolean | undefined = undefined, volume: number | undefined = undefined, rate: number = 1) {
		if (app.data.sfxEnabled === false) {
			return -1;
		}

		volume = volume ?? data.sfxVolume;

		const sound = Object.values(this.musics).find((music) => music.key === id);
		if (sound) {
			sound.volume(volume);
			if (loop) {
				sound.loop(loop);
			}
			sound.rate(rate);
			return sound.play();
		}

		return -1;
	}

	static playSound(id: string, loop: boolean | undefined = undefined, volume: number | undefined = undefined, rate: number = 1) {
		if (!app.data.sfxEnabled) return;
		if (volume !== undefined) {
			volume = volume * data.sfxVolume;
		} else {
			volume = data.sfxVolume;
		}

		if (this.customSfxList[id]) {
			return this.customSfxList[id].play();
		}

		if (this.sfx && this.sfx.has(id)) {
			return this.sfx.play(id, loop, volume, rate);
		}

		if (this.oldSFX && this.oldSFX.has(id)) {
			return this.oldSFX.play(id, loop, volume, rate);
		}

		return this.playSoundInternal(id, loop, volume, rate);
	}

	static stopSound(id: number | string) {
		if (this.customSfxList[id]) {
			return this.customSfxList[id].stop();
		}

		if (typeof id === "string") {
			if (this.sfx && this.sfx.has(id)) {
				return this.sfx.stop(id);
			}

			if (this.oldSFX && this.oldSFX.has(id)) {
				return this.oldSFX.stop(id);
			}
			const sound = Object.values(this.musics).find((music) => music.key === id);
			if (sound) {
				sound.stop();
			}
		} else {
			if (this.sfx) {
				this.sfx.stop(id);
			}

			if (this.oldSFX) {
				this.oldSFX.stop(id);
			}
		}
	}

	static muteAll() {
		Howler.mute(true);
	}

	static unmuteAll() {
		Howler.mute(false);
	}
}

export default AudioManager;
