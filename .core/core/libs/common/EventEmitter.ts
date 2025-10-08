import * as PIXI from "pixi.js";

class EventEmitter extends PIXI.EventEmitter {
	private static instance: EventEmitter | null = null;

	static getInstance(): EventEmitter {
		if (!EventEmitter.instance) {
			EventEmitter.instance = new EventEmitter();
		}
		return EventEmitter.instance;
	}

	// public someMethod(): void {
	// 	console.log("Some method of the singleton class");
	// }
}

export default EventEmitter;
