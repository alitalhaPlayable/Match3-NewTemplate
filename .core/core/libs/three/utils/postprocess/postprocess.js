import {
	BloomEffect,
	BrightnessContrastEffect,
	DepthOfFieldEffect,
	EffectComposer,
	EffectPass,
	FXAAEffect,
	HueSaturationEffect,
	OutlineEffect,
	PixelationEffect,
	RenderPass,
	ToneMappingEffect,
	ToneMappingMode,
	SelectiveBloomEffect,
	BlendFunction,
} from "postprocessing";
import globals from "@globals";
import Scene3D from "../../objects/Scene3D";
import { Camera } from "three";
import { GUIHelper } from "utils";

export default class Postprocess {
	constructor(renderer) {
		this.renderer = renderer;
		if (!this.renderer) {
			this.renderer = globals.threeMain.renderer;
		}
	}

	/**
	 *
	 * @param {Scene3D} scene
	 * @param {Camera} camera
	 */
	init(scene, camera) {
		console.warn("Postprocess is enabled");
		this.composer = new EffectComposer(this.renderer);
		this.composer.addPass(new RenderPass(scene, camera));
		this.composer.addPass(
			new EffectPass(
				camera,
				new ToneMappingEffect({
					mode: ToneMappingMode.LINEAR,
					exposure: 1,
				})
			)
		);

		const data = globals.data.postprocessData;
		if (data.fxaa) {
			this.composer.addPass(new EffectPass(camera, new FXAAEffect()));
		}

		/*

		if (data.colorEdit.enable) {
			this.composer.addPass(
				new EffectPass(
					camera,
					new BrightnessContrastEffect({ brightness: data.colorEdit.brightness, contrast: data.colorEdit.constrast }),
					new HueSaturationEffect({ hue: data.colorEdit.hue, saturation: data.colorEdit.saturation })
				)
			);
		}

		if (data.toon.enable) {
			this.composer.addPass(
				new EffectPass(
					camera,
					new OutlineEffect(scene, camera, {
						edgeStrength: data.toon.edgeSens,
						visibleEdgeColor: data.toon.outlineColor,
					})
				)
			);
		}

		if (data.grayscale.enable) {
			this.composer.addPass(new EffectPass(camera, new HueSaturationEffect({ hue: 0, saturation: -1 })));
		} */

		//vingette
		//to be added

		if (data.bloom.enable) {
			const effect = new SelectiveBloomEffect(scene, camera, {
				blendFunction: BlendFunction.ADD,
				mipmapBlur: true,
				luminanceThreshold: 0.066,
				luminanceSmoothing: 0.09,
				radius: 0.32,
				intensity: 0.9,
			});
			effect.inverted = true;
			effect.ignoreBackground = true;
			this.composer.addPass(new EffectPass(camera, effect));
		}

		/* if (data.pixelate.enable) {
			this.composer.addPass(new EffectPass(camera, new PixelationEffect(data.pixelate.pixelSize)));
		} */
	}

	registerBloomOptions(_composer, _effect) {
		const pass = _composer;
		const effect = _effect;
		const blendMode = effect.blendMode;
		let menu = GUIHelper.gui;

		const params = {
			intensity: effect.intensity,
			radius: effect.mipmapBlurPass.radius,
			luminance: {
				filter: effect.luminancePass.enabled,
				threshold: effect.luminanceMaterial.threshold,
				smoothing: effect.luminanceMaterial.smoothing,
			},
			selection: {
				inverted: effect.inverted,
				"ignore bg": effect.ignoreBackground,
			},
			opacity: blendMode.opacity.value,
			"blend mode": blendMode.blendFunction,
		};

		menu.add(params, "intensity", 0.0, 10.0, 0.01).onChange((value) => {
			effect.intensity = Number(value);
		});

		menu.add(params, "radius", 0.0, 1.0, 0.001).onChange((value) => {
			effect.mipmapBlurPass.radius = Number(value);
		});

		let folder = menu.addFolder("Luminance");

		folder.add(params.luminance, "filter").onChange((value) => {
			effect.luminancePass.enabled = value;
		});

		folder.add(params.luminance, "threshold", 0.0, 1.0, 0.001).onChange((value) => {
			effect.luminanceMaterial.threshold = Number(value);
		});

		folder.add(params.luminance, "smoothing", 0.0, 1.0, 0.001).onChange((value) => {
			effect.luminanceMaterial.smoothing = Number(value);
		});

		folder.open();
		folder = menu.addFolder("Selection");

		folder.add(params.selection, "inverted").onChange((value) => {
			effect.inverted = value;
		});

		folder.add(params.selection, "ignore bg").onChange((value) => {
			effect.ignoreBackground = value;
		});

		folder.open();

		menu.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {
			blendMode.opacity.value = value;
		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {
			blendMode.setBlendFunction(Number(value));
		});

		/* menu.add(pass, "dithering").onChange((value) => {
			pass.dithering = value;
		}); */

		/* if (window.innerWidth < 720) {
			menu.close();
		} */
	}

	resize(w, h) {
		if (!this.composer) return;
		this.composer.setSize(w, h);
	}

	render() {
		if (!this.composer) return;

		this.composer.render();
	}

	reset() {
		if (!this.composer) return;

		this.composer.passes.forEach((pass) => {
			if (pass.camera) {
				pass.camera = app.main.camera;
			}
		});
	}
}
