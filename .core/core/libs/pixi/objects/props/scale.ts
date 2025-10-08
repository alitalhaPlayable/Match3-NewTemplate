
export interface ScaleType {
	x: number;
	y: number;
}
export interface Scalable {
	get scale(): ScaleType;
	set scale(value: ScaleType);
	get scaleX(): number;
	set scaleX(value: number);
	get scaleY(): number;
	set scaleY(value: number);
	setScale(x: number, y: number): void;
}

class Scale implements ScaleType {
	gameObject: Scalable;
	constructor(gameObject: Scalable) {
		this.gameObject = gameObject;
	}

	set(x: number, y: number) {
		this.gameObject.setScale(x, y);
	}

	get() {
		return this.gameObject.scale;
	}

	set x(value) {
		this.gameObject.scaleX = value;
	}

	get x() {
		return this.gameObject.scaleX;
	}

	set y(value) {
		this.gameObject.scaleY = value;
	}

	get y() {
		return this.gameObject.scaleY;
	}
}

export default Scale;
