import { Environment, Grid, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { HEX } from "@/lib/palette";
import { setSelected } from "@/lib/story-store";
import { ChipPackage } from "./ChipPackage";
import { Dust } from "./Dust";
import { CameraRig, Director } from "./Rig";
import { Bridge, Streams } from "./Streams";
import { Wafer } from "./Wafer";

export default function SiliconScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [-2.4, 5.4, 11], fov: 45, near: 0.1, far: 120 }}
      onPointerMissed={() => setSelected(null)}
    >
      <Director />
      <color attach="background" args={[HEX.bg]} />
      <fogExp2 attach="fog" args={[HEX.bg, 0.035]} />
      <ambientLight intensity={0.25} />
      <hemisphereLight args={["#9fc9ff", "#1a0f08", 0.4]} />
      <directionalLight position={[6, 12, 6]} intensity={1.2} color="#e8f0ff" />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2.4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[14, 14, 1]} />
        <Lightformer intensity={1.8} color={HEX.panther} position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
        <Lightformer intensity={1.8} color={HEX.wildcat} position={[8, 2, 0]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>

      <Grid
        position={[0, -0.14, 0]}
        args={[80, 80]}
        cellSize={0.6}
        cellThickness={0.5}
        cellColor="#0c2034"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#14406a"
        fadeDistance={42}
        fadeStrength={1.4}
        infiniteGrid
      />
      <Wafer />
      <Streams />
      <Bridge />
      <ChipPackage chip="panther" />
      <ChipPackage chip="wildcat" />
      <Dust />
      <CameraRig />

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.62} luminanceSmoothing={0.3} intensity={1.15} radius={0.75} />
        <Noise opacity={0.035} />
        <Vignette offset={0.2} darkness={0.82} />
      </EffectComposer>
    </Canvas>
  );
}
