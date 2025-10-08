/* eslint-disable new-cap */
// import Body from "./Body";
import { getPhysicsDefaults } from "core/libs/common/physicsDefaults";
import { BodyOptions } from "./@types/types";
// import { getPhysicsDefaults } from "../../../common/physicsDefaults";
import Box2DPhysics from "./Box2dPhysics";

let phySystem: Box2DPhysics;
export default class Box2DBody {
	coreBody: any;
	label: string;
	bodyOptions: BodyOptions;

	constructor(bodyOptions: BodyOptions, createFromComponent: boolean = false) {
		this.bodyOptions = bodyOptions;
		this.label = bodyOptions.physicsLabel as string;

		phySystem = Box2DPhysics.getInstance();

		if (createFromComponent) {
			const mappedComp = this.componentToOptions(bodyOptions, bodyOptions.node);
			this.coreBody = phySystem.create(mappedComp);
		} else {
			this.coreBody = phySystem.create(bodyOptions);
		}

		// if (bodyOptions.shapeType === "polygon") {
		// 	this.coreBody = phySystem.polygon(bodyOptions);
		// } else if (bodyOptions.shapeType === "rectangle") {
		// 	this.coreBody = phySystem.rectangle(bodyOptions);
		// } else if (bodyOptions.shapeType === "circle") {
		// 	this.coreBody = phySystem.circle(bodyOptions);
		// }
	}

	// eslint-disable-next-line class-methods-use-this
	componentToOptions(component: any, node?: any) {
		if (!component) {
			return { shapes: [getPhysicsDefaults()] };
		}

		const coreBody = {
			...getPhysicsDefaults(),
			type: component.shape.type || "rectangle",
			offset: component.shape.offset,
		};

		if (component.shape.type === "rectangle") {
			coreBody.width = component.shape.width;
			coreBody.height = component.shape.height;
		} else if (component.shape.type === "circle") {
			coreBody.radius = component.shape.radius;
		} else if (component.shape.type === "polygon") {
			const tempPoints: { [key: string]: { x: number; y: number } } = {}; // Add index signature
			const scaleX = node ? node.scale.x : 1;
			const scaleY = node ? node.scale.y : 1;

			for (const key in component.shape.points) {
				if (Object.prototype.hasOwnProperty.call(component.shape.points, key)) {
					tempPoints[key] = { ...component.shape.points[key] };
					tempPoints[key].x /= scaleX;
					tempPoints[key].y /= scaleY;
				}
			}

			coreBody.points = tempPoints;
		} else {
			coreBody.type = "rectangle";
			coreBody.width = component.shape.width;
			coreBody.height = component.shape.height;
		}

		// const { compounds } = component;

		const mappedComp: BodyOptions = {
			node: node,
			physicsLabel: component.physicsLabel,
			bodyType: component.bodyType,
			sensor: component.sensor,
			friction: component.friction,
			restitution: component.restitution,
			density: component.density,
			// shapeType: component.shape.type,
			// offset: component.shape.offset,
			categoryBits: component.categoryBits,
			maskBits: component.maskBits, // ? ["1", ...component.maskBits] : [],
			shapes: [coreBody, ...(component.compounds || [])],
		};

		return mappedComp;
	}

	updateBody(node: any, component: any) {
		if (component) {
			this.remove(false);

			const mappedComp = this.componentToOptions(component, node);

			node.body = new Box2DBody({
				...this.bodyOptions,
				...mappedComp,
			});
		}
	}

	setPosition(x: number, y: number, rotation: number = this.coreBody.GetAngle(), awake: boolean = true) {
		this.coreBody.SetTransform(new Box2D.b2Vec2(x / phySystem.PTM, y / phySystem.PTM), rotation);

		this.coreBody.SetAwake(awake);
	}

	applyAngularImpulse(impulse: number) {
		this.coreBody.ApplyAngularImpulse(impulse);
	}

