import { Container } from "pixi.js";

export default abstract class Physics2D {
	bodies: { body: any; node: any }[];

	abstract addBody(body: any, node: any): void;
	abstract removeBody(body: any): void;
	abstract drawDebug(parentCont: Container, boundsStrokeWidth: number): void;

	constructor() {
		this.bodies = [];
	}
}
