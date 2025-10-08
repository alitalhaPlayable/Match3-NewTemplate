import { Vector3, PerspectiveCamera, AmbientLight, DirectionalLight, Vector2 } from "three";
//import Script3D from "../../src/core/libs/common/script/Script3D";
import Script3D from "core/libs/common/script/Script3D";

export default class Temp3d extends Script3D {
	_className = "Temp3d";

	/**@@type{Vector3}*/
	testVar = { x: 33, y: 22, z: 11 };

	/**@@type{Vector2} */
	testVek3 = { x: 3, y: 5 };

	/**@@type{Number}*/
	testNumber = 8;

	/**@@type{String}*/
	testString = "test 'something' else";

	/**@@type{Boolean}*/
	testBool = true;

	/**@@type{Color}*/
	testColor = "#40277a";

	/**@@type{PerspectiveCamera}*/
	testObject = null;

	/**@@type{AmbientLight} */
	testAmbientLight = null;

	/**@@type{ABShield} */
	ffSZZZhield = null;

	/**@@type{Temp3d} */
	testDirectionalLight = null;

	/**@@type{params}*/
	testParams = null;

	awake() {
		// console.log("AWAKE", this.node);
	}

	init() {
		//this.node.position.copy(this.testVek3);
		if (this.testDirectionalLight) {
			console.warn("INIT", this.testDirectionalLight.node.name);
			const bla = this.node.components.scripts?.get(Temp3d).testNumber;
			console.log("bla", bla);
			const kla = this.node.components.scripts?.getByName("Temp3d").testString;
			console.log("kla", kla);
		}
	}

	update(delta) {}

	resize(w, h) {}

	onRemove() {}
}
