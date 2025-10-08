import { Container, Rectangle, Sprite, Texture } from "pixi.js";

// @ts-ignore
import * as poly2tri from "poly2tri/dist/poly2tri.js";

// import { LiquidfunRenderer, LiquidfunSprite } from "./lib/liquidfun-renderer";
import * as debugDraw from "./lib/debugDrawManager";
import { BodyOptions, BodyType } from "./@types/types";
import { getPixiApplication } from "core/libs/common/editorGlobals";
import Box2DBody from "./Box2DBody";
import LiquidMesh from "./LiquidMesh";
import { PhysicsShape } from "core/libs/common/components";
// import globals from "@globals";
// import { getObject2D } from "../../utils/utils2D";

let pixiApp: any;
let box2D: any;
let PTM: number = 0;

export default class Box2DPhysics {
	static instance: Box2DPhysics;
	world: any;
	gravity: any;
	PTM: number = 32;
	debugDraw: any;
	tempVec: any = null;
	tris: any[] = [];
	particleSystem: any;
	worldBounds?: Rectangle;
	boundsWallSprites: any[] = [];
	debugSprite: Sprite | null = null;
	private _toRemove: any[] = [];
	isSimulationEnabled: boolean = true; // for studio
	deviceType: "low" | "medium" | "high" = "low";
	bodies: any[] = [];
	constructor() {
		PTM = this.PTM;
		const { b2Vec2, b2World } = app.box2D;

		box2D = app.box2D;

		this.gravity = new b2Vec2(0, 30);
		this.world = new b2World(this.gravity);

		this.tempVec = new b2Vec2();

		pixiApp = getPixiApplication();

		this.addContactListener();

		// // liquid test
		// this.createParticleSystem();
		// setTimeout(() => {
		// 	console.warn(this.world);

		// 	const liquidMesh = new LiquidMesh();
		// 	const parent = getObject2D("test");
		// 	(parent as any).addChild(liquidMesh);

		// 	globals.pixiApp.ticker.add((delta) => {
		// 		liquidMesh.update(delta.deltaTime);
		// 	});

		// 	this.spawnParticles(2, 4, 4);
		// 	this.spawnParticles(1, 8, 2);
		// 	this.spawnParticles(1, 12, 4);
		// }, 100);
	}

	static getInstance() {
		if (!Box2DPhysics.instance) {
			Box2DPhysics.instance = new Box2DPhysics();
		}
		return Box2DPhysics.instance;
	}

	createBodyDef(options: { bodyType: BodyType; x: number; y: number; node: any }) {
		const { bodyType, x, y, node } = options;

		const bd = new box2D.b2BodyDef();

		this.tempVec.set_x(x / PTM);
		this.tempVec.set_y(y / PTM);
		bd.set_position(this.tempVec);
		if (node) {
			bd.set_angle(node.rotation);
		} else {
			bd.set_angle(0);
		}

		if (bodyType === "dynamic") {
			bd.set_type(2);
		} else if (bodyType === "kinematic") {
			bd.set_type(1);
		} else {
			bd.set_type(0);
		}

		return bd;
	}

	rectangle(body: any, bodyData: PhysicsShape, density = 1) {
		const shape = new Box2D.b2PolygonShape();

		const { width, height, offset } = bodyData;

		const _width = width || 100;
		const _height = height || 100;

		shape.SetAsBox(_width / this.PTM / 2, _height / this.PTM / 2, new Box2D.b2Vec2(offset.x / this.PTM, offset.y / this.PTM), 0);

		const fixture = body.CreateFixture(shape, density);

		return fixture;
	}

	circle(body: any, bodyData: PhysicsShape, density = 1) {
		const shape = new Box2D.b2CircleShape();
		const { radius, offset } = bodyData;

		const _radius = radius || 50;

		shape.set_m_p(new Box2D.b2Vec2(offset.x / this.PTM, offset.y / this.PTM));
		shape.set_m_radius(_radius / this.PTM);

		const fixture = body.CreateFixture(shape, density);

		return fixture;
	}

