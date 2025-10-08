import Cache3D from "./Cache3D";
import * as THREE from "three";

export default class Texture3dHelpers {
	static checkValidColor(kolor: string) {
		return /^#[0-9A-F]{6}$/i.test(kolor);
	}

	static initSolidTexture(color: string) {
		if (!this.checkValidColor(color)) return null;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d")!;
		canvas.width = 512;
		canvas.height = 512;

		ctx.fillStyle = color;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const texture = new THREE.CanvasTexture(canvas);
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1, 1);
		texture.colorSpace = THREE.SRGBColorSpace;
		return texture;
	}

	static initGradientTexture(color1: string, color2: string) {
		if (!this.checkValidColor(color1) || !this.checkValidColor(color2)) return null;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d")!;
		canvas.width = 512;
		canvas.height = 512;

		const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
		grd.addColorStop(0, color1);
		grd.addColorStop(1, color2);

		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const texture = new THREE.CanvasTexture(canvas);
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1, 1);
		return texture;
	}

	static getImageBg(textureId: string) {
		const texture = Cache3D.get(textureId);
		if (!texture) return null;

		texture.colorSpace = THREE.SRGBColorSpace;

		return texture;
	}

	static async getHdrBg(hdrId: string) {
		const hdr = Cache3D.get(hdrId);
		if (!hdr) return null;
		hdr.mapping = THREE.EquirectangularReflectionMapping;
		return hdr;
	}

	static async getCubeMapBg(cubeMapId: string) {
		const cubemap = Cache3D.get(cubeMapId);
		if (!cubemap) return null;
		cubemap.mapping = THREE.CubeReflectionMapping;
		return cubemap;
	}

	static getEnvironmentMap(envMapId: string) {
		const envMap = Cache3D.get(envMapId);
		if (!envMap) return null;

		if (envMap instanceof THREE.CubeTexture) {
			envMap.mapping = THREE.CubeReflectionMapping;
		} else {
			envMap.mapping = THREE.EquirectangularReflectionMapping;
		}

		return envMap;
	}

	static resizeTexture(texture: THREE.Texture, w: number, h: number) {
		if (!texture) return;

		if (!w || !h) return;

		const targetWidth = w;
		const targetHeight = h;
		if (!texture.image) {
			console.log("no image");
			return;
		}

		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		const imageWidth = texture.image.width;
		const imageHeight = texture.image.height;

		const targetAspect = targetWidth / targetHeight;
		const imageAspect = imageWidth / imageHeight;
		const factor = imageAspect / targetAspect;
		// console.warn(targetAspect, imageAspect, factor);
		// When factor larger than 1, that means texture 'wilder' than target。
		// we should scale texture height to target height and then 'map' the center  of texture to target， and vice versa.
		texture.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
		texture.repeat.x = factor > 1 ? 1 / factor : 1;
		texture.offset.y = factor > 1 ? 0 : (1 - factor) / 2;
		texture.repeat.y = factor > 1 ? 1 : factor;

		texture.needsUpdate = true;

		// scene.background.offset.x += globals.data.bgImageOffsetX;
		// scene.background.offset.y += globals.data.bgImageOffsetY;
	}
}
