export interface SkewType {
	x: number;
	y: number;
}

export interface Skeweble {
	get skew(): SkewType;
	set skew(value: SkewType);
	get skewX(): number;
	set skewX(value: number);
	get skewY(): number;
	set skewY(value: number);
	setSkew(x: number, y: number): void;
}

class Skew implements SkewType {
	gameObject: Skeweble;
	constructor(gameObject: Skeweble) {
		this.gameObject = gameObject;
	}

	set(x: number, y: number) {
		this.gameObject.setSkew(x, y);
	}

	get() {
		return this.gameObject.skew;
	}

	set x(value) {
		this.gameObject.skewX = value;
	}

	get x() {
		return this.gameObject.skewX;
	}

	set y(value) {
		this.gameObject.skewY = value;
	}

	get y() {
		return this.gameObject.skewY;
	}
}

export default Skew;