	polygon(body: any, bodyData: PhysicsShape, density = 1) {
		// const shape = new Box2D.b2PolygonShape();
		const { points: rawPoints, offset } = bodyData;

		const polyPoints = rawPoints ? Object.values(rawPoints) : rawPoints; // for studio

		const points: any[] = [];
		this.preparePolygonPoints(polyPoints, points);

		let shape = null;

		const scaleX = 1;
		const scaleY = 1;

		const fixtures: any = [];

		points!.forEach((point: any) => {
			const _points = [];
			for (let i = 0; i < 3; i++) {
				const vec = new Box2D.b2Vec2();
				vec.Set(((point[i].x + offset.x) * scaleX) / this.PTM, ((point[i].y + offset.y) * scaleY) / this.PTM);
				_points.push(vec);
			}

			shape = this.createPolygonShape(_points);

			const fixture = body.CreateFixture(shape, density || 1.0);
			fixtures.push(fixture);
		});

		return fixtures;
	}

	create(bodyOptions: BodyOptions) {
		const { x, y, node, bodyType, friction, restitution, density, sensor, physicsLabel, categoryBits, maskBits, shapes } = bodyOptions;

		const _x = node ? node.x : x;
		const _y = node ? node.y : y;

		const bd = this.createBodyDef({ bodyType: bodyType!, x: _x, y: _y, node });

		const body = this.world.CreateBody(bd);
		body.label = physicsLabel;
		this.addBody(body, node);
		body.node = node;

		const fixtures: any = [];

		shapes.forEach((shape) => {
			if (shape.type === "rectangle") {
				const fixture = this.rectangle(body, shape, density);
				fixtures.push(fixture);
			}
			if (shape.type === "circle") {
				const fixture = this.circle(body, shape, density);
				fixtures.push(fixture);
			}
			if (shape.type === "polygon") {
				const tempFixtures = this.polygon(body, shape, density);
				fixtures.push(...tempFixtures);
			}
		});
		// .filter((fixture) => fixture !== null);

		fixtures.forEach((fixture: any) => {
			fixture.SetFriction(friction || 0.2);
			fixture.SetRestitution(restitution || 0);
			fixture.SetSensor(sensor);
			this.addCategoryAndMaskBits(body, categoryBits!, maskBits!);
		});

		return body;
	}

	preparePolygonPoints(shape: any, allPoints: any) {
		this.tris = [];
		const shapeCopy = JSON.parse(JSON.stringify(shape));
		try {
			const swctx = new poly2tri.SweepContext(shapeCopy, { cloneArrays: true });

			swctx.triangulate();

			this.tris = this.tris.concat(swctx.getTriangles() || []);

			for (let i = 0, l = this.tris.length; i < l; i++) {
				const points = this.getPolysFromTriangulation(this.tris[i].points_);
				allPoints.push(points.map((p: any) => ({ x: p.get_x(), y: p.get_y() })));
			}

			return allPoints;
		} catch (e) {
			console.log("error: createTerrain()", e);
			//@ts-ignore
			console.log(e.message);
			//@ts-ignore
			console.log(e.stack);
			// console.log(this.terrainShape);
			console.log(this.tris);
		}
	}

	getPolysFromTriangulation(pointsArray: any) {
		const vecs = [];
		for (let i = 0, l = pointsArray.length; i < l; i++) {
			const poly = pointsArray[i];
			vecs.push(new box2D.b2Vec2(poly.x, poly.y));
		}
		return vecs;
	}

	setPolygonBody(bodyOptions: BodyOptions) {
		const { x, y, points, node, bodyType, sensor, friction, restitution, density, physicsLabel, categoryBits, maskBits, offset } = bodyOptions;

		const _x = node ? node.x : x;
		const _y = node ? node.y : y;

		const bd = this.createBodyDef({ bodyType: bodyType!, x: _x, y: _y, node });

		const body = this.world.CreateBody(bd);
		body.node = node;
		body.label = physicsLabel;

		let shape = null;
		points!.forEach((point: any) => {
			let pointX: number;
			let pointY: number;

			if (node) {
				pointX = node.x / PTM;
				pointY = node.y / PTM;
			} else {
				pointX = _x / PTM;
				pointY = _y / PTM;
			}

			const _points = [];
			for (let i = 0; i < 3; i++) {
				const vec = new box2D.b2Vec2();
				vec.Set(((point[i].x + offset.x) * node.scale.x) / PTM, ((point[i].y + offset.y) * node.scale.y) / PTM);
				_points.push(vec);
			}

			shape = this.createPolygonShape(_points);

			const fixture = body.CreateFixture(shape, density || 1.0);
			fixture.SetSensor(sensor);
			fixture.SetRestitution(restitution);
			fixture.SetFriction(friction);

			body.fixture = fixture;

			this.addCategoryAndMaskBits(body, categoryBits!, maskBits!);

			const temp = new box2D.b2Vec2(pointX, pointY);

			const angle = node ? node.angle : 0;
			body.SetTransform(temp, angle * (Math.PI / 180));

			body.shape = shape;
		});

		this.addBody(body, node);

		return body;
	}

