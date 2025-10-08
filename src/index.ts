import { Studio } from "core/init";
import { startScene2DByIndex } from "utils2D";

// #if process.projConfig.projectType === "3D"
import { startScene3DByIndex } from "utils3D";
// #endif

Studio.init(() => {
	// Initialize the scenes
	startScene2DByIndex(0);

	// #if process.projConfig.projectType === "3D"
	startScene3DByIndex(0);
	// #endif
});
