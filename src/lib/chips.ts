/**
 * Fact sheet for both 18A processor families. Every number shown on the site comes from here.
 * Sources are listed in SOURCES; "up to" values are the top SKU of each family.
 */

export type ChipId = "panther" | "wildcat";

export const CHIPS: Record<
  ChipId,
  {
    id: ChipId;
    brand: string;
    codename: string;
    cat: string;
    persona: string;
    tagline: string;
    launch: string;
    tone: string;
    gradText: string;
  }
> = {
  panther: {
    id: "panther",
    brand: "Intel® Core™ Ultra Series 3",
    codename: "Panther Lake",
    cat: "The Panther",
    persona: "The night-shift creator",
    tagline: "Built for the work that pushes back.",
    launch: "Shipping since Jan 2026",
    tone: "text-panther",
    gradText: "text-panther-grad",
  },
  wildcat: {
    id: "wildcat",
    brand: "Intel® Core™ Series 3",
    codename: "Wildcat Lake",
    cat: "The Wildcat",
    persona: "The daylight hustler",
    tagline: "Built for the day that never sits still.",
    launch: "Launched Apr 2026",
    tone: "text-wildcat",
    gradText: "text-wildcat-grad",
  },
};

/** Clickable components — used by the 3D packages and the die explorer. */
export type Part = {
  id: string;
  name: string;
  kind: string;
  description: string;
  panther: string | null;
  wildcat: string | null;
};

export const PARTS: Record<string, Part> = {
  pcore: {
    id: "pcore",
    name: "Cougar Cove P-cores",
    kind: "Performance cores",
    description:
      "The sprinters. Big, fast cores that wake up for whatever you're waiting on — opening apps, exporting, compiling. Both families use the exact same Cougar Cove design.",
    panther: "Up to 4 · up to 5.1 GHz",
    wildcat: "Up to 2 · up to 4.8 GHz",
  },
  ecore: {
    id: "ecore",
    name: "Darkmont E-cores",
    kind: "Efficient cores",
    description:
      "The workhorse crew. A cluster of efficient cores that chews through multi-threaded jobs — renders, builds, batch edits — alongside the P-cores.",
    panther: "Up to 8",
    wildcat: null,
  },
  lpe: {
    id: "lpe",
    name: "Low Power E-cores",
    kind: "Low-power island",
    description:
      "The night watch. Darkmont cores parked on their own low-power island so music, chats and background syncs run without waking the big cores — a big reason both families sip battery.",
    panther: "4 LP E-cores",
    wildcat: "4 LP E-cores",
  },
  gpu: {
    id: "gpu",
    name: "Xe3 graphics",
    kind: "Integrated GPU",
    description:
      "Same Xe3 graphics architecture in both. The Panther can carry Intel® Arc™ B390 with 12 Xe-cores for real gaming and GPU-heavy AI; the Wildcat carries a compact 2 Xe-core GPU for smooth video and everyday visuals.",
    panther: "Up to 12 Xe-cores · Arc B390 · 122 GPU TOPS",
    wildcat: "Up to 2 Xe-cores · 21 GPU TOPS",
  },
  npu: {
    id: "npu",
    name: "NPU 5",
    kind: "Neural processing unit",
    description:
      "A dedicated AI engine for always-on tasks — background blur, live captions, noise removal, smarter search — at a fraction of the power the CPU or GPU would use.",
    panther: "Up to 50 TOPS",
    wildcat: "Up to 17 TOPS",
  },
  cache: {
    id: "cache",
    name: "Intel Smart Cache",
    kind: "On-chip memory",
    description:
      "Ultra-fast memory right next to the cores, so they wait less on RAM. Bigger cache helps heavy, data-hungry workloads stay quick.",
    panther: "Up to 18 MB",
    wildcat: "6 MB + 4 MB memory-side cache",
  },
  memory: {
    id: "memory",
    name: "Memory controller",
    kind: "RAM interface",
    description:
      "Feeds the chip from system RAM. More channels and faster memory mean more bandwidth for big projects, games and local AI models.",
    panther: "Dual-channel · LPDDR5X-9600 · up to 96 GB",
    wildcat: "Single-channel · LPDDR5x-7467 / DDR5-6400 · up to 64 GB",
  },
  pct: {
    id: "pct",
    name: "Platform controller tile",
    kind: "I/O tile",
    description:
      "The chip's front door: storage lanes, USB, Thunderbolt and wireless all hang off this tile. Both families pack Thunderbolt 4, Wi-Fi 7 and Bluetooth 6.0.",
    panther: "PCIe 5.0 + 4.0 · Thunderbolt 4 · Wi-Fi 7 · BT 6.0",
    wildcat: "6× PCIe 4.0 · 2× Thunderbolt 4 · Wi-Fi 7 · BT 6.0",
  },
  compute: {
    id: "compute",
    name: "Compute tile · Intel 18A",
    kind: "The 18A heart",
    description:
      "Where the cores live. Built on Intel 18A with RibbonFET gate-all-around transistors and PowerVia backside power — the same process for both families.",
    panther: "CPU + NPU on 18A",
    wildcat: "CPU + GPU + NPU on 18A",
  },
  package: {
    id: "package",
    name: "Tiled package",
    kind: "System-on-chip",
    description:
      "Instead of one giant die, each processor is assembled from tiles. The Panther mixes compute, graphics and platform tiles; the Wildcat keeps it lean with two.",
    panther: "Compute + GPU + platform tiles",
    wildcat: "Compute + platform tiles",
  },
};

