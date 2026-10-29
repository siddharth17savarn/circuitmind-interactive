import type { ChipId } from "./chips";

export type QuizOption = { label: string; cat: ChipId; points: 1 | 2; reason: string };
export type QuizQuestion = { id: string; q: string; options: QuizOption[] };

export const QUIZ: QuizQuestion[] = [
  {
    id: "screen",
    q: "What fills most of your screen time?",
    options: [
      { label: "Editing video, 3D or gaming", cat: "panther", points: 2, reason: "Creative and gaming work loves 12 Xe3 GPU cores." },
      { label: "Docs, browsing, classes & streaming", cat: "wildcat", points: 2, reason: "Everyday work runs great on the same Cougar Cove P-cores." },
      { label: "Coding & running local AI models", cat: "panther", points: 2, reason: "Builds and local models scale with 16 cores and 180 TOPS." },
      { label: "Video calls & running a small business", cat: "wildcat", points: 2, reason: "Calls and office apps are exactly what the 17 TOPS NPU targets." },
    ],
  },
  {
    id: "heaviest",
    q: "How heavy is your heaviest app?",
    options: [
      { label: "Pro creative suite or AAA game", cat: "panther", points: 2, reason: "Heavy apps want dual-channel memory up to 96 GB." },
      { label: "A big spreadsheet and 40 tabs", cat: "wildcat", points: 2, reason: "Busy-but-light multitasking fits a cool 15 W chip." },
      { label: "Something heavy, but only now and then", cat: "panther", points: 1, reason: "Occasional heavy lifting still benefits from extra headroom." },
    ],
  },
  {
    id: "budget",
    q: "Your budget mindset?",
    options: [
      { label: "Pay for headroom I'll grow into", cat: "panther", points: 1, reason: "Headroom means the laptop keeps up for years of bigger projects." },
      { label: "Best value for what I actually do", cat: "wildcat", points: 2, reason: "Core Series 3 brings 18A to more price-friendly laptops." },
    ],
  },
  {
    id: "ai",
    q: "\"AI on my laptop\" means…",
    options: [
      { label: "Generating images & running LLMs", cat: "panther", points: 2, reason: "Generative AI scales with up to 180 platform TOPS." },
      { label: "Live captions, blur & smart search", cat: "wildcat", points: 2, reason: "Everyday AI effects run efficiently on NPU 5." },
    ],
  },
  {
    id: "day",
    q: "Your laptop's typical day?",
    options: [
      { label: "Long sessions at a desk, plugged into a monitor", cat: "panther", points: 1, reason: "Long sessions let the Panther stretch its legs." },
      { label: "Backpack life: class, café, commute", cat: "wildcat", points: 1, reason: "Low-power E-cores stretch battery through a mobile day." },
    ],
  },
];

export type QuizResult = { cat: ChipId; panther: number; wildcat: number; reasons: string[]; confidence: number };

/**
 * Score answers (option index per question). Higher total wins; a tie goes to
 * the first question's answer (what fills your screen time), then to Wildcat.
 */
export function scoreQuiz(answers: (number | undefined)[]): QuizResult {
  let panther = 0;
  let wildcat = 0;
  const picked: QuizOption[] = [];
  QUIZ.forEach((q, i) => {
    const a = answers[i];
    if (a === undefined) return;
    const opt = q.options[a];
    if (!opt) return;
    picked.push(opt);
    if (opt.cat === "panther") panther += opt.points;
    else wildcat += opt.points;
  });
  let cat: ChipId;
  if (panther !== wildcat) cat = panther > wildcat ? "panther" : "wildcat";
  else cat = picked[0]?.cat ?? "wildcat";
  const total = panther + wildcat || 1;
  const reasons = picked.filter((o) => o.cat === cat).map((o) => o.reason).slice(0, 3);
  return { cat, panther, wildcat, reasons, confidence: Math.round(((cat === "panther" ? panther : wildcat) / total) * 100) };
}
