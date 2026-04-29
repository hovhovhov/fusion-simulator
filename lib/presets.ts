import { FUEL_PROFILES, type FuelKey } from "@/lib/physics/fuels";

export type PresetId = "jet" | "iter" | "sparc" | "arc" | "demo";

export type SimulatorInputs = {
  hasElectricalConversion: boolean;
  operationMode: "steady" | "pulsed";
  heatingPowerMW: number;
  pulseRateHz: number;
  qSci: number;
  houseLoadMW: number;
  etaHeating: number;
  etaNeutron: number;
  etaCharged: number;
  etaHeatingThrough: number;
  blanketMult: number;
  fuel: FuelKey;
  temperatureKeV: number;
  densityPerM3: number;
  confinementTimeS: number;
};

export type Preset = {
  id: PresetId;
  name: string;
  meta: string;
  tag: "research" | "power";
  inputs: SimulatorInputs;
};

export const DEFAULT_INPUTS: SimulatorInputs = {
  hasElectricalConversion: false,
  operationMode: "pulsed",
  heatingPowerMW: 24,
  pulseRateHz: 0.2,
  qSci: 0.67,
  houseLoadMW: 55,
  etaHeating: 0.45,
  etaNeutron: 0.0,
  etaCharged: 0.0,
  etaHeatingThrough: 0.0,
  blanketMult: 1.0,
  fuel: "dt",
  temperatureKeV: 15,
  densityPerM3: 8e19,
  confinementTimeS: 1.7,
};

export const PRESETS: Preset[] = [
  {
    id: "jet",
    name: "JET",
    meta: "2021 record · Q~0.67 · 16 MW",
    tag: "research",
    inputs: {
      ...DEFAULT_INPUTS,
      hasElectricalConversion: false,
      heatingPowerMW: 24,
      qSci: 0.67,
      houseLoadMW: 55,
      etaHeating: 0.45,
      etaNeutron: 0.0,
      etaCharged: 0.0,
      etaHeatingThrough: 0.0,
      blanketMult: 1.0,
      fuel: "dt",
      operationMode: "pulsed",
      pulseRateHz: 0.2,
      temperatureKeV: 15,
      densityPerM3: 8e19,
      confinementTimeS: 1.7,
    },
  },
  {
    id: "iter",
    name: "ITER",
    meta: "2030s target · Q=10 · 500 MW",
    tag: "research",
    inputs: {
      ...DEFAULT_INPUTS,
      hasElectricalConversion: false,
      heatingPowerMW: 100,
      qSci: 10,
      houseLoadMW: 120,
      etaNeutron: 0.0,
      etaCharged: 0.0,
      etaHeatingThrough: 0.0,
      etaHeating: 0.5,
      blanketMult: 1.0,
      fuel: "dt",
      operationMode: "pulsed",
      pulseRateHz: 0.5,
      temperatureKeV: 20,
      densityPerM3: 1e20,
      confinementTimeS: 3,
    },
  },
  {
    id: "sparc",
    name: "SPARC",
    meta: "Late-2020s target · Q~11 · 140 MW",
    tag: "research",
    inputs: {
      ...DEFAULT_INPUTS,
      hasElectricalConversion: false,
      heatingPowerMW: 25.5,
      qSci: 11,
      houseLoadMW: 30,
      fuel: "dt",
      operationMode: "pulsed",
      pulseRateHz: 1.2,
      temperatureKeV: 22,
      densityPerM3: 1.8e20,
      confinementTimeS: 1.4,
    },
  },
  {
    id: "arc",
    name: "ARC",
    meta: "Late 2030s target · Q~12 · 525 MW",
    tag: "power",
    inputs: {
      ...DEFAULT_INPUTS,
      hasElectricalConversion: true,
      heatingPowerMW: 72,
      qSci: 12,
      houseLoadMW: 36,
      etaHeating: 0.57,
      etaNeutron: 0.26,
      etaCharged: 0.18,
      etaHeatingThrough: 0.2,
      blanketMult: 1.15,
      operationMode: "steady",
      pulseRateHz: 1,
      fuel: "dt",
      temperatureKeV: 24,
      densityPerM3: 2.3e20,
      confinementTimeS: 2.0,
    },
  },
  {
    id: "demo",
    name: "DEMO",
    meta: "2050s target · Q~25 · 2 GW",
    tag: "power",
    inputs: {
      ...DEFAULT_INPUTS,
      hasElectricalConversion: true,
      heatingPowerMW: 145,
      qSci: 25,
      houseLoadMW: 15,
      etaHeating: 0.55,
      etaNeutron: 0.22,
      etaCharged: 0.14,
      etaHeatingThrough: 0.12,
      blanketMult: 1.1,
      operationMode: "steady",
      pulseRateHz: 1,
      fuel: "dt",
      temperatureKeV: 24,
      densityPerM3: 2.7e20,
      confinementTimeS: 2.1,
    },
  },
];

export const PRESET_MAP = Object.fromEntries(PRESETS.map((preset) => [preset.id, preset])) as Record<
  PresetId,
  Preset
>;

export function fuelDescription(fuel: FuelKey): { equation: string; neutronFraction: number; text: string } {
  const profile = FUEL_PROFILES[fuel];
  return {
    equation: profile.reaction.replace("->", "→"),
    neutronFraction: profile.neutronFraction,
    text: profile.notes,
  };
}
