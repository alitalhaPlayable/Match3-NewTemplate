import * as CANNON from "cannon-es";

export class Cannon3DUtils {
	/**
	 * Creates a Cannon body from options
	 */
	public static createCannonBodyFromOptions(world: CANNON.World, options: any): CANNON.Body | null {
		try {
			// Create body material
			const material = new CANNON.Material();

			// Create body
			const body = new CANNON.Body({
				mass: options.bodyType === "static" ? 0 : options.mass || 1,
				material: material,
				position: options.position
					? new CANNON.Vec3(options.position.x, options.position.y, options.position.z)
					: new CANNON.Vec3(0, 0, 0),
				quaternion: options.rotation
					? new CANNON.Quaternion().setFromEuler(options.rotation.x, options.rotation.y, options.rotation.z)
					: new CANNON.Quaternion(),
			});

			// Set body type
			if (options.bodyType === "kinematic") {
				body.type = CANNON.Body.KINEMATIC;
			} else if (options.bodyType === "static") {
				body.type = CANNON.Body.STATIC;
			} else {
				body.type = CANNON.Body.DYNAMIC;
			}

			// Add shapes
			this.addShapesToCannonBody(body, options);

			// Set collision filtering if specified
			if (options.categoryBits || (options.maskBits && options.maskBits.length > 0)) {
				const categoryValue = options.categoryBits ? parseInt(options.categoryBits) : 1;
				const maskValue = options.maskBits && options.maskBits.length > 0 
					? options.maskBits.reduce((acc: number, bit: string) => acc | parseInt(bit), 0)
					: 0xFFFFFFFF;
				
				// Set collision filter
				body.collisionFilterGroup = categoryValue;
				body.collisionFilterMask = maskValue;
			}

			// Add to world
			world.addBody(body);

			return body;
		} catch (error) {
			console.error("Failed to create Cannon body:", error);
			return null;
		}
	}

	/**
	 * Adds shapes to a Cannon body
	 */
	public static addShapesToCannonBody(body: CANNON.Body, options: any) {
		// Handle main shape
		if (options.shape) {
			const shape = this.createCannonShape(options.shape);
			if (shape) {
				// Check if the main shape has offset/orientation data
				const offset = options.shape.offset || { x: 0, y: 0, z: 0 };
				const orientation = options.shape.orientation || { x: 0, y: 0, z: 0 };

				body.addShape(
					shape,
					new CANNON.Vec3(offset.x, offset.y, offset.z),
					new CANNON.Quaternion().setFromEuler(orientation.x, orientation.y, orientation.z)
				);
			}
		}

		// Handle compound shapes
		if (options.compounds && options.compounds.length > 0) {
			options.compounds.forEach((compound: any) => {
				if (compound && compound.type) {
					// The compound shape data is directly the shape data, not nested under a 'shape' property
					const shape = this.createCannonShape(compound);
					if (shape) {
						const offset = compound.offset || { x: 0, y: 0, z: 0 };
						const orientation = compound.orientation || { x: 0, y: 0, z: 0 };

						body.addShape(
							shape,
							new CANNON.Vec3(offset.x, offset.y, offset.z),
							new CANNON.Quaternion().setFromEuler(orientation.x, orientation.y, orientation.z)
						);
					}
				} else {
					console.warn("Invalid compound shape data:", compound);
				}
			});
		}
	}

	/**
	 * Creates a Cannon shape from shape data
	 */
	public static createCannonShape(shapeData: any): CANNON.Shape | null {
		try {
			if (!shapeData || !shapeData.type) {
				console.warn("Invalid shape data provided:", shapeData);
				return new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
			}

			switch (shapeData.type) {
				case "box":
					return new CANNON.Box(
						new CANNON.Vec3(
							(shapeData.width || 1) / 2,
							(shapeData.height || 1) / 2,
							(shapeData.depth || 1) / 2
						)
					);

				case "sphere":
					return new CANNON.Sphere(shapeData.radius || 0.5);

				case "cylinder":
					return new CANNON.Cylinder(
						shapeData.radius || 0.5,
						shapeData.radius || 0.5,
						shapeData.height || 1,
						shapeData.numSegments || 8
					);

				case "cone":
					// Create a cone using a cylinder with very small top radius
					const coneRadius = shapeData.radius || 0.5;
					const coneHeight = shapeData.height || 1;
					const coneSegments = shapeData.numSegments || 8;
					return new CANNON.Cylinder(0.01, coneRadius, coneHeight, coneSegments);

				case "plane":
					return new CANNON.Plane();

				case "mesh":
					// For mesh shapes, we'll need to create a Trimesh
					// This is a simplified implementation
					if (shapeData.vertices && shapeData.indices) {
						return new CANNON.Trimesh(shapeData.vertices, shapeData.indices);
					}
					break;

				default:
					console.warn(`Unsupported Cannon shape type: ${shapeData.type}`);
					return new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
			}
		} catch (error) {
			console.error("Failed to create Cannon shape:", error);
			return new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
		}

		return null;
	}

	/**
	 * Converts Physics3DGC component data to Cannon body options
	 */
	public static physics3DGCToOptions(component: any, node: any): any {
		return {
			bodyType: component.bodyType || "dynamic",
			mass: component.mass || 1,
			shape: component.shape,
			compounds: component.compounds,
			categoryBits: component.categoryBits,
			maskBits: component.maskBits,
			sensor: component.sensor,
			node: node,
			position: node.position
				? {
						x: node.position.x,
						y: node.position.y,
						z: node.position.z,
					}
				: undefined,
			rotation: node.rotation
				? {
						x: node.rotation.x,
						y: node.rotation.y,
						z: node.rotation.z,
					}
				: undefined,
		};
	}
}

export default Cannon3DUtils;
