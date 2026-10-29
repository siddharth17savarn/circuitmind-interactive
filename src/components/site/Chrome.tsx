import { AnimatePresence, motion, useScroll } from "framer-motion";
import { MousePointerClick, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CHIPS, PARTS, type ChipId } from "@/lib/chips";
import { SECTIONS, setSelected, useSection, useStory } from "@/lib/story-store";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} fill="none" aria-hidden>
      <rect x="7" y="7" width="18" height="18" rx="3" className="fill-background stroke-silicon/60" strokeWidth="1.2" />
      <path d="M11 11h5v10h-5z" className="fill-panther" />
      <path d="M16 11h5v10h-5z" className="fill-wildcat" />
      {[11, 16, 21].map((p) => (
        <g key={p} strokeWidth="1.4" strokeLinecap="round">
          <path d={`M${p} 7V3`} className="stroke-silicon/70" />
          <path d={`M${p} 25v4`} className="stroke-silicon/70" />
          <path d={`M7 ${p}H3`} className="stroke-panther" />
          <path d={`M25 ${p}h4`} className="stroke-wildcat" />
        </g>
      ))}
    </svg>
  );
}

export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-5 md:px-10">
      <a href="#top" className="pointer-events-auto flex items-center gap-2.5">
        <LogoMark />
        <span className="font-display text-sm font-semibold tracking-wide">
          Choose Your <span className="text-choice">Cat</span>
        </span>
      </a>
      <div className="pointer-events-auto flex items-center gap-3">
        <span className="hidden font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase sm:inline">Intel 18A · Series 3</span>
        <Button variant="wire" size="sm" className="rounded-full px-4" asChild>
          <a href="#quiz">Find my cat</a>
        </Button>
      </div>
    </header>
  );
}

const TONES = ["text-intel", "text-silicon", "text-panther", "text-wildcat", "text-intel", "text-silicon", "text-intel", "text-silicon"];

