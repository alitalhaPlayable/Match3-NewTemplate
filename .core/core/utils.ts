import base122Helper from "./brotli/base122Helper";

export const decodeBase122 = (base122: string) => {
    if(!base122.startsWith("___base122___")){
        return base122;
    }
	let src = base122.slice(13);

	const parts = src.split("___");
	const mimeType = parts.shift();
	const encodedData = parts.join("___");
	src = base122Helper.decode(encodedData, mimeType);

	return src;
};
