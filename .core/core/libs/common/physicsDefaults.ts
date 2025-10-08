import { v4 as uuidv4 } from "uuid";
import { PhysicsShape } from "./components";

export const getPhysicsDefaults = (): PhysicsShape => {
	return {
		type: "rectangle",
		offset: { x: 0, y: 0 },
		width: 100,
		height: 100,
		radius: 50,
		points: {
			"0": { x: 0, y: 0 },
			"1": { x: 100, y: 0 },
			"2": { x: 100, y: 100 },
			"3": { x: 0, y: 100 },
		},
		uuid: uuidv4(),
	};
};
