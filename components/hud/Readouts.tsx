"use client";

import { useDisplayValue, useSimulation, useSimulatorStore } from "@/lib/store";
import { useTweenNumber } from "@/lib/useTweenNumber";

export function Readouts() {
  const simulation = useSimulation();
  const fuel = useSimulatorStore((state) => state.inputs.fuel);
  const qSci = useSimulatorStore((state) => state.inputs.qSci);
  const displayMode = useSimulatorStore((state) => state.displayMode);
  const selectedFlowKey = useSimulatorStore((state) => state.selectedFlowKey);

  const netDisplay = useDisplayValue(simulation.powerMW.netElectric);
  const grossDisplay = useDisplayValue(simulation.powerMW.electricGross);
  const recircDisplay = useDisplayValue(simulation.powerMW.recirculating);
  const fusionDisplay = useDisplayValue(simulation.powerMW.fusion);
  const lawsonMargin = simulation.ignitionRatio >= 1 ? 0 : (1 / simulation.ignitionRatio) - 1;
  const smoothQeng = useTweenNumber(simulation.engineeringQ);
  const smoothNet = useTweenNumber(netDisplay);
  const smoothGross = useTweenNumber(grossDisplay);
  const smoothRecirc = useTweenNumber(recircDisplay);
  const smoothFusion = useTweenNumber(fusionDisplay);

  const unit = displayMode === "power" ? "MW" : "MJ";

  return (
    <section className="panel rounded-md p-3">
      <p className="section-label mb-2">Core Readouts</p>
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[12px]">
        <MetricRow label="QSCI" value={qSci} unit="" />
        <MetricRow
          label="QENG"
          value={smoothQeng}
          unit=""
          highlight={selectedFlowKey === "electric_gross"}
        />
        <MetricRow label="FUSION POWER" value={smoothFusion} unit={unit} />
        <MetricRow label="GROSS ELECTRIC" value={smoothGross} unit={unit} />
        <MetricRow
          label="RECIRCULATION"
          value={smoothRecirc}
          unit={unit}
          highlight={selectedFlowKey === "recirculation_loss"}
        />
        <MetricRow
          label="NET ELECTRIC"
          value={smoothNet}
          unit={unit}
          highlight={selectedFlowKey === "net_electric"}
        />
        <MetricRow label="LAWSON MARGIN" value={lawsonMargin} unit="x under" digits={1} />
        <MetricRow label="FUEL MODE" value={0} unit={fuel.toUpperCase()} literal />
      </div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  unit,
  digits = 2,
  highlight = false,
  literal = false,
}: {
  label: string;
  value: number;
  unit: string;
  digits?: number;
  highlight?: boolean;
  literal?: boolean;
}) {
  return (
    <>
      <span className="text-[10px] tracking-[0.18em] text-muted-foreground">{label}</span>
      <span
        className="text-right font-mono tabular-nums"
        style={{
          color: highlight ? "var(--primary)" : "var(--foreground)",
        }}
      >
        {literal
          ? unit
          : `${value.toLocaleString(undefined, {
              minimumFractionDigits: digits === 0 ? 0 : 1,
              maximumFractionDigits: digits,
            })}${unit ? ` ${unit}` : ""}`}
      </span>
    </>
  );
}
