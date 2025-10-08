//@ts-nocheck
import { decodeBase122 } from "core/utils";
import { Howl } from "howler";

class Music extends Howl {
	key: string;
	canPlayMultipleTimes: boolean;

	constructor(src: string, loop: boolean = true, volume: number = 0.5, canPlayMultipleTimes: boolean = true) {
		super({
			src: [decodeBase122(src)],
			loop,
			volume,
		});
		this.canPlayMultipleTimes = canPlayMultipleTimes;
	}
	play(spriteId?: string | undefined): number {
		if (this.playing() && !this.canPlayMultipleTimes) {
			return 0;
		}
		return super.play();
	}

	stop() {
		super.stop();
	}
}

export default Music;
