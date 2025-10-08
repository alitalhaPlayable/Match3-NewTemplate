import ScriptBase from "./ScriptBase";
import { StudioObject2D } from "../../pixi/objects/types";

export default class Script2D extends ScriptBase {
	get node(): StudioObject2D {
		return this._node;
	}
}
