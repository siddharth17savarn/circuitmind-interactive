import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "./layout";
import { live } from "./live";

const COUNT = 2600;

/** Drifting silicon dust and charged sparks, animated on the GPU. */
export function Dust() {
  const { gl } = useThree();
  const geo = useMemo(() => {
    const rng = mulberry32(21);
    const pos = new Float32Array(COUNT * 3);
    const rnd = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (rng() - 0.5) * 44;
      pos[i * 3 + 1] = rng() * 12;
      pos[i * 3 + 2] = (rng() - 0.5) * 44;
      rnd[i] = rng();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixel: { value: Math.min(gl.getPixelRatio(), 2) },
      uMode: { value: new THREE.Color() },
      uPower: { value: 0 },
    }),
    [gl],
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uMode.value.copy(live.color);
    uniforms.uPower.value = live.power;
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          attribute float aRand;
          uniform float uTime; uniform float uPixel; uniform vec3 uMode; uniform float uPower;
          varying vec3 vColor; varying float vAlpha;
          void main() {
            vec3 p = position;
            p.y = mod(p.y + uTime * (0.1 + aRand * 0.25), 12.0);
            p.x += sin(uTime * 0.31 + aRand * 25.0) * 0.8;
            p.z += cos(uTime * 0.23 + aRand * 13.0) * 0.8;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float spark = step(0.92, aRand);
            float tw = 0.5 + 0.5 * sin(uTime * (1.5 + aRand * 7.0) + aRand * 60.0);
            gl_PointSize = (0.9 + aRand * 2.0 + spark * 1.8) * uPixel * (30.0 / -mv.z);
            vec3 dust = mix(vec3(0.6, 0.75, 1.0), vec3(1.0, 0.8, 0.5), fract(aRand * 7.3));
            vColor = mix(dust, uMode * 2.4, spark);
            vAlpha = (0.15 + 0.55 * tw) * (0.3 + spark * 0.9) * uPower;
            vAlpha *= smoothstep(0.0, 1.2, p.y) * smoothstep(12.0, 9.0, p.y);
            vAlpha *= smoothstep(60.0, 10.0, -mv.z) * smoothstep(0.5, 3.0, -mv.z);
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec3 vColor; varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vColor, a * a * vAlpha);
          }
        `}
      />
    </points>
  );
}
