let environment: "studio" | "template" = "template";
let deviceOrientation: "landscape" | "portrait" = "portrait";
let eventEmitter: any = null;
let rootScene: any = null;
let pixiApplication: any = null;
let globalFont = "";
let pixiDimensions = { width: 0, height: 0 };

export function getEnvironment() {
	return environment;
}

export function setEnvironment(env: "studio" | "template") {
	environment = env;
}

export function isStudio() {
	return environment === "studio";
}

export function isTemplate() {
	return environment === "template";
}

export function getDeviceOrientation() {
	return deviceOrientation;
}

export function setDeviceOrientation(orientation: "landscape" | "portrait") {
	deviceOrientation = orientation;
}

export function setEventEmitter(emitter: any) {
	eventEmitter = emitter;
}

export function getEventEmitter() {
	return eventEmitter;
}

export function setRootScene(scene: any) {
	rootScene = scene;
}

export function getRootScene() {
	return rootScene;
}

export function setPixiApplication(app: any) {
	pixiApplication = app;
}

export function getPixiApplication() {
	return pixiApplication;
}

export function setGlobalFont(id: string) {
	globalFont = id;
}

export function getGlobalFont() {
	return globalFont;
}

export function getCanvasParent(): HTMLElement {
	if (isStudio()) {
		return document.getElementById("view-parent-2D") as HTMLElement;
	}
	return document.body;
}

export function setPixiDimensions(width: number, height: number) {
	pixiDimensions.width = width;
	pixiDimensions.height = height;
}

export function getPixiDimensions() {
	return {
		width: pixiDimensions.width || app.globals.pixiWidth,
		height: pixiDimensions.height || app.globals.pixiHeight,
	};
}

export function getLockedOrientation() {
	const lockScreen = app.globals.projectConfig.generalSettings.lockScreen;
	if(lockScreen === "portrait" || lockScreen === "landscape") {
		return lockScreen;
	}
	return deviceOrientation;
}