import { AnimatePresence, motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { Atom, Bluetooth, Cpu, Layers, MonitorPlay, Sparkles, Usb, Zap } from "lucide-react";
import { useState } from "react";
import { SHARED } from "@/lib/chips";
import { cn } from "@/lib/utils";
import { PinnedSection, SectionHeading, range } from "./PinnedSection";

const ICONS = [Atom, Layers, Zap, Cpu, MonitorPlay, Sparkles, Bluetooth, Usb];

// a double helix: blue and amber strands crossing at 8 shared "genes"
const W = 800;
const strand = (phase: number) =>
  Array.from({ length: 161 }, (_, i) => {
    const x = (i / 160) * W;
    const y = 50 + Math.sin((i / 160) * Math.PI * 8 + phase) * 34;
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
const A = strand(0);
const B = strand(Math.PI);
const NODES = Array.from({ length: 8 }, (_, i) => ((i + 0.5) / 8) * W);

export function DnaSection() {
  return (
    <PinnedSection id="dna" index={1} height="h-[300vh]">
      {(p) => <DnaInner p={p} />}
    </PinnedSection>
  );
}

function DnaInner({ p }: { p: MotionValue<number> }) {
  const [lit, setLit] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  useMotionValueEvent(p, "change", (v) => setLit(Math.round(range(v, 0.15, 0.8) * SHARED.length)));
  const helix = useTransform(p, [0.05, 0.8], [0, 1]);
  const panelY = useTransform(p, [0, 0.15], [80, 0]);
  const panelO = useTransform(p, [0, 0.1], [0, 1]);

  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <SectionHeading
        step="01"
        kicker="Same DNA"
        tone="text-silicon"
        title={
          <>
            Born in the <span className="text-choice">same fab.</span>
          </>
        }
        line="Before they're two choices, they're siblings. Both start life on the same Intel 18A wafer and share the same core technologies."
      />
      <motion.div style={{ y: panelY, opacity: panelO }} className="pointer-events-auto glass-panel p-4 md:p-6">
        <svg viewBox={`0 0 ${W} 100`} className="w-full" fill="none" aria-hidden>
          <motion.path d={A} className="stroke-panther" strokeWidth="2.5" style={{ pathLength: helix }} />
          <motion.path d={B} className="stroke-wildcat" strokeWidth="2.5" style={{ pathLength: helix }} />
          {NODES.map((x, i) => (
            <g key={x}>
              <line x1={x} x2={x} y1="16" y2="84" className={cn("transition-all duration-500", i < lit ? "stroke-silicon/60" : "stroke-border")} strokeWidth="1" strokeDasharray="3 4" />
              <circle cx={x} cy="50" r={i < lit ? 7 : 4} className={cn("transition-all duration-500", i < lit ? "fill-silicon" : "fill-muted")} style={{ filter: i < lit ? "drop-shadow(0 0 6px currentColor)" : undefined }} />
            </g>
          ))}
        </svg>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {SHARED.map((f, i) => {
            const Icon = ICONS[i]!;
            const on = i < lit;
            const isOpen = open === f.id;
            return (
              <motion.button
                key={f.id}
                layout
                onClick={() => setOpen(isOpen ? null : f.id)}
                className={cn(
                  "group relative overflow-hidden rounded-lg border p-3 text-left transition-colors duration-500",
                  on ? "border-silicon/25 bg-silicon/5 hover:border-silicon/60" : "border-border bg-background/20 opacity-40",
                  isOpen && "col-span-2 border-silicon/60 bg-silicon/10",
                )}
                aria-expanded={isOpen}
              >
                {on && <span className="absolute inset-0 animate-shimmer opacity-40" />}
                <motion.div layout="position" className="relative flex items-center gap-2">
                  <Icon className={cn("size-4 shrink-0 transition-colors", on ? "text-silicon" : "text-muted-foreground")} />
                  <span className="font-display text-xs font-semibold md:text-sm">{f.title}</span>
                </motion.div>
                <motion.div layout="position" className="relative mt-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                  {f.line}
                </motion.div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative mt-2 text-xs leading-relaxed text-foreground/85"
                    >
                      {f.detail}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          <span>shared genes · tap to expand</span>
          <span className="text-silicon">
            {lit}/{SHARED.length} matched
          </span>
        </div>
      </motion.div>
    </div>
  );
}
