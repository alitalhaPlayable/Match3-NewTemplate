import Script2D from "core/libs/common/script/Script2D";
import globals from "@globals";
import data from "@data";
import gsap from "gsap";

export default class MathFunctions extends Script2D {
	_className = "MathFunctions";

	static distanceBetweenPoints(p1, p2) {
		return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
	}
	static rectangelePointCollision(point, rectangle, height, width) {
		//checking given rectangle and poin's positions for collision
		if (point.x >= rectangle.x && point.x <= rectangle.x + width && point.y >= rectangle.y && point.y <= rectangle.y + height) {
			return true;
		}
		return false;
	}
	static rectangelePointCollisionV2(point, rectangle, height, width) {
		//checking given rectangle and poin's positions for collision
		if (
			((point.x >= rectangle.x && point.x <= rectangle.x + width / 2) || (point.x <= rectangle.x && point.x >= rectangle.x - width / 2)) &&
			((point.y >= rectangle.y && point.y <= rectangle.y + height / 2) || (point.y <= rectangle.y && point.y >= rectangle.y - height / 2))
		) {
			return true;
		}
		return false;
	}

	static rectangleRectangleCollision(rect1, rect2) {
		// Calculate the half-widths and half-heights of each rectangle
		var halfWidth1 = rect1.baseWidth / 2;
		var halfHeight1 = rect1.baseHeight / 2;
		var halfWidth2 = rect1.baseWidth / 2;
		var halfHeight2 = rect1.baseHeight / 2;

		// Calculate centers of each rectangle
		var centerX1 = rect1.x + halfWidth1;
		var centerY1 = rect1.y + halfHeight1;
		var centerX2 = rect2.x + halfWidth2;
		var centerY2 = rect2.y + halfHeight2;

		// Calculate the distance between centers of the rectangles
		var dx = Math.abs(centerX1 - centerX2);
		var dy = Math.abs(centerY1 - centerY2);

		// Check if the distance between centers is less than the sum of half-widths and half-heights
		if (dx < halfWidth1 + halfWidth2 && dy < halfHeight1 + halfHeight2) {
			return true; // Collision detected
		}

		return false; // No collision
	}

	static getAngleBetweenPoints(point_1, point_2) {
		let dx = point_2.x - point_1.x;
		let dy = point_2.y - point_1.y;

		// Calculate angle in radians
		let angleRadians = Math.atan2(dy, dx);

		// Convert angle to degrees
		let angleDegrees = angleRadians * (180 / Math.PI);
		return angleDegrees;
	}

	static shuffleArray(array2) {
		let array = [...array2];
		for (let i = array.length - 1; i > 0; i--) {
			// Generate a random index
			const j = Math.floor(Math.random() * (i + 1));

			// Swap elements at i and j
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	static findDirectionBetweenPoints(pointA, pointB) {
		const directionX = pointB.x - pointA.x;
		const directionY = pointB.y - pointA.y;

		// Vektörü normalize et (uzunluğunu 1 yap)
		const length = Math.sqrt(directionX ** 2 + directionY ** 2);
		const normalizedDirection = {
			x: length === 0 ? 0 : directionX / length,
			y: length === 0 ? 0 : directionY / length,
		};

		return normalizedDirection;
	}
}
