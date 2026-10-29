import { useScroll, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A tall section whose content stays pinned while its own scroll progress (0→1) drives the animation. */
export function PinnedSection({
  id,
  index,
  className,
  height = "h-[280vh]",
  children,
}: {
  id: string;
  index: number;
  className?: string;
  height?: string;
  children: (progress: MotionValue<number>) => ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section ref={ref} id={id} data-section={index} className={cn("relative", height, className)}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-5 md:px-14 lg:pr-16 lg:pl-32">
        {children(scrollYProgress)}
      </div>
    </section>
  );
}

export function SectionHeading({
  step,
  kicker,
  title,
  line,
  tone,
  titleClass,
  className,
}: {
  step: string;
  kicker: string;
  title: ReactNode;
  line?: ReactNode;
  tone: string;
  titleClass?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-xl", className)}>
      <div className={cn("mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.3em] uppercase", tone)}>
        <span className="inline-block size-1.5 rounded-full bg-current glow-dot" />
        {step} — {kicker}
      </div>
      <h2 className={cn("font-display text-4xl leading-[1.02] font-semibold tracking-tight text-foreground md:text-6xl", titleClass)}>
        {title}
      </h2>
      {line && <p className="mt-5 text-base text-muted-foreground md:text-lg">{line}</p>}
    </div>
  );
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
