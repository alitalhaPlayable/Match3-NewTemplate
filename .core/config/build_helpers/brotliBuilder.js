const fs = require("fs");

const brotliPath = "./build/brotli/";

// fs.readFile(brotliPath + "brotli.html", "utf8", function (err, data) {
fs.readFile(brotliPath + "mainBrotli.js", "utf8", function (err, _mainJs) {
	let mainJs = _mainJs;
	fs.readFile(brotliPath + "extras.js", "utf8", function (err, extrasJs) {
		let fp = "";
		try {
			const configData = JSON.parse(fs.readFileSync("./projectConfig.json", "utf8"));
			fp = "//" + configData.uID + "." + configData.cID;
		} catch (err) {
			//
		}

		mainJs = extrasJs + mainJs;
		mainJs = "var ___asd = 1;" + mainJs + fp;

		// fs.writeFile( "./build/brotliMain" + ".js", mainJs, function (err) {
		fs.writeFile("./build/main" + ".js", mainJs, function (err) {
			if (err) throw err;

			// fs.writeFile("./build/step.txt", "1", function (err) {});

			/*
                fs.readdir(brotliPath, (data)=>{
                    console.log(data);
                })
                */

			setTimeout(() => {
				fs.readdir(brotliPath, (err, files) => {
					if (err) {
						console.log(err);
					} else {
						Promise.all(
							files.map((file) => {
								return fs.unlink(brotliPath + file, () => {});
							})
						).then(() => {
							const coreTempFolder = "./build/.core/";
							try {
								fs.rmdir(brotliPath, () => {});
								fs.rmdir(coreTempFolder, () => {});
							} catch (err) {
								//
							}
						});
					}
				});
			}, 1000);
		});

		//saveData = saveData.replace("</body>","<script>"+mainJs+"</script></body>");
	});
});
// });
