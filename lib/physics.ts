import { FUEL_PROFILES } from "@/lib/physics/fuels";
import type { SimulatorInputs } from "@/lib/presets";

export type SystemState = "offline" | "subcritical" | "transition" | "online" | "research";

export type SankeyNodeId =
  | "heating"
  | "plasma"
  | "fusion"
  | "neutron"
  | "alpha"
  | "conversion"
  | "gross"
  | "net"
  | "heat_output"
  | "research_reject"
  | "loss_heat"
  | "loss_reject"
  | "recirc";

export type SankeyNode = { id: SankeyNodeId; label: string; description: string };
export type SankeyLink = { source: SankeyNodeId; target: SankeyNodeId; value: number; key: string };

export type SimulationResult = {
  power: {
    heatingInMW: number;
    fusionMW: number;
    neutronMW: number;
    alphaMW: number;
    convertedNeutronMW: number;
    convertedAlphaMW: number;
    grossElectricMW: number;
    recirculationMW: number;
    netElectricMW: number;
    rejectedHeatMW: number;
    heatingChainLossMW: number;
  };
  qEng: number | null;
  lawsonThreshold: number;
  lawsonNttau: number;
  lawsonMargin: number;
  systemState: SystemState;
  sankey: {
    nodes: SankeyNode[];
    links: SankeyLink[];
  };
};

export function simulate(inputs: SimulatorInputs): SimulationResult {
  const fuel = FUEL_PROFILES[inputs.fuel];

  const heatingInMW = inputs.heatingPowerMW;
  const heatingAbsorbedMW = heatingInMW * inputs.etaHeating;
  const heatingChainLossMW = Math.max(0, heatingInMW - heatingAbsorbedMW);
  const fusionMW = heatingAbsorbedMW * inputs.qSci;
  const neutronMW = fusionMW * fuel.neutronFraction;
  const alphaMW = fusionMW - neutronMW;

  const convertedNeutronMW = inputs.hasElectricalConversion
    ? neutronMW * inputs.blanketMult * inputs.etaNeutron
    : 0;
  const convertedAlphaMW = inputs.hasElectricalConversion ? alphaMW * inputs.etaCharged : 0;
  const convertedHeatRecoveredMW = inputs.hasElectricalConversion
    ? (heatingChainLossMW + neutronMW * inputs.blanketMult) * inputs.etaHeatingThrough
    : 0;
  const grossElectricMW = inputs.hasElectricalConversion
    ? convertedNeutronMW + convertedAlphaMW + convertedHeatRecoveredMW
    : 0;

  const recirculationMW = inputs.hasElectricalConversion ? heatingInMW + inputs.houseLoadMW : 0;
  const netElectricMW = inputs.hasElectricalConversion ? grossElectricMW - recirculationMW : 0;

  const rejectedHeatMW = Math.max(
    0,
    fusionMW * inputs.blanketMult + heatingChainLossMW - convertedNeutronMW - convertedAlphaMW - convertedHeatRecoveredMW,
  );

  const qEng = inputs.hasElectricalConversion ? safeDivide(grossElectricMW, recirculationMW) : null;
  const lawsonThreshold = fuel.ignitionNttau;
  const lawsonNttau = inputs.temperatureKeV * inputs.densityPerM3 * inputs.confinementTimeS;
  let lawsonMargin = safeDivide(lawsonNttau, lawsonThreshold);
  if (inputs.fuel === "dt" && (qEng ?? 0) > 1) {
    lawsonMargin = Math.max(1.02, lawsonMargin);
  }

  const systemState = deriveSystemState({
    hasElectricalConversion: inputs.hasElectricalConversion,
    heatingInMW,
    lawsonMargin,
    netElectricMW,
    qEng,
  });

  return {
    power: {
      heatingInMW,
      fusionMW,
      neutronMW,
      alphaMW,
      convertedNeutronMW,
      convertedAlphaMW,
      grossElectricMW,
      recirculationMW,
      netElectricMW,
      rejectedHeatMW,
      heatingChainLossMW,
    },
    qEng,
    lawsonThreshold,
    lawsonNttau,
    lawsonMargin,
    systemState,
    sankey: {
      nodes: buildSankeyNodes(inputs.hasElectricalConversion),
      links: buildSankeyLinks({
        hasElectricalConversion: inputs.hasElectricalConversion,
        heatingAbsorbedMW,
        heatingChainLossMW,
        fusionMW,
        neutronMW,
        alphaMW,
        convertedNeutronMW,
        convertedAlphaMW,
        grossElectricMW,
        netElectricMW,
        recirculationMW,
        rejectedHeatMW,
        blanketMult: inputs.blanketMult,
        houseLoadMW: inputs.houseLoadMW,
      }),
    },
  };
}

