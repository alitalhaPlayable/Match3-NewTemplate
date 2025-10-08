type ParticleItemNumber = {
	value: number;
	time: number;
};

type ParticleItemColor = {
	value: string;
	time: number;
};

interface ParticleBehaviours {
	alphaStatic: {
		enabled: boolean;
		alpha: number;
	};
	alpha: {
		enabled: boolean;
		alpha: {
			list: ParticleItemNumber[];
		};
	};
	scaleStatic: {
		enabled: boolean;
		min: number;
		max: number;
	};
	scale: {
		enabled: boolean;
		scale: {
			list: ParticleItemNumber[];
			isStepped: boolean;
		};
		minMult: number;
	};
	colorStatic: {
		enabled: boolean;
		color: string;
	};
	color: {
		enabled: boolean;
		color: {
			list: ParticleItemColor[];
		};
	};
	moveAcceleration: {
		enabled: boolean;
		accel: {
			x: number;
			y: number;
		};
		// maxSpeed: 0,
		minStart: number;
		maxStart: number;
		rotate: boolean;
	};
	rotationStatic: {
		enabled: boolean;
		min: number;
		max: number;
	};
	rotation: {
		enabled: boolean;
		minStart: number;
		maxStart: number;
		minSpeed: number;
		maxSpeed: number;
		accel: number;
	};
	moveSpeedStatic: {
		enabled: boolean;
		min: number;
		max: number;
	};
	moveSpeed: {
		enabled: boolean;
		speed: {
			list: ParticleItemNumber[];
		};
		minMult: number;
	};
	spawnBurst: {
		enabled: boolean;
		spacing: number;
		start: number;
		distance: number;
	};
	blendMode: {
		enabled: boolean;
		blendMode:
			| "normal"
			| "add"
			| "multiply"
			| "screen"
			| "overlay"
			| "darken"
			| "lighten"
			| "color-dodge"
			| "color-burn"
			| "hard-light"
			| "soft-light"
			| "difference"
			| "exclusion"
			| "hue"
			| "saturation"
			| "color"
			| "luminosity";
	};
	movePath: {
		enabled: boolean;
		path: string;
		speed: {
			list: ParticleItemNumber[];
		};
		minMult: number;
	};
	spawnShape: {
		enabled: boolean;
		type: "rect" | "torus" | "polygonalChain";
		dataRect: {
			x: number;
			y: number;
			w: number;
			h: number;
		};
		dataTorus: {
			radius: number;
			x: number;
			y: number;
			innerRadius: number;
			rotation: boolean;
		};
		dataPolygonalChain: {
			points: { x: number; y: number }[];
		}[];
	};
	textureSingle: {
		enabled: boolean;
		texture: string;
	};
}

export interface ParticleData {
	lifetime: {
		min: number;
		max: number;
	};
	frequency: number;
	spawnChance: number;
	particlesPerWave: number;
	emitterLifetime: number;
	maxParticles: number;
	pos: {
		x: number;
		y: number;
	};
	addAtBack: boolean;
	autoplay: boolean;
	// behaviorsOriginal: [
	// 	{
	// 		type: "alphaStatic";
	// 		config: {
	// 			enabled: boolean;
	// 			alpha: number;
	// 		};
	// 	},
	// 	{
	// 		type: "alpha";
	// 		config: {
	// 			enabled: boolean;
	// 			alpha: {
	// 				list: ParticleItemNumber[];
	// 			};
	// 		};
	// 	},
	// 	{
	// 		type: "scaleStatic";
	// 		config: {
	// 			enabled: boolean;
	// 			min: number;
	// 			max: number;
	// 		};
	// 	},
	// 	{
	// 		type: "scale";
	// 		config: {
	// 			enabled: boolean;
	// 			scale: {
	// 				list: ParticleItemNumber[];
	// 				isStepped: boolean;
	// 			};
	// 			minMult: number;
	// 		};
	// 	},
	// 	{
	// 		type: "colorStatic";
	// 		config: {
	// 			enabled: boolean;
	// 			color: string;
	// 		};
	// 	},
	// 	{
	// 		type: "color";
	// 		config: {
	// 			enabled: boolean;
	// 			color: {
	// 				list: ParticleItemColor[];
	// 			};
	// 		};
	// 	},
	// 	{
	// 		type: "moveAcceleration";
	// 		config: {
	// 			enabled: boolean;
	// 			accel: {
	// 				x: number;
	// 				y: number;
	// 			};
	// 			// maxSpeed: 0,
	// 			minStart: number;
	// 			maxStart: number;
	// 			rotate: boolean;
	// 		};
	// 	},
	// 	{
	// 		type: "rotationStatic";
	// 		config: {
	// 			enabled: boolean;
	// 			min: number;
	// 			max: number;
	// 		};
	// 	},
	// 	{
	// 		type: "rotation";
	// 		config: {
	// 			enabled: boolean;
	// 			minStart: number;
	// 			maxStart: number;
	// 			minSpeed: number;
	// 			maxSpeed: number;
	// 			accel: number;
	// 		};
	// 	},
	// 	{
	// 		type: "moveSpeedStatic";
	// 		config: {
	// 			enabled: boolean;
	// 			min: number;
	// 			max: number;
	// 		};
	// 	},
	// 	{
	// 		type: "moveSpeed";
	// 		config: {
	// 			enabled: boolean;
	// 			speed: {
	// 				list: ParticleItemNumber[];
	// 			};
	// 			minMult: number;
	// 		};
	// 	},
	// 	{
	// 		type: "spawnBurst";
	// 		config: {
	// 			enabled: boolean;
	// 			spacing: number;
	// 			start: number;
	// 			distance: number;
	// 		};
	// 	},
	// 	{
	// 		type: "blendMode";
	// 		config: {
	// 			enabled: boolean;
	// 			blendMode:
	// 				| "normal"
	// 				| "add"
	// 				| "multiply"
	// 				| "screen"
	// 				| "overlay"
	// 				| "darken"
	// 				| "lighten"
	// 				| "color-dodge"
	// 				| "color-burn"
	// 				| "hard-light"
	// 				| "soft-light"
	// 				| "difference"
	// 				| "exclusion"
	// 				| "hue"
	// 				| "saturation"
	// 				| "color"
	// 				| "luminosity";
	// 		};
	// 	},
	// 	{
	// 		type: "movePath";
	// 		config: {
	// 			enabled: boolean;
	// 			path: string;
	// 			speed: {
	// 				list: ParticleItemNumber[];
	// 			};
	// 			minMult: number;
	// 		};
	// 	},
	// 	{
	// 		type: "spawnShape";
	// 		config: {
	// 			enabled: boolean;
	// 			type: "rect" | "torus" | "polygonalChain";
	// 			data:
	// 				| {
	// 						x: number;
	// 						y: number;
	// 						w: number;
	// 						h: number;
	// 				  }
	// 				| {
	// 						radius: number;
	// 						x: number;
	// 						y: number;
	// 						innerRadius: number;
	// 						rotation: boolean;
	// 				  }
	// 				| {
	// 						points: [{ x: number; y: number }][];
	// 				  }[];
	// 		};
	// 	},
	// 	{
	// 		type: "textureSingle";
	// 		config: {
	// 			enabled: boolean;
	// 			texture: string;
	// 		};
	// 	},
	// ];
	behaviors: ParticleBehaviours;
}

