export default function startVideo(src, callback) {
	let initVideoCount = 0;
	let startStep = 0;
	let soundTimeout;

	const video = document.createElement("video");
	video.style.position = "fixed";
	video.style.top = 0;
	video.style.left = 0;
	video.style.width = "100%";
	video.style.height = "100%";
	video.style.objectFit = "cover";
	video.style.zIndex = 1999;
	video.style.backgroundColor = "#000";
	video.style.pointerEvents = "none";
	video.style.userSelect = "none";

	video.playsinline = true;
	video.loop = false;
	video.muted = true;
	video.removeAttribute("controls");
	video.setAttribute("muted", "muted");
	video.setAttribute("playsinline", "playsinline");
	video.setAttribute("crossOrigin", "Anonymous");

	document.body.appendChild(video);

	// Add source element
	const vidSource = document.createElement("source");
	vidSource.src = src;
	vidSource.type = "video/mp4";
	video.appendChild(vidSource);

	function videoStartSuccess() {
		video.addEventListener("ended", () => {
			video.style.pointerEvents = "none";
			callback && callback();
			callback = null;
			video.style.opacity = 0;
			setTimeout(() => {
				video.remove();
			}, 500);
		});
	}

	// Resize handler
	app.pfResizeVideo = (w, h) => {
		video.style.objectFit = w < h ? "cover" : "contain";
	};

	if (app.documentWidth) {
		app.pfResizeVideo(app.documentWidth, app.documentHeight);
	} else {
		app.pfResizeVideo(window.innerWidth, window.innerHeight);
	}

	function initialPlayVideo() {
		if (window.app && app?.globals?.type == "applovin") {
			// For AppLovin, start with muted video
			video.muted = true;
			video.setAttribute("muted", "muted");
			video
				.play()
				.then(() => {
					videoStartSuccess();
				})
				.catch((err) => {
					console.log("AppLovin video play failed:", err);
					// Fallback to image version
					startImageVersion();
				});
			return;
		}

		if (window.app && app.gamePaused) {
			setTimeout(() => {
				initialPlayVideo();
			}, 200);
			return;
		}

		let v2;

		// Try to play with sound first if conditions are met
		if (startStep == 0 && !app.data.soundDisabled && window?.app?.main?.soundEnabled) {
			startStep = 1;
			video.muted = false;
			video.removeAttribute("muted");
			v2 = video.play();
			if (v2 !== undefined) {
				soundTimeout = setTimeout(() => {
					if (video.currentTime === 0) {
						initialPlayVideo();
					}
				}, 500);
				v2.then(() => {
					clearTimeout(soundTimeout);
					videoStartSuccess();
				}).catch((e) => {
					clearTimeout(soundTimeout);
					initialPlayVideo();
				});
			}
			return;
		}

		// Play muted video
		video.muted = true;
		video.setAttribute("muted", "muted");
		console.warn("try starting", initVideoCount);
		v2 = video.play();
		if (v2 !== undefined) {
			v2.then(() => {
				videoStartSuccess();
				console.warn("autoPlay start");
			}).catch((e) => {
				console.warn("error autoPlay", e);
				initVideoCount++;
				if (initVideoCount < 4) {
					setTimeout(() => {
						initialPlayVideo();
					}, 200);
				} else {
					// Fallback to image version after multiple failed attempts
					startImageVersion();
				}
				console.warn("initVideoCount:", initVideoCount);
			});
		} else {
			console.warn("v2 Undefined , ", v2);
		}
	}

	function startImageVersion() {
		const img = document.createElement("img");
		img.src = src;
		document.body.appendChild(img);
		img.style.position = "absolute";
		img.style.top = 0;
		img.style.left = 0;
		img.style.width = "100%";
		img.style.height = "100%";
		img.style.objectFit = "cover";
		img.style.zIndex = 1999;
		img.style.backgroundColor = "#000";

		let timeout = setTimeout(() => {
			img.style.pointerEvents = "none";
			callback && callback();
			callback = null;
			img.style.opacity = 0;
			setTimeout(() => {
				img.remove();
			}, 500);
		}, app.data.entranceVideoDuration * 1000 + 250);

		video.style.display = "none";
		video.remove();

		app.pfResizeVideo = (w, h) => {
			img.style.objectFit = w < h ? "cover" : "contain";
		};
		if (app.documentWidth) {
			app.pfResizeVideo(app.documentWidth, app.documentHeight);
		}
	}

	// Start video after a short delay
	setTimeout(() => {
		initialPlayVideo();
	}, 500);
}
