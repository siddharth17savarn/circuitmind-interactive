import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { WAFER_R, mulberry32 } from "./layout";
import { live } from "./live";

function makeWaferTexture() {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const rng = mulberry32(18);
  const cx = size / 2;
  const R = size / 2 - 4;

  g.fillStyle = "#05070b";
  g.fillRect(0, 0, size, size);

  const bg = g.createRadialGradient(cx, cx, 0, cx, cx, R);
  bg.addColorStop(0, "#1a2230");
  bg.addColorStop(0.7, "#121924");
  bg.addColorStop(1, "#0b1018");
  g.fillStyle = bg;
  g.beginPath();
  g.arc(cx, cx, R, 0, Math.PI * 2);
  g.fill();

  // dies with a thin-film sheen that shifts with angle
  const pitch = 30;
  const gap = 3;
  for (let y = 0; y < size; y += pitch) {
    for (let x = 0; x < size; x += pitch) {
      const dx = x + pitch / 2 - cx;
      const dy = y + pitch / 2 - cx;
      const r = Math.hypot(dx, dy);
      if (r > R - 26) continue;
      const a = Math.atan2(dy, dx);
      const hue = 200 + Math.sin(a * 2 + r * 0.01) * 22 + (r / R) * 18;
      const light = 16 + Math.sin(a * 3) * 5 + rng() * 4;
      g.fillStyle = `hsl(${hue} 45% ${light}%)`;
      g.fillRect(x + gap, y + gap, pitch - gap * 2, pitch - gap * 2);
      // tiny circuitry hint inside each die
      g.fillStyle = `hsla(${hue + 30} 60% 60% / 0.18)`;
      g.fillRect(x + gap + 4, y + gap + 4, (pitch - gap * 2) * 0.45, (pitch - gap * 2) * 0.3);
      g.fillRect(x + gap + 4, y + pitch - gap - 10, (pitch - gap * 2) * 0.7, 3);
      if (rng() < 0.05) {
        g.fillStyle = "rgba(255,190,90,0.25)";
        g.fillRect(x + gap, y + gap, pitch - gap * 2, pitch - gap * 2);
      }
    }
  }

  // edge exclusion + notch
  g.strokeStyle = "rgba(200,220,240,0.25)";
  g.lineWidth = 2;
  g.beginPath();
  g.arc(cx, cx, R - 14, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#05070b";
  g.beginPath();
  g.arc(cx, size - 4, 12, 0, Math.PI * 2);
  g.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** A 300 mm-style 18A wafer — the shared birthplace of both families — with a radar sweep. */
export function Wafer() {
  const tex = useMemo(() => makeWaferTexture(), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uPower: { value: 0 } }), []);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uColor.value.copy(live.color);
    uniforms.uPower.value = live.power * (1 - live.dim * 0.6) * (0.6 + live.bridge * 0.6);
  });

  return (
    <group>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[WAFER_R, WAFER_R, 0.12, 160]} />
        <meshStandardMaterial color="#1b2330" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <circleGeometry args={[WAFER_R, 160]} />
        <meshStandardMaterial map={tex} metalness={0.85} roughness={0.28} envMapIntensity={1.3} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <circleGeometry args={[WAFER_R, 160]} />
        <shaderMaterial
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={/* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={/* glsl */ `
            uniform float uTime; uniform vec3 uColor; uniform float uPower; varying vec2 vUv;
            void main(){
              vec2 p = vUv - 0.5;
              float r = length(p) * 2.0;
              float a = atan(p.y, p.x);
              // die grid lines
              vec2 g = abs(fract(vUv * 34.0) - 0.5);
              float grid = smoothstep(0.47, 0.5, max(g.x, g.y));
              // radar sweep
              float sweep = mod(a - uTime * 0.45, 6.28318) / 6.28318;
              float beam = pow(1.0 - sweep, 18.0) + pow(1.0 - sweep, 3.0) * 0.12;
              // expanding ring wave
              float wave = fract(uTime * 0.12);
              float ring = smoothstep(0.035, 0.0, abs(r - wave)) * (1.0 - wave);
              float edge = smoothstep(0.985, 0.995, r) * (1.0 - smoothstep(0.995, 1.0, r));
              float v = (grid * (0.08 + beam * 1.4) + beam * 0.18 + ring * 0.7 + edge * 0.9) * uPower;
              v *= 1.0 - smoothstep(0.98, 1.0, r);
              gl_FragColor = vec4(uColor * v, v);
            }`}
        />
      </mesh>
    </group>
  );
}
