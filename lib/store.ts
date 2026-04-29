"use client";

import { create } from "zustand";

import { simulate, toDisplayValue } from "@/lib/physics/calculate";
import {
  DEFAULT_INPUTS,
  PRESET_MAP,
  PRESETS,
  type PresetId,
  type SimulatorInputs,
} from "@/lib/physics/presets";

const QUERY_KEYS: (keyof SimulatorInputs)[] = [
  "heatingEnergyPerPulseMJ",
  "pulseRateHz",
  "qSci",
  "etaConversion",
  "etaHeating",
  "houseLoadMW",
  "conversionMode",
  "fuel",
  "etaNeutron",
  "etaCharged",
  "blanketMult",
  "operationMode",
  "temperatureKeV",
  "densityPerM3",
  "confinementTimeS",
];

type SimulatorStore = {
  inputs: SimulatorInputs;
  displayMode: "power" | "energy";
  activePreset: PresetId | "custom";
  selectedFlowKey: string | null;
  selectedHotspot: string | null;
  setInput: <K extends keyof SimulatorInputs>(
    key: K,
    value: SimulatorInputs[K],
  ) => void;
  setDisplayMode: (mode: "power" | "energy") => void;
  setSelectedFlowKey: (key: string | null) => void;
  setSelectedHotspot: (key: string | null) => void;
  applyPreset: (presetId: PresetId) => void;
  reset: () => void;
  hydrateFromQuery: (params: URLSearchParams) => void;
  toQueryString: () => string;
};

export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  inputs: DEFAULT_INPUTS,
  displayMode: "power",
  activePreset: "iter",
  selectedFlowKey: null,
  selectedHotspot: null,
  setInput: (key, value) =>
    set((state) => ({
      inputs: { ...state.inputs, [key]: value },
      activePreset: "custom",
    })),
  setDisplayMode: (displayMode) => set({ displayMode }),
  setSelectedFlowKey: (selectedFlowKey) => set({ selectedFlowKey }),
  setSelectedHotspot: (selectedHotspot) => set({ selectedHotspot }),
  applyPreset: (presetId) =>
    set({
      inputs: PRESET_MAP[presetId].inputs,
      activePreset: presetId,
      selectedFlowKey: null,
      selectedHotspot: null,
    }),
  reset: () =>
    set({
      inputs: DEFAULT_INPUTS,
      displayMode: "power",
      activePreset: "iter",
      selectedFlowKey: null,
      selectedHotspot: null,
    }),
  hydrateFromQuery: (params) => {
    const nextInputs: SimulatorInputs = { ...DEFAULT_INPUTS };
    let isCustom = false;

    const preset = params.get("preset") as PresetId | null;
    if (preset && PRESET_MAP[preset]) {
      Object.assign(nextInputs, PRESET_MAP[preset].inputs);
    }

    QUERY_KEYS.forEach((key) => {
      const rawValue = params.get(key);
      if (rawValue == null) {
        return;
      }

      const defaultValue = DEFAULT_INPUTS[key];
      if (typeof defaultValue === "number") {
        const parsed = Number(rawValue);
        if (Number.isFinite(parsed)) {
          (nextInputs as Record<string, unknown>)[key] = parsed;
          isCustom = true;
        }
        return;
      }

      (nextInputs as Record<string, unknown>)[key] = rawValue;
      isCustom = true;
    });

    const displayMode = params.get("display") === "energy" ? "energy" : "power";

    set({
      inputs: nextInputs,
      displayMode,
      activePreset: preset && !isCustom && PRESET_MAP[preset] ? preset : "custom",
    });
  },
  toQueryString: () => {
    const { inputs, displayMode, activePreset } = get();
    const params = new URLSearchParams();

    if (activePreset !== "custom") {
      params.set("preset", activePreset);
    }

    QUERY_KEYS.forEach((key) => {
      const value = inputs[key];
      params.set(key, String(value));
    });
    params.set("display", displayMode);

    return params.toString();
  },
}));

export function useSimulation() {
  const inputs = useSimulatorStore((state) => state.inputs);
  return simulate(inputs);
}

export function useDisplayValue(valueMW: number): number {
  const pulseRate = useSimulatorStore((state) => state.inputs.pulseRateHz);
  const displayMode = useSimulatorStore((state) => state.displayMode);
  return toDisplayValue(valueMW, pulseRate, displayMode);
}

export { PRESETS };