	createPolygonShape(vertices: any) {
		const shape = new box2D.b2PolygonShape();
		const buffer = box2D._malloc(vertices.length * 8);
		let offset = 0;
		for (let i = 0; i < vertices.length; i++) {
			box2D.HEAPF32[(buffer + offset) >> 2] = vertices[i].get_x();
			box2D.HEAPF32[(buffer + (offset + 4)) >> 2] = vertices[i].get_y();
			offset += 8;
		}
		const ptrWrapped = box2D.wrapPointer(buffer, box2D.b2Vec2);
		shape.Set(ptrWrapped, vertices.length);
		return shape;
	}

	addCategoryAndMaskBits(body: any, categoryBits: string, maskBits: string[]) {
		if (!categoryBits) {
			return;
		}

		let bits = 0;
		for (let i = 0; i < maskBits.length; i++) {
			bits |= parseInt(maskBits[i]);
		}

		const filter = new box2D.b2Filter();
		filter.set_categoryBits(+categoryBits);
		if (bits) filter.set_maskBits(bits);
		body.GetFixtureList().SetFilterData(filter);
	}

	removeWorldBounds() {
		this.boundsWallSprites.forEach((sprite) => {
			const index = this.bodies.findIndex((data: any) => data.body === sprite.body);
			if (index > -1) {
				this.bodies.splice(index, 1);
			}

			this.removeBody(sprite.body);
			sprite.destroy();
		});
		this.boundsWallSprites = [];
	}

	setWorldBounds(options: {
		bounds: Rectangle;
		strokeWidth: number;
		left: boolean;
		right: boolean;
		top: boolean;
		bottom: boolean;
		categoryBits?: string;
		maskBits?: string[];
		parentCont: Container;
		showWallSprite?: boolean;
	}) {
		const { bounds, strokeWidth, left, right, top, bottom, categoryBits, maskBits, parentCont, showWallSprite } = options;
		this.worldBounds = bounds;
		const walls = [];

		const wallBodyCreator = (x: number, y: number, w: number, h: number) => {
			let sprite = null;
			if (showWallSprite) {
				sprite = new Sprite(Texture.WHITE);
				parentCont.addChild(sprite);
				sprite.position.set(x, y);
				sprite.width = w;
				sprite.height = h;
				sprite.baseWidth = w / sprite.scale.x;
				sprite.baseHeight = h / sprite.scale.y;
				sprite.anchor.set(0.5);
				// const lb = sprite.getLocalBounds();
				// sprite.pivot.set(lb.x + lb.width * 0.5, lb.y + lb.height * 0.5);
				sprite.tint = 0x000000;
				this.boundsWallSprites.push(sprite);
			}

			const body = new Box2DBody({
				x,
				y,
				bodyType: "static",
				sensor: false,
				friction: 1,
				restitution: 0,
				density: 3,
				physicsLabel: "wall",
				node: sprite,
				categoryBits: categoryBits || "1",
				maskBits,
				shapes: [
					{
						type: "rectangle",
						width: w,
						height: h,
						offset: { x: 0, y: 0 },
					},
				],
			});

			if (sprite) sprite.body = body;

			return body;
		};

		if (left) {
			const wall = wallBodyCreator(-strokeWidth * 0.5 + bounds.x, bounds.height * 0.5 + bounds.y, strokeWidth, bounds.height + strokeWidth * 2);
			walls.push(wall);
		}
		if (right) {
			const wall = wallBodyCreator(bounds.width + bounds.x + strokeWidth * 0.5, bounds.height * 0.5 + bounds.y, strokeWidth, bounds.height + strokeWidth * 2);
			walls.push(wall);
		}
		if (top) {
			const wall = wallBodyCreator(bounds.width * 0.5 + bounds.x, -strokeWidth * 0.5 + bounds.y, bounds.width + strokeWidth * 2, strokeWidth);
			walls.push(wall);
		}
		if (bottom) {
			const wall = wallBodyCreator(bounds.width * 0.5 + bounds.x, bounds.height + bounds.y + strokeWidth * 0.5, bounds.width + strokeWidth * 2, strokeWidth);
			walls.push(wall);
		}
	}

