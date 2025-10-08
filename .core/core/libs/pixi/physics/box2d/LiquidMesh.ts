import { BlurFilter, Buffer, Filter, Geometry, GlProgram, Mesh, MeshGeometry, Rectangle} from "pixi.js";
import LiquidShader from "./LiquidShader";
import Box2DPhysics from "./Box2dPhysics";
import globals from "@globals";

import BubbleFilter from "./BubbleFilter.ts";

let box2D: any = null;

export default class LiquidMesh extends Mesh {
	liquidShader: LiquidShader;
	posArray: Float32Array;
	colorArray: Uint8Array;
	phySystem: Box2DPhysics;
	private time: number = 0;
	private bubbleFilter: BubbleFilter | undefined;

	constructor() {
		box2D = app.box2D;

		const phySystem = Box2DPhysics.getInstance();
		const maxParticleCount = phySystem.particleSystem.GetMaxParticleCount();
		const max = maxParticleCount;
		const _posArray = new Float32Array(max * 2);
		const _colorArray = new Uint8Array(max * 4);

		const posBuff = new Buffer({
			data: _posArray,
			usage: 2,
		});

		const colorBuff = new Buffer({
			data: _colorArray,
			usage: 2,
		});

		const indices = [];
		for (let i = 0; i < maxParticleCount; i += 4) {
			if (i + 3 < maxParticleCount) {
				indices.push(i, i + 1, i + 2);
				indices.push(i + 2, i + 3, i);
			}
		}

		const geometry = new Geometry({
			attributes: {
				aPos: posBuff,
				aColor: colorBuff,
			},
			indexBuffer: indices,
			topology: "point-list",
		});
		const shader = new LiquidShader();
		super({
			geometry: geometry as MeshGeometry,
			shader,
			state: null,
		});

		this.phySystem = phySystem;
		this.posArray = _posArray;
		this.colorArray = _colorArray;

		this.liquidShader = shader;
		this.init();
	}

	init() {
		this.alpha = 1;
		this.position.set(0, 0);

		const waterDisplacementFilter = new Filter({
			glProgram: new GlProgram({
				fragment:`
        varying vec2 vTextureCoord;
        varying vec4 vColor;

        uniform sampler2D uTexture;
        uniform float jsThreshold;
        uniform float jsTime;
        uniform float jsDepthIntensity;    // Controls depth effect strength
        uniform float jsSurfaceBrightness; // Controls surface brightness
        uniform vec3 jsDeepColor;          // Deep water color
        uniform vec3 jsSurfaceColor;       // Surface water color

        // Include only the most reliable Lygia functions

		float saturate(float x) {
			return clamp(x, 0.0, 1.0);
		}

		vec3 saturate(vec3 x) {
    		return clamp(x, 0.0, 1.0);
		}
        
        // Manual noise implementation
        float noise(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
        }

        // Improved noise for surface details
        float smoothNoise(vec2 uv, float time) {
            vec2 i = floor(uv);
            vec2 f = fract(uv);
            f = f * f * (3.0 - 2.0 * f);
            
            float a = noise(vec3(i, time));
            float b = noise(vec3(i + vec2(1.0, 0.0), time));
            float c = noise(vec3(i + vec2(0.0, 1.0), time));
            float d = noise(vec3(i + vec2(1.0, 1.0), time));
            
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        #define TAU 6.28318530718
        #define MAX_ITER 5

        // Simplified water effect that returns a single float
        float waterEffect(vec2 uv, float time) {
            vec2 p = (uv * TAU) - 250.0;
            vec2 i = vec2(p);
            float c = 1.0;
            float inten = 0.005;
            
            for (int n = 0; n < MAX_ITER; n++) {
                float t = time * (1.0 - (3.5 / float(n+1)));
                i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
                c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten), p.y / (cos(i.y+t)/inten)));
            }
            
            c /= float(MAX_ITER);
            c = 1.05 - pow(c, 1.2);
            
            return pow(abs(c), 5.0);
        }

        // Calculate depth-based color mixing
        vec3 calculateDepthColor(vec2 uv, float time, float alpha) {
            // Create depth map based on particle density and position
            float depth = alpha;
            
            // Add surface ripples for more realistic depth perception
            float surfaceRipple = smoothNoise(uv * 8.0 + time * 0.2, time) * 0.3;
            float mediumRipple = smoothNoise(uv * 4.0 + time * 0.15, time) * 0.2;
            float largeRipple = smoothNoise(uv * 2.0 + time * 0.1, time) * 0.1;
            
            float totalRipple = (surfaceRipple + mediumRipple + largeRipple) * 0.5;
            
            // Calculate depth factor (0 = surface, 1 = deep)
            float depthFactor = saturate(depth * jsDepthIntensity + totalRipple);
            
            // Surface gets lighter, deeper areas get darker
            float surfaceInfluence = 1.0 - depthFactor;
            surfaceInfluence = pow(surfaceInfluence, 2.0); // Non-linear falloff
            
            // Mix between deep and surface colors
            vec3 baseColor = mix(jsDeepColor, jsSurfaceColor, surfaceInfluence);
            
            // Add surface brightness/highlights
            float surfaceHighlight = pow(surfaceInfluence, 4.0) * jsSurfaceBrightness;
            baseColor += vec3(surfaceHighlight);
            
            // Add the flowing water pattern on top
            float waterPattern = waterEffect(uv, time);
            vec3 waterColor = vec3(0.1, 0.5, 0.9) * waterPattern;
            baseColor = mix(baseColor, baseColor + waterColor * 0.3, 1.0);
            
            return saturate(baseColor);
        }

        void main(void)
        {
            vec2 uv = vTextureCoord;
            
            // Sample the original texture (particles)
            float alpha = texture2D(uTexture, uv).a;
            float border = smoothstep(jsThreshold * 0.3, jsThreshold * 1.5, alpha);

            // Calculate depth-based water color
            vec3 depthColor = calculateDepthColor(uv, jsTime, alpha);
            
            // Apply fresnel-like effect for more realism
            float fresnel = pow(1.0 - alpha, 2.0);
            depthColor += vec3(fresnel * 0.1); // Slight edge lighting
            
            // Final color with depth effect
            vec4 color = vec4(depthColor, 0.3 + alpha * 0.3) * border;
            
            gl_FragColor = color;
        }
        `,
				vertex: `
        attribute vec2 aPosition;
        varying vec2 vTextureCoord;
        
        uniform vec4 uInputSize;
        uniform vec4 uOutputFrame;
        uniform vec4 uOutputTexture;
        
        vec4 filterVertexPosition( void )
        {
            vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
            
            position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
            position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
        
            return vec4(position, 0.0, 1.0);
        }
        
        vec2 filterTextureCoord( void )
        {
            return aPosition * (uOutputFrame.zw * uInputSize.zw);
        }
        
        void main(void)
        {
            gl_Position = filterVertexPosition();
            vTextureCoord = filterTextureCoord();
        }`,
			}),
			resources: {
				uniforms: {
					jsTime: { value: 0.1, type: "f32" },
					jsThreshold: { value: 0.2, type: "f32" },
					// New depth effect uniforms
					jsDepthIntensity: { value: 1.0, type: "f32" },
					jsSurfaceBrightness: { value: 0.2, type: "f32" },
					jsDeepColor: { value: [0.1, 0.3, 0.7], type: "vec3<f32>" }, // Deep blue
					jsSurfaceColor: { value: [0.4, 0.7, 1.0], type: "vec3<f32>" }, // Light blue
				},
			},
		});

		this.bubbleFilter = new BubbleFilter();
		this.bubbleFilter.setResolution(globals.pixiApp.stage.width, globals.pixiApp.stage.height);

		this.filterArea = globals.pixiApp.screen;

		// Layer filters for best water effect
		this.filters = [
			new BlurFilter({ strength: 6, quality: 2 }), // Pre-blur for smoothness
			waterDisplacementFilter, // Main water effect
			this.bubbleFilter, // Bubble effect on top
		];

		this.onResizeCallback = () => {
			this.filterArea = new Rectangle(0, 0, globals.pixiApp.stage.width, globals.pixiApp.stage.height);
			this.bubbleFilter?.setResolution(globals.pixiApp.stage.width, globals.pixiApp.stage.height);
		};
	}

