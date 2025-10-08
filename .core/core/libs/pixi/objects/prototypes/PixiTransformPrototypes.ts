import * as PIXI from "pixi.js";

PIXI.Container.prototype.setScale = function setScale(x: number, y: number) {
	let _y = y;
	if (y === undefined) {
		_y = x;
	}
	this.scale.set(x, _y);
};

PIXI.Container.prototype.setOrigin = function setOrigin(x: number, y: number) {
	this.originX = x;
	this.originY = y;
};

Object.defineProperty(PIXI.Container.prototype, "originX", {
	get() {
		let originX = null;
		if (this.anchor) {
			originX = this.anchor.x;
		} else {
			originX = this.pivot.x / this.baseWidth;
		}

		return originX;
	},
	set(value: number) {
		if (this.type === "cell2D" || this.type === "layout2D") {
			this.pivot.x = value * this.baseWidth;
			return;
		}
		if (this.anchor) {
			this.anchor.x = value;
		} else {
			// const lb = this.getLocalBounds();
			// this.pivot.x = lb.x + lb.width * value;
			this.pivot.x = this.baseWidth * value;
			if (this.spineObj || this.type === "graphics") this.pivot.x = 0;
		}
	},
});

Object.defineProperty(PIXI.Container.prototype, "originY", {
	get() {
		let originY = null;
		if (this.anchor) {
			originY = this.anchor.y;
		} else {
			originY = this.pivot.y / this.baseHeight;
		}

		return originY;
	},
	set(value: number) {
		if (this.type === "cell2D" || this.type === "layout2D") {
			this.pivot.x = value * this.baseHeight;
			return;
		}

		if (this.anchor) {
			this.anchor.y = value;
		} else {
			// const lb = this.getLocalBounds();
			// this.pivot.y = lb.y + lb.height * value;
			this.pivot.y = this.baseHeight * value;
			if (this.spineObj || this.type === "graphics") this.pivot.y = 0;
		}
	},
});

PIXI.Container.prototype.setSkew = function setSkew(x: number, y: number) {
	let _y = y;
	if (y === undefined) {
		_y = x;
	}
	this.skew.set(x, _y);
};

Object.defineProperty(PIXI.Container.prototype, "scaleX", {
	get() {
		return this.scale.x;
	},
	set(value: number) {
		this.scale.x = value;
	},
});

Object.defineProperty(PIXI.Container.prototype, "scaleY", {
	get() {
		return this.scale.y;
	},
	set(value: number) {
		this.scale.y = value;
	},
});

Object.defineProperty(PIXI.Container.prototype, "skewX", {
	get() {
		return this.skew.x;
	},
	set(value: number) {
		this.skew.x = value;
	},
});

Object.defineProperty(PIXI.Container.prototype, "skewY", {
	get() {
		return this.skew.y;
	},
	set(value: number) {
		this.skew.y = value;
	},
});

Object.defineProperty(PIXI.Container.prototype, "top", {
	get() {
		return this.y - this.height * this.originY;
	},
	set(value: number) {
		this.y = value + this.height * this.originY;
	},
});

Object.defineProperty(PIXI.Container.prototype, "bottom", {
	get() {
		return this.y + this.height * (1 - this.originY);
	},
	set(value: number) {
		this.y = value - this.height * (1 - this.originY);
	},
});

Object.defineProperty(PIXI.Container.prototype, "left", {
	get() {
		return this.x - this.width * this.originX;
	},
	set(value: number) {
		this.x = value + this.width * this.originX;
	},
});

Object.defineProperty(PIXI.Container.prototype, "right", {
	get() {
		return this.x + this.width * (1 - this.originX);
	},
	set(value: number) {
		this.x = value - this.width * (1 - this.originX);
	},
});

export default () => {
	return null;
};
