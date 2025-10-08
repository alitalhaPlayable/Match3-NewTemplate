export function pfDynamicFuncs() {
	let camPropsList = ["camZoom", "camVert", "camHorz"];
	camPropsList.forEach((prop) => {
		window.addEventListener("pf_" + prop, (e) => {
			let data = app.data;
			data[prop] = e.detail.value;
			let cam = window.cameraMan;
			if (!cam) return;

			cam.setSphericalOffsets(data["camZoom"], data["camVert"], data["camHorz"]);

			//cam.setFov(data.cameraFov);
			//cam.updateProjectionMatrix();
		});
	});

	let ctaButtonList = ["ctaButtonWidth", "ctaButtonHeight", "ctaButtonXPortrait", "ctaButtonYPortrait", "ctaButtonXLandscape", "ctaButtonYLandscape"];
	ctaButtonList.forEach((prop) => {
		window.addEventListener("pf_" + prop, (e) => {
			let data = app.data;
			data[prop] = e.detail.value;
			app.changeCtaButtonProps();
		});
	});

	let logoList = ["logoWidth", "logoHeight", "logoXPortrait", "logoYPortrait", "logoXLandscape", "logoYLandscape"];
	logoList.forEach((prop) => {
		window.addEventListener("pf_" + prop, (e) => {
			let data = app.data;
			data[prop] = e.detail.value;
			app.changeLogoProps();
		});
	});

	let gifList = ["gifScale", "gifPosX", "gifPosY", "gifPosXHorizontal", "gifPosYHorizontal"];

	gifList.forEach((prop) => {
		window.addEventListener("pf_" + prop, (e) => {
			let data = app.data;
			data[prop] = e.detail.value;
			app.updateGif();
		});
	});
}