	applyForce(force: { x: number; y: number }, point: { x: number; y: number }) {
		this.coreBody.ApplyForce(new Box2D.b2Vec2(force.x, force.y), this.coreBody.GetWorldPoint(new Box2D.b2Vec2(point.x, point.y)));
	}

	applyForceToCenter(force: { x: number; y: number }) {
		this.coreBody.ApplyForceToCenter(new Box2D.b2Vec2(force.x, force.y));
	}

	setLinearVelocity(x: number, y: number) {
		this.coreBody.SetLinearVelocity(new Box2D.b2Vec2(x, y));
	}

	// applyLinearImpulse(impulse: number) { // not working with small numbers
	//   this.coreBody.ApplyLinearImpulse(impulse);
	// }

	applyTorque(torque: number) {
		this.coreBody.ApplyTorque(torque);
	}

	setAngularDamping(damping: number) {
		this.coreBody.SetAngularDamping(damping);
	}

	setAngularVelocity(velocity: number) {
		this.coreBody.SetAngularVelocity(velocity);
	}

	scaleBody(ratio: number) {
		let shape = this.bodyOptions.shape;
		let node = this.bodyOptions.node;

		if (shape.type === "rectangle") {
			console.error(shape.width, shape.height, ratio);
			shape.width *= ratio;
			shape.height *= ratio;
			console.error(shape.width, shape.height, ratio);
		} else if (shape.type === "circle") {
			shape.radius *= ratio;
		} else if (shape.type === "polygon") {
			for (const key in shape.points) {
				if (Object.prototype.hasOwnProperty.call(shape.points, key)) {
					shape.points[key].x *= ratio;
					shape.points[key].y *= ratio;
				}
			}
		}

		node.components.physics.update(node.components.physics.componentData);
	}

	setAwake(awake: boolean) {
		this.coreBody.SetAwake(awake);
	}

	setActive(active: boolean) {
		this.coreBody.SetEnabled(active);
	}

	setFixedRotation(isFixed: boolean) {
		this.coreBody.SetFixedRotation(isFixed);
	}

	setGravityScale(scale: number) {
		this.coreBody.SetGravityScale(scale);
	}

	setSleepingAllowed(allowed: boolean) {
		this.coreBody.SetSleepingAllowed(allowed);
	}

	setType(type: "static" | "dynamic" | "kinematic") {
		let typeNo = 0;
		if (type === "static") {
			typeNo = 0;
		} else if (type === "dynamic") {
			typeNo = 2;
		} else if (type === "kinematic") {
			typeNo = 1;
		}

		this.coreBody.SetType(typeNo);
	}

	setUserData(data: any) {
		this.coreBody.SetUserData(data);
	}

	getUserData() {
		return this.coreBody.GetUserData();
	}

	setBullet(bullet: boolean) {
		this.coreBody.SetBullet(bullet);
	}

	isActive() {
		return this.coreBody.IsActive();
	}

	isAwake() {
		return this.coreBody.IsAwake();
	}

	isBullet() {
		return this.coreBody.IsBullet();
	}

	isFixedRotation() {
		return this.coreBody.IsFixedRotation();
	}

	isSleepingAllowed() {
		return this.coreBody.IsSleepingAllowed();
	}

	getAngle() {
		return this.coreBody.GetAngle();
	}

	getPosition() {
		const pos = this.coreBody.GetPosition();
		return { x: pos.get_x(), y: pos.get_y() };
	}

	getLinearVelocity() {
		return this.coreBody.GetLinearVelocity();
	}

	getAngularDamping() {
		return this.coreBody.GetAngularDamping();
	}

	getContactList() {
		return this.coreBody.GetContactList();
	}

	getFixtureList() {
		return this.coreBody.GetFixtureList();
	}

	getAngularVelocity() {
		return this.coreBody.GetAngularVelocity();
	}

	getMass() {
		return this.coreBody.GetMass();
	}

	getInertia() {
		return this.coreBody.GetInertia();
	}

	getGravityScale() {
		return this.coreBody.GetGravityScale();
	}

