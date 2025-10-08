import { Studio } from "core/init";
import { startScene2D, startScene2DByIndex } from "utils2D";
import data from "@data";
// #if process.projConfig.projectType === "3D"
import { startScene3DByIndex } from "utils3D";
// #endif

Studio.init(() => {
	// Initialize the scenes
	if(data.isEditor){
		startScene2D("Editor");
	}
	else{
		startScene2D("Main Scene");
	}

	// #if process.projConfig.projectType === "3D"
	startScene3DByIndex(0);
	// #endif
});
