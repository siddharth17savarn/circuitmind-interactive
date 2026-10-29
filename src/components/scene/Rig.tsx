import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { story } from "@/lib/story-store";
import { live, updateLive } from "./live";

/** Must be the first scene child so every other frame callback reads fresh state. */
export function Director() {
  useFrame((_, delta) => updateLive(Math.min(delta, 0.05)));
  return null;
}

type Shot = { pos: [number, number, number]; look: [number, number, number] };

// one camera shot per page section
const SHOTS: Shot[] = [
  { pos: [-2.4, 5.4, 11], look: [-3.3, 0.9, 0] },
  { pos: [0, 15.5, 5], look: [0, 0, 0] },
  { pos: [-0.9, 3.9, 6.4], look: [-0.7, 1.1, 0] },
  { pos: [0.9, 3.9, 6.4], look: [0.7, 1.1, 0] },
  { pos: [0, 9, 13], look: [0, 0, -2] },
  { pos: [0, 2.8, 9.5], look: [0, 1.6, 0] },
  { pos: [0, 7, 12], look: [0, 1, 0] },
  { pos: [0, 5.2, 13.5], look: [0, 1.4, 0] },
];

/** Scroll-driven camera with mouse parallax and a slow orbit during the quiz. */
export function CameraRig() {
  const light = useRef<THREE.PointLight>(null);
  const pos = useMemo(() => new THREE.Vector3(...SHOTS[0]!.pos), []);
  const look = useMemo(() => new THREE.Vector3(...SHOTS[0]!.look), []);
  const tPos = useMemo(() => new THREE.Vector3(), []);
  const tLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, pointer, clock, size }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    const shot = SHOTS[story.section] ?? SHOTS[0]!;
    tLook.set(...shot.look);
    tPos.set(...shot.pos);
    if (story.section === 6) {
      const a = t * 0.12;
      tPos.set(Math.sin(a) * 12, 7, Math.cos(a) * 12);
    }
    // portrait screens: centre the subject and pull back
    const aspect = size.width / size.height;
    if (aspect < 1) {
      tLook.x *= 0.15;
      tPos.x *= 0.3;
      tPos.sub(tLook).multiplyScalar(1.85).add(tLook);
    }
    tPos.x += pointer.x * 0.9;
    tPos.y += pointer.y * 0.45;
    const k = 1 - Math.exp(-2.2 * dt);
    pos.lerp(tPos, k);
    look.lerp(tLook, k);
    camera.position.copy(pos);
    camera.lookAt(look);
    if (light.current) {
      light.current.position.set(look.x, 4.5, look.z + 2);
      light.current.color.copy(live.color);
      light.current.intensity = 18 * live.power;
    }
  });

  return <pointLight ref={light} distance={22} decay={1.6} />;
}
