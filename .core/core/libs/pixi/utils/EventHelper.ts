import EventEmitter from "../../common/EventEmitter";

export class Event {
	private static eventEmitter = EventEmitter.getInstance();

	static get(): EventEmitter {
		return this.eventEmitter;
	}

	static on(event: string, listener: (...args: any[]) => void, context?: any): Event {
		this.eventEmitter.on(event, listener, context);
		return this;
	}

	static off(event: string, listener?: (...args: any[]) => void, context?: any): Event {
		this.eventEmitter.off(event, listener, context);
		return this;
	}

	static once(event: string, listener: (...args: any[]) => void, context?: any): Event {
		this.eventEmitter.once(event, listener, context);
		return this;
	}

	static emit(event: string, ...args: any[]): Event {
		this.eventEmitter.emit(event, ...args);
		return this;
	}

	static removeAllListeners(event?: string): Event {
		this.eventEmitter.removeAllListeners(event);
		return this;
	}

	static listenerCount(event: string): number {
		return this.eventEmitter.listenerCount(event);
	}

	static eventNames(): (string | symbol)[] {
		return this.eventEmitter.eventNames();
	}
} 