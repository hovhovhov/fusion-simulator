import type { PresetId } from "@/lib/presets";

export const PRESET_STORIES: Record<
  PresetId,
  {
    title: string;
    tagline: string;
    status: string;
    year: string;
    hero: {
      qSci: string;
      fusion: string;
      net: string;
      status: string;
    };
    description: string[];
    teaches: string[];
    milestones: Array<{ label: string; source: string }>;
  }
> = {
  jet: {
    title: "JET",
    tagline: "What we've actually achieved",
    status: "Decommissioned after final D-T campaign (2023)",
    year: "1983-2023",
    hero: {
      qSci: "~0.67",
      fusion: "~16 MW peak",
      net: "No grid output",
      status: "Decommissioned",
    },
    description: [
      "The Joint European Torus set the world record for fusion energy released in a sustained D-T pulse, reaching 59 MJ over five seconds in 2021.",
      "JET mattered because it used the same deuterium-tritium fuel cycle expected for first-generation fusion plants, making its results directly relevant to reactor design.",
      "Its final D-T campaign in 2023 focused on plasma control, heat exhaust, and material behavior under reactor-grade neutron loads, then operations ended.",
      "JET is now a knowledge asset: it does not produce electricity, but it anchors validation for ITER operating scenarios and plasma-facing component strategy.",
    ],
    teaches: [
      "How to sustain high-performance D-T plasmas for multi-second pulses.",
      "How tritium retention and wall conditioning behave under realistic fusion conditions.",
      "How to control divertor heat loads and fuel mix in real time.",
    ],
    milestones: [
      {
        label: "UKAEA final D-T campaign announcement and closure reports.",
        source: "https://www.gov.uk/government/news/scientific-community-to-conduct-final-tritium-experiments-at-jet",
      },
      {
        label: "JET final 2023 run completion coverage.",
        source: "https://www.bbc.co.uk/news/science-environment-67101176",
      },
    ],
  },
  iter: {
    title: "ITER",
    tagline: "What we're building",
    status: "Under construction in southern France",
    year: "2030s target",
    hero: {
      qSci: "10 target",
      fusion: "500 MW target",
      net: "No grid output",
      status: "Construction",
    },
    description: [
      "ITER is the largest fusion experiment ever built, designed to prove that burning plasma can deliver ten times the heating power injected into it.",
      "The machine is intentionally not a power plant: its mission is to validate plasma control, superconducting magnet operation, and reactor technologies at scale.",
      "Its architecture and operating envelope define the bridge between current experiments and electricity-producing successors such as DEMO.",
      "If ITER reaches stable Q=10 performance, the engineering uncertainty for first-generation fusion plants drops dramatically.",
    ],
    teaches: [
      "Whether long-duration burning plasma can be controlled at reactor scale.",
      "How integrated superconducting magnets, cryogenics, and tritium systems perform together.",
      "How to qualify operating regimes that future grid-connected reactors can inherit.",
    ],
    milestones: [
      {
        label: "ITER baseline and first-plasma schedule updates.",
        source: "https://www.iter.org/mag/9/first-plasma-2025",
      },
      {
        label: "ITER project readiness and operation preparation updates.",
        source: "https://www.iter.org/node/20687/making-sure-iter-ready-operation",
      },
    ],
  },
  sparc: {
    title: "SPARC",
    tagline: "The private-sector bet",
    status: "Under construction in Massachusetts",
    year: "Late-2020s target",
    hero: {
      qSci: "~11 target",
      fusion: "~140 MW target",
      net: "No grid output",
      status: "Demonstrator build",
    },
    description: [
      "SPARC aims to prove high-Q fusion in a compact tokamak by using high-temperature superconducting magnets with much stronger magnetic fields.",
      "The core idea is strategic: if stronger fields work, reactors can be smaller, faster to build, and potentially cheaper than traditional mega-scale designs.",
      "SPARC is not expected to export electricity; it is designed to validate performance and accelerate the path to ARC-class commercial plants.",
      "Its progress is a marker of fusion's transition from mostly state-led science programs to privately financed industrial execution.",
    ],
    teaches: [
      "Whether high-field magnet architecture can reliably unlock compact high-gain operation.",
      "How quickly private programs can iterate compared with public megaproject timelines.",
      "Whether commercial fusion economics can be improved by scaling down reactor size.",
    ],
    milestones: [
      {
        label: "Commonwealth Fusion Systems SPARC program overview.",
        source: "https://www.cfs.energy/technology/sparc",
      },
      {
        label: "Construction progress and timeline reporting.",
        source: "https://blog.cfs.energy/cfs-fusion-progress-weve-built-more-than-half-of-sparcs-magnet-pancakes/",
      },
    ],
  },
  arc: {
    title: "ARC",
    tagline: "The first commercial design",
    status: "Planned for late-2030s operation",
    year: "2030s target",
    hero: {
      qSci: "~12 target",
      fusion: "~525 MW target",
      net: "~270 MW to grid",
      status: "Commercial pilot design",
    },
    description: [
      "ARC is Commonwealth Fusion Systems' commercial pilot concept, intended to convert fusion output into saleable electricity on a grid timeline in the late 2030s.",
      "It assumes SPARC validates high-field superconducting magnet performance and then adds full power-plant subsystems, including a liquid FLiBe blanket and thermal conversion train.",
      "ARC is significant because it is explicitly a product architecture rather than a pure physics demonstrator.",
      "Its success would demonstrate that private-sector fusion can cross from plasma performance milestones into utility economics.",
    ],
    teaches: [
      "How private, high-field tokamaks transition from demonstrator to grid-connected operation.",
      "How neutron capture and tritium breeding can be integrated in a compact plant design.",
      "Whether fusion can be financed and operated as a commercial energy asset.",
    ],
    milestones: [
      {
        label: "CFS ARC commercialization roadmap and design framing.",
        source: "https://www.cfs.energy/technology/arc",
      },
      {
        label: "CFS SPARC-to-ARC transition context.",
        source: "https://www.cfs.energy/technology/sparc",
      },
    ],
  },
  demo: {
    title: "DEMO",
    tagline: "The first power plant",
    status: "Conceptual design for 2050s operation",
    year: "2050s target",
    hero: {
      qSci: "~25 target",
      fusion: "~2 GW target",
      net: "~500 MW to grid",
      status: "Concept phase",
    },
    description: [
      "DEMO is the planned post-ITER step: not another pure experiment, but a plant-scale system designed to send fusion electricity to the grid.",
      "Its mission includes integrated tritium self-sufficiency, high-duty-cycle operation, and maintainability under realistic neutron damage conditions.",
      "DEMO design choices depend directly on ITER results, especially on plasma scenario robustness and component lifetime in reactor environments.",
      "If DEMO performs as intended, it validates the transition from single demonstration units to deployable commercial fusion fleets.",
    ],
    teaches: [
      "Whether fusion can run as a reliable grid asset, not just a physics experiment.",
      "Whether tritium breeding, conversion efficiency, and maintenance can close in one plant architecture.",
      "What cost and uptime envelope commercial rollout might realistically target in the 2060s.",
    ],
    milestones: [
      {
        label: "EUROfusion DEMO status and roadmap publication.",
        source: "https://euro-fusion.org/eurofusion-news/the-state-of-the-art-for-demo/",
      },
      {
        label: "European roadmap toward fusion electricity.",
        source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6365854/",
      },
    ],
  },
};

