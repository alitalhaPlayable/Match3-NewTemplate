type Vector2 = { x: number; y: number };

class MathHelper {
	/**
	 * Twice PI.
	 * @property {number}
	 * @default ~6.283
	 */
	static PI2 = Math.PI * 2;

	/**
	 * Half PI.
	 * @property {number}
	 * @default ~1.570
	 */
	static HALF_PI = Math.PI * 0.5;

	/**
	 * Degrees to Radians factor.
	 * @property {number}
	 */
	static DEG_TO_RAD = Math.PI / 180;

	/**
	 * Degrees to Radians factor.
	 * @property {number}
	 */
	static RAD_TO_DEG = 180 / Math.PI;

	constructor() {}

	/**
	 * Find distance and rotation between 2 points in 2d space
	 * @param {Vector2} p0 with x,y position
	 * @param {Vector2} p1 with x,y position
	 * @returns {Object} with distance and rotation
	 */
	static findDistRot(p0: Vector2, p1: Vector2): { distance: number; rotation: number } {
		let dx = p1.x - p0.x;
		let dy = p1.y - p0.y;

		let distance = Math.sqrt(dx * dx + dy * dy);
		let rotation = Math.atan2(dy, dx);

		return { distance, rotation };
	}

	static getRandomNumber(first: number, last: number): number {
		return Math.floor(Math.random() * (first - last)) + last;
	}

	/**
	 * Find distance between 2 points in 2d space
	 * @param {Vector2} point with x,y position
	 * @param {Vector2} point with x,y position
	 * @returns {number}
	 */
	static findDist(p0: Vector2, p1: Vector2): number {
		let dx = p1.x - p0.x;
		let dy = p1.y - p0.y;

		let dist = Math.sqrt(dx * dx + dy * dy);

		return dist;
	}

	/**
	 * Find rotation between 2 points in 2d space
	 * @param {Vector2} point with x,y position
	 * @param {Vector2} point with x,y position
	 * @returns {number}
	 */
	static findRot(p0: Vector2, p1: Vector2): number {
		let dx = p1.x - p0.x;
		let dy = p1.y - p0.y;

		let rot = Math.atan2(dy, dx);
		return rot;
	}

	/**
	 * Converts radian to degree
	 * @param {number} x Radian value
	 * @returns {number}
	 */
	static degToRad(x: number): number {
		return (x * Math.PI) / 180;
	}

	/**
	 * Convert radians to degrees.
	 *
	 *
	 * @param {number} radians - Angle in radians.
	 * @return {number} Angle in degrees
	 */
	static radToDeg(radians: number): number {
		return radians * this.RAD_TO_DEG;
	}

	/**
	 *
	 * @param {number} v0 Initial Value
	 * @param {number} v1 Next Value
	 * @param {number} a interpolation factor
	 */
	static lerp(v0: number, v1: number, a: number): number {
		return (1 - a) * v0 + a * v1;
	}

	/**
	 *
	 * @param {number} from rotation
	 * @param {number} to rotation
	 * @param {number} a interpolation factor
	 */
	static lerpRot(from: number, to: number, weight: number): number {
		return from + this.short_angle_dist(from, to) * weight;
	}

	static short_angle_dist(from: number, to: number): number {
		var max_angle = Math.PI * 2;
		var difference = (to - from) % max_angle;
		return ((2 * difference) % max_angle) - difference;
	}

	/**
	 * Returns a random float in the range `[min, max)`. If these parameters are not in order than they will be put in order.
	 * Default is 0 for `min` and 1 for `max`.
	 *
	 * @param {number} min - The minimum value. Must be a Number.
	 * @param {number} max - The maximum value. Must be a Number.
	 * @return {number} A floating point number between min (inclusive) and max (exclusive).
	 */
	static random(min: number, max: number): number {
		if (min === undefined) {
			min = 0;
		}
		if (max === undefined) {
			max = 1;
		}

		if (min === max) {
			return min;
		}

		if (min > max) {
			var temp = min;
			min = max;
			max = temp;
		}

		return Math.random() * (max - min) + min;
	}

