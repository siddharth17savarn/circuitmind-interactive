import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CHIPS, type ChipId } from "@/lib/chips";
import { HEX } from "@/lib/palette";
import { setHovered, setSelected, story } from "@/lib/story-store";
import { CHIP_POS, PANTHER_LAYOUT, WILDCAT_LAYOUT, type Block } from "./layout";
import { live } from "./live";

const SUB_H = 0.14;
const TILE_H = 0.12;

const TONES: Record<ChipId, Record<Block["tone"], string>> = {
  panther: { main: HEX.panther, glow: HEX.pantherGlow, white: HEX.silicon, ai: HEX.intel, dim: "#2d5fa8" },
  wildcat: { main: HEX.wildcat, glow: HEX.wildcatGlow, white: HEX.silicon, ai: HEX.intel, dim: "#9a6a1c" },
};

const emph = (chip: ChipId) => (chip === "panther" ? live.panther : live.wildcat);

function handlers(key: string) {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(key);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (story.hovered === key) setHovered(null);
      document.body.style.cursor = "";
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      setSelected(key);
    },
  };
}

/** One glowing functional block. Brightens when its part is hovered or selected. */
function BlockMesh({ chip, block, y }: { chip: ChipId; block: Block; y: number }) {
  const key = `${chip}:${block.part}`;
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const color = useMemo(() => new THREE.Color(TONES[chip][block.tone]), [chip, block.tone]);
  const base = block.tone === "dim" ? 0.5 : 1.1;
  const h = block.h ?? 0.035;

  useFrame(({ clock }) => {
    if (!mat.current) return;
    const t = clock.elapsedTime;
    const hot = story.hovered === key;
    const sel = story.selected === key;
    const flick = 0.85 + 0.15 * Math.sin(t * 3 + block.x * 9 + block.z * 7);
    let target = base * (0.35 + emph(chip) * 0.9) * flick * (1 - live.dim * 0.6) * live.power;
    if (hot) target = 3.4;
    if (sel) target = 3 + Math.sin(t * 6) * 1.2;
    mat.current.emissiveIntensity += (target - mat.current.emissiveIntensity) * 0.18;
  });

  return (
    <mesh position={[block.x, y + h / 2, block.z]} {...handlers(key)}>
      <boxGeometry args={[block.w, h, block.d]} />
      <meshStandardMaterial ref={mat} color="#05080d" emissive={color} emissiveIntensity={0} roughness={0.35} metalness={0.4} />
    </mesh>
  );
}

function Pads({ w, d }: { w: number; d: number }) {
  const geo = useMemo(() => {
    const gs: THREE.BufferGeometry[] = [];
    const step = 0.16;
    for (let x = -w / 2 + 0.12; x <= w / 2 - 0.1; x += step) {
      for (const z of [-d / 2 + 0.07, d / 2 - 0.07]) {
        const g = new THREE.BoxGeometry(0.07, 0.012, 0.07);
        g.translate(x, SUB_H + 0.006, z);
        gs.push(g);
      }
    }
    for (let z = -d / 2 + 0.2; z <= d / 2 - 0.2; z += step) {
      for (const x of [-w / 2 + 0.07, w / 2 - 0.07]) {
        const g = new THREE.BoxGeometry(0.07, 0.012, 0.07);
        g.translate(x, SUB_H + 0.006, z);
        gs.push(g);
      }
    }
    return mergeGeometries(gs)!;
  }, [w, d]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#d8b15e" metalness={1} roughness={0.25} />
    </mesh>
  );
}

