"use client";

import { create } from "zustand";

import { simulate } from "@/lib/physics";
import {
  DEFAULT_INPUTS,
  PRESET_MAP,
  PRESETS,
  type PresetId,
  type SimulatorInputs,
} from "@/lib/presets";

const QUERY_KEYS: (keyof SimulatorInputs)[] = [
  "hasElectricalConversion",
  "operationMode",
  "heatingPowerMW",
  "pulseRateHz",
  "qSci",
  "houseLoadMW",
  "etaHeating",
  "etaNeutron",
  "etaCharged",
  "etaHeatingThrough",
  "blanketMult",
  "fuel",
  "temperatureKeV",
  "densityPerM3",
  "confinementTimeS",
];

type MetricKey =
  | "qSci"
  | "qEng"
  | "fusion"
  | "gross"
  | "recirc"
  | "net"
  | "lawson";

type SimulatorStore = {
  inputs: SimulatorInputs;
  activePreset: PresetId | "custom";
  touchedMetric: MetricKey | null;
  touchNonce: number;
  selectedFlowKey: string | null;
  selectedNodeId: string | null;
  setInput: <K extends keyof SimulatorInputs>(key: K, value: SimulatorInputs[K]) => void;
  applyPreset: (presetId: PresetId) => void;
  reset: () => void;
  setSelectedFlowKey: (key: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  hydrateFromQuery: (params: URLSearchParams) => void;
  toQueryString: () => string;
};

export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  inputs: DEFAULT_INPUTS,
  activePreset: "jet",
  touchedMetric: null,
  touchNonce: 0,
  selectedFlowKey: null,
  selectedNodeId: null,
  setInput: (key, value) =>
    set((state) => ({
      inputs: { ...state.inputs, [key]: value },
      activePreset: "custom",
      touchedMetric: metricMap[key] ?? null,
      touchNonce: state.touchNonce + 1,
    })),
  applyPreset: (presetId) =>
    set((state) => ({
      inputs: PRESET_MAP[presetId].inputs,
      activePreset: presetId,
      touchedMetric: "net",
      touchNonce: state.touchNonce + 1,
      selectedFlowKey: null,
      selectedNodeId: null,
    })),
  reset: () =>
    set((state) => ({
      inputs: DEFAULT_INPUTS,
      activePreset: "jet",
      touchedMetric: "net",
      touchNonce: state.touchNonce + 1,
      selectedFlowKey: null,
      selectedNodeId: null,
    })),
  setSelectedFlowKey: (selectedFlowKey) => set({ selectedFlowKey }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  hydrateFromQuery: (params) => {
    const nextInputs: SimulatorInputs = { ...DEFAULT_INPUTS };
    const preset = params.get("preset") as PresetId | null;
    let isCustom = false;

    if (preset && PRESET_MAP[preset]) {
      Object.assign(nextInputs, PRESET_MAP[preset].inputs);
    }

    QUERY_KEYS.forEach((key) => {
      const raw = params.get(key);
      if (!raw) return;
      const defaultValue = DEFAULT_INPUTS[key];
      if (typeof defaultValue === "number") {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
          (nextInputs as Record<string, unknown>)[key] = parsed;
          isCustom = true;
        }
      } else if (typeof defaultValue === "boolean") {
        (nextInputs as Record<string, unknown>)[key] = raw === "true";
        isCustom = true;
      } else {
        (nextInputs as Record<string, unknown>)[key] = raw;
        isCustom = true;
      }
    });

    set({
      inputs: nextInputs,
      activePreset: preset && !isCustom && PRESET_MAP[preset] ? preset : "custom",
    });
  },
  toQueryString: () => {
    const state = get();
    const params = new URLSearchParams();
    if (state.activePreset !== "custom") {
      params.set("preset", state.activePreset);
    }
    QUERY_KEYS.forEach((key) => {
      params.set(key, String(state.inputs[key]));
    });
    return params.toString();
  },
}));

const metricMap: Partial<Record<keyof SimulatorInputs, MetricKey>> = {
  qSci: "qSci",
  heatingPowerMW: "fusion",
  houseLoadMW: "recirc",
  etaNeutron: "gross",
  etaCharged: "gross",
  etaHeatingThrough: "gross",
  blanketMult: "gross",
  temperatureKeV: "lawson",
  densityPerM3: "lawson",
  confinementTimeS: "lawson",
};

export function useSimulation() {
  const inputs = useSimulatorStore((state) => state.inputs);
  return simulate(inputs);
}

export { PRESETS };
