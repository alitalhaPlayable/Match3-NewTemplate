//@ts-nocheck
import { decodeBase122 } from "core/utils";
import { Howl } from "howler";

class SoundSprite {
	sound: Howl;
	volume: number;
	list: any = {};
	playedList: any = {};

	constructor(src: string, json: any, volume: number = 1) {
		let sprite: any = {};
		const spritemap = json.spritemap;
		for (let prop in spritemap) {
			let s = spritemap[prop];
			let start = s.start * 1000;
			let duration = Math.ceil(s.end * 1000 - start);
			let loop = s.loop;
			if (duration < 0.1 && !loop) {
				duration += 0.5;
			}
			sprite[prop] = [start, duration, loop];
		}

		this.list = sprite;

		this.sound = new Howl({
			src: [decodeBase122(src)],
			sprite,
			volume,
		});
		this.volume = volume;
	}

	has(name: string): boolean {
		return this.list[name] !== undefined;
	}

	play(name: string, loop: boolean | undefined = undefined, volume: number | undefined = undefined, rate: number = 1): number {
		if (!this.has(name)) {
			console.error(`SoundSprite:play: sound not found: ${name}`);
			return -1;
		}
		const id = this.sound.play(name);
		this.sound.volume(volume === undefined ? this.volume : volume, id);
		if (loop !== undefined) {
			this.sound.loop(loop, id);
		}
		this.sound.rate(rate, id);

		if (!this.playedList[name]) {
			this.playedList[name] = [];
		}
		this.playedList[name].push(id);
		return id;
	}

	stop(id: number | string): void {
		if (typeof id === "string") {
			if (this.playedList[id]) {
				this.playedList[id].forEach((id: number) => {
					this.sound.stop(id);
				});
				this.playedList[id] = [];
			}
			return;
		}
		this.sound.stop(id);
	}

	fadeOut(id: number, duration: number): void {
		this.sound.fade(1, 0, duration, id);
	}
}

export default SoundSprite;
