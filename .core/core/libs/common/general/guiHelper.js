import LILGUI from "lil-gui";
import threeDATGUI from "three-dat.gui";
import Stats from "stats.js";
import globals from "@globals";

export default class GUIHelper {
	static init({ renderer3d, scene3d } = {}) {
		threeDATGUI({ GUI: LILGUI });
		this.gui = new LILGUI({
			closeFolders: true,
			//width: 150,
			touchStyles: false,
		});
		this.gui.domElement.parentElement.style.zIndex = 10000;
		this.gui.domElement.style.opacity = 0.7;
		this.gui.domElement.style.right = 0;

		this.renderer3d = renderer3d || globals.threeMain.renderer;
		this.scene3d = scene3d || globals.threeScene;
	}

	static initStats() {
		this.stats = new Stats();
		this.stats.showPanel(0);
		document.body.appendChild(this.stats.dom);

		this.statsEnabled = true;
	}

	static addColor(kolor, name, onChange) {
		let color = { val: "#" + kolor.getHexString() };
		return this.gui
			.addColor(color, "val")
			.onChange((val) => {
				//color.set(val);
				//color.convertSRGBToLinear();
				console.log(val);
				if (onChange) onChange(val);
			})
			.name(name);
	}

	/**
	 * Ambient light
	 * Directional light
	 */
	static addLightsGui(dirLight, ambLight) {
		if (!dirLight) {
			dirLight = this.scene3d.dirLight;
		}

		if (!ambLight) {
			ambLight = this.scene3d.ambientLight;
		}

		if (ambLight) {
			let f1 = this.gui.addFolder("AmbientLight");
			f1.add(ambLight, "intensity", 0, 10, 0.1);
			ambLight.colorHex = "#" + ambLight.color.getHexString();
			f1.addColor(ambLight, "colorHex").onChange((val) => {
				ambLight.color.set(val);
			});
		}
		if (dirLight) {
			let f2 = this.gui.addFolder("DirectionalLight");

			dirLight.colorHex = "#" + dirLight.color.getHexString();

			f2.add(dirLight, "intensity", 0, 10, 0.1);
			f2.addColor(dirLight, "colorHex").onChange((val) => {
				dirLight.color.set(val);
			});
			let bounds = 300;
			f2.add(dirLight.position, "x", -bounds, bounds, 0.5);
			f2.add(dirLight.position, "y", -bounds, bounds, 0.5);
			f2.add(dirLight.position, "z", -bounds, bounds, 0.5);
		}
	}

	/**
	 * Background Color(Linear)
	 * Fog
	 * Tone Mapping
	 */
	static addBackgroundThings() {
		let f3 = this.gui.addFolder("backgroundThings");
		//console.log(this.renderer3d.background);
		let bgColor = {
			val: this.renderer3d.background || "#ffffff",
		};
		f3.addColor(bgColor, "val").onChange((val) => {
			this.scene3d.background = new THREE.Color(val);
		});

		if (this.scene3d.fog) {
			this.gui.addFog("fog", this.scene3d.fog);
		}

		let toneMappingOptions = {
			None: THREE.NoToneMapping,
			Linear: THREE.LinearToneMapping,
			Reinhard: THREE.ReinhardToneMapping,
			Cineon: THREE.CineonToneMapping,
			ACESFilmic: THREE.ACESFilmicToneMapping,
			AgXToneMapping: THREE.AgXToneMapping,
			NeutralToneMapping: THREE.NeutralToneMapping,
			Custom: THREE.CustomToneMapping,
		};
		let params = {
			exposure: 1.0,
			toneMapping: toneMappingOptions.Linear,
		};
		f3.add(params, "toneMapping", Object.keys(toneMappingOptions)).onChange(() => {
			this.renderer3d.toneMapping = toneMappingOptions[params.toneMapping];
			this.scene3d.traverse((obj) => {
				if (obj.material) {
					obj.material.needsUpdate = true;
				}
			});
		});
		f3.add(params, "exposure", 0, 1, 0.01).onChange((val) => {
			this.renderer3d.toneMappingExposure = val;
			this.scene3d.traverse((obj) => {
				if (obj.material) {
					obj.material.needsUpdate = true;
				}
			});
		});
	}

	static addCameraGui(camera) {
		let f4 = this.gui.addFolder("CamSettings");

		f4.add(camera, "fov", 10, 100, 1).onChange((val) => {
			camera.fov = val;
			camera.updateProjectionMatrix();
		});
		f4.add(camera, "far", 0, 5000, 0.1).onChange((val) => {
			camera.far = val;
			camera.updateProjectionMatrix();
		});
		f4.addObject3D("cam", camera);
	}

	static initOriginBox() {
		let bb = ThreeHelpers.createBox();
		bb.material.depthTest = false;
		bb.material.depthWrite = false;
		bb.material.transparent = true;
		bb.material.opacity = 0.2;
		this.originBox = bb;
		bb.visible = true;
		return bb;
	}
}