export const LAWSON_EXPLANATION =
  "The Lawson criterion measures whether a plasma can sustain fusion. It combines three quantities: temperature, density, and how long energy stays trapped. Crossing the threshold = ignition (the plasma heats itself without external power). Most experiments today operate well below this line.";

export const LEARN_CARDS = [
  {
    id: "what-is-fusion",
    title: "What is nuclear fusion?",
    body: "When two light atomic nuclei (typically deuterium and tritium, two forms of hydrogen) fuse into a heavier one (helium), they release enormous energy — about four million times more per kilogram than burning coal. Fusion is what powers the sun. On Earth, achieving it requires temperatures above 100 million °C, hotter than the sun's core, because we lack its gravitational pressure. The challenge isn't the reaction itself — it's holding plasma at those conditions long enough for fusion to release more energy than we put in.",
  },
  {
    id: "why-matter",
    title: "Why does it matter?",
    body: "Fusion's appeal is structural, not incremental. Its fuel (deuterium from seawater, lithium from rocks) is effectively unlimited. It produces no long-lived radioactive waste like fission. It cannot melt down — losing containment stops the reaction instantly. It produces zero CO2. A single gram of fusion fuel releases as much energy as 8 tons of oil. If commercial fusion works, it changes the energy supply curve of civilization for thousands of years. If it doesn't, we are stuck with renewables + storage + fission for the indefinite future.",
  },
  {
    id: "where-now",
    title: "Where do we stand right now?",
    body: "As of 2026: no fusion device on Earth has produced net electricity. JET (UK) holds the energy record from a 2021 D-T campaign. NIF (USA) crossed scientific breakeven in 2022 with laser-driven inertial fusion. ITER (France) is under construction for first plasma in the 2030s. SPARC (USA, private) targets first plasma in the late 2020s. The first machine designed to actually put fusion electricity on the grid is ARC (CFS, late 2030s). The first public-sector grid plant is DEMO (Europe, 2050s).",
  },
  {
    id: "why-slow",
    title: "Why is it taking so long?",
    body: "Three reasons. First, the physics is hard: confining a plasma at 100M °C for long enough is genuinely unprecedented engineering. Second, the materials problem: neutron flux from D-T fusion damages reactor walls, and we don't yet have proven materials that survive years of exposure. Third, the funding model: until recently fusion was funded as basic science (long timelines, small budgets) rather than as an industrial program. Private capital and high-field superconducting magnets are accelerating things since 2018, but compressing 30 years of physics into 10 is not guaranteed.",
  },
  {
    id: "fusion-vs-fission",
    title: "What's the difference between fusion and fission?",
    body: "Fission splits heavy atoms (uranium) into smaller ones, releasing energy and long-lived radioactive waste. It powers all current nuclear plants. Fusion does the opposite: combines light atoms (hydrogen) into heavier ones. Fusion's waste is mostly short-lived (decades, not millennia), its fuel is abundant, and its failure mode is benign — but it has never been done commercially. Fission works today; fusion might work tomorrow.",
  },
  {
    id: "how-to-use",
    title: "How to use this simulator?",
    body: "Pick a preset on the left to load real-world device parameters. The tokamak above shows the plasma in 3D — its color and brightness change with fuel and power. The energy flow below traces every megawatt from heating input to grid output, showing exactly where energy is lost. Click any element for a detailed explanation. Adjust sliders to see what would have to change for fusion to become economical.",
  },
] as const;

