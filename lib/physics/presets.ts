import type { FuelKey } from "@/lib/physics/fuels";

export type PresetId = "iter" | "sparc" | "arc" | "nif" | "jt60sa" | "demo";

export type SimulatorInputs = {
  heatingEnergyPerPulseMJ: number;
  pulseRateHz: number;
  qSci: number;
  etaConversion: number;
  etaHeating: number;
  houseLoadMW: number;
  conversionMode: "simple" | "split";
  fuel: FuelKey;
  etaNeutron: number;
  etaCharged: number;
  blanketMult: number;
  operationMode: "steady" | "pulsed";
  temperatureKeV: number;
  densityPerM3: number;
  confinementTimeS: number;
};

export type PresetConfig = {
  id: PresetId;
  label: string;
  description: string;
  inputs: SimulatorInputs;
};

export const DEFAULT_INPUTS: SimulatorInputs = {
  heatingEnergyPerPulseMJ: 50,
  pulseRateHz: 1,
  qSci: 10,
  etaConversion: 0.33,
  etaHeating: 0.5,
  houseLoadMW: 20,
  conversionMode: "split",
  fuel: "dt",
  etaNeutron: 0.4,
  etaCharged: 0.2,
  blanketMult: 1,
  operationMode: "pulsed",
  temperatureKeV: 20,
  densityPerM3: 1.2e20,
  confinementTimeS: 3.7,
};

export const PRESETS: PresetConfig[] = [
  {
    id: "iter",
    label: "ITER",
    description: "Reference D-T magnetic confinement target.",
    inputs: {
      ...DEFAULT_INPUTS,
      qSci: 10,
      heatingEnergyPerPulseMJ: 50,
      pulseRateHz: 1,
      temperatureKeV: 20,
      confinementTimeS: 3.7,
      densityPerM3: 1e20,
      operationMode: "pulsed",
      fuel: "dt",
    },
  },
  {
    id: "sparc",
    label: "SPARC",
    description: "Compact high-field gain demonstration.",
    inputs: {
      ...DEFAULT_INPUTS,
      qSci: 11,
      heatingEnergyPerPulseMJ: 25,
      pulseRateHz: 2.2,
      temperatureKeV: 20,
      confinementTimeS: 0.5,
      densityPerM3: 2.2e20,
      operationMode: "pulsed",
      fuel: "dt",
    },
  },
  {
    id: "arc",
    label: "ARC",
    description: "Commercialized compact tokamak profile.",
    inputs: {
      ...DEFAULT_INPUTS,
      qSci: 13,
      heatingEnergyPerPulseMJ: 40,
      pulseRateHz: 1,
      etaNeutron: 0.45,
      etaCharged: 0.26,
      houseLoadMW: 35,
      operationMode: "steady",
      temperatureKeV: 25,
      densityPerM3: 2.4e20,
      confinementTimeS: 1.2,
      fuel: "dt",
    },
  },
  {
    id: "nif",
    label: "NIF",
    description: "Inertial confinement pulsed ignition experiment.",
    inputs: {
      ...DEFAULT_INPUTS,
      qSci: 1.5,
      heatingEnergyPerPulseMJ: 2.2,
      pulseRateHz: 0.0002,
      houseLoadMW: 420,
      operationMode: "pulsed",
      temperatureKeV: 8,
      densityPerM3: 3e31,
      confinementTimeS: 1e-10,
      fuel: "dt",
    },
  },
  {
    id: "jt60sa",
    label: "JT-60SA",
    description: "Advanced tokamak research regime.",
    inputs: {
      ...DEFAULT_INPUTS,
      qSci: 1.2,
      heatingEnergyPerPulseMJ: 30,
      pulseRateHz: 0.5,
      houseLoadMW: 70,
      operationMode: "steady",
      fuel: "dd",
      temperatureKeV: 15,
      densityPerM3: 7e19,
      confinementTimeS: 2.5,
    },
  },
  {
    id: "demo",
    label: "DEMO",
    description: "EU-style next-step net-electric objective.",
    inputs: {
      ...DEFAULT_INPUTS,
      qSci: 35,
      heatingEnergyPerPulseMJ: 70,
      pulseRateHz: 1.2,
      etaNeutron: 0.5,
      etaCharged: 0.28,
      blanketMult: 1.15,
      houseLoadMW: 80,
      operationMode: "steady",
      fuel: "dt",
      temperatureKeV: 24,
      densityPerM3: 2.6e20,
      confinementTimeS: 2.1,
    },
  },
];

export const PRESET_MAP = Object.fromEntries(
  PRESETS.map((preset) => [preset.id, preset]),
) as Record<PresetId, PresetConfig>;
