import { FUEL_PROFILES } from "@/lib/physics/fuels";
import { calculateNttau, lawsonThresholdForFuel } from "@/lib/physics/lawson";
import type { SimulatorInputs } from "@/lib/physics/presets";

export type ViabilityStatus =
  | "below-breakeven"
  | "ignition-window"
  | "commercial-viable";

export type PlantSystemState = "offline" | "subcritical" | "transitioning" | "on";

export type SankeyNode = {
  id: string;
  label: string;
};

export type SankeyLink = {
  source: string;
  target: string;
  value: number;
  key: string;
};

export type SimulationOutput = {
  powerMW: {
    heatingAbsorbed: number;
    heatingWall: number;
    fusion: number;
    neutron: number;
    charged: number;
    thermal: number;
    electricGross: number;
    houseLoad: number;
    recirculating: number;
    netElectric: number;
  };
  engineeringQ: number;
  ntTau: number;
  lawsonThreshold: number;
  ignitionRatio: number;
  viabilityStatus: ViabilityStatus;
  systemState: PlantSystemState;
  sankey: {
    nodes: SankeyNode[];
    links: SankeyLink[];
  };
};

export function toDisplayValue(
  powerMW: number,
  pulseRateHz: number,
  displayMode: "power" | "energy",
): number {
  if (displayMode === "power") {
    return powerMW;
  }

  if (pulseRateHz <= 0) {
    return 0;
  }

  return powerMW / pulseRateHz;
}

export function simulate(inputs: SimulatorInputs): SimulationOutput {
  const fuel = FUEL_PROFILES[inputs.fuel];

  const heatingAbsorbed = inputs.heatingEnergyPerPulseMJ * inputs.pulseRateHz;
  const heatingWall = safeDivide(heatingAbsorbed, inputs.etaHeating);
  const fusion = inputs.qSci * heatingAbsorbed;
  const neutron = fusion * fuel.neutronFraction;
  const charged = fusion * (1 - fuel.neutronFraction);
  const thermal = inputs.blanketMult * neutron + charged;

  const electricGross =
    inputs.conversionMode === "split"
      ? inputs.etaNeutron * inputs.blanketMult * neutron +
        inputs.etaCharged * charged
      : inputs.etaConversion * thermal;

  const recirculating = heatingWall + inputs.houseLoadMW;
  const netElectric = electricGross - recirculating;
  const engineeringQ = safeDivide(electricGross, recirculating);

  const ntTau = calculateNttau(
    inputs.densityPerM3,
    inputs.temperatureKeV,
    inputs.confinementTimeS,
  );
  const lawsonThreshold = lawsonThresholdForFuel(inputs.fuel);
  const ignitionRatio = safeDivide(ntTau, lawsonThreshold);

  const viabilityStatus = getViabilityStatus({
    netElectric,
    engineeringQ,
    ignitionRatio,
  });
  const systemState = getSystemState({
    heatingAbsorbed,
    ignitionRatio,
    engineeringQ,
    netElectric,
  });

  const heatingRejected = Math.max(0, heatingWall - heatingAbsorbed);
  const neutronToElectric = inputs.etaNeutron * inputs.blanketMult * neutron;
  const chargedToElectric = inputs.etaCharged * charged;
  const neutronRejected = Math.max(0, inputs.blanketMult * neutron - neutronToElectric);
  const chargedRejected = Math.max(0, charged - chargedToElectric);
  const grossToNetLoss = Math.max(0, electricGross - Math.max(netElectric, 0));
  const houseAux = Math.max(0, inputs.houseLoadMW);

  return {
    powerMW: {
      heatingAbsorbed,
      heatingWall,
      fusion,
      neutron,
      charged,
      thermal,
      electricGross,
      houseLoad: inputs.houseLoadMW,
      recirculating,
      netElectric,
    },
    engineeringQ,
    ntTau,
    lawsonThreshold,
    ignitionRatio,
    viabilityStatus,
    systemState,
    sankey: {
      nodes: [
        { id: "heating", label: "Heating In" },
        { id: "heating_loss", label: "Heating Loss" },
        { id: "plasma", label: "Plasma" },
        { id: "fusion", label: "Fusion" },
        { id: "neutron", label: "Neutron" },
        { id: "alpha", label: "Alpha" },
        { id: "conversion", label: "Conversion" },
        { id: "conversion_loss", label: "Rejected Heat" },
        { id: "gross", label: "Gross Electric" },
        { id: "recirc", label: "Recirculation" },
        { id: "net", label: "Net Electric" },
      ],
      links: [
        {
          source: "heating",
          target: "plasma",
          value: positive(heatingAbsorbed),
          key: "heating_absorbed",
        },
        {
          source: "heating",
          target: "heating_loss",
          value: positive(heatingRejected),
          key: "heating_rejected",
        },
        {
          source: "plasma",
          target: "fusion",
          value: positive(fusion),
          key: "fusion_output",
        },
        {
          source: "fusion",
          target: "neutron",
          value: positive(neutron),
          key: "fusion_neutron",
        },
        {
          source: "fusion",
          target: "alpha",
          value: positive(charged),
          key: "fusion_alpha",
        },
        {
          source: "neutron",
          target: "conversion",
          value: positive(neutronToElectric),
          key: "neutron_to_electric",
        },
        {
          source: "neutron",
          target: "conversion_loss",
          value: positive(neutronRejected),
          key: "neutron_rejected_heat",
        },
        {
          source: "alpha",
          target: "conversion",
          value: positive(chargedToElectric),
          key: "alpha_to_electric",
        },
        {
          source: "alpha",
          target: "conversion_loss",
          value: positive(chargedRejected),
          key: "alpha_rejected_heat",
        },
        {
          source: "conversion",
          target: "gross",
          value: positive(electricGross),
          key: "electric_gross",
        },
        {
          source: "gross",
          target: "recirc",
          value: positive(grossToNetLoss),
          key: "recirculation_loss",
        },
        {
          source: "recirc",
          target: "conversion_loss",
          value: positive(houseAux),
          key: "house_load",
        },
        {
          source: "gross",
          target: "net",
          value: positive(Math.max(netElectric, 0)),
          key: "net_electric",
        },
      ],
    },
  };
}

function safeDivide(a: number, b: number): number {
  if (b <= 0) {
    return 0;
  }
  return a / b;
}

function positive(value: number): number {
  return Math.max(0.0001, value);
}

function getViabilityStatus({
  netElectric,
  engineeringQ,
  ignitionRatio,
}: {
  netElectric: number;
  engineeringQ: number;
  ignitionRatio: number;
}): ViabilityStatus {
  if (netElectric > 200 && engineeringQ >= 1.2 && ignitionRatio >= 1) {
    return "commercial-viable";
  }
  if (netElectric >= 0 || (engineeringQ >= 1 && ignitionRatio >= 0.8)) {
    return "ignition-window";
  }
  return "below-breakeven";
}

function getSystemState({
  heatingAbsorbed,
  ignitionRatio,
  engineeringQ,
  netElectric,
}: {
  heatingAbsorbed: number;
  ignitionRatio: number;
  engineeringQ: number;
  netElectric: number;
}): PlantSystemState {
  if (heatingAbsorbed < 0.5) {
    return "offline";
  }
  if (ignitionRatio < 0.35 || engineeringQ < 0.7) {
    return "subcritical";
  }
  if (netElectric < 0) {
    return "transitioning";
  }
  return "on";
}
