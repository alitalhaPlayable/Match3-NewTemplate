import { Box3, Box3Helper, BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, MeshLambertMaterial, Object3D, PlaneGeometry, Vector2, Vector3 } from "three";
import globals from "@globals";

class threeHelper {
	constructor() {}

	/**
	 * [verilen meshe ışıktan gamma'dan etkilenmeyen shader ekler]
	 * @param  {Mesh} shader eklenecek mesh
	 */
	static simpleShader(obj) {
		let texture = obj.material.map;
		const vertexShader = `
            varying vec2 vUv;
            void main()
            {
                
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `;

		const fragmentShader = `    
            uniform sampler2D uMap;
            varying vec2 vUv;
            void main( void ) {
                vec4 tex1 = texture2D(uMap, vUv * 1.0);
                gl_FragColor = vec4(
                    tex1.r, // R
                    tex1.g, // R
                    tex1.b, // R
                    tex1.a
                );
            } 
        `;

		let uniforms = {
			uMap: { type: "t", value: texture },
		};

		let material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader,
			fragmentShader,
			lights: false,
			side: THREE.DoubleSide,
		});
		material.transparent = true;

		obj.material = material;
	}

	/**
	 * [verilen objeyi sahneye taşır]
	 * @param  {Object3D} sahneye taşınacak obje
	 */
	static moveToScene(obj) {
		obj.updateWorldMatrix(true);
		obj.getWorldPosition(obj.position);
		obj.getWorldScale(obj.scale);
		obj.getWorldQuaternion(obj.quaternion);
		globals.threeScene.add(obj);
	}

	/**
	 * [verilen objenin sahnedeki pozisyonunu verir]
	 * @param  {Object3D} pozisyonu istenen obje
	 */
	static getWorldPosition(obj) {
		obj.updateWorldMatrix(true);
		let worldPos = new THREE.Vector3();
		return obj.getWorldPosition(worldPos);
	}

	/**
	 * [verilen obje için box3 oluşturur]
	 * @param  {Object3D} box3 eklenecek obje
	 * @param  {Boolean} eklenen box3 sahnede gözüksün mü
	 */
	static modelToBox3(obj, showBox3) {
		obj.updateWorldMatrix(true);
		let box3 = new Box3().setFromObject(obj);
		if (showBox3) {
			let box3Helper = new Box3Helper(box3);
			app.main.scene.add(box3Helper);
		}

		let position = new Vector3().addVectors(box3.min, box3.max).multiplyScalar(0.5);
		let dimensions = new Vector3().subVectors(box3.max, box3.min);
		obj.dimensions = dimensions;
		return [position, dimensions, box3];
	}

	/**
	 * [sahnenin ekran görüntüsünü alır ve base64 olarak döndürür]
	 * @param  {Array} snapshot alınacak obje listesi
	 * @param  {Boolean} ışıklar eklensin mi
	 * @param  {Vector3} kamera pozisyonu
	 * @param  {Number} çözünürlük
	 */
	static takeSnapshot(objectList, addLights = true, cameraPos, resolution = 1) {
		let rendererConfig = {
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true,
		};

		let main = app.main;

		let tempScene = new THREE.Scene();
		let tempRenderer = new THREE.WebGLRenderer(rendererConfig);

		tempRenderer.outputEncoding = main.renderer.outputEncoding;
		tempRenderer.gammaFactor = main.renderer.gammaFactor;
		tempRenderer.setClearColor(0x000000, 0);

		var meshList = objectList;

		if (!meshList) {
			meshList = main.scene.children.concat();
		} else if (addLights) {
			for (let i = 0; i < main.scene.children.length; i++) {
				let obj = main.scene.children[i];
				if (obj.type.indexOf("Light") >= 0) {
					meshList.push(obj);
				}
			}
		}

		for (let obj of meshList) {
			tempScene.add(obj.clone());
		}

		function resizeCanvas(canvas, renderer) {
			//var resolution = 2;
			var scale = 1 / resolution;
			canvas.setAttribute(
				"style",
				" -ms-transform: scale(" +
					scale +
					"); -webkit-transform: scale3d(" +
					scale +
					", 1);" +
					" -moz-transform: scale(" +
					scale +
					"); -o-transform: scale(" +
					scale +
					"); transform: scale(" +
					scale +
					");" +
					" transform-origin: top left;"
			);
			var iw = window.innerWidth,
				ih = window.innerHeight;

			/*var realWidth = iw;
            var realHeight = ih;
      
            if (!iw || !ih) {
              setTimeout(function () {
                resizeCanvas(event);
              }, 500);
              return;
            }*/

			document.body.style.maxWidth = iw + "px";
			document.body.style.maxHeight = ih + "px";
			iw *= resolution;
			ih *= resolution;
			var styleWidth = iw + "px";
			var styleHeight = ih + "px";
			canvas.style.maxWidth = styleWidth;
			canvas.style.maxHeight = styleHeight;
			canvas.style.width = styleWidth;
			canvas.style.height = styleHeight;

			renderer.setSize(iw, ih);
		}

		resizeCanvas(tempRenderer.domElement, tempRenderer);

		let mainCamera = main.camera;
		let tempPos = mainCamera.position.clone();

		if (cameraPos) {
			mainCamera.position.copy(cameraPos);
		}

		tempRenderer.render(tempScene, mainCamera);

		let src = tempRenderer.domElement.toDataURL();

		for (let i = tempScene.children.length - 1; i >= 0; i--) {
			tempScene.remove(tempScene.children[i]);
		}

		mainCamera.position.copy(tempPos);

		return src;
	}

	/**
	 * [verilen objeye simple outline ekler, genelde basit şekillerde çalışır]
	 * @param  {Object3D} outline eklenecek obje
	 * @param  {Number} outline kalınlığı
	 * @param  {Color} outline rengi
	 */
	addSimpleOutline(obj, thickness = 0.02, outlineColor = 0x000000) {
		let meshList = [];

		obj.traverse((child) => {
			if (child.material) {
				meshList.push(child);
			}
		});

		meshList.forEach((mesh) => {
			let cloneMesh = mesh.clone();
			mesh.parent.add(cloneMesh);
			cloneMesh.material = new MeshLambertMaterial({
				color: outlineColor,
				side: THREE.BackSide,
			});

			cloneMesh.material.onBeforeCompile = (shader) => {
				const token = "#include <begin_vertex>";
				const customTransform = `
                    vec3 transformed = position + objectNormal*${thickness};
                `;
				shader.vertexShader = shader.vertexShader.replace(token, customTransform);
			};
		});
	}

	/**
	 * [verilen objeye trail ekler]
	 * @param  {Object3D} trailin ekleneceği obje
	 * @param  {Array} Head Geometry List
	 * @param  {Hex Color} trail rengi
	 * @param  {Number} başlangıç alpha değeri
	 * @param  {Number} bitiş alpha değeri
	 * @param  {Number} trail uzunluğu
	 */
	static addTrail(target, trailHeadGeometry, trailColor = "#000000", startAlpha = 1, endAlpha = 0, trailLength = 60) {
		let scene = globals.threeScene;
		// create the trail renderer object
		let trail = new TrailRenderer(scene, true);
		// create material for the trail renderer
		let trailMaterial = TrailRenderer.createBaseMaterial();

		let c = new THREE.Color(trailColor);
		trailMaterial.uniforms.headColor.value.set(c.r, c.g, c.b, startAlpha);
		trailMaterial.uniforms.tailColor.value.set(c.r, c.g, c.b, endAlpha);

		// initialize the trail
		trail.initialize(trailMaterial, trailLength, false, 0, trailHeadGeometry, target);
		trail.activate();

		return trail;
	}

	static sortByNameIndex(objList) {
		return objList.sort(function (a, b) {
			let numA = parseInt(a.name.match(/\d+$/)[0]);
			let numB = parseInt(b.name.match(/\d+$/)[0]);
			return numA - numB;
		});
	}

	static screenXY(pos, camera = globals.main.camera) {
		// get the position of the center of the cube
		let tempV = pos.clone();
		camera.updateMatrixWorld();
		tempV.project(camera);
		// convert the normalized position to CSS coordinates
		const x = (tempV.x * 0.5 + 0.5) * globals.pixiScene.baseWidth;
		const y = (tempV.y * -0.5 + 0.5) * globals.pixiScene.baseHeight;
		return new Vector2(x, y);
	}

	static createBox({ w = 1, h = 1, d = 1, x = 0, y = 0, z = 0, color = "#ff0000", addToScene = true, customMat } = {}) {
		let geo = new BoxGeometry(w, h, d);

		let mat;
		mat = customMat ? customMat : new MeshLambertMaterial({ color });
		let mesh = new Mesh(geo, mat);
		mesh.position.set(x, y, z);
		mesh.initSize = new Vector3(w, h, d);
		if (addToScene) globals.threeScene.add(mesh);
		return mesh;
	}

	static createSphere({ radius = 1, widthSegments = 32, heightSegments = 16, x = 0, y = 0, z = 0, color = "#ff0000", addToScene = true, customMat } = {}) {
		let geo = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

		let mat = customMat ? customMat : new THREE.MeshLambertMaterial({ color });
		let mesh = new THREE.Mesh(geo, mat);
		mesh.position.set(x, y, z);
		mesh.initSize = new THREE.Vector3(radius * 2, radius * 2, radius * 2); // Approximate bounding box

		if (addToScene) globals.threeScene.add(mesh);

		return mesh;
	}

	static createPlane({ w = 1, h = 1, x = 0, y = 0, z = 0, color = "#ff0000", addToScene = true, customMat } = {}) {
		let geo = new PlaneGeometry(w, h, 10, 10);
		let mat;
		if (customMat) {
			mat = customMat;
		} else {
			mat = new MeshBasicMaterial({ color, side: DoubleSide });
		}
		let mesh = new Mesh(geo, mat);
		mesh.position.set(x, y, z);
		mesh.rotation.x = -Math.PI / 2;
		mesh.initSize = new Vector2(w, h);
		if (addToScene) globals.threeScene.add(mesh);
		return mesh;
	}

	static distCheck2d(pos1, pos2) {
		return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.z - pos2.z, 2));
	}
}

export default threeHelper;
