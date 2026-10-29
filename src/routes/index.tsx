import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { CatSection } from "@/components/site/CatSection";
import { Nav, PartInspector, ProgressRail, SurgeFlash } from "@/components/site/Chrome";
import { DnaSection } from "@/components/site/DnaSection";
import { Hero } from "@/components/site/Hero";
import { setSection, story } from "@/lib/story-store";

const SiliconScene = lazy(() => import("@/components/scene/SiliconScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Choose Your Cat — Intel Core Ultra Series 3 vs Core Series 3" },
      {
        name: "description",
        content: "Panther Lake or Wildcat Lake? Two Intel 18A processor families, one choice. Find the cat built for you.",
      },
      { property: "og:title", content: "Choose Your Cat — Panther Lake vs Wildcat Lake" },
      { property: "og:description", content: "Same Intel 18A DNA, two different heroes. Explore both chips and find yours." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function useScrollDriver() {
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      story.progress = max > 0 ? window.scrollY / max : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setSection(Number((e.target as HTMLElement).dataset["section"]));
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);
}

function Index() {
  useScrollDriver();
  return (
    <div className="relative">
      <div className="fixed inset-0" aria-hidden>
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <SiliconScene />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="pointer-events-none fixed inset-0 scrim-left" aria-hidden />
      <Nav />
      <ProgressRail />
      <SurgeFlash />
      <PartInspector />
      <main className="pointer-events-none relative z-10">
        <Hero />
        <DnaSection />
        <CatSection chip="panther" />
        <CatSection chip="wildcat" />
      </main>
    </div>
  );
}
