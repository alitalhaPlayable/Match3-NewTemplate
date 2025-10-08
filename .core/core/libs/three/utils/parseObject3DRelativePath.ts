import { Object3D } from "three";

export function parseObject3DRelativePath(object3d: Object3D, relativePath: string, startIndex = 1)  {
	if (!relativePath) {
        throw new Error("empty path")
    }
    const path = relativePath.split("/") || [];
    let currentObject : (any|null) = object3d;
    for (let i = startIndex; i < path.length; i++) {
        if (path[i].startsWith("#")) {
            let found = false;
            for (let j = 0; j < currentObject.length; j++) {
                const child = currentObject[j];
                if (child.name === path[i].slice(1, path[i].length)) {
                    currentObject = child;
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error(`Child with name "${path[i].slice(1)}" not found at path segment ${i}: "${path[i]}"`);
            }
        } else {
            if (!(path[i] in currentObject)) {
                throw new Error(`Property "${path[i]}" not found on object at path segment ${i}`);
            }
            currentObject = currentObject[path[i]];
        }
    }

    return currentObject;
}