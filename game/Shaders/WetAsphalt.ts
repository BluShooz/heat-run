import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

type Shader = {
    uniforms: { [uniform: string]: THREE.IUniform };
    vertexShader: string;
    fragmentShader: string;
}

export const AsphaltShader = {
    onBeforeCompile: (shader: Shader) => {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uRainWetness = { value: 1.0 };

        shader.fragmentShader = `
      uniform float uTime;
      uniform float uRainWetness;
      
      // Simple noise function
      float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
      float noise(vec2 x) {
        vec2 i = floor(x);
        vec2 f = fract(x);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
    ` + shader.fragmentShader;

        // Modify roughness to create puddles

        const roughnessReplacement = `
      float roughnessFactor = roughness;
      
      // Generate puddles
      float noiseVal = noise(vWorldPosition.xz * 0.5);
      float puddle = smoothstep(0.4, 0.6, noiseVal);
      
      // Rain ripples (time based rings)
      float ripple = 0.0;
      if(puddle > 0.5) {
          float t = uTime * 2.0;
          vec2 uv = vWorldPosition.xz * 5.0;
          float n = noise(uv + t); 
          ripple = sin(length(fract(uv) - 0.5) * 50.0 - t * 10.0) * 0.05 * exp(-length(fract(uv) - 0.5)*5.0);
      }
      
      roughnessFactor = mix(roughnessFactor, 0.05, puddle * uRainWetness);
      
      // Perturb normal for ripples (Cheat)
      // We will skip normal perturbation for this pass to avoid complexity with normal map mix
    `;

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <roughnessmap_fragment>',
            '#include <roughnessmap_fragment>\n' + roughnessReplacement
        );

        (shader as any).userData = { shader };
    }
};