/** A hovering processor package made of clickable tiles and blocks. */
export function ChipPackage({ chip }: { chip: ChipId }) {
  const layout = chip === "panther" ? PANTHER_LAYOUT : WILDCAT_LAYOUT;
  const [px, py, pz] = CHIP_POS[chip];
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Group>(null);
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: chip === "panther" ? HEX.panther : HEX.wildcat,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [chip],
  );
  const beamMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color(chip === "panther" ? HEX.panther : HEX.wildcat) }, uAmt: { value: 0 }, uTime: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform float uAmt; uniform float uTime; varying vec2 vUv;
          void main(){
            float fade = pow(1.0 - vUv.y, 1.6);
            float bands = 0.65 + 0.35 * sin(vUv.y * 40.0 - uTime * 4.0);
            gl_FragColor = vec4(uColor * 1.6, fade * bands * uAmt * 0.35);
          }`,
      }),
    [chip],
  );
  const phase = chip === "panther" ? 0 : 1.7;
  const maxSide = Math.max(layout.w, layout.d);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.elapsedTime;
    const e = emph(chip);
    if (group.current) {
      group.current.position.y = py + Math.sin(t * 0.8 + phase) * 0.08 + e * 0.25;
      group.current.rotation.x += (-0.08 - pointer.y * 0.06 - group.current.rotation.x) * Math.min(1, delta * 3);
      group.current.rotation.z += (pointer.x * 0.05 - group.current.rotation.z) * Math.min(1, delta * 3);
      group.current.rotation.y = Math.sin(t * 0.3 + phase) * 0.06 + (chip === "panther" ? 0.12 : -0.12);
      const s = 0.9 + e * 0.14;
      group.current.scale.setScalar(s);
    }
    if (halo.current) halo.current.rotation.z = t * 0.25 * (chip === "panther" ? 1 : -1);
    haloMat.opacity = (0.15 + e * 0.6) * live.power * (1 - live.dim * 0.5);
    beamMat.uniforms["uAmt"]!.value = e * live.power;
    beamMat.uniforms["uTime"]!.value = t;
  });

  const label = CHIPS[chip];

  return (
    <group position={[px, 0, pz]}>
      {/* light column from wafer to package */}
      <mesh position={[0, 0.9, 0]} material={beamMat}>
        <cylinderGeometry args={[maxSide * 0.55, maxSide * 0.62, 1.8, 48, 1, true]} />
      </mesh>
      {/* halo rings on the wafer */}
      <group ref={halo} position={[0, 0.06, 0]} rotation-x={-Math.PI / 2}>
        <mesh material={haloMat}>
          <ringGeometry args={[maxSide * 0.68, maxSide * 0.7, 96]} />
        </mesh>
        <mesh material={haloMat}>
          <ringGeometry args={[maxSide * 0.78, maxSide * 0.785, 96, 1, 0, Math.PI * 1.3]} />
        </mesh>
        <mesh material={haloMat}>
          <ringGeometry args={[maxSide * 0.86, maxSide * 0.865, 96, 1, Math.PI, Math.PI * 0.6]} />
        </mesh>
      </group>

      <group ref={group} position={[0, py, 0]}>
        {/* substrate */}
        <mesh position={[0, SUB_H / 2, 0]} {...handlers(`${chip}:package`)}>
          <boxGeometry args={[layout.w, SUB_H, layout.d]} />
          <meshStandardMaterial color="#0c1416" roughness={0.6} metalness={0.3} />
        </mesh>
        <Pads w={layout.w} d={layout.d} />
        {layout.tiles.map((tile) => (
          <group key={tile.part} position={[tile.x, SUB_H, tile.z]}>
            <mesh position={[0, TILE_H / 2, 0]} {...handlers(`${chip}:${tile.part}`)}>
              <boxGeometry args={[tile.w, TILE_H, tile.d]} />
              <meshPhysicalMaterial color="#0a0f18" roughness={0.18} metalness={0.75} clearcoat={1} clearcoatRoughness={0.1} />
            </mesh>
            {tile.blocks.map((b, i) => (
              <BlockMesh key={i} chip={chip} block={b} y={TILE_H} />
            ))}
          </group>
        ))}
        <Html position={[0, 0.5, -layout.d / 2 - 0.35]} center distanceFactor={9} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <div className="flex flex-col items-center whitespace-nowrap select-none">
            <span className={`font-mono text-[10px] uppercase tracking-[0.35em] ${label.tone}`}>{label.codename}</span>
            <span className="mt-1 font-display text-sm font-semibold text-foreground/90">{label.brand.replace("Intel® ", "")}</span>
          </div>
        </Html>
      </group>
    </group>
  );
}