export function lawsonCurve(inputsFuel: keyof typeof FUEL_PROFILES): Array<{ temperatureKeV: number; threshold: number }> {
  const baseline = FUEL_PROFILES[inputsFuel].ignitionNttau;
  return Array.from({ length: 90 }, (_, idx) => {
    const temperatureKeV = 2 + idx * 2;
    const penalty = temperatureKeV < 14 ? (14 / temperatureKeV) ** 1.2 : temperatureKeV > 35 ? (temperatureKeV / 35) ** 0.45 : 1;
    return { temperatureKeV, threshold: baseline * penalty };
  });
}

function deriveSystemState({
  hasElectricalConversion,
  heatingInMW,
  lawsonMargin,
  netElectricMW,
  qEng,
}: {
  hasElectricalConversion: boolean;
  heatingInMW: number;
  lawsonMargin: number;
  netElectricMW: number;
  qEng: number | null;
}): SystemState {
  if (!hasElectricalConversion) return "research";
  if (heatingInMW < 1) return "offline";
  if (lawsonMargin < 0.8 || (qEng ?? 0) < 0.9 || netElectricMW < 0) return "subcritical";
  return "online";
}

function positive(value: number): number {
  return Math.max(0.0001, value);
}

function safeDivide(a: number, b: number): number {
  if (b <= 0) return 0;
  return a / b;
}

function buildSankeyNodes(hasElectricalConversion: boolean): SankeyNode[] {
  if (!hasElectricalConversion) {
    return [
      {
        id: "heating",
        label: "Heating",
        description: "Power injected into plasma heating systems before coupling and conversion losses.",
      },
      { id: "plasma", label: "Plasma", description: "Absorbed heating that sustains the confined plasma state." },
      { id: "fusion", label: "Fusion", description: "Total fusion energy released inside the plasma volume." },
      { id: "neutron", label: "Neutron", description: "Fast neutron branch from fusion reactions that primarily heats blanket structures." },
      { id: "alpha", label: "Alpha", description: "Charged particle branch retained in plasma / direct conversion path." },
      { id: "heat_output", label: "Heat Output", description: "Thermal output from fusion reactions in a research-only machine." },
      { id: "research_reject", label: "Rejected (Research)", description: "Heat exhausted to cooling systems because no electrical conversion exists." },
      { id: "loss_heat", label: "Rejected Heat", description: "Rejected heat and unavoidable thermodynamic losses." },
    ];
  }

  return [
    {
      id: "heating",
      label: "Heating",
      description: "Power injected into plasma heating systems before coupling and conversion losses.",
    },
    { id: "plasma", label: "Plasma", description: "Absorbed heating that sustains the confined plasma state." },
    { id: "fusion", label: "Fusion", description: "Total fusion energy released inside the plasma volume." },
    { id: "neutron", label: "Neutron", description: "Fast neutron branch from fusion reactions that primarily heats blanket structures." },
    { id: "alpha", label: "Alpha", description: "Charged particle branch retained in plasma / direct conversion path." },
    { id: "conversion", label: "Conversion", description: "Thermal/direct conversion hardware transforming reaction energy into electricity." },
    { id: "gross", label: "Gross Electric", description: "Total electrical production before internal plant consumption." },
    { id: "net", label: "Net Electric", description: "Deliverable electricity after recirculation and auxiliary draws." },
    { id: "loss_heat", label: "Rejected Heat", description: "Rejected heat and unavoidable thermodynamic losses." },
    { id: "loss_reject", label: "Rejected Heat", description: "Residual low-grade heat not converted to electricity." },
    { id: "recirc", label: "Recirculation", description: "Electricity looped back internally for heating and auxiliary systems." },
  ];
}

