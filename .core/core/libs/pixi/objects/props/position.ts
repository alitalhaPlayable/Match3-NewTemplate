export interface Positionable {
	position: { x: number; y: number };
	positionX: number;
	positionY: number;
	setPosition(x: number, y: number): void;
}

class Position {
	gameObject: Positionable;

	constructor(gameObject: Positionable) {
		this.gameObject = gameObject;
	}

	set(x: number, y: number) {
		this.gameObject.setPosition(x, y);
	}

	get() {
		return this.gameObject.position;
	}

	set x(value) {
		this.gameObject.positionX = value;
	}

	get x() {
		return this.gameObject.positionX;
	}

	set y(value) {
		this.gameObject.positionY = value;
	}

	get y() {
		return this.gameObject.positionY;
	}
}

export default Position;
