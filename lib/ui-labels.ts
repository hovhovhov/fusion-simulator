import { PRESETS, type PresetId } from "@/lib/presets";

export const CONTROL_LABELS: Record<string, string> = {
  heatingPowerMW: "Heating power",
  pulseRateHz: "Pulse rate",
  qSci: "Scientific gain (Q_sci)",
  houseLoadMW: "House load",
  etaHeating: "Heating system efficiency",
  etaNeutron: "Neutron conversion efficiency",
  etaCharged: "Charged-particle conversion efficiency",
  etaHeatingThrough: "Heating-through conversion efficiency",
  blanketMult: "Blanket multiplication",
  temperatureKeV: "Plasma temperature",
  densityPerM3: "Plasma density",
  confinementTimeS: "Confinement time",
  fuel: "Fuel mix",
};

export const NODE_LABELS: Record<string, string> = {
  heating: "Heating Input",
  plasma: "Plasma",
  fusion: "Fusion Power",
  neutron: "Neutron Channel",
  alpha: "Charged-Particle Channel",
  conversion: "Power Conversion",
  heat_output: "Thermal Output",
  research_reject: "Rejected Heat",
  loss_reject: "Rejected Heat",
  loss_heat: "Rejected Heat",
  gross: "Gross Electric",
  recirc: "Recirculation",
  net: "Net Electric",
};

export const PRESET_NAMES = Object.fromEntries(
  PRESETS.map((preset) => [preset.id, preset.name]),
) as Record<PresetId, string>;

export function labelForControl(controlId: string): string {
  return CONTROL_LABELS[controlId] ?? humanize(controlId);
}

export function labelForNode(nodeId: string): string {
  return NODE_LABELS[nodeId] ?? humanize(nodeId);
}

function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase());
}
