import { Filter, GlProgram } from "pixi.js";

export default class BubbleFilter extends Filter {
	private time: number = 0;

	constructor() {
		super({
			glProgram: new GlProgram({
				fragment: `
                precision mediump float;
                varying vec2 vTextureCoord;

                uniform sampler2D uTexture;
                uniform float jsTime;
                uniform float jsBubbleCount;      
                uniform float jsBubbleSpeed;      
                uniform float jsBubbleSize;       
                uniform float jsBubbleIntensity;  
                uniform vec2 jsResolution;        
                uniform float jsRandomness;       // Controls horizontal movement randomness
                uniform float jsTurbulence;       // Controls path turbulence
                uniform float jsThreshold;        // Water area threshold (same as water filter)
                #define BUBBLE_COUNT 100.0        // Increased bubble count for more density

                // Enhanced hash function for better pseudo-random numbers
                float hash(vec2 p) {
                    p = fract(p * vec2(443.8975, 397.2973));
                    p += dot(p.xy, p.yx + 19.19);
                    return fract(p.x * p.y);
                }

                // 2D hash for vector randomness
                vec2 hash2(vec2 p) {
                    return vec2(hash(p), hash(p + vec2(1.3, 2.7)));
                }

                // Improved noise function for more natural movement
                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    
                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));
                    
                    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                }

                // Generate a simple white bubble
                vec4 generateSimpleBubble(float index, vec2 uv, float waterMask) {
                    // Generate bubbles even with low water mask (more permissive)
                    if (waterMask < 0.01) {
                        return vec4(0.0);
                    }
                    
                    // Create unique seed for this bubble
                    vec2 seed = vec2(index * 12.34, index * 56.78);
                    vec2 randVec = hash2(seed);
                    
                    // Random horizontal starting position (0 to 1)
                    float xStart = randVec.x;
                    
                    // Simple size variation
                    float sizeVariation = 0.7 + randVec.y * 0.6; // 0.7x to 1.3x
                    float bubbleRadius = jsBubbleSize * sizeVariation;
                    
                    // Simple speed variation
                    float speed = jsBubbleSpeed;
                    
                    // Simple bubble lifecycle - travels from bottom to top
                    float lifecycle = 2.0;
                    float timeOffset = hash(seed + vec2(2.0, 0.0)) * 5.0;
                    float bubbleTime = mod(jsTime * speed + timeOffset, lifecycle);
                    
                    // Y position: simple upward movement
                    float yProgress = bubbleTime / lifecycle;
                    float verticalTurbulence = sin(bubbleTime * 4.0 + index) * 0.02 * jsTurbulence;
                    float yPos = 1.2 - yProgress * 1.4 + verticalTurbulence;
                    
                    // Apply randomness to the wobble frequency
                    float wobbleFreq = 2.0 + (randVec.y - 0.5) * jsRandomness;
                    float enhancedWobble = sin(bubbleTime * wobbleFreq + index) * 0.05 * jsTurbulence;

                    float xPos = xStart + enhancedWobble;
                    
                    // Bubble position
                    vec2 bubblePos = vec2(xPos, yPos);
                    
                    // Distance calculation with proper aspect ratio correction for perfect circles
                    vec2 diff = uv - bubblePos;
                    // Correct for screen aspect ratio to make actual circles
                    diff.x *= jsResolution.y / jsResolution.x; // This fixes the stretching
                    float distance = length(diff);
                    
                    // Create actual circular shape - simple and direct
                    float bubble = 1.0 - step(bubbleRadius, distance);
                    // Add slight blur to edges
                    bubble += (1.0 - smoothstep(bubbleRadius * 0.8, bubbleRadius, distance)) * 0.3;
                    
                    // Simple fade in/out
                    float fade = smoothstep(0.0, 0.1, yProgress) * (1.0 - smoothstep(0.9, 1.0, yProgress));
                    
                    // White color with alpha
                    float alpha = bubble * jsBubbleIntensity * fade * waterMask;
                    
                    return vec4(0.6, 0.8, 1.0, alpha);
                }

                void main(void) {
                    vec2 uv = vTextureCoord;
                    
                    // Sample the original texture
                    vec4 originalColor = texture2D(uTexture, uv);
                    
                    // Calculate water mask using the same method as water displacement filter
                    float alpha = originalColor.a;
                    float waterMask = smoothstep(jsThreshold * 0.3, jsThreshold * 1.5, alpha);
                    
                    // Initialize bubble accumulation
                    vec4 bubbleAccum = vec4(0.0, 0.0, 0.0, 0.0);
                    
                    // Only generate bubbles if we're in a water area (more permissive)
                    if (waterMask > 0.01) {
                        // Generate multiple tiny bubbles
                        for (float i = 0.0; i < BUBBLE_COUNT; i += 1.0) {
                            vec4 bubble = generateSimpleBubble(i, uv, waterMask);
                            
                            // Proper alpha blending
                            bubbleAccum.rgb = bubbleAccum.rgb * (1.0 - bubble.a) + bubble.rgb * bubble.a;
                            bubbleAccum.a = bubbleAccum.a + bubble.a * (1.0 - bubbleAccum.a);
                        }
                    }
                    
                    // Blend bubbles over the original texture
                    vec3 finalColor2 = originalColor.rgb * (1.0 - bubbleAccum.a) + bubbleAccum.rgb * bubbleAccum.a;
                    float finalAlpha = originalColor.a + bubbleAccum.a * (1.0 - originalColor.a);
                    
                    gl_FragColor = vec4(finalColor2, finalAlpha);
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
					jsTime: { value: 0.0, type: "f32" },
					jsBubbleSpeed: { value: 0.5, type: "f32" },
					jsBubbleSize: { value: 0.0015, type: "f32" }, // Doubled size
					jsBubbleIntensity: { value: 0.5, type: "f32" }, // Increased intensity
					jsResolution: { value: [1920, 1080], type: "vec2<f32>" },
					jsRandomness: { value: 1.0, type: "f32" },
					jsTurbulence: { value: 2.0, type: "f32" },
					jsThreshold: { value: 0.2, type: "f32" }, // Same as water filter
				},
			},
		});
	}

	// Update the time uniform for animation
	update(delta: number) {
		this.time += delta * 0.15;

		if (this.resources?.uniforms?.uniforms?.jsTime !== undefined) {
			this.resources.uniforms.uniforms.jsTime = this.time;
		}
	}

	// Set screen resolution for proper aspect ratio
	setResolution(width: number, height: number) {
		if (this.resources?.uniforms?.uniforms?.jsResolution) {
			this.resources.uniforms.uniforms.jsResolution = [width, height];
		}
	}
}