	spawnParticles(radius: any, x: any, y: any) {
		const color = new box2D.b2ParticleColor(55, 166, 200, 255);
		const flags = 0 << 0;

		const pgd = new box2D.b2ParticleGroupDef();
		const shape = new box2D.b2CircleShape();
		shape.set_m_radius(radius);
		pgd.set_shape(shape);
		pgd.set_color(color);
		pgd.set_flags(flags);
		shape.set_m_p(new box2D.b2Vec2(x, y));
		const group = this.particleSystem.CreateParticleGroup(pgd);

		return group;
	}

	createParticleSystem(config: { [key: string]: any } = {}) {
		const psd = new box2D.b2ParticleSystemDef();
		psd.set_radius(0.2);
		Object.keys(config).forEach((key) => {
			const setterMethod = `set_${key}`;
			if (typeof psd[setterMethod] === "function") {
				psd[setterMethod](config[key]);
			} else {
				console.warn(`Unknown property: ${key}`);
			}
		});

		// const properties = [
		// 	"strictContactCheck",
		// 	"density",
		// 	"gravityScale",
		// 	"radius",
		// 	"maxCount",
		// 	"pressureStrength",
		// 	"dampingStrength",
		// 	"elasticStrength",
		// 	"springStrength",
		// 	"viscousStrength",
		// 	"surfaceTensionPressureStrength",
		// 	"surfaceTensionNormalStrength",
		// 	"repulsiveStrength",
		// 	"powderStrength",
		// 	"ejectionStrength",
		// 	"staticPressureStrength",
		// 	"staticPressureRelaxation",
		// 	"staticPressureIterations",
		// 	"colorMixingStrength",
		// 	"destroyByAge",
		// 	"lifetimeGranularity",
		// ];

		const particleSystem = this.world.CreateParticleSystem(psd);
		this.particleSystem = particleSystem;
		particleSystem.CreateParticleGroup("water");
		particleSystem.SetMaxParticleCount(70000);
	}

	spawnParticlesAdvanced(radius: number, x: number, y: number, config: { [key: string]: any } = {}) {
		const pgd = new box2D.b2ParticleGroupDef();

		if (config.color) {
			const c = config.color;
			pgd.set_color(new box2D.b2ParticleColor(c.r, c.g, c.b, c.a));
			delete config.color;
		} else {
			pgd.set_color(new box2D.b2ParticleColor(55, 166, 200, 255));
		}

		if (config.flags === undefined) {
			config.flags = 0 << 0; // Default flags
		}

		const shape = new box2D.b2CircleShape();
		shape.set_m_radius(radius);
		shape.set_m_p(new box2D.b2Vec2(x, y));
		pgd.set_shape(shape);

		Object.keys(config).forEach((key) => {
			const setterMethod = `set_${key}`;
			if (typeof (pgd as any)[setterMethod] === "function") {
				(pgd as any)[setterMethod](config[key]);
			} else {
				console.warn(`Unknown particle group property: ${key}`);
			}
		});

		// const properties = [
		// 	"flags",
		// 	"groupFlags",
		// 	"position",
		// 	"angle",
		// 	"linearVelocity",
		// 	"angularVelocity",
		// 	"color",
		// 	"strength",
		// 	"shape",
		// 	"shapeCount",
		// 	"stride",
		// 	"particleCount",
		// 	"positionData",
		// 	"lifetime",
		// 	"userData",
		// 	"group",
		// ];

		const group = this.particleSystem.CreateParticleGroup(pgd);
		return group;
	}