/** Left-side progress rail drawn as a live trace with one node per section. */
export function ProgressRail() {
  const { scrollYProgress } = useScroll();
  const active = useSection();
  return (
    <nav aria-label="Sections" className="fixed top-1/2 left-8 z-40 hidden -translate-y-1/2 lg:block">
      <div className="relative flex flex-col gap-8 py-1">
        <div className="absolute top-0 bottom-0 left-[5px] w-px bg-border" />
        <motion.div
          className={cn("absolute top-0 bottom-0 left-[5px] w-px origin-top bg-current transition-colors duration-700", TONES[active])}
          style={{ scaleY: scrollYProgress }}
        />
        {SECTIONS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} className="group relative flex items-center gap-3">
            <span
              className={cn(
                "relative z-10 size-[11px] rounded-full border transition-all duration-500",
                i <= active ? cn("border-current bg-current glow-dot", TONES[i]) : "border-muted-foreground/50 bg-background",
                i === active && "scale-125",
              )}
            />
            <span
              className={cn(
                "font-mono text-[10px] tracking-[0.25em] uppercase transition-all duration-300",
                "opacity-0 group-hover:opacity-80",
                i === active ? cn("opacity-80", TONES[i]) : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}

/** Full-screen transition burst — a different effect for every section change. */
export function SurgeFlash() {
  const section = useSection();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setArmed(true), 600);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      <AnimatePresence>{armed && <Burst key={section} section={section} />}</AnimatePresence>
    </div>
  );
}

function Claw({ side }: { side: ChipId }) {
  const stroke = side === "panther" ? "stroke-panther-glow" : "stroke-wildcat-glow";
  const flip = side === "wildcat";
  return (
    <motion.svg
      viewBox="0 0 400 400"
      className={cn("absolute top-1/2 h-[80vmin] w-[80vmin] -translate-y-1/2", flip ? "right-[5%] -scale-x-100" : "left-[5%]")}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.7, delay: 0.45 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${90 + i * 70} 40 Q ${150 + i * 70} 200 ${120 + i * 70} 370`}
          className={stroke}
          strokeWidth={10 - i * 2}
          strokeLinecap="round"
          fill="none"
          style={{ filter: "drop-shadow(0 0 12px currentColor)" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.32, delay: i * 0.06, ease: [0.7, 0, 0.3, 1] }}
        />
      ))}
    </motion.svg>
  );
}

function Burst({ section }: { section: number }) {
  const exit = { opacity: 0, transition: { duration: 0.2 } };
  switch (section) {
    case 1:
    case 6:
      return (
        <motion.div
          className={cn(
            "absolute top-1/2 left-1/2 size-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 glow-dot",
            section === 1 ? "border-silicon text-silicon" : "border-intel text-intel",
          )}
          initial={{ scale: 0.1, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          exit={exit}
          transition={{ duration: 1.3, ease: "easeOut" }}
        />
      );
    case 2:
      return (
        <motion.div exit={exit}>
          <Claw side="panther" />
        </motion.div>
      );
    case 3:
      return (
        <motion.div exit={exit}>
          <Claw side="wildcat" />
        </motion.div>
      );
    case 4:
      return (
        <motion.div
          className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent to-intel/30"
          initial={{ top: "-10%" }}
          animate={{ top: "105%" }}
          exit={exit}
          transition={{ duration: 1.1, ease: "linear" }}
        >
          <div className="absolute bottom-0 h-px w-full bg-intel text-intel glow-dot" />
        </motion.div>
      );
    case 5:
      return (
        <motion.div className="absolute inset-0" exit={exit}>
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-panther/0 to-panther/35"
            initial={{ x: "-100%" }}
            animate={{ x: ["-100%", "0%", "0%"], opacity: [1, 1, 0] }}
            transition={{ duration: 1, times: [0, 0.4, 1] }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-wildcat/0 to-wildcat/35"
            initial={{ x: "100%" }}
            animate={{ x: ["100%", "0%", "0%"], opacity: [1, 1, 0] }}
            transition={{ duration: 1, times: [0, 0.4, 1] }}
          />
          <motion.div
            className="absolute inset-y-0 left-1/2 w-px bg-silicon text-silicon glow-dot"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1.1, delay: 0.3 }}
          />
        </motion.div>
      );
    case 7:
      return (
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--panther)_0%,var(--wildcat)_30%,transparent_60%)]"
          initial={{ opacity: 0.45, scale: 0.6 }}
          animate={{ opacity: 0, scale: 1.6 }}
          exit={exit}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      );
    default:
      return (
        <motion.div
          className="absolute inset-0 bg-intel/10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={exit}
          transition={{ duration: 0.8 }}
        />
      );
  }
}

function splitKey(key: string | null) {
  if (!key) return null;
  const [chip, part] = key.split(":") as [ChipId, string];
  const info = PARTS[part];
  return info ? { chip, part: info } : null;
}

/** Hover label that follows the cursor over 3D blocks, and the detail card for a clicked block. */
export function PartInspector() {
  const hovered = splitKey(useStory((s) => s.hovered));
  const selected = splitKey(useStory((s) => s.selected));
  const tip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (tip.current) tip.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div ref={tip} className="pointer-events-none fixed top-0 left-0 z-50">
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={`${hovered.chip}${hovered.part.id}`}
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.18 }}
              className="glass-panel rounded-lg px-3 py-2"
            >
              <div className={cn("font-mono text-[10px] tracking-[0.25em] uppercase", CHIPS[hovered.chip].tone)}>
                {CHIPS[hovered.chip].codename}
              </div>
              <div className="font-display text-sm font-semibold">{hovered.part.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MousePointerClick className="size-3" /> Click for details
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.aside
            key={`${selected.chip}${selected.part.id}`}
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, filter: "blur(6px)", transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed right-4 bottom-4 left-4 z-50 glass-panel overflow-hidden p-5 sm:left-auto sm:w-[400px] md:right-8 md:bottom-8"
            role="dialog"
            aria-label={selected.part.name}
          >
            <div
              className={cn(
                "pointer-events-none absolute -top-24 -right-24 size-56 rounded-full opacity-30 blur-3xl",
                selected.chip === "panther" ? "bg-panther" : "bg-wildcat",
              )}
            />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className={cn("font-mono text-[10px] tracking-[0.3em] uppercase", CHIPS[selected.chip].tone)}>
                  {CHIPS[selected.chip].codename} · {selected.part.kind}
                </div>
                <h3 className="mt-1.5 font-display text-xl font-semibold">{selected.part.name}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{selected.part.description}</p>
            <div className="relative mt-4 grid grid-cols-2 gap-2">
              {(["panther", "wildcat"] as const).map((c) => (
                <div
                  key={c}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 transition-colors",
                    c === selected.chip ? (c === "panther" ? "border-panther/60 bg-panther/10" : "border-wildcat/60 bg-wildcat/10") : "border-border bg-background/30",
                  )}
                >
                  <div className={cn("font-mono text-[9px] tracking-[0.25em] uppercase", CHIPS[c].tone)}>{CHIPS[c].codename}</div>
                  <div className="mt-1 text-xs leading-snug font-medium text-foreground">{selected.part[c] ?? "Not on this chip"}</div>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
