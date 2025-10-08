import ScriptBase from "./ScriptBase";
import { StudioObject3D } from "../../three/objects/types";

export default class Script3D extends ScriptBase {
	get node(): StudioObject3D {
		return this._node;
	}
}
