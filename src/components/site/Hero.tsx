import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

const LINE1 = "Choose your";
const LINE2 = "cat.";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const spacing = useTransform(scrollYProgress, [0, 1], ["-0.03em", "0.2em"]);
  const blur = useTransform(scrollYProgress, [0, 0.8], ["blur(0px)", "blur(10px)"]);

  return (
    <section ref={ref} id="top" data-section={0} className="relative h-[150vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center px-5 md:px-14 lg:pl-32">
        <motion.div style={{ y, opacity, filter: blur }} className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-intel uppercase animate-flicker-in">
            <span className="inline-block size-1.5 rounded-full bg-current glow-dot" />
            Intel 18A · two processor families
          </div>
          <motion.h1
            style={{ letterSpacing: spacing }}
            className="font-display text-6xl leading-[0.92] font-bold sm:text-7xl md:text-8xl lg:text-[7.5rem]"
            aria-label={`${LINE1} ${LINE2}`}
          >
            <span className="block">
              {LINE1.split("").map((c, i) => (
                <span key={i} aria-hidden className="inline-block text-glow animate-flicker-in" style={{ animationDelay: `${0.15 + i * 0.06}s` }}>
                  {c === " " ? "\u00A0" : c}
                </span>
              ))}
            </span>
            <span className="block">
              {LINE2.split("").map((c, i) => (
                <span key={i} aria-hidden className="inline-block text-choice animate-flicker-in" style={{ animationDelay: `${0.85 + i * 0.09}s` }}>
                  {c}
                </span>
              ))}
            </span>
          </motion.h1>
          <p className="mt-7 max-w-xl text-lg text-muted-foreground md:text-xl animate-flicker-in" style={{ animationDelay: "1.2s" }}>
            Same silicon DNA. Two different heroes.{" "}
            <span className="text-panther">Core Ultra Series 3</span> and <span className="text-wildcat">Core Series 3</span> — find out which one
            was built for you.
          </p>
          <div className="pointer-events-auto mt-10 flex flex-wrap gap-3 animate-flicker-in" style={{ animationDelay: "1.5s" }}>
            <Button variant="choice" size="xl" asChild>
              <a href="#quiz">
                Find my cat <ArrowRight />
              </a>
            </Button>
            <Button variant="wire" size="xl" asChild>
              <a href="#dna">Meet them both</a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity }}
          className="absolute right-5 bottom-24 hidden items-center gap-2.5 rounded-full glass-panel px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase md:right-14 md:flex"
        >
          <MousePointerClick className="size-3.5 text-intel animate-pulse-glow" />
          Click any glowing block on the chips
        </motion.div>

        <motion.div style={{ opacity }} className="absolute bottom-10 left-5 flex items-center gap-4 md:left-14 lg:left-32">
          <svg width="2" height="56" className="overflow-visible" aria-hidden>
            <line x1="1" y1="0" x2="1" y2="56" className="stroke-border" strokeWidth="2" />
            <line x1="1" y1="0" x2="1" y2="56" className="stroke-intel animate-current" strokeWidth="2" strokeDasharray="6 34" />
          </svg>
          <span className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground uppercase">Scroll to meet them</span>
        </motion.div>
      </div>
    </section>
  );
}
