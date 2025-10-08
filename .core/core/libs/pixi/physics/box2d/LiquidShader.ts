import { GlProgram, GpuProgram, Shader, Texture } from "pixi.js";
import Box2DPhysics from "./Box2dPhysics";

export default class LiquidShader extends Shader {
    texture: Texture;
    constructor() {
        const glProgram = new GlProgram({
            name: "grid-shader",
            vertex: `
        in vec2 aPosition;

        attribute vec2 aPos;
        attribute vec3 aColor;

        uniform mat3 uProjectionMatrix;
        uniform mat3 uWorldTransformMatrix;

        uniform mat3 uTransformMatrix;

        uniform float PTM;

        varying vec4 vColor;

        void main() {
            mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
            gl_Position = vec4((mvp * vec3(aPos.x * PTM, aPos.y * PTM, 1.0)).xy, 0.0, 1.0);
            gl_PointSize = 12.0;

            vColor = vec4(aColor, 1.0);
        }
			`,
            fragment: `
        varying vec4 vColor;
        
        void main(void)
        {
            vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
            float distance = dot(circCoord, circCoord);
            
            // Create softer, more blended particles
            float alpha = 1.0 - smoothstep(0.3, 1.2, distance);
            
            // Use a consistent blue color for water
            vec4 waterColor = vec4(0.2, 0.6, 1.0, alpha * 1.0);
            
            gl_FragColor = waterColor;
        }
			`,
        });

        const shaderSrc = `
      struct GlobalUniforms {
          uProjectionMatrix : mat3x3<f32>,
          uWorldTransformMatrix : mat3x3<f32>,
          uWorldColorAlpha : vec4<f32>,
          uResolution : vec2<f32>,
      }

      struct LocalUniforms {
          uTransformMatrix : mat3x3<f32>,
          uColor : vec4<f32>,
          uRound : f32,
      }

      struct CustomUniforms {
        vpw: f32,
				vph: f32,
				thickness: f32,
				pitchX: f32,
				pitchY: f32,
				color: vec3<f32>,
				offsetX: f32,
				offsetY: f32,
            }
			
			fn custom_mod(x: f32, y: f32) -> f32 { 
				return x - y * floor(x / y);
			}

            @binding(0) @group(2) var<uniform> customUniforms : CustomUniforms;
            @binding(0) @group(0) var<uniform> globalUniforms : GlobalUniforms;
            @binding(0) @group(1) var<uniform> localUniforms : LocalUniforms;

            @vertex 
            fn vsMain(
                @location(0) aPosition : vec2<f32>,
            ) -> @builtin(position) vec4f {
            	return vec4f(aPosition, 0.0, 1.0);
            }

            @fragment 
			fn fsMain(
                @builtin(position) coord: vec4<f32>,
            ) -> @location(0) vec4<f32> {
				var outColor : vec4<f32>;

				var modX = custom_mod(coord.x - customUniforms.offsetX, customUniforms.pitchX);
				var modY = custom_mod(coord.y - customUniforms.offsetY, customUniforms.pitchY);

				var condition = (modX < 1.0) || (modY < 1.0);
				outColor = vec4<f32>(customUniforms.color, 1.0) * f32(condition);

				return outColor;
			}
        `;

        const gpuProgram = GpuProgram.from({
            name: "grid-shader",
            vertex: {
                source: shaderSrc,
                entryPoint: "vsMain",
            },
            fragment: {
                source: shaderSrc,
                entryPoint: "fsMain",
            },
        });
        gpuProgram.autoAssignGlobalUniforms = true;
        gpuProgram.autoAssignLocalUniforms = true;

        const phySystem = Box2DPhysics.getInstance();

        super({
            glProgram,
            gpuProgram,
            resources: {
                customUniforms: {
                    PTM: { type: "f32", value: phySystem.PTM },
                },
            },
        });

        // this.texture = Texture.WHITE;
    }

    updateUniforms(delta: number) {
        // this.resources.customUniforms.uniforms.PTM = 100;
    }
}
