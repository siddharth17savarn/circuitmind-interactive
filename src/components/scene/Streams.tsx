import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { HEX } from "@/lib/palette";
import { CHIP_POS, WAFER_R, mulberry32 } from "./layout";
import { live } from "./live";

type Owner = "panther" | "wildcat" | "bridge";
type Path = { pts: THREE.Vector3[]; lens: number[]; total: number; owner: Owner };

const Y = 0.03;

function buildPath(pts: THREE.Vector3[], owner: Owner): Path {
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = pts[i]!.distanceTo(pts[i - 1]!);
    lens.push(l);
    total += l;
  }
  return { pts, lens, total, owner };
}

function makePaths(): Path[] {
  const rng = mulberry32(42);
  const paths: Path[] = [];
  const limit = WAFER_R - 0.6;
  for (const owner of ["panther", "wildcat"] as const) {
    const [cx] = CHIP_POS[owner];
    const dir = owner === "panther" ? -1 : 1;
    for (let i = 0; i < 22; i++) {
      let x = cx + (rng() - 0.5) * 2.6;
      let z = (rng() - 0.5) * 2.4;
      const pts = [new THREE.Vector3(x, Y, z)];
      const horizontalFirst = rng() < 0.5;
      for (let s = 0; s < 4; s++) {
        if ((s % 2 === 0) === horizontalFirst) x += dir * (0.8 + rng() * 2.6) * (rng() < 0.2 ? -0.5 : 1);
        else z += (z >= 0 ? 1 : -1) * (0.6 + rng() * 2.6);
        const r = Math.hypot(x, z);
        if (r > limit) {
          x *= limit / r;
          z *= limit / r;
          pts.push(new THREE.Vector3(x, Y, z));
          break;
        }
        pts.push(new THREE.Vector3(x, Y, z));
      }
      paths.push(buildPath(pts, owner));
    }
  }
  // bridges between the two packages — what they share
  for (let i = 0; i < 7; i++) {
    const z = -1.4 + i * 0.47;
    const mid = (rng() - 0.5) * 1.2;
    const zOff = (rng() - 0.5) * 0.6;
    paths.push(
      buildPath(
        [
          new THREE.Vector3(CHIP_POS.panther[0] + 1.6, Y, z),
          new THREE.Vector3(mid, Y, z),
          new THREE.Vector3(mid, Y, z + zOff),
          new THREE.Vector3(CHIP_POS.wildcat[0] - 1.3, Y, z + zOff),
        ],
        "bridge",
      ),
    );
  }
  return paths;
}

const COLORS: Record<Owner, THREE.Color> = {
  panther: new THREE.Color(HEX.panther),
  wildcat: new THREE.Color(HEX.wildcat),
  bridge: new THREE.Color(HEX.silicon),
};

const amount = (o: Owner) => (o === "panther" ? live.panther : o === "wildcat" ? live.wildcat : live.bridge);

/** Copper-like traces on the wafer with light pulses racing toward each package. */
export function Streams() {
  const paths = useMemo(() => makePaths(), []);
  const segs = useMemo(() => paths.flatMap((p) => p.pts.slice(1).map((b, i) => ({ a: p.pts[i]!, b, owner: p.owner }))), [paths]);
  const traceRef = useRef<THREE.InstancedMesh>(null);
  const pulseRef = useRef<THREE.InstancedMesh>(null);

  const pulses = useMemo(() => {
    const rng = mulberry32(7);
    return paths.flatMap((p, pi) =>
      Array.from({ length: p.owner === "bridge" ? 3 : 2 }, () => ({ pi, t: rng(), speed: 0.12 + rng() * 0.22 })),
    );
  }, [paths]);

  useLayoutEffect(() => {
    const m = traceRef.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    segs.forEach((s, i) => {
      const len = s.a.distanceTo(s.b);
      o.position.set((s.a.x + s.b.x) / 2, Y, (s.a.z + s.b.z) / 2);
      o.rotation.set(0, Math.atan2(s.b.x - s.a.x, s.b.z - s.a.z), 0);
      o.scale.set(0.04, 0.01, len + 0.04);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.copy(COLORS[s.owner]).multiplyScalar(0.28));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [segs]);

  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color(), v: new THREE.Vector3() }), []);

  useFrame((_, delta) => {
    const m = pulseRef.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    pulses.forEach((pu, i) => {
      const p = paths[pu.pi]!;
      const amt = amount(p.owner);
      pu.t = (pu.t + dt * pu.speed * (0.6 + amt * 1.4) * (6 / p.total)) % 1;
      // inbound: travel from the wafer edge toward the chip (reverse); bridges go both ways
      const tt = p.owner === "bridge" ? (i % 2 ? pu.t : 1 - pu.t) : 1 - pu.t;
      let d = tt * p.total;
      let k = 0;
      while (k < p.lens.length - 1 && d > p.lens[k]!) {
        d -= p.lens[k]!;
        k++;
      }
      const a = p.pts[k]!;
      const b = p.pts[k + 1]!;
      const f = Math.min(1, d / (p.lens[k] || 1));
      tmp.v.lerpVectors(a, b, f);
      tmp.o.position.set(tmp.v.x, Y + 0.02, tmp.v.z);
      tmp.o.rotation.set(0, Math.atan2(b.x - a.x, b.z - a.z), 0);
      const s = 0.4 + amt * 0.8;
      tmp.o.scale.set(0.09 * s, 0.03, 0.42 * s);
      tmp.o.updateMatrix();
      m.setMatrixAt(i, tmp.o.matrix);
      m.setColorAt(i, tmp.c.copy(COLORS[p.owner]).multiplyScalar((0.2 + amt * 3.2) * live.power * (1 - live.dim * 0.5)));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={traceRef} args={[undefined, undefined, segs.length]} frustumCulled={false}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={pulseRef} args={[undefined, undefined, pulses.length]} frustumCulled={false}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** Arc of light linking the two packages — blue on one end, amber on the other. */
export function Bridge() {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(CHIP_POS.panther[0] + 1.2, 1.9, 0);
    const b = new THREE.Vector3(CHIP_POS.wildcat[0] - 1.0, 1.9, 0);
    const curve = new THREE.CatmullRomCurve3([a, new THREE.Vector3(-1.4, 3.4, 0), new THREE.Vector3(1.4, 3.4, 0), b]);
    return new THREE.TubeGeometry(curve, 160, 0.035, 10, false);
  }, []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmt: { value: 0 },
      uA: { value: new THREE.Color(HEX.panther) },
      uB: { value: new THREE.Color(HEX.wildcat) },
    }),
    [],
  );
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uAmt.value = live.bridge * live.power * (1 - live.dim);
  });
  return (
    <mesh geometry={geo}>
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        vertexShader={/* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={/* glsl */ `
          uniform float uTime; uniform float uAmt; uniform vec3 uA; uniform vec3 uB; varying vec2 vUv;
          void main(){
            vec3 col = mix(uA, uB, smoothstep(0.2, 0.8, vUv.x));
            float dash = smoothstep(0.55, 1.0, sin(vUv.x * 60.0 - uTime * 6.0));
            float dash2 = smoothstep(0.55, 1.0, sin(vUv.x * 60.0 + uTime * 6.0));
            float v = (0.35 + 1.8 * max(dash, dash2)) * uAmt;
            gl_FragColor = vec4(col * v * 2.0, v);
          }`}
      />
    </mesh>
  );
}