	spawnWaterFromSprite(sprite: Sprite, liquidContainer: Container, config: { [key: string]: any } = {}) {
		const pgd = new box2D.b2ParticleGroupDef();

		if (config.color) {
			const c = config.color;
			pgd.set_color(new box2D.b2ParticleColor(c.r, c.g, c.b, c.a));
		} else {
			pgd.set_color(new box2D.b2ParticleColor(55, 166, 200, 255));
		}

		if (config.flags === undefined) {
			config.flags = box2D.b2_waterParticle;
		}

		const spriteGlobalPos = sprite.getGlobalPosition();
		const spriteLocalPos = liquidContainer.toLocal(spriteGlobalPos);

		const spriteWidth = sprite.width;
		const spriteHeight = sprite.height;

		const physicsX = spriteLocalPos.x / this.PTM;
		const physicsY = spriteLocalPos.y / this.PTM;
		const physicsWidth = spriteWidth / this.PTM;
		const physicsHeight = spriteHeight / this.PTM;

		let centerX = physicsX;
		let centerY = physicsY;

		if (sprite.anchor.x !== 0.5 || sprite.anchor.y !== 0.5) {
			centerX = physicsX + physicsWidth * (0.5 - sprite.anchor.x);
			centerY = physicsY + physicsHeight * (0.5 - sprite.anchor.y);
		}

		const shape = new box2D.b2PolygonShape();
		shape.SetAsBox(physicsWidth / 2, physicsHeight / 2, new box2D.b2Vec2(centerX, centerY), sprite.rotation || 0);

		pgd.set_shape(shape);

		Object.keys(config).forEach((key) => {
			if (key === "color") return;
			const setterMethod = `set_${key}`;
			if (typeof pgd[setterMethod] === "function") {
				pgd[setterMethod](config[key]);
			}
		});

		const group = this.particleSystem.CreateParticleGroup(pgd);
		return group;
	}

	addBody(body: any, node: any): void {
		this.bodies.push({ body, node });
	}

	removeBody(body: any) {
		const ind = this._toRemove.indexOf(body);
		if (ind === -1) {
			this._toRemove.push(body);
		}
	}

	createConstraint(bodyA: any, bodyB: any, pointA: any, pointB: any) {
		let jd = new box2D.b2RevoluteJointDef();
		jd.set_bodyA(bodyA);
		jd.set_bodyB(bodyB);
		let anchorA = new box2D.b2Vec2(pointA.x, pointA.y);
		let anchorB = new box2D.b2Vec2(pointB.x, pointB.y);
		jd.set_localAnchorA(anchorA);
		jd.set_localAnchorB(anchorB);

		box2D.destroy(anchorA);
		box2D.destroy(anchorB);

		jd.set_collideConnected(false);
		jd.set_enableLimit(false);
		jd.set_lowerAngle(-Math.PI * 0.25);
		jd.set_upperAngle(Math.PI * 0.25);
		const joint = this.world.CreateJoint(jd);

		// bodyA.joint = joint;
		// bodyB.joint = joint;

		return joint;
	}

	addContactListener() {
		const listener = new box2D.JSContactListener();

		listener.BeginContact = (contactPtr: any) => {
			const contact = box2D.wrapPointer(contactPtr, box2D.b2Contact);
			const fixtureA = contact.GetFixtureA();
			const fixtureB = contact.GetFixtureB();
			const bodyA = fixtureA.GetBody();
			const bodyB = fixtureB.GetBody();

			if (bodyA.node) {
				bodyA.node.emit("beginContact", {
					collidedBody: bodyB,
					collidedNode: bodyB.node,
					collidedFixture: fixtureB,
				});
			}

			if (bodyB.node) {
				bodyB.node.emit("beginContact", {
					collidedBody: bodyA,
					collidedNode: bodyA.node,
					collidedFixture: fixtureA,
				});
			}
		};

		listener.EndContact = (contactPtr: any) => {
			const contact = box2D.wrapPointer(contactPtr, box2D.b2Contact);
			const fixtureA = contact.GetFixtureA();
			const fixtureB = contact.GetFixtureB();
			const bodyA = fixtureA.GetBody();
			const bodyB = fixtureB.GetBody();

			if (bodyA.node) {
				bodyA.node.emit("endContact", {
					collidedBody: bodyB,
					collidedNode: bodyB.node,
					collidedFixture: fixtureB,
				});
			}

			if (bodyB.node) {
				bodyB.node.emit("endContact", {
					collidedBody: bodyA,
					collidedNode: bodyA.node,
					collidedFixture: fixtureA,
				});
			}
		};

		listener.PreSolve = (contactPtr: any, oldManifoldPtr: any) => {};
		listener.PostSolve = (contactPtr: any, impulsePtr: any) => {};

		this.world.SetContactListener(listener);
	}

