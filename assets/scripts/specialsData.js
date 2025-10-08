export class SpecialsData {
	static specialData = {
		Rocket: {
			name: "rocket",
			scale: 0.6,
			idleAnimName: "idle",
			createAnimName: "creation",
			actionAnimName: "action",
		},
		LightBall: {
			name: "lightBall",
			scale: 0.6,
			idleAnimName: "idle",
			createAnimName: "creation",
			actionAnimName: "action",
		},
		Bomb: {
			name: "bomb",
			scale: 0.6,
			idleAnimName: "idle",
			createAnimName: "creation",
			// actionAnimName: "action",
		},
		Propeller: {
			name: "propeller",
			scale: 0.33,
			destroyScaleMultiplier: 2,
			idleAnimName: "Propeller_Idle",
			createAnimName: "Propeller_Creat",
			actionAnimName: "Propller_Fly_Body",
		},
	};

	static getData(name) {
		return this.specialData[name];
	}

	static comboData = {
		Bomb_Bomb: {
			name: "Bomb_Bomb",
			destroyDelay: 0.3,
			comboAnimName: "combo",
			comboAnimTimescale: 1.5,
			effectDelay: 0.55,
			extraScaler: 1.3,
			extraDelay: 0.3,
		},
		//Doesn't have extra animation
		Rocket_Rocket: {
			name: "Rocket_Rocket",
			destroyDelay: 0.15,
			extraDelay: 0.3,
		},
		Rocket_Bomb: {
			name: "Rocket_Bomb",
			destroyDelay: 0.15,
			extraScaler: 1,
			destroyDelay: 0.3,
			extraDelay: 0.3,
			effectDelay: 0.5,
			dikeyAnimName: "rocket_combo_dikey2", // Aynı satırda ve rocket dikeyse
			dikey2AnimName: "rocket_combo_dikey", // Aynı Sütunda ve rocket dikeyse
			yatayAnimName: "rocket_combo_yatay", // Aynı satırda ve rocket yataysa
			yatay2AnimName: "rocket_combo_yatay2", // Aynı sütunda ve rocket yataysa
		},
		Lightball_Lightball: {
			name: "Lightball_Lightball",
			destroyDelay: 1.4,
			comboAnimName_0: "combo_horizontal", // Aynı satırda
			comboAnimName_1: "combo_vertical", // Aynı sütunda
			extraDelay: 0,
		},
	};
}
