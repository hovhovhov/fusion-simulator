import type { FuelKey } from "@/lib/physics/fuels";

export type SpeciesKey = "d" | "t" | "he3" | "he4" | "p" | "n" | "b11";

export type ReactionBranch = {
  reaction: string;
  reactants: SpeciesKey[];
  products: SpeciesKey[];
};

export type FuelReactionInfo = {
  title: string;
  facts: Array<{ label: string; value: string }>;
  branchA: ReactionBranch;
  branchB?: ReactionBranch;
  deepDive: string[];
  theme: {
    primary: string;
    secondary: string;
    glow: string;
  };
};

export const SPECIES: Record<
  SpeciesKey,
  { label: string; protons: number; neutrons: number; tooltip: string }
> = {
  d: {
    label: "D",
    protons: 1,
    neutrons: 1,
    tooltip: "Deuterium - hydrogen isotope with one neutron.",
  },
  t: {
    label: "T",
    protons: 1,
    neutrons: 2,
    tooltip: "Tritium - hydrogen with 2 neutrons; radioactive (half-life ~12 years).",
  },
  he3: {
    label: "He-3",
    protons: 2,
    neutrons: 1,
    tooltip: "Helium-3 - rare isotope with low neutron output fusion pathways.",
  },
  he4: {
    label: "He-4",
    protons: 2,
    neutrons: 2,
    tooltip: "Helium-4 (alpha particle) - tightly bound fusion product.",
  },
  p: {
    label: "p",
    protons: 1,
    neutrons: 0,
    tooltip: "Proton - hydrogen nucleus with positive charge.",
  },
  n: {
    label: "n",
    protons: 0,
    neutrons: 1,
    tooltip: "Neutron - neutral particle that escapes magnetic confinement.",
  },
  b11: {
    label: "B-11",
    protons: 5,
    neutrons: 6,
    tooltip: "Boron-11 - common isotope used in aneutronic p-B11 concepts.",
  },
};

export const FUEL_REACTION_INFO: Record<FuelKey, FuelReactionInfo> = {
  dt: {
    title: "D-T reaction",
    facts: [
      { label: "Reaction", value: "D + T -> He-4 + n" },
      { label: "Min temperature", value: "~100 M C" },
      { label: "Energy / event", value: "17.6 MeV" },
      { label: "Neutron yield", value: "80% of energy" },
      { label: "Fuel abundance", value: "Tritium bred from lithium (scarce)" },
      { label: "Used in", value: "JET, ITER, SPARC, ARC, DEMO" },
    ],
    branchA: {
      reaction: "D + T -> He-4 + n",
      reactants: ["d", "t"],
      products: ["he4", "n"],
    },
    deepDive: [
      "D-T is the practical near-term path because it ignites at the lowest temperature and gives the highest gain in tokamak conditions.",
      "Its main tradeoff is neutron-heavy output, which drives wall damage, shielding requirements, and a full tritium-breeding fuel cycle.",
      "Current flagship programs (ITER, SPARC, ARC roadmap, DEMO studies) are all anchored on D-T performance.",
    ],
    theme: { primary: "#ff9248", secondary: "#ef5757", glow: "rgba(255,146,72,0.35)" },
  },
  dd: {
    title: "D-D reaction",
    facts: [
      { label: "Reaction", value: "D + D -> He-3 + n / T + p (50/50)" },
      { label: "Min temperature", value: "~400 M C" },
      { label: "Energy / event", value: "3.3-4.0 MeV" },
      { label: "Neutron yield", value: "~50% of energy" },
      { label: "Fuel abundance", value: "Deuterium from seawater (near-unlimited)" },
      { label: "Used in", value: "Research only - too hard for practical gain today" },
    ],
    branchA: {
      reaction: "D + D -> He-3 + n",
      reactants: ["d", "d"],
      products: ["he3", "n"],
    },
    branchB: {
      reaction: "D + D -> T + p",
      reactants: ["d", "d"],
      products: ["t", "p"],
    },
    deepDive: [
      "D-D is attractive for fuel supply, but ignition requirements are far tougher than D-T and energy per reaction is lower.",
      "The channel splits between two branches, so product mix and neutron loading are less predictable cycle-to-cycle.",
      "It remains a research path rather than a near-term commercial electricity route.",
    ],
    theme: { primary: "#ffb547", secondary: "#ff9248", glow: "rgba(255,181,71,0.35)" },
  },
  dhe3: {
    title: "D-He3 reaction",
    facts: [
      { label: "Reaction", value: "D + He-3 -> He-4 + p" },
      { label: "Min temperature", value: "~600 M C" },
      { label: "Energy / event", value: "18.4 MeV" },
      { label: "Neutron yield", value: "~5% (mostly side reactions)" },
      { label: "Fuel abundance", value: "He-3 is extremely rare on Earth" },
      { label: "Used in", value: "Speculative concepts; Helion targets variant paths" },
    ],
    branchA: {
      reaction: "D + He-3 -> He-4 + p",
      reactants: ["d", "he3"],
      products: ["he4", "p"],
    },
    deepDive: [
      "D-He3 is attractive because output is mostly charged particles, opening cleaner conversion options with less neutron damage.",
      "The challenge is severe: high ignition temperature and scarce helium-3 supply.",
      "It is often framed as a longer-horizon or niche architecture rather than a first-wave grid plant strategy.",
    ],
    theme: { primary: "#4dd0e1", secondary: "#7dd3fc", glow: "rgba(77,208,225,0.35)" },
  },
  pb11: {
    title: "p-B11 reaction",
    facts: [
      { label: "Reaction", value: "p + B-11 -> 3 x He-4" },
      { label: "Min temperature", value: "~1 B C" },
      { label: "Energy / event", value: "8.7 MeV" },
      { label: "Neutron yield", value: "<1% (aneutronic target)" },
      { label: "Fuel abundance", value: "Boron is abundant" },
      { label: "Used in", value: "TAE Technologies, HB11 Energy" },
    ],
    branchA: {
      reaction: "p + B-11 -> 3 x He-4",
      reactants: ["p", "b11"],
      products: ["he4", "he4", "he4"],
    },
    deepDive: [
      "p-B11 is an aneutronic target with compelling long-term plant characteristics if achieved.",
      "Its barrier is extreme temperature and confinement requirements far beyond current mainstream tokamak operation.",
      "Programs pursuing p-B11 are generally high-risk, high-upside efforts with different device architectures.",
    ],
    theme: { primary: "#b076ff", secondary: "#ef63d6", glow: "rgba(176,118,255,0.35)" },
  },
};
