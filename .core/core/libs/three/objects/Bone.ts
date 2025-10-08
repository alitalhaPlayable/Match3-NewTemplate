import * as THREE from "three";
import materialController from "../utils/MaterialController";
import { StudioObject3D } from "./types";


class StudioBone extends THREE.Bone implements StudioObject3D {
    sID: string = "";
    type: string = "Mesh";
    selected: boolean = false;
    locked: boolean = false;
    isGameObject: boolean = true;
    materialID: string = "";

    constructor() {
        super();
        this.initComponentSystem();
    }

    updateComponents(components: { [key: string]: any }) {
        super.updateComponents(components);
    }

    update(delta: number) {
        super.update(delta)
    }
}

export default StudioBone;
