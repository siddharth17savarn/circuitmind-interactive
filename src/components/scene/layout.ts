import type { ChipId } from "@/lib/chips";

/** World placement of the two packages hovering above the wafer. */
export const CHIP_POS: Record<ChipId, [number, number, number]> = {
  panther: [-3.4, 1.35, 0],
  wildcat: [3.4, 1.35, 0],
};

export const WAFER_R = 9;

export type Block = { part: string; x: number; z: number; w: number; d: number; h?: number; tone: "main" | "glow" | "white" | "ai" | "dim" };
export type Tile = { part: string; x: number; z: number; w: number; d: number; blocks: Block[] };
export type PackageLayout = { w: number; d: number; tiles: Tile[] };

function row(part: string, n: number, x0: number, z: number, w: number, d: number, gap: number, tone: Block["tone"]): Block[] {
  return Array.from({ length: n }, (_, i) => ({ part, x: x0 + i * (w + gap), z, w, d, tone }));
}

/** Panther: compute + GPU + platform tiles. Top SKU: 4P + 8E + 4LP-E, 12 Xe-cores. */
export const PANTHER_LAYOUT: PackageLayout = {
  w: 4.4,
  d: 3.4,
  tiles: [
    {
      part: "compute",
      x: -0.85,
      z: -0.35,
      w: 2.3,
      d: 2.2,
      blocks: [
        ...row("pcore", 4, -0.81, -0.62, 0.42, 0.62, 0.12, "main"),
        ...row("ecore", 4, -0.84, 0.08, 0.22, 0.26, 0.08, "glow"),
        ...row("ecore", 4, -0.84, 0.4, 0.22, 0.26, 0.08, "glow"),
        ...row("lpe", 2, 0.42, 0.08, 0.18, 0.2, 0.08, "white"),
        ...row("lpe", 2, 0.42, 0.36, 0.18, 0.2, 0.08, "white"),
        { part: "npu", x: 0.82, z: 0.22, w: 0.32, d: 0.48, tone: "ai" },
        { part: "cache", x: 0, z: -0.15, w: 2.0, d: 0.12, tone: "dim" },
        { part: "memory", x: 0, z: 0.86, w: 2.0, d: 0.18, tone: "dim" },
      ],
    },
    {
      part: "gpu",
      x: 1.35,
      z: -0.35,
      w: 1.5,
      d: 2.2,
      blocks: [0, 1, 2, 3].flatMap((r) => row("gpu", 3, -0.44, -0.72 + r * 0.48, 0.34, 0.36, 0.1, "main")),
    },
    {
      part: "pct",
      x: 0,
      z: 1.25,
      w: 3.9,
      d: 0.55,
      blocks: [...row("pct", 6, -1.55, 0, 0.42, 0.22, 0.2, "dim")],
    },
  ],
};

/** Wildcat: compute (CPU + GPU + NPU) + platform tiles. Top SKU: 2P + 4LP-E, 2 Xe-cores. */
export const WILDCAT_LAYOUT: PackageLayout = {
  w: 3.1,
  d: 2.6,
  tiles: [
    {
      part: "compute",
      x: 0,
      z: -0.3,
      w: 2.55,
      d: 1.55,
      blocks: [
        ...row("pcore", 2, -0.95, -0.35, 0.42, 0.58, 0.12, "main"),
        ...row("lpe", 2, -0.32, -0.48, 0.18, 0.2, 0.08, "white"),
        ...row("lpe", 2, -0.32, -0.2, 0.18, 0.2, 0.08, "white"),
        ...row("gpu", 2, 0.28, -0.35, 0.34, 0.36, 0.1, "main"),
        { part: "npu", x: 1.02, z: -0.35, w: 0.3, d: 0.5, tone: "ai" },
        { part: "cache", x: 0, z: 0.18, w: 2.25, d: 0.12, tone: "dim" },
        { part: "memory", x: -0.55, z: 0.5, w: 1.1, d: 0.18, tone: "dim" },
      ],
    },
    {
      part: "pct",
      x: 0,
      z: 0.85,
      w: 2.55,
      d: 0.5,
      blocks: [...row("pct", 4, -0.9, 0, 0.42, 0.2, 0.18, "dim")],
    },
  ],
};

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