export const SANKEY_NODE_TOOLTIPS: Record<string, string> = {
  heating:
    "Energy injected into the plasma to start and sustain the fusion reaction. Comes from neutral beams, microwaves, or radio waves.",
  plasma:
    "Superheated ionized gas at ~150 million °C where fusion happens. Held in place by powerful magnetic fields, never touching the vessel walls.",
  fusion:
    "Total energy released when atoms fuse. For D-T fuel, 80% comes out as fast neutrons, 20% as charged alpha particles.",
  neutron:
    "Fast-moving neutrons carry most of the fusion energy. They escape the magnetic field and deposit their energy in the surrounding blanket as heat.",
  alpha:
    "Helium nuclei produced by fusion. Trapped by the magnetic field, they help keep the plasma hot — this is how fusion becomes self-sustaining.",
  conversion:
    "Heat from the blanket boils water, drives a steam turbine, generates electricity. Same principle as any thermal power plant — only the heat source is different.",
  heat_output:
    "Total thermal output produced by fusion in this research machine. There is no electrical conversion stage in this preset.",
  research_reject:
    "Research-only machines exhaust this heat to cooling systems rather than turning it into electricity for the grid.",
  loss_reject:
    "Energy that couldn't be converted to electricity due to thermodynamic limits. Released through cooling towers, same as in a nuclear or coal plant.",
  loss_heat:
    "Energy that couldn't be converted to electricity due to thermodynamic limits. Released through cooling towers, same as in a nuclear or coal plant.",
  gross:
    "Total electricity produced before subtracting what the plant itself needs to run.",
  recirc:
    "Electricity the plant consumes to power its own heating systems and pumps. Subtracted from gross output.",
  net: "Electricity actually delivered to the grid. This is what the plant produces for the world.",
};

export const CONTROL_EXPLANATIONS: Record<
  string,
  {
    short: string;
    title: string;
    long: string[];
    why: string;
    relatedNodes: string[];
  }