export const ParticleDefaults: ParticleData = {
	lifetime: {
		min: 1,
		max: 2,
	},
	frequency: 0.001,
	spawnChance: 1,
	particlesPerWave: 1,
	emitterLifetime: 0,
	maxParticles: 100,
	pos: {
		x: 125,
		y: 125,
	},
	addAtBack: false,
	autoplay: false,
	behaviors: {
		alphaStatic: {
			enabled: false,
			alpha: 0.75,
		},
		alpha: {
			enabled: true,
			alpha: {
				list: [
					{ value: 0.62, time: 0 },
					{ value: 0.31, time: 0.5 },
					{ value: 0, time: 1 },
				],
			},
		},
		scaleStatic: {
			enabled: false,
			min: 0.25,
			max: 0.75,
		},
		scale: {
			enabled: true,
			scale: {
				list: [
					{ value: 1, time: 0 },
					{ value: 2, time: 0.5 },
					{ value: 3, time: 1 },
				],
				isStepped: false,
			},
			minMult: 0.5,
		},
		colorStatic: {
			enabled: false,
			color: "#ffff00",
		},
		color: {
			enabled: true,
			color: {
				list: [
					{ value: "#fff191", time: 0 },
					{ value: "#fff191", time: 0.5 },
					{ value: "#ff622c", time: 1 },
				],
			},
		},
		moveAcceleration: {
			enabled: false,
			accel: {
				x: 100,
				y: 200,
			},
			// maxSpeed: 0,
			minStart: 200,
			maxStart: 200,
			rotate: true,
		},
		rotationStatic: {
			enabled: false,
			min: 0,
			max: 180,
		},
		rotation: {
			enabled: false,
			minStart: 265,
			maxStart: 275,
			minSpeed: 50,
			maxSpeed: 50,
			accel: 0,
		},
		moveSpeedStatic: {
			enabled: false,
			min: 500,
			max: 500,
		},
		moveSpeed: {
			enabled: false,
			speed: {
				list: [
					{ value: 10, time: 0 },
					{ value: 100, time: 0.5 },
					{ value: 0, time: 1 },
				],
			},
			minMult: 0.8,
		},
		spawnBurst: {
			enabled: true,
			spacing: 0,
			start: 0,
			distance: 300,
		},
		blendMode: {
			enabled: false,
			blendMode: "multiply",
		},
		movePath: {
			enabled: false,
			path: "sin(x/5)*10",
			speed: {
				list: [
					{ value: 150, time: 0 },
					{ value: 50, time: 0.5 },
					{ value: 50, time: 1 },
				],
			},
			minMult: 0.8,
		},
		spawnShape: {
			enabled: false,
			type: "rect",
			dataRect: {
				x: -250,
				y: -150,
				w: 500,
				h: 300,
			},
			dataTorus: {
				radius: 100,
				x: 0,
				y: 0,
				innerRadius: 50,
				rotation: false,
			},
			dataPolygonalChain: [{ points: [{ x: 0, y: 0 }] }],
		},
		textureSingle: {
			enabled: true,
			texture: "",
		},
	},
};