	/**
	 * Returns a random integer in the range `[min, max]`. If these parameters are not in order than they will be put in order.
	 * Default is 0 for `min` and 1 for `max`.
	 *
	 * @param {number} min - The minimum value. Must be a Number.
	 * @param {number} max - The maximum value. Must be a Number.
	 * @return {number} An integer between min (inclusive) and max (inclusive).
	 */
	static between(min: number, max: number): number {
		if (min === undefined) {
			min = 0;
		}
		if (max === undefined) {
			max = 1;
		}

		if (min === max) {
			return min;
		}

		if (min > max) {
			var temp = min;
			min = max;
			max = temp;
		}

		min = Math.ceil(min);
		max = Math.floor(max);

		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * Two number are fuzzyEqual if their difference is less than epsilon.
	 *
	 * @param {number} a - The first number to compare.
	 * @param {number} b - The second number to compare.
	 * @param {number} [epsilon=0.0001] - The epsilon (a small value used in the calculation)
	 * @return {boolean} True if |a-b|<epsilon
	 */
	fuzzyEqual(a: number, b: number, epsilon: number): boolean {
		if (epsilon === undefined) {
			epsilon = 0.0001;
		}

		return Math.abs(a - b) < epsilon;
	}

	/**
	 * Snap a value to nearest grid slice, using rounding.
	 *
	 * Example: if you have an interval gap of 5 and a position of 12... you will snap to 10 whereas 14 will snap to 15.
	 *
	 * @param {number} input - The value to snap.
	 * @param {number} gap - The interval gap of the grid.
	 * @param {number} [start=0] - Optional starting offset for gap.
	 * @return {number} The snapped value.
	 */
	static snapTo(input: number, gap: number, start: number): number {
		if (start === undefined) {
			start = 0;
		}

		if (gap === 0) {
			return input;
		}

		input -= start;
		input = gap * Math.round(input / gap);

		return start + input;
	}

	/**
	 * Snap a value to nearest grid slice, using floor.
	 *
	 * Example: if you have an interval gap of 5 and a position of 12... you will snap to 10.
	 * As will 14 snap to 10... but 16 will snap to 15.
	 *
	 * @param {number} input - The value to snap.
	 * @param {number} gap - The interval gap of the grid.
	 * @param {number} [start=0] - Optional starting offset for gap.
	 * @return {number} The snapped value.
	 */
	static snapToFloor(input: number, gap: number, start: number): number {
		if (start === undefined) {
			start = 0;
		}

		if (gap === 0) {
			return input;
		}

		input -= start;
		input = gap * Math.floor(input / gap);

		return start + input;
	}

	/**
	 * Snap a value to nearest grid slice, using ceil.
	 *
	 * Example: if you have an interval gap of 5 and a position of 12... you will snap to 15.
	 * As will 14 will snap to 15... but 16 will snap to 20.
	 *
	 * @param {number} input - The value to snap.
	 * @param {number} gap - The interval gap of the grid.
	 * @param {number} [start=0] - Optional starting offset for gap.
	 * @return {number} The snapped value.
	 */
	static snapToCeil(input: number, gap: number, start: number): number {
		if (start === undefined) {
			start = 0;
		}

		if (gap === 0) {
			return input;
		}

		input -= start;
		input = gap * Math.ceil(input / gap);

		return start + input;
	}

	/**
	 * Find the angle of a segment from (point1.x, point1.y) -> (point2.x, point2.y).
	 *
	 * @param {Vector2} point1 - The first point.
	 * @param {Vector2} point2 - The second point.
	 * @return {number} The angle between the two points, in radians.
	 */
	static angleBetweenPoints(point1: Vector2, point2: Vector2): number {
		return Math.atan2(point2.y - point1.y, point2.x - point1.x);
	}

	/**
	 * Reverses an angle.
	 * @param {number} angleRad - The angle to reverse, in radians.
	 * @return {number} The reverse angle, in radians.
	 */
	static reverseAngle(angleRad: number): number {
		return this.normalizeAngle(angleRad + Math.PI, true);
	}

	/**
	 * Normalizes an angle to the [0,2pi) range.
	 * @param {number} angleRad - The angle to normalize, in radians.
	 * @param {boolean} reverse - If the angle should be reversed.
	 * @return {number} The angle, fit within the [0,2pi] range, in radians.
	 */
	static normalizeAngle(angleRad: number, reverse: boolean): number {
		var result = angleRad % this.PI2;

		if (result < 0) {
			result += this.PI2;
		}

		if (reverse) {
			result = this.PI2 - result;
		}

		return result;
	}

	/**
	 * Adds the given amount to the value, but never lets the value go over the specified maximum.
	 *
	 * @param {number} value - The value to add the amount to.
	 * @param {number} amount - The amount to add to the value.
	 * @param {number} max - The maximum the value is allowed to be.
	 * @return {number} The new value.
	 */
	static maxAdd(value: number, amount: number, max: number): number {
		return Math.min(value + amount, max);
	}

	/**
	 * Subtracts the given amount from the value, but never lets the value go below the specified minimum.
	 *
	 * @param {number} value - The base value.
	 * @param {number} amount - The amount to subtract from the base value.
	 * @param {number} min - The minimum the value is allowed to be.
	 * @return {number} The new value.
	 */
	static minSub(value: number, amount: number, min: number): number {
		return Math.max(value - amount, min);
	}

	/**
	 * Ensures that the value always stays between min and max, by wrapping the value around.
	 *
	 * If `max` is not larger than `min` the result is 0.
	 *
	 * @param {number} value - The value to wrap.
	 * @param {number} min - The minimum the value is allowed to be.
	 * @param {number} max - The maximum the value is allowed to be, should be larger than `min`.
	 * @return {number} The wrapped value.
	 */
	static wrap(value: number, min: number, max: number): number {
		var range = max - min;

		if (range <= 0) {
			return 0;
		}

		var result = (value - min) % range;

		if (result < 0) {
			result += range;
		}

		return result + min;
	}

	/**
	 * Adds value to amount and ensures that the result always stays between 0 and max, by wrapping the value around.
	 *
	 * Values _must_ be positive integers, and are passed through Math.abs. See {@link Phaser.Math#wrap} for an alternative.
	 *
	 * @param {number} value - The value to add the amount to.
	 * @param {number} amount - The amount to add to the value.
	 * @param {number} max - The maximum the value is allowed to be.
	 * @return {number} The wrapped value.
	 */
	static wrapValue(value: number, amount: number, max: number): number {
		var diff;
		value = Math.abs(value);
		amount = Math.abs(amount);
		max = Math.abs(max);
		diff = (value + amount) % max;

		return diff;
	}

	/**
	 * Variation of Math.min that can be passed either an array of numbers or the numbers as parameters.
	 *
	 * Prefer the standard `Math.min` function when appropriate.
	 *
	 * @return {number} The lowest value from those given.
	 * @see {@link http://jsperf.com/math-s-min-max-vs-homemade}
	 */
	static min(): number {
		let data: any;
		if (arguments.length === 1 && typeof arguments[0] === "object") {
			data = arguments[0];
		} else {
			data = arguments;
		}

		for (var i = 1, min = 0, len = data.length; i < len; i++) {
			if (data[i] < data[min]) {
				min = i;
			}
		}

		return data[min];
	}

	/**
	 * Variation of Math.max that can be passed either an array of numbers or the numbers as parameters.
	 *
	 * Prefer the standard `Math.max` function when appropriate.
	 *
	 * @return {number} The largest value from those given.
	 * @see {@link http://jsperf.com/math-s-min-max-vs-homemade}
	 */
	static max(): number {
		var data: any;
		if (arguments.length === 1 && typeof arguments[0] === "object") {
			data = arguments[0];
		} else {
			data = arguments;
		}

		for (var i = 1, max = 0, len = data.length; i < len; i++) {
			if (data[i] > data[max]) {
				max = i;
			}
		}

		return data[max];
	}

	/**
	 * Returns the length of this vector.
	 * 
	 * @param {Vector2} vector The vector from which the length is calculated.
	 * @returns {number} Magnitude value
	 */
	static findMagnitude(vector: Vector2) {
		return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
	}

	/**
	 * Normalizes the vector 
	 * 
	 * @param {Vector2} vector The vector that will be normalized 
	 * @returns {Vector2} Normalized Vector
	 */
	static normalizeVector(vector: Vector2) {
		const magn = MathHelper.findMagnitude(vector)
		return {x: vector.x/magn, y: vector.y/magn}
	}

	/**
	 * Calculates the dot product of 2 vectors 
	 * 
	 * Example usage:
	 * @example
	 * let dotProduct = MathHelper.dot({x: 1, y: 0}, {x: 1, y: 1}) 
	 * 
	 * @param {Vector2} vec1 first vector
	 * @param {Vector2} vec2 second vector
	 * @returns {number} Dot product value
	 */
	static dot(vec1: Vector2, vec2: Vector2) {
		return vec1.x * vec2.x + vec1.y * vec2.y;
	}

	/**
	 * Rotates the up vector given angle.
	 * 
	 * @example 
	 * //returns {x: -0.7, y: 0.7}
	 * let rotatedDir = MathHelper.makeDirectionGivenRotation(45, {x: 0, y: 1})
	 * 
	 * @param {number} rotationInAngles Rotation value in angles. 
	 * @param {Vector2} vectorUp Provide up vector. You could also just multiply the output with -1.
	 * @returns {Vector2} Rotated vector
	 */
	static makeDirectionGivenRotation(rotationInAngles : number, vectorUp = {x: 0, y: 1}) { //default arguments return error?
		let rotationMatrix = [
			[Math.cos(MathHelper.degToRad(rotationInAngles)), -Math.sin(MathHelper.degToRad(rotationInAngles))],
			[Math.sin(MathHelper.degToRad(rotationInAngles)),  Math.cos(MathHelper.degToRad(rotationInAngles))]
		] 
	
		let result = {
			x: rotationMatrix[0][0] * vectorUp.x + rotationMatrix[0][1] * vectorUp.y,
			y: rotationMatrix[1][0] * vectorUp.x + rotationMatrix[1][1] * vectorUp.y
		};
	
		return result;
	}

	/**
	 * Clamps the given number
	 * 
	 * @param {number} num Number to clamp 
	 * @param {number} min Minimum value
	 * @param {number} max Maximum value
	 * @returns {number} clamped number
	 */
	static clamp(num:number, min:number, max:number) {
		return Math.min(Math.max(min, num), max)
	}

	/**
	 * Remaps the current value from one range to an another. 
	 * e.g. [0,1] -> [5,10] 
	 * 
	 * @example
	 * //This returns a random number between 3,6.
	 * let output = MathHelper.remap(Math.random(), 0, 1, 3, 6)
	 * 
	 * @param {number} value Value
	 * @param {number} low1 Lowest value input value can get
	 * @param {number} high1 Highest value input value can get
	 * @param {number} low2 New lowest value input value can get
	 * @param {number} high2 New highest value input value can get
	 * @returns {number} Remapped value
	 */
	static remap(value: number, low1: number, high1: number, low2: number, high2: number) {
		return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
	}

	/**
	 * Generates an array of linearly spaced values between `startValue` and `stopValue`.
	 * 
	 * The function calculates equally spaced values starting from `startValue`, and ending at `stopValue`.
	 * The number of values in the array is determined by `cardinality`. If `cardinality` is 1, the array will
	 * contain only the `startValue`.
	 * 
	 * @param {number} startValue - The starting value of the range.
	 * @param {number} stopValue - The ending value of the range.
	 * @param {number} cardinality - The number of values to generate (inclusive of both start and stop values).
	 * 
	 * @returns {number[]} An array of `cardinality` values linearly spaced between `startValue` and `stopValue`.
	*/
	static linspace(startValue: number, stopValue: number, cardinality: number) {
		var arr = [];
		var step = (stopValue - startValue) / (cardinality - 1);
		for (var i = 0; i < cardinality; i++) {
		  arr.push(startValue + (step * i));
		}
		return arr;
	}

	/**
	 * Smooth linear interpolation
	 * 
	 * @param start start number
	 * @param end end number
	 * @param t interpolation var
	 * @param smoothFactor smoothing factor
	 * @returns interpolated value
	 */
	static slerp(start: number, end: number, t: number, smoothFactor: number) {
		return start + (end - start) * smoothFactor * t;  // Adjust this formula for smoother movement
	}
	
	/**
	 * Generates a gaussian random.
	 * @param mean Mean value of the normal distribution
	 * @param stdev standard deviation of the normal distribution
	 * @returns Value from a gaussian distribution
	 */
	static gaussianRandom(mean=0, stdev=1) {
		const u = 1 - Math.random(); // Converting [0,1) to (0,1]
		const v = Math.random();
		const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
		// Transform to the desired mean and standard deviation:
		return z * stdev + mean;
	}
}

export default MathHelper;