	getJointList() {
		return this.coreBody.GetJointList();
	}

	getLinearDamping() {
		return this.coreBody.GetLinearDamping();
	}

	getLinearVelocityFromLocalPoint(point: { x: number; y: number }) {
		return this.coreBody.GetLinearVelocityFromLocalPoint(new Box2D.b2Vec2(point.x, point.y));
	}

	getLinearVelocityFromWorldPoint(point: { x: number; y: number }) {
		return this.coreBody.GetLinearVelocityFromWorldPoint(new Box2D.b2Vec2(point.x, point.y));
	}

	getLocalCenter() {
		return this.coreBody.GetLocalCenter();
	}

	getLocalPoint(worldPoint: { x: number; y: number }) {
		return this.coreBody.GetLocalPoint(new Box2D.b2Vec2(worldPoint.x, worldPoint.y));
	}

	getLocalVector(worldVector: { x: number; y: number }) {
		return this.coreBody.GetLocalVector(new Box2D.b2Vec2(worldVector.x, worldVector.y));
	}

	getWorldCenter() {
		return this.coreBody.GetWorldCenter();
	}

	getWorldPoint(localPoint: { x: number; y: number }) {
		return this.coreBody.GetWorldPoint(new Box2D.b2Vec2(localPoint.x, localPoint.y));
	}

	getWorldVector(localVector: { x: number; y: number }) {
		return this.coreBody.GetWorldVector(new Box2D.b2Vec2(localVector.x, localVector.y));
	}

	resetMassData() {
		this.coreBody.ResetMassData();
	}

	setLinearDamping(damping: number) {
		this.coreBody.SetLinearDamping(damping);
	}

	setDensity(density: number) {
		const fixtureList = this.coreBody.GetFixtureList();
		fixtureList.SetDensity(density);
		this.coreBody.ResetMassData();
	}

	setFriction(friction: number) {
		const fixtureList = this.coreBody.GetFixtureList();
		fixtureList.SetFriction(friction);
	}

	setRestitution(restitution: number) {
		const fixtureList = this.coreBody.GetFixtureList();
		fixtureList.SetRestitution(restitution);
	}

	setSensor(isSensor: boolean) {
		const fixtureList = this.coreBody.GetFixtureList();
		fixtureList.SetSensor(isSensor);
	}

	getDensity() {
		const fixtureList = this.coreBody.GetFixtureList();
		return fixtureList.GetDensity();
	}

	getFriction() {
		const fixtureList = this.coreBody.GetFixtureList();
		return fixtureList.GetFriction();
	}

	getRestitution() {
		const fixtureList = this.coreBody.GetFixtureList();
		return fixtureList.GetRestitution();
	}

	isSensor() {
		const fixtureList = this.coreBody.GetFixtureList();
		return fixtureList.IsSensor();
	}

	remove(removeNode: boolean = true) {
		if (!this.coreBody) return;
		const index = phySystem.bodies.findIndex((data: any) => data.body === this.coreBody);
		if (index > -1) {
			phySystem.bodies.splice(index, 1);
		}

		if (removeNode && this.coreBody.node) {
			this.coreBody.node.destroy();
			this.coreBody.node = null;
		}

		this.coreBody.removeNode = removeNode;

		phySystem.removeBody(this.coreBody);
	}

	// testPoint(x: number, y: number) { // buggy always returns 1
	//   const fixtureList = this.coreBody.GetFixtureList();
	//   return fixtureList.TestPoint(
	//     this.coreBody.GetTransform(),
	//     new Box2D.b2Vec2(x, y)
	//   );
	// }

	// getTransform() { // return awkward data
	//   return this.coreBody.GetTransform();
	// }

	// dump() { // returns undefined
	//   return this.coreBody.Dump();
	// }

	// setMassData(mass: number, center: { x: number; y: number }, I: number) { // buggy if mass 0
	//   this.coreBody.SetMassData(mass, new Box2D.b2Vec2(center.x, center.y), I);
	// }
}
