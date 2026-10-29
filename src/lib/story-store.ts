import { useSyncExternalStore } from "react";
import type { ChipId } from "./chips";

/**
 * Shared state read by the 3D scene every frame and by the page UI.
 * Mutate through the setters so React subscribers re-render; the scene reads the raw object.
 */
export const story = {
  progress: 0,
  section: 0,
  /** Part hovered in the 3D scene (id from PARTS) */
  hovered: null as string | null,
  /** Part clicked in the 3D scene or die explorer */
  selected: null as string | null,
  /** Quiz result — tints the scene toward the matching chip */
  verdict: null as ChipId | null,
};

export const SECTIONS = [
  { id: "top", label: "Two cats" },
  { id: "dna", label: "Same DNA" },
  { id: "panther", label: "Panther" },
  { id: "wildcat", label: "Wildcat" },
  { id: "explore", label: "Inside" },
  { id: "duel", label: "Differences" },
  { id: "quiz", label: "Your pick" },
  { id: "finale", label: "Choose" },
] as const;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setSection(index: number) {
  if (index === story.section) return;
  story.section = index;
  emit();
}

export function setHovered(id: string | null) {
  if (id === story.hovered) return;
  story.hovered = id;
  emit();
}

export function setSelected(id: string | null) {
  story.selected = id;
  emit();
}

export function setVerdict(v: ChipId | null) {
  story.verdict = v;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useStory<T>(pick: (s: typeof story) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => pick(story),
    () => pick({ progress: 0, section: 0, hovered: null, selected: null, verdict: null }),
  );
}

export const useSection = () => useStory((s) => s.section);