	render(delta: number) {
		let count = this.phySystem.particleSystem.GetParticleCount();

		if (count > 0) {
			let numPositions = count * 2;
			let numColors = count * 4;

			if (this.posArray.length < numPositions || this.colorArray.length < numColors) {
				this.posArray = new Float32Array(numPositions);
				this.colorArray = new Uint8Array(numColors);
			}

			this.posArray.set(new Float32Array(box2D.HEAPF32.buffer, box2D.getPointer(this.phySystem.particleSystem.GetPositionBuffer()), numPositions));
			this.colorArray.set(new Uint8Array(box2D.HEAPF32.buffer, box2D.getPointer(this.phySystem.particleSystem.GetColorBuffer()), numColors));

			this.geometry.buffers[0].setDataWithSize(this.posArray, numPositions, true);
			this.geometry.buffers[1].setDataWithSize(this.colorArray, numColors, true);

			this.updateIndexBuffer(this.phySystem);
		}
	}

	updateIndexBuffer(physics: any) {
		const particleCount = physics.particleSystem.GetParticleCount();
		const indices = [];

		for (let i = 0; i < particleCount; i += 4) {
			if (i + 3 < particleCount) {
				indices.push(i, i + 1, i + 2);
				indices.push(i + 2, i + 3, i);
			}
		}

		this.geometry.indexBuffer.data = new Uint16Array(indices);
	}

	update(delta: number) {
		// Update time for wave animation
		this.time += delta * 0.3; // Smooth time progression

		// Update the water displacement filter's uniforms
		if (this.filters && this.filters[1]) {
			const waterFilter = this.filters[1] as Filter;
			if (waterFilter.resources?.uniforms?.uniforms?.jsTime) {
				waterFilter.resources.uniforms.uniforms.jsTime = this.time;
			}
		}

		if (this.bubbleFilter) {
            this.bubbleFilter.update(delta);
        }

		this.render(delta);
		this.liquidShader.updateUniforms(delta);
	}

}
