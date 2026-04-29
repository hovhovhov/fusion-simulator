export type FuelKey = "dt" | "dd" | "dhe3" | "pb11";

export type FuelProfile = {
  key: FuelKey;
  label: string;
  reaction: string;
  energyMeV: number;
  neutronFraction: number;
  ignitionNttau: number;
  notes: string;
};

export const FUEL_PROFILES: Record<FuelKey, FuelProfile> = {
  dt: {
    key: "dt",
    label: "D-T",
    reaction: "D + T -> He4 + n",
    energyMeV: 17.6,
    neutronFraction: 0.8,
    ignitionNttau: 3e21,
    notes: "Best near-term gain, high neutron load and tritium cycle required.",
  },
  dd: {
    key: "dd",
    label: "D-D",
    reaction: "D + D -> T + p / He3 + n",
    energyMeV: 3.65,
    neutronFraction: 0.5,
    ignitionNttau: 1e23,
    notes: "Fuel abundant, but ignition requirements are much harder than D-T.",
  },
  dhe3: {
    key: "dhe3",
    label: "D-He3",
    reaction: "D + He3 -> He4 + p",
    energyMeV: 18.3,
    neutronFraction: 0.05,
    ignitionNttau: 2e23,
    notes: "Mostly charged output, but He3 sourcing and ignition are difficult.",
  },
  pb11: {
    key: "pb11",
    label: "p-B11",
    reaction: "p + B11 -> 3 He4",
    energyMeV: 8.7,
    neutronFraction: 0.01,
    ignitionNttau: 2e24,
    notes: "Aneutronic target with extreme confinement and temperature demands.",
  },
};

export const FUEL_ORDER: FuelKey[] = ["dt", "dd", "dhe3", "pb11"];