> = {
  heatingPowerMW: {
    short: "External power injected to heat and sustain the plasma.",
    title: "Heating Power",
    long: [
      "Heating power is the external energy you inject into plasma through neutral beams, RF systems, or microwave heating.",
      "Higher heating usually increases fusion power, but it also increases plant recirculation burden because that energy has to come from somewhere.",
      "In a commercial regime, the key is not maximizing heating power alone, but maximizing fusion return per unit of recirculated electricity.",
    ],
    why: "This control sets the launch condition for the entire energy chain and strongly influences net electric outcome.",
    relatedNodes: ["heating", "plasma", "recirc"],
  },
  pulseRateHz: {
    short: "How frequently pulsed operation repeats the plasma burn cycle.",
    title: "Pulse Rate",
    long: [
      "Pulse rate defines how often the reactor repeats a burn cycle in pulsed mode.",
      "Higher pulse rates can increase average output but also stress thermal cycling, power electronics, and control systems.",
      "Steady-state operation avoids this cycling but requires different confinement and current-drive assumptions.",
    ],
    why: "Pulse cadence changes operational realism and average grid profile.",
    relatedNodes: ["plasma", "fusion"],
  },
  qSci: {
    short: "Ratio of fusion power produced to plasma heating power absorbed.",
    title: "Scientific Gain (Q_sci)",
    long: [
      "Q_sci is the plasma-only gain ratio: fusion power divided by absorbed heating power.",
      "It says the plasma is productive, but it ignores all plant overheads such as conversion losses and auxiliary loads.",
      "That is why engineering gain and net electric output are required before claiming commercial viability.",
    ],
    why: "This is the fastest way to move from research-like behavior toward reactor-like behavior.",
    relatedNodes: ["fusion", "gross", "net"],
  },
  houseLoadMW: {
    short: "Power consumed by plant infrastructure: cryogenics, pumps, controls, balance-of-plant.",
    title: "House Load",
    long: [
      "House load is the plant's own electrical demand, excluding direct plasma heating.",
      "It includes cryogenic support, vacuum pumping, diagnostics, control systems, coolant circulation, and auxiliary balance-of-plant.",
      "A fusion machine can have high gross output but still weak net output if house load is too high.",
    ],
    why: "Commercial fusion is won or lost on gross-to-net conversion discipline.",
    relatedNodes: ["gross", "recirc", "net"],
  },
};

export const CORE_METRIC_EXPLANATIONS: Record<
  string,
  {
    title: string;
    short: string[];
    relatedControls: string[];
  }
> = {
  qSci: {
    title: "Scientific gain (Q_sci)",
    short: [
      "Q_sci measures plasma performance only: fusion power divided by absorbed heating power.",
      "Crossing 1 means the plasma produces more fusion power than direct heating power, but it does not include plant losses.",
    ],
    relatedControls: ["qSci", "heatingPowerMW", "temperatureKeV"],
  },
  qEng: {
    title: "Engineering gain (Q_eng)",
    short: [
      "Q_eng compares gross electric output to total electric input for plant systems.",
      "This is a system-level metric, so it includes conversion and recirculation penalties that Q_sci ignores.",
    ],
    relatedControls: ["etaNeutron", "etaCharged", "houseLoadMW"],
  },
  fusion: {
    title: "Fusion power",
    short: [
      "Total power released by fusion reactions before conversion losses.",
      "This is split mainly between neutron energy and charged-particle energy.",
    ],
    relatedControls: ["qSci", "heatingPowerMW", "fuel"],
  },
  gross: {
    title: "Gross electric output",
    short: [
      "Electric power generated before subtracting plant self-consumption.",
      "Higher conversion efficiencies move more fusion heat into this bucket.",
    ],
    relatedControls: ["etaNeutron", "etaCharged", "etaHeatingThrough"],
  },
  recirc: {
    title: "Recirculation",
    short: [
      "Power that the plant loops back into its own operation.",
      "Recirculation includes plasma heating and other internal loads, reducing deliverable grid output.",
    ],
    relatedControls: ["heatingPowerMW", "houseLoadMW", "etaHeating"],
  },
  net: {
    title: "Net electric output",
    short: [
      "Power available to the grid after subtracting internal plant consumption.",
      "This is the headline commercial metric for power-producing configurations.",
    ],
    relatedControls: ["qSci", "houseLoadMW", "etaNeutron"],
  },
  lawson: {
    title: "Ignition margin",
    short: [
      "Lawson criterion combines temperature, density, and confinement time into one ignition threshold.",
      "This margin shows how far current conditions are above or below that threshold.",
      "Above 1 means self-heating is plausible; below 1 means external heating remains mandatory.",
    ],
    relatedControls: ["temperatureKeV", "densityPerM3", "confinementTimeS"],
  },
  fuel_mode: {
    title: "Fuel mode",
    short: [
      "Fuel choice changes neutron fraction, achievable gain envelope, and conversion pathway.",
      "D-T is the current practical route for near-term high-gain tokamak operation.",
    ],
    relatedControls: ["fuel", "temperatureKeV", "qSci"],
  },
};