	drawDebug(parentCont: Container, boundsStrokeWidth: number): void {
		if (!this.worldBounds) {
			return;
		}
		this.debugDraw = debugDraw;
		debugDraw.init(this.world, this.worldBounds, boundsStrokeWidth, PTM, box2D, parentCont);
	}

	showDebug() {
		if (this.debugSprite) this.debugSprite.visible = true;
		this.boundsWallSprites.forEach((sprite) => {
			sprite.visible = true;
		});
	}

	updateDebug(worldBounds: { x: number; y: number; width: number; height: number }, wallStroke: number) {
		if (this.debugDraw) this.debugDraw.refresh(worldBounds, wallStroke, PTM);
	}

	hideDebug() {
		if (this.debugSprite) this.debugSprite.visible = false;
		this.boundsWallSprites.forEach((sprite) => {
			sprite.visible = false;
		});
	}

	restart(restartWorld: boolean = false) {
		let joint = this.world.GetJointList();
		while (joint) {
			if (this.world.GetJointCount() == 0) {
				break;
			}

			const nextJoint = joint.GetNext();
			this.world.DestroyJoint(joint);
			joint = nextJoint;
		}

		let body = this.world.GetBodyList();
		while (body) {
			if (this.world.GetBodyCount() == 0) {
				break;
			}

			const nextBody = body.GetNext();
			this.world.DestroyBody(body);
			body = nextBody;
		}

		if (restartWorld) {
			this.restartWorld();
		}
	}

	restartWorld() {
		const { b2Vec2, b2World } = app.box2D;

		this.world = new b2World(this.gravity);
		this.addContactListener()
	}

	removeBodies() {
		let i = this._toRemove.length;
		while (i--) {
			let body = this._toRemove[i];

			if (body.node && body.removeNode) {
				body.node.body = null;
				body.node.destroy();
				body.node = null;
			}

			if (body.shape) {
				body.shape = null;
			}

			if (body.fixture) {
				body.DestroyFixture(body.fixture);
				body.fixture = null;
			}

			this.world.DestroyBody(body);
			body = null;
		}
		this._toRemove.length = 0;
	}

	update() {
		// stats.begin();

		// remove bodies
		this.removeBodies();

		// update bodies
		for (let k = this.bodies.length - 1; k > -1; k--) {
			const { body, node } = this.bodies[k];

			if (node && !node.isClicked && !node.destroyed) {
				// .isClicked only for studio
				if (this.isSimulationEnabled) {
					// if block for studio
					const pos = body.GetPosition();
					node.position.set(pos.x * PTM, pos.y * PTM);
					node.rotation = body.GetAngle();
				}
			}
		}

		if (this.debugDraw) {
			this.debugDraw.update();
			this.debugDraw.refresh(this.worldBounds, 12, PTM);
		}

		if (this.isSimulationEnabled && this.world) {
			// this.world.Step(1 / 60, 6, 2); // if block for studio
			this.stablePhysicsStep();
		}

		// stats.end();
	}

	stablePhysicsStep() {
		const currentFPS = pixiApp.ticker.FPS;
		const targetTimeStep = 1 / 60;
		const maxTimeStep = 1 / 30;
		const minTimeStep = 1 / 120;

		let timeStep = Math.max(minTimeStep, Math.min(maxTimeStep, 1 / Math.max(currentFPS, 1)));

		if (currentFPS < 40) {
			const subSteps = Math.ceil(timeStep / targetTimeStep);
			const subTimeStep = timeStep / subSteps;

			for (let i = 0; i < Math.min(subSteps, 4); i++) {
				this.world.Step(subTimeStep, 6, 2);
			}

			this.deviceType = "low";
		} else if (currentFPS < 80) {
			// Medium FPS - single step with moderate settings
			this.world.Step(targetTimeStep, 8, 3);
			this.deviceType = "medium";
		} else {
			// High FPS - normal settings
			this.world.Step(targetTimeStep, 8, 3);
			this.deviceType = "high";
		}
	}
}
