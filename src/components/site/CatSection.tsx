import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { useState } from "react";
import pantherImg from "@/assets/panther.jpg";
import wildcatImg from "@/assets/wildcat.jpg";
import { CHIPS, PERSONAS, type ChipId } from "@/lib/chips";
import { cn } from "@/lib/utils";
import { PinnedSection, range } from "./PinnedSection";

const STATS: Record<ChipId, { value: number; unit: string; label: string }[]> = {
  panther: [
    { value: 16, unit: "", label: "CPU cores" },
    { value: 12, unit: "", label: "Xe3 GPU cores" },
    { value: 180, unit: "", label: "Platform TOPS" },
    { value: 96, unit: "GB", label: "Max memory" },
  ],
  wildcat: [
    { value: 15, unit: "W", label: "Base power" },
    { value: 6, unit: "", label: "CPU cores" },
    { value: 17, unit: "", label: "NPU TOPS" },
    { value: 4.8, unit: "GHz", label: "P-core turbo" },
  ],
};

export function CatSection({ chip }: { chip: ChipId }) {
  return (
    <PinnedSection id={chip} index={chip === "panther" ? 2 : 3} height="h-[300vh]">
      {(p) => <CatInner p={p} chip={chip} />}
    </PinnedSection>
  );
}

function CatInner({ p, chip }: { p: MotionValue<number>; chip: ChipId }) {
  const info = CHIPS[chip];
  const persona = PERSONAS[chip];
  const isP = chip === "panther";
  const [step, setStep] = useState(0);
  const [stat, setStat] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    setStep(Math.round(range(v, 0.22, 0.6) * persona.moments.length));
    setStat(range(v, 0.55, 0.8));
  });

  const imgO = useTransform(p, [0, 0.15, 0.9, 1], [0, 0.9, 0.9, 0.4]);
  const imgS = useTransform(p, [0, 1], [1.15, 1]);
  const imgX = useTransform(p, [0, 1], isP ? [60, -20] : [-60, 20]);
  const titleY = useTransform(p, [0, 0.15], [60, 0]);
  const titleO = useTransform(p, [0, 0.1], [0, 1]);
  const panelO = useTransform(p, [0.15, 0.25], [0, 1]);
  const panelY = useTransform(p, [0.15, 0.28], [50, 0]);
  const statsO = useTransform(p, [0.5, 0.6], [0, 1]);

  return (
    <div className={cn("relative mx-auto flex w-full max-w-6xl", isP ? "justify-end" : "justify-start")}>
      <motion.img
        src={isP ? pantherImg : wildcatImg}
        alt={isP ? "A panther made of electric-blue circuitry" : "A wildcat made of amber circuitry"}
        width={1280}
        height={1024}
        loading="lazy"
        style={{ opacity: imgO, scale: imgS, x: imgX }}
        className={cn(
          "pointer-events-none absolute -top-[18vh] w-[min(760px,92vw)] screen-blend fade-mask",
          isP ? "right-[-6%]" : "left-[-6%]",
        )}
      />

      <div className="relative w-full md:w-[58%]">
        <motion.div style={{ y: titleY, opacity: titleO }}>
          <div className={cn("mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.3em] uppercase", info.tone)}>
            <span className="inline-block size-1.5 rounded-full bg-current glow-dot" />
            {isP ? "02" : "03"} — Meet {info.cat.toLowerCase()}
          </div>
          <h2 className="font-display text-5xl leading-none font-bold tracking-tight md:text-7xl">
            <span className={info.gradText}>{info.cat}.</span>
          </h2>
          <p className="mt-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase md:text-sm">
            {info.brand} · <span className={info.tone}>{info.codename}</span>
          </p>
          <p className="mt-4 max-w-md text-lg text-foreground/90 md:text-xl">{info.tagline}</p>
        </motion.div>

        <motion.div style={{ opacity: panelO, y: panelY }} className="pointer-events-auto mt-6 glass-panel p-5 md:p-6">
          <div className="flex items-baseline gap-4">
            <span className={cn("font-mono text-4xl font-semibold tabular-nums md:text-5xl", info.tone)}>{persona.clock}</span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">{info.persona}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{persona.scene}</p>

          <ol className="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
            <div className="absolute top-[7px] right-0 left-0 hidden h-px bg-border md:block" />
            <motion.div
              className={cn("absolute top-[7px] left-0 hidden h-px origin-left md:block", isP ? "bg-panther" : "bg-wildcat")}
              animate={{ scaleX: step / persona.moments.length }}
              style={{ right: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            {persona.moments.map((m, i) => (
              <li key={m.time} className="relative">
                <span
                  className={cn(
                    "relative z-10 block size-[15px] rounded-full border-2 transition-all duration-500",
                    i < step ? cn("glow-dot", isP ? "border-panther bg-panther text-panther" : "border-wildcat bg-wildcat text-wildcat") : "border-muted-foreground/40 bg-background",
                  )}
                />
                <motion.div animate={{ opacity: i < step ? 1 : 0.3, y: i < step ? 0 : 6 }} transition={{ duration: 0.4 }} className="mt-2">
                  <div className={cn("font-mono text-xs", info.tone)}>{m.time}</div>
                  <div className="text-xs leading-snug text-foreground/90">{m.text}</div>
                </motion.div>
              </li>
            ))}
          </ol>

          <motion.div style={{ opacity: statsO }} className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
            {STATS[chip].map((s) => (
              <div key={s.label} className={cn("rounded-lg border px-3 py-2.5", isP ? "border-panther/25 bg-panther/5" : "border-wildcat/25 bg-wildcat/5")}>
                <div className="font-display text-2xl font-bold tabular-nums md:text-3xl">
                  <span className={info.gradText}>
                    {s.value % 1 ? (s.value * stat).toFixed(1) : Math.round(s.value * stat)}
                  </span>
                  <span className="ml-0.5 text-sm text-muted-foreground">{s.unit}</span>
                </div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                  {isP && s.label !== "Max memory" ? "up to " : ""}
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div style={{ opacity: statsO }} className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Made for</span>
            {persona.who.map((w) => (
              <span key={w} className={cn("rounded-full border px-3 py-1 text-xs", isP ? "border-panther/40 text-panther-glow" : "border-wildcat/40 text-wildcat-glow")}>
                {w}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
