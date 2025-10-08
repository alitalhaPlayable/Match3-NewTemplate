// @ts-nocheck
import { ConstantValue, IntervalValue, PiecewiseBezier } from "three.quarks";

export default class QuarksModifier {
	static multiplyParticleScale(emitterList, mult, fullScale = false) {
		const adjustList = [];
		for (let i = 0; i < emitterList.length; i++) {
			const emitter = emitterList[i];

			const { startSize, startSpeed } = emitter.system;
			let applyForce;

			const veks = [];
			for (let j = 0; j < emitter.system.behaviors.length; j++) {
				const beh = emitter.system.behaviors[j];
				if (beh.type === "ApplyForce") {
					applyForce = beh.magnitude;
				}

				/* 	for (let key in beh) {
					let att = beh[key];
					if (att.x && !att.w) {
						veks.push(att);
					} else {
						for (let key2 in att) {
							let att2 = att[key2];
							if (att2.x && !att.w) {
								veks.push(att2);
							}
						}
					}
				}
 */
				for (const key in beh) {
					if (Object.prototype.hasOwnProperty.call(beh, key)) {
						const att = beh[key];
						if (!att) continue;

						if (att.x && !att.w) {
							veks.push(att);
						} else {
							for (const key2 in att) {
								if (Object.prototype.hasOwnProperty.call(att, key2)) {
									const att2 = att[key2];
									if (!att2) continue;

									if (att2.x && !att.w) {
										veks.push(att2);
									}
								}
							}
						}
					}
				}
			}

			if (fullScale) {
				for (let k = 0; k < veks.length; k++) {
					const v = veks[i];
					if (!v.orgVek) {
						v.orgVek = v.clone();
					}
					v.copy(v.orgVek);
					v.multiplyScalar(mult);
				}
				// console.log(veks);
			}

			adjustList.push(startSize, startSpeed, applyForce);

			if (!emitter.orgPos) {
				emitter.orgPos = emitter.position.clone();
			}
			if (!emitter.orgScale) {
				emitter.orgScale = emitter.scale.clone();
			}
			emitter.position.copy(emitter.orgPos);
			emitter.position.multiplyScalar(mult);
			// emitter.scale.copy(emitter.orgScale);
			// emitter.scale.multiplyScalar(mult);
			const shape = emitter.system.emitterShape;
			if (Number.isFinite(shape.radius)) {
				if (!shape.orgRadius) {
					shape.orgRadius = shape.radius;
				}
				shape.radius = shape.orgRadius;
				shape.radius *= mult;
			}

			for (const vals of adjustList) {
				this.changeProperty(vals, mult);
			}
		}
	}

	static changeProperty(editValue, mult, reset = true) {
		if (editValue instanceof ConstantValue) {
			if (reset) {
				if (!editValue.orgVal) {
					editValue.orgVal = editValue.value;
				}
				editValue.value = editValue.orgVal;
			}
			editValue.value *= mult;
		} else if (editValue instanceof IntervalValue) {
			if (reset) {
				if (!editValue.orgVal) {
					editValue.orgVal = { a: editValue.a, b: editValue.b };
				}
				editValue.a = editValue.orgVal.a;
				editValue.b = editValue.orgVal.b;
				// editValue.value = emitter.system.orgScale.value;
			}
			editValue.a *= mult;
			editValue.b *= mult;
			// editValue.value *= mult;
		} else if (editValue instanceof PiecewiseBezier) {
			const vals = editValue.functions[0][0].p;
			if (!editValue.orgVals) {
				editValue.orgVals = [...vals];
			}
			for (let i = 0; i < vals.length; i++) {
				vals[i] = editValue.orgVals[i] * mult;
			}
		}
	}
}
