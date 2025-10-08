import { PhysicsShape } from "../../../../common/components";

export type ShapeType = "polygon" | "rectangle" | "circle";
export type BodyType = "dynamic" | "static" | "kinematic";

// export type BodyOptions = {
// 	x?: number;
// 	y?: number;
// 	width?: number;
// 	height?: number;
// 	radius?: number;
// 	shapeType?: ShapeType;
// 	bodyType?: BodyType;
// 	points?: { x: number; y: number }[];
// 	friction?: number;
// 	restitution?: number;
// 	density?: number;
// 	sensor?: boolean;
// 	physicsLabel?: string;
// 	node?: any;
// 	categoryBits?: string | null;
// 	maskBits?: string[];
// 	offset: { x: number; y: number };
// };

export type BodyOptions = {
	x?: number;
	y?: number;
	node?: any;
	bodyType?: BodyType;
	friction?: number;
	restitution?: number;
	density?: number;
	sensor?: boolean;
	physicsLabel?: string;
	categoryBits?: string | null;
	maskBits?: string[];
	shapes: PhysicsShape[];
};
