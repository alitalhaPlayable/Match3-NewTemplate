import * as THREE from "three";
import { GameComponent, Sprite3DGC } from "../../../common/components";
import ObjectTypes from "../../../common/objectTypes";
import { StudioObject3D } from "../types";
import MaterialController from "../../utils/MaterialController";

const spriteMaterial = new THREE.SpriteMaterial({ color: 0xffffff });

class Sprite extends THREE.Sprite implements StudioObject3D {
	type: ObjectTypes = ObjectTypes.SPRITE3D;

	constructor(material?: THREE.SpriteMaterial) {
		super(material || spriteMaterial);
		this.initComponentSystem();
	}

	updateSpriteComponent(component: Sprite3DGC) {
		this.center.copy(component.center);

		if (component.material) {
			const material = MaterialController.get(component.material);
			if (material) {
				this.material = material as THREE.SpriteMaterial;
			}
		}
	}

	updateComponents(components: { [key: string]: GameComponent }) {
		const sprite = components.sprite3D as Sprite3DGC;
		if (sprite) {
			this.updateSpriteComponent(sprite);
		}
		super.updateComponents(components);
	}
}

export default Sprite;
