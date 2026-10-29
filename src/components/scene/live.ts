import * as THREE from "three";
import { MODE_HEX } from "@/lib/palette";
import { story } from "@/lib/story-store";

const MODE_COLORS = MODE_HEX.map((c) => new THREE.Color(c));

/** Per-frame scene state derived from scroll. Mutated in place, never via React state. */
export const live = {
  color: new THREE.Color(MODE_HEX[0]),
  power: 0,
  panther: 0.7,
  wildcat: 0.7,
  bridge: 0.3,
  dim: 0,
  progress: 0,
};

// [panther emphasis, wildcat emphasis, bridge, dim] per section
const MIX: [number, number, number, number][] = [
  [0.85, 0.85, 0.35, 0],
  [0.55, 0.55, 1, 0],
  [1, 0.15, 0.1, 0],
  [0.15, 1, 0.1, 0],
  [0.45, 0.45, 0.3, 0.55],
  [1, 1, 1, 0],
  [0.6, 0.6, 0.5, 0.2],
  [1, 1, 1, 0],
];

export function updateLive(dt: number) {
  const s = story.section;
  const k = 1 - Math.exp(-3 * dt);
  live.color.lerp(MODE_COLORS[s] ?? MODE_COLORS[0]!, k);
  live.power += (1 - live.power) * (1 - Math.exp(-0.9 * dt));
  let [p, w, b, d] = MIX[s] ?? MIX[0]!;
  if (s === 6 && story.verdict) {
    p = story.verdict === "panther" ? 1 : 0.2;
    w = story.verdict === "wildcat" ? 1 : 0.2;
  }
  live.panther += (p - live.panther) * k;
  live.wildcat += (w - live.wildcat) * k;
  live.bridge += (b - live.bridge) * k;
  live.dim += (d - live.dim) * k;
  live.progress += (story.progress - live.progress) * (1 - Math.exp(-4 * dt));
}