/** Q1 — what both families share. */
export const SHARED = [
  {
    id: "18a",
    title: "Intel 18A",
    line: "Same factory DNA",
    detail:
      "Both compute tiles are made on Intel 18A — the most advanced chip process developed and manufactured in the United States.",
  },
  {
    id: "ribbonfet",
    title: "RibbonFET",
    line: "Gate-all-around transistors",
    detail: "The gate wraps the channel on all sides, so each transistor switches faster and leaks less power.",
  },
  {
    id: "powervia",
    title: "PowerVia",
    line: "Power from the back",
    detail: "Power wires move to the back of the wafer, freeing the front for signals — cleaner, more efficient chips.",
  },
  {
    id: "cores",
    title: "Cougar Cove + Darkmont",
    line: "Same core family",
    detail: "Identical P-core and LP E-core designs, including the low-power island that keeps light work off the big cores.",
  },
  {
    id: "xe3",
    title: "Xe3 graphics",
    line: "Same GPU architecture",
    detail: "Both run Intel's Xe3 graphics, just sized differently for different jobs.",
  },
  {
    id: "npu",
    title: "NPU 5",
    line: "On-device AI",
    detail: "A dedicated AI engine in both, with OpenVINO™, WindowsML, ONNX RT and WebNN support.",
  },
  {
    id: "wireless",
    title: "Wi-Fi 7 · BT 6.0",
    line: "Latest wireless",
    detail: "Integrated Intel Wi-Fi 7 and Bluetooth 6.0 on both families.",
  },
  {
    id: "tb4",
    title: "Thunderbolt 4",
    line: "One-cable docking",
    detail: "Displays, docks and fast drives through a single port on both.",
  },
] as const;

/** Q2 — differences as paired meters. `better` = which direction suits whom; neither side "loses". */
export const DUEL = [
  { label: "CPU cores", panther: 16, wildcat: 6, unit: "", max: 16, pNote: "4P + 8E + 4LP-E", wNote: "2P + 4LP-E" },
  { label: "Xe3 GPU cores", panther: 12, wildcat: 2, unit: "", max: 12, pNote: "Arc B390", wNote: "Everyday visuals" },
  { label: "NPU AI", panther: 50, wildcat: 17, unit: "TOPS", max: 50, pNote: "Heavier AI effects", wNote: "Right-sized AI" },
  { label: "Platform AI", panther: 180, wildcat: 40, unit: "TOPS", max: 180, pNote: "CPU + GPU + NPU", wNote: "CPU + GPU + NPU" },
  { label: "Max memory", panther: 96, wildcat: 64, unit: "GB", max: 96, pNote: "Dual-channel", wNote: "Single-channel" },
  { label: "Base power", panther: 25, wildcat: 15, unit: "W", max: 25, pNote: "Room to push", wNote: "Cool & frugal" },
] as const;

export const PERSONAS: Record<
  ChipId,
  { clock: string; scene: string; moments: { time: string; text: string }[]; who: string[]; why: string[] }
> = {
  panther: {
    clock: "23:47",
    scene: "A 4K timeline exporting, a game paused, a local AI model answering questions — all on one thin laptop.",
    moments: [
      { time: "10:30", text: "Colour-grades a 4K reel on battery" },
      { time: "14:00", text: "Compiles a big codebase in minutes" },
      { time: "19:15", text: "Raids a AAA game on Arc B390" },
      { time: "23:47", text: "Runs an LLM locally — no cloud" },
    ],
    who: ["Video & 3D creators", "Gamers", "Developers & engineers", "AI tinkerers"],
    why: [
      "Up to 16 cores for renders, builds and multitasking",
      "Up to 12 Xe3 GPU cores for gaming and GPU AI",
      "Up to 180 platform TOPS for heavier on-device AI",
      "Up to 96 GB of fast dual-channel memory",
    ],
  },
  wildcat: {
    clock: "07:52",
    scene: "Notes on the bus, a lecture with live captions, a client call with the background blurred — and battery to spare.",
    moments: [
      { time: "07:52", text: "Takes notes on the morning commute" },
      { time: "11:00", text: "Live captions through a lecture" },
      { time: "15:30", text: "Client call, AI noise removal on" },
      { time: "21:00", text: "Streams a series in bed" },
    ],
    who: ["Students", "Small businesses", "Families & first laptops", "Value-minded buyers"],
    why: [
      "15 W base power keeps it cool, quiet and long-lasting",
      "Same Cougar Cove P-cores for snappy everyday speed",
      "17 TOPS NPU for the AI features people actually use",
      "Modern Wi-Fi 7 and Thunderbolt 4 in more affordable laptops",
    ],
  },
};

export const SOURCES = [
  { label: "Intel — Panther Lake architecture (Oct 2025)", url: "https://www.intel.com/content/www/us/en/newsroom/news/client-computing/intel-unveils-panther-lake-architecture-first-ai-pc-platform-built-on-18a.html" },
  { label: "Intel ARK — Core Ultra X9 388H", url: "https://www.intel.com/content/www/us/en/products/sku/245526/intel-core-ultra-x9-processor-388h-18m-cache-up-to-5-10-ghz/specifications.html" },
  { label: "Intel ARK — Core 7 350", url: "https://www.intel.com/content/www/us/en/products/sku/246017/intel-core-7-processor-350-6m-cache-up-to-4-80-ghz/specifications.html" },
  { label: "Tom's Hardware — Core Series 3 launch", url: "https://www.tomshardware.com/tech-industry/intel-launches-wildcat-lake-as-core-series-3" },
  { label: "Tom's Hardware — Panther Lake at CES 2026", url: "https://www.tomshardware.com/pc-components/cpus/intel-doubles-down-on-gaming-with-panther-lake-claims-76-percent-faster-gaming-performance-new-x-series-chips-deliver-up-to-12-xe3-cores" },
];
