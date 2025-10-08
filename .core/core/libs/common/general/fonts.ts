class FontHandler {
	static async loadFonts(
		fonts: { [key: string]: string },
		fontMaps: {
			[key: string]: string;
		}
	) {
		const promises: Promise<void>[] = [];
		for (const key in fonts) {
			if (!fonts.hasOwnProperty(key)) continue;
			const mapList = [];
			for (const mapName in fontMaps) {
				if (fontMaps[mapName] === key) {
					mapList.push(mapName);
				}
			}
			promises.push(FontHandler.loadFont(key, fonts[key], mapList));
		}
		await Promise.all(promises);
	}

	static async loadFontCss(key: string, src: string): Promise<void> {
		const style = document.createElement("style");
		style.innerHTML = `
			@font-face {
				font-family: '${key}';
				src: url(${src});
			}
			body {
				font-family: '${key}';
			}
		`;

		const fakeParag = document.createElement("div");
		fakeParag.style.position = "absolute";
		fakeParag.style.left = "-100px";
		fakeParag.style.fontFamily = "'" + key + "'";
		fakeParag.innerHTML = "A";
		document.body.appendChild(fakeParag);
		document.head.appendChild(style);
	}

	static async loadFontItem(key: string, src: string): Promise<void> {
		const fontFace = new FontFace(key, `url(${src})`);
		return fontFace
			.load()
			.then(() => {
				// @ts-ignore
				document.fonts.add(fontFace);
			})
			.catch((error) => {
				FontHandler.loadFontCss(key, src);
			});
	}

	static async loadFont(key: string, src: string, mapList: string[]): Promise<void> {
		src = src.replace(/\\/g, "/");
		const loadList = [{ key, src }].concat(
			mapList.map((mapName) => {
				return { key: mapName, src };
			})
		);
		const promises: Promise<void>[] = [];

		for (const item of loadList) {
			promises.push(FontHandler.loadFontItem(item.key, item.src));
		}
		// const fontFace = new FontFace(key, `url(${src})`);
		// return fontFace.load().then(() => {
		// 	// @ts-ignore
		// 	document.fonts.add(fontFace);
		// });
	}
}

export default FontHandler;