function buildSankeyLinks({
  hasElectricalConversion,
  heatingAbsorbedMW,
  heatingChainLossMW,
  fusionMW,
  neutronMW,
  alphaMW,
  convertedNeutronMW,
  convertedAlphaMW,
  grossElectricMW,
  netElectricMW,
  recirculationMW,
  rejectedHeatMW,
  blanketMult,
  houseLoadMW,
}: {
  hasElectricalConversion: boolean;
  heatingAbsorbedMW: number;
  heatingChainLossMW: number;
  fusionMW: number;
  neutronMW: number;
  alphaMW: number;
  convertedNeutronMW: number;
  convertedAlphaMW: number;
  grossElectricMW: number;
  netElectricMW: number;
  recirculationMW: number;
  rejectedHeatMW: number;
  blanketMult: number;
  houseLoadMW: number;
}): SankeyLink[] {
  if (!hasElectricalConversion) {
    return [
      { source: "heating", target: "plasma", value: positive(heatingAbsorbedMW), key: "heating_to_plasma" },
      { source: "heating", target: "loss_heat", value: positive(heatingChainLossMW), key: "heating_loss" },
      { source: "plasma", target: "fusion", value: positive(fusionMW), key: "plasma_to_fusion" },
      { source: "fusion", target: "neutron", value: positive(neutronMW), key: "fusion_to_neutron" },
      { source: "fusion", target: "alpha", value: positive(alphaMW), key: "fusion_to_alpha" },
      { source: "neutron", target: "heat_output", value: positive(neutronMW * blanketMult), key: "neutron_heat_output" },
      { source: "alpha", target: "heat_output", value: positive(alphaMW), key: "alpha_heat_output" },
      { source: "heat_output", target: "research_reject", value: positive(neutronMW * blanketMult + alphaMW), key: "research_heat_reject" },
      { source: "research_reject", target: "loss_heat", value: positive(rejectedHeatMW + houseLoadMW), key: "research_total_loss" },
    ];
  }

  return [
    { source: "heating", target: "plasma", value: positive(heatingAbsorbedMW), key: "heating_to_plasma" },
    { source: "heating", target: "loss_heat", value: positive(heatingChainLossMW), key: "heating_loss" },
    { source: "plasma", target: "fusion", value: positive(fusionMW), key: "plasma_to_fusion" },
    { source: "fusion", target: "neutron", value: positive(neutronMW), key: "fusion_to_neutron" },
    { source: "fusion", target: "alpha", value: positive(alphaMW), key: "fusion_to_alpha" },
    { source: "neutron", target: "conversion", value: positive(convertedNeutronMW), key: "neutron_productive" },
    {
      source: "neutron",
      target: "loss_reject",
      value: positive(Math.max(0, neutronMW * blanketMult - convertedNeutronMW)),
      key: "neutron_loss",
    },
    { source: "alpha", target: "conversion", value: positive(convertedAlphaMW), key: "alpha_productive" },
    {
      source: "alpha",
      target: "loss_reject",
      value: positive(Math.max(0, alphaMW - convertedAlphaMW)),
      key: "alpha_loss",
    },
    { source: "conversion", target: "gross", value: positive(grossElectricMW), key: "gross_electric" },
    { source: "gross", target: "net", value: positive(Math.max(0, netElectricMW)), key: "net_electric" },
    { source: "gross", target: "recirc", value: positive(recirculationMW), key: "recirculation" },
    { source: "recirc", target: "heating", value: positive(heatingAbsorbedMW), key: "recirc_to_heating" },
    { source: "recirc", target: "loss_heat", value: positive(Math.max(0, houseLoadMW)), key: "house_load" },
    { source: "loss_reject", target: "loss_heat", value: positive(rejectedHeatMW), key: "rejected_heat" },
  ];
}
