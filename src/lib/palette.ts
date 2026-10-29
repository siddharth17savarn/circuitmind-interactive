/** Hex mirrors of the CSS tokens in src/styles.css, for the 3D scene. Change both together. */
export const HEX = {
  panther: "#3d8bff",
  pantherGlow: "#8fd8ff",
  wildcat: "#ffae2b",
  wildcatGlow: "#ffd76a",
  silicon: "#dfeaf7",
  intel: "#33c6ff",
  bg: "#03060b",
} as const;

/** Signal colour of the whole scene for each page section (see SECTIONS in story-store). */
export const MODE_HEX = [
  HEX.intel, // hero
  HEX.silicon, // shared DNA
  HEX.panther, // panther
  HEX.wildcat, // wildcat
  HEX.intel, // die explorer
  HEX.silicon, // duel
  HEX.intel, // quiz
  HEX.silicon, // finale
];
