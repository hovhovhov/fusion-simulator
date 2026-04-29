export type LearnCardId =
  | "what-is-fusion"
  | "why-matter"
  | "where-now"
  | "why-slow"
  | "fusion-vs-fission"
  | "how-to-use";

export const GLOSSARY: Record<
  string,
  {
    term: string;
    definition: string;
    learnCard: LearnCardId;
  }
> = {
  q_sci: {
    term: "Q_sci",
    definition: "Scientific gain: fusion power divided by absorbed plasma heating power.",
    learnCard: "why-matter",
  },
  q_eng: {
    term: "Q_eng",
    definition: "Engineering gain: system-level output vs. total electrical input.",
    learnCard: "why-matter",
  },
  lawson_margin: {
    term: "Lawson margin",
    definition: "How far current plasma conditions are above or below ignition threshold.",
    learnCard: "why-slow",
  },
  recirculation: {
    term: "Recirculation",
    definition: "Power consumed internally by the plant instead of delivered to grid.",
    learnCard: "why-matter",
  },
  plasma: {
    term: "Plasma",
    definition: "Ionized gas where fusion reactions occur at extreme temperature.",
    learnCard: "what-is-fusion",
  },
  neutron: {
    term: "Neutron",
    definition: "Neutral particle carrying most D-T fusion energy into the blanket.",
    learnCard: "what-is-fusion",
  },
  alpha: {
    term: "Alpha",
    definition: "Charged helium nucleus from fusion that helps heat plasma.",
    learnCard: "what-is-fusion",
  },
  dt: {
    term: "D-T",
    definition: "Deuterium-tritium fuel pair, the main near-term fusion pathway.",
    learnCard: "fusion-vs-fission",
  },
  dd: {
    term: "D-D",
    definition: "Deuterium-deuterium fusion pathway with lower near-term gain than D-T.",
    learnCard: "fusion-vs-fission",
  },
  dhe3: {
    term: "D-He3",
    definition: "Deuterium-helium-3 pathway with reduced neutron fraction but harder ignition.",
    learnCard: "fusion-vs-fission",
  },
  pb11: {
    term: "p-B11",
    definition: "Proton-boron-11 aneutronic concept requiring very high ignition conditions.",
    learnCard: "fusion-vs-fission",
  },
  steady: {
    term: "Steady state",
    definition: "Continuous operation instead of pulse-driven burn cycles.",
    learnCard: "how-to-use",
  },
  pulsed: {
    term: "Pulsed",
    definition: "Operation in repeated burn cycles with dwell/transient phases.",
    learnCard: "how-to-use",
  },
};
