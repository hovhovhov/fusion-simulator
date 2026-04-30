import type { ReactNode } from "react";

export type FuelReactionId = "D-T" | "D-D" | "p-B11";

export type ReactionToken =
  | { sym: string; iso?: string }
  | { op: string }
  | { arrow: true }
  | { branchText: string };

export type ReactantParticle = {
  id: string;
  color: string;
  r: number;
  fromX: number;
  toX: number;
};

export type ProductParticle = {
  id: string;
  label: string;
  color: string;
  r: number;
  dx: number;
  dy: number;
  arrowLen: number;
  charged: boolean;
};

export type ReactionBranch = {
  label?: string;
  weight: number;
  yOffset?: number;
  reactants: ReactantParticle[];
  products: ProductParticle[];
};

export type ReactionConfig = {
  id: FuelReactionId;
  label: string;
  short: string;
  eyebrowDot: string;
  equation: ReactionToken[];
  energy: string;
  anchor: ReactNode;
  details: [string, string][];
  branches: ReactionBranch[];
};

export const REACTIONS: Record<FuelReactionId, ReactionConfig> = {
  "D-T": {
    id: "D-T",
    label: "Deuterium · Tritium",
    short: "D + T",
    eyebrowDot: "var(--p-alpha)",
    equation: [
      { sym: "D", iso: "²" },
      { op: "+" },
      { sym: "T", iso: "³" },
      { arrow: true },
      { sym: "He", iso: "⁴" },
      { op: "+" },
      { sym: "n" },
    ],
    energy: "17.6 MeV",
    anchor: (
      <>
        The default for <strong>every reactor being built today</strong>. Each fusion event releases{" "}
        <strong>17.6&nbsp;MeV</strong> - a single gram of D-T fuel carries roughly the energy of{" "}
        <strong>11&nbsp;tonnes of coal</strong>. The neutron leaves with 80% of that energy and escapes
        the plasma; the alpha stays behind and keeps it hot.
      </>
    ),
    details: [
      ["Reaction", "D + T -> He-4 + n"],
      ["Min temperature", "~100 M °C"],
      ["Energy / event", "17.6 MeV"],
      ["Neutron yield", "80% of energy"],
      ["Fuel abundance", "Tritium bred from lithium (scarce)"],
      ["Used in", "JET, ITER, SPARC, ARC, DEMO"],
    ],
    branches: [
      {
        weight: 1,
        reactants: [
          { id: "D", color: "p-deuterium", r: 11, fromX: 30, toX: 220 },
          { id: "T", color: "p-tritium", r: 13, fromX: 450, toX: 260 },
        ],
        products: [
          { id: "He-4", label: "α  He⁴", color: "p-alpha", r: 14, dx: 72, dy: -8, arrowLen: 60, charged: true },
          { id: "n", label: "n", color: "p-neutron", r: 7, dx: -150, dy: -32, arrowLen: 220, charged: false },
        ],
      },
    ],
  },
  "D-D": {
    id: "D-D",
    label: "Deuterium · Deuterium",
    short: "D + D",
    eyebrowDot: "var(--p-deuterium)",
    equation: [
      { sym: "D", iso: "²" },
      { op: "+" },
      { sym: "D", iso: "²" },
      { arrow: true },
      { branchText: "He³ + n   /   T + p" },
    ],
    energy: "3.3 / 4.0 MeV",
    anchor: (
      <>
        A research curiosity, <strong>not a power-plant target</strong>. Two deuterons fuse into{" "}
        <strong>two equally-likely outcomes</strong>: helium-3 + neutron, or tritium + proton. Yield
        per event is roughly <strong>1/4 of D-T</strong>, but the fuel is seawater-cheap - about{" "}
        <strong>33&nbsp;mg of deuterium per litre</strong>.
      </>
    ),
    details: [
      ["Reaction", "D + D -> He-3 + n   /   T + p   (50/50)"],
      ["Min temperature", "~400 M °C"],
      ["Energy / event", "3.27 MeV / 4.03 MeV"],
      ["Neutron yield", "~35% of energy (one branch)"],
      ["Fuel abundance", "Deuterium from seawater (abundant)"],
      ["Used in", "Research devices; not currently a power-plant target"],
    ],
    branches: [
      {
        label: "BRANCH A · 50%",
        weight: 0.5,
        yOffset: -42,
        reactants: [
          { id: "D", color: "p-deuterium", r: 11, fromX: 30, toX: 220 },
          { id: "D2", color: "p-deuterium", r: 11, fromX: 450, toX: 260 },
        ],
        products: [
          { id: "He-3", label: "He³", color: "p-helium3", r: 11, dx: 56, dy: 0, arrowLen: 50, charged: true },
          { id: "n", label: "n", color: "p-neutron", r: 7, dx: -130, dy: -10, arrowLen: 180, charged: false },
        ],
      },
      {
        label: "BRANCH B · 50%",
        weight: 0.5,
        yOffset: 42,
        reactants: [
          { id: "D", color: "p-deuterium", r: 11, fromX: 30, toX: 220 },
          { id: "D2", color: "p-deuterium", r: 11, fromX: 450, toX: 260 },
        ],
        products: [
          { id: "T", label: "T", color: "p-tritium", r: 12, dx: 62, dy: 6, arrowLen: 70, charged: true },
          { id: "p", label: "p⁺", color: "p-proton", r: 6, dx: -120, dy: 14, arrowLen: 160, charged: true },
        ],
      },
    ],
  },
  "p-B11": {
    id: "p-B11",
    label: "Proton · Boron-11",
    short: "p + ¹¹B",
    eyebrowDot: "var(--p-boron)",
    equation: [
      { sym: "p" },
      { op: "+" },
      { sym: "B", iso: "¹¹" },
      { arrow: true },
      { sym: "3·He", iso: "⁴" },
    ],
    energy: "8.7 MeV",
    anchor: (
      <>
        The aneutronic dream. <strong>Decades away, possibly never.</strong> A proton smashes into
        boron-11 and shatters it into <strong>three alpha particles</strong> - all of them charged, all
        of them stay in the plasma. <strong>No neutrons</strong> means no radioactive walls and no
        shielding tax, but it needs roughly <strong>10x the temperature</strong> of D-T to ignite.
      </>
    ),
    details: [
      ["Reaction", "p + ¹¹B -> 3 He-4"],
      ["Min temperature", "~1 B °C"],
      ["Energy / event", "8.7 MeV"],
      ["Neutron yield", "≈ 0 (aneutronic)"],
      ["Fuel abundance", "Boron-11 abundant; protons trivial"],
      ["Used in", "TAE Technologies, HB11, research"],
    ],
    branches: [
      {
        weight: 1,
        reactants: [
          { id: "p", color: "p-proton", r: 6, fromX: 30, toX: 220 },
          { id: "B11", color: "p-boron", r: 17, fromX: 450, toX: 260 },
        ],
        products: [
          { id: "α1", label: "α", color: "p-alpha", r: 12, dx: 140, dy: -52, arrowLen: 150, charged: true },
          { id: "α2", label: "α", color: "p-alpha", r: 12, dx: 150, dy: 44, arrowLen: 160, charged: true },
          { id: "α3", label: "α", color: "p-alpha", r: 12, dx: -150, dy: 6, arrowLen: 165, charged: true },
        ],
      },
    ],
  },
};

export const FUEL_SEQUENCE: FuelReactionId[] = ["D-T", "D-D", "p-B11"];
