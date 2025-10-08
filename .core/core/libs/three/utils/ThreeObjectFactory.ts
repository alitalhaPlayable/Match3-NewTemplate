import { Bone, Object3D } from "three";
import { GameNode, PartialGameComponent } from "../../common/scene";
import AmbientLight from "../objects/lights/AmbientLight";
import DirectionalLight from "../objects/lights/DirectionalLight";
import PointLight from "../objects/lights/PointLight";
import SpotLight from "../objects/lights/SpotLight";
import Box from "../objects/primitives/Box";
import Cylinder from "../objects/primitives/Cylinder";
import Plane from "../objects/primitives/Plane";
import Sphere from "../objects/primitives/Sphere";
import { HemisphereLightGC, ModelGC, PerspectiveCameraGC, QuarksParticleGC } from "../../common/components";
import HemisphereLight from "../objects/lights/HemisphereLight";
import PerspectiveCamera from "../objects/cameras/PerspectiveCamera";
import Sprite from "../objects/primitives/Sprite";
import Model from "../objects/Model";
import ObjectTypes from "../../common/objectTypes";
import QuarksParticle from "../objects/QuarksParticle";
import InlineModel from "../objects/InlineModel";
import CustomMesh from "../objects/primitives/CustomMesh";
import SkinnedMesh from "../objects/SkinnedMesh";
import { parseObject3DRelativePath } from "./parseObject3DRelativePath";
import Physics3D from "../objects/components/physics3d";

class ThreeObjectFactory {
	static add(node: GameNode, cachedObject?: Object3D) {
		let obj: Object3D;

		const { type, components, id } = node;
		if (type === "node3D") {
			obj = this.addNode3D();
		} else if (type === ObjectTypes.MESH) {
			obj = this.addCustomMesh(components, cachedObject, id);	
		} else if (type === "box") {
			obj = this.addBox();
		} else if (type === "sphere") {
			obj = this.addSphere();
		} else if (type === "cylinder") {
			obj = this.addCylinder();
		} else if (type === "plane") {
			obj = this.addPlane();
		} else if (type === "ambientLight") {
			obj = this.addAmbientLight();
		} else if (type === "directionalLight") {
			obj = this.addDirectionalLight(components);
		} else if (type === "pointLight") {
			obj = this.addPointLight(components);
		} else if (type === "spotLight") {
			obj = this.addSpotLight(components);
		} else if (type === "hemisphereLight") {
			obj = this.addHemisphereLight(components);
		} else if (type === "perspectiveCamera") {
			obj = this.addPerspectiveCamera(components);
		} else if (type === "sprite3D") {
			obj = this.addSprite();
		} else if (type === "model") {
			obj = this.addModel(components);
		} else if (type === ObjectTypes.QUARKS_PARTICLE) {
			obj = this.addQuarksParticle(components);
		} else if (type === ObjectTypes.SKINNED_MESH) {
			obj = this.addSkinnedMesh(components, cachedObject, id);
		} else if (type === ObjectTypes.BONE) {
			obj = this.addBone(components, cachedObject);
		} else if (type === ObjectTypes.INLINE_MODEL) {
			obj = this.addInlineModel(cachedObject)
		} else { 
			console.error("Unknown object type adding box instead", type, node);
			obj = this.addBox();
		}

		if (components?.physics3D) {
			console.log("has physics3D");
			obj.components.physics3D = new Physics3D(obj);
		}

		obj.updateComponents(components);
		obj.isStudioObject = true;
		return obj;
	}

	static addInlineModel(cachedObject: any) {
		const obj = new InlineModel(cachedObject);
		return obj;
	}

	static addSkinnedMesh(components: PartialGameComponent, cachedObject: any, id: string) {
		if (components.skinnedMesh) {
			const obj = new SkinnedMesh(cachedObject, components.skinnedMesh, id);
			return obj;
		}

		return new Object3D();
	}

	
	static addCustomMesh(components: PartialGameComponent, cachedObject: any, id:string) {
		if (components.mesh) {
			const obj = new CustomMesh(cachedObject, components.mesh, id);
			return obj;
		}

		return new Object3D();
	}

	static addBone(components: PartialGameComponent, cachedObject: any) {
		if (!components.bone) return new Bone();

		let skeletonObj = parseObject3DRelativePath(cachedObject.scene, components.bone?.skeleton ?? "", 0)
		const bone = skeletonObj.bones[components.bone.index];
		if (!bone) {
			return new Bone();
		}

		// const cloneBone = bone.clone(false);
		// cloneBone.initComponentSystem();
		// skeletonObj.bones[components.bone.index] = cloneBone;

		// skeletonObj.update()
		bone.clear();
		bone.initComponentSystem?.()
		return bone;
	}

	static addNode3D() {
		const obj = new Object3D();
		obj.initComponentSystem();
		return obj;
	}

	static addBox() {
		const obj = new Box();
		return obj;
	}

	static addModel(components: PartialGameComponent) {
		const modelData = components.model as ModelGC;
		const obj = new Model(modelData.modelUUID);
		return obj;
	}

	static addSphere() {
		const obj = new Sphere();
		return obj;
	}

	static addCylinder() {
		const obj = new Cylinder();
		return obj;
	}

	static addPlane() {
		const obj = new Plane();
		return obj;
	}

	static addSprite() {
		const obj = new Sprite();
		return obj;
	}

	static addPerspectiveCamera(components: PartialGameComponent) {
		const perspectiveCamera = components.perspectiveCamera as PerspectiveCameraGC;
		const obj = new PerspectiveCamera(perspectiveCamera.fov, perspectiveCamera.aspect, perspectiveCamera.near, perspectiveCamera.far);
		return obj;
	}

	static addAmbientLight() {
		const obj = new AmbientLight();
		return obj;
	}

	static addDirectionalLight(components: PartialGameComponent) {
		const obj = new DirectionalLight(components.light?.color, components.light?.intensity);
		return obj;
	}
	static addPointLight(components: PartialGameComponent) {
		const obj = new PointLight(components.light?.color, components.light?.intensity);
		return obj;
	}

	static addSpotLight(components: PartialGameComponent) {
		const obj = new SpotLight(components.light?.color, components.light?.intensity);
		return obj;
	}

	static addHemisphereLight(components: PartialGameComponent) {
		const hemisphereLight = components.hemisphereLight as HemisphereLightGC;
		const obj = new HemisphereLight(hemisphereLight?.color, hemisphereLight?.groundColor, hemisphereLight?.intensity);
		return obj;
	}

	static addQuarksParticle(components: PartialGameComponent) {
		const data = components.quarksParticle as QuarksParticleGC;
		const obj = new QuarksParticle(data.modelUUID);
		return obj;
	}
}

export default ThreeObjectFactory;
