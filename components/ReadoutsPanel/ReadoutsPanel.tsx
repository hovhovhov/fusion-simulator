"use client";

import { Database, Home, Info, PlugZap } from "lucide-react";
import { type ReactNode } from "react";

import { FuelReactionCard } from "@/components/ReadoutsPanel/FuelReactionCard";
import { GlossaryTerm } from "@/components/learn/GlossaryTerm";
import { GLOSSARY } from "@/lib/learn";
import type { FuelKey } from "@/lib/physics/fuels";
import { useSimulation, useSimulatorStore } from "@/store";
import { useTweenNumber } from "@/lib/useTweenNumber";

export function ReadoutsPanel({
  onOpenContextPopover,
  onOpenCoreMetricPopover,
  onOpenFuelReactionPopover,
}: {
  onOpenFuelReactionPopover: (
    kind: "overview" | "deep_dive",
    fuel: FuelKey,
    anchorRect: DOMRect,
    placement: "left" | "right" | "top",
  ) => void;
  onOpenContextPopover: (
    id: "homes" | "data_centers" | "grid_share",
    anchorRect: DOMRect,
    placement: "left" | "right" | "top",
  ) => void;
  onOpenCoreMetricPopover: (
    metricId: "qSci" | "qEng" | "fusion" | "gross" | "recirc" | "net" | "lawson" | "fuel_mode",
    anchorRect: DOMRect,
    placement: "left" | "right" | "top",
  ) => void;
}) {
  const inputs = useSimulatorStore((s) => s.inputs);
  const touchedMetric = useSimulatorStore((s) => s.touchedMetric);
  const touchNonce = useSimulatorStore((s) => s.touchNonce);
  const simulation = useSimulation();
  const hasElectricalConversion = inputs.hasElectricalConversion;

  const qSci = useTweenNumber(inputs.qSci, 250);
  const qEng = useTweenNumber(simulation.qEng ?? 0, 250);
  const fusion = useTweenNumber(simulation.power.fusionMW, 250);
  const gross = useTweenNumber(simulation.power.grossElectricMW, 250);
  const recirc = useTweenNumber(simulation.power.recirculationMW, 250);
  const net = useTweenNumber(simulation.power.netElectricMW, 250);
  const lawsonValue = useTweenNumber(simulation.lawsonMargin, 250);
  const homes = hasElectricalConversion ? Math.max(0, Math.round(net * 1000 / 3.7)) : 0;
  const dataCenters = hasElectricalConversion ? Math.max(0, net / 80) : 0;
  const franceDemand = hasElectricalConversion ? Math.max(0, net / 130000) : 0;
  const ignitionClass =
    lawsonValue >= 1 ? "text-[#5be584]" : lawsonValue >= 0.5 ? "text-[#ffb547]" : "text-[#ef5757]";

  return (
    <aside className="panel column-scroll flex h-full flex-col overflow-y-auto p-3">
      <section className="mb-3 border border-white/6 p-2">
        <p className="section-label mb-2">Core Metrics</p>
        <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1.5 text-[12px]">
          <Metric label={<GlossaryTerm term="Q_sci" definition={GLOSSARY.q_sci.definition} />} value={qSci} metricKey="qSci" touchedMetric={touchedMetric} touchNonce={touchNonce} onOpenMetric={onOpenCoreMetricPopover} />
          <Metric label={<GlossaryTerm term="Q_eng" definition={GLOSSARY.q_eng.definition} />} value={qEng} metricKey="qEng" touchedMetric={touchedMetric} touchNonce={touchNonce} na={!hasElectricalConversion} onOpenMetric={onOpenCoreMetricPopover} />
          <Metric label="Fusion Power" value={fusion} unit="MW" metricKey="fusion" touchedMetric={touchedMetric} touchNonce={touchNonce} onOpenMetric={onOpenCoreMetricPopover} />
          <Metric label="Gross Electric" value={gross} unit="MW" metricKey="gross" touchedMetric={touchedMetric} touchNonce={touchNonce} na={!hasElectricalConversion} onOpenMetric={onOpenCoreMetricPopover} />
          <Metric label={<GlossaryTerm term="Recirculation" definition={GLOSSARY.recirculation.definition} />} value={recirc} unit="MW" metricKey="recirc" touchedMetric={touchedMetric} touchNonce={touchNonce} na={!hasElectricalConversion} onOpenMetric={onOpenCoreMetricPopover} />
          <Metric label="Net Electric" value={net} unit="MW" metricKey="net" touchedMetric={touchedMetric} touchNonce={touchNonce} na={!hasElectricalConversion} onOpenMetric={onOpenCoreMetricPopover} />
          <Metric
            label={<GlossaryTerm term="Ignition margin" definition={GLOSSARY.lawson_margin.definition} />}
            value={lawsonValue}
            literal={`${lawsonValue.toFixed(2)}x threshold`}
            metricKey="lawson"
            touchedMetric={touchedMetric}
            touchNonce={touchNonce}
            onOpenMetric={onOpenCoreMetricPopover}
            valueClassName={ignitionClass}
          />
          <Metric label="Fuel mode" value={0} literal={inputs.fuel.toUpperCase()} metricKey="fuel_mode" onOpenMetric={onOpenCoreMetricPopover} />
        </div>
      </section>

      <section className="mb-3 border border-white/6 p-2">
        <p className="section-label mb-2">Real-World Context</p>
        <ul className="space-y-1.5 text-[12px] text-white/75">
          <li className="flex items-start gap-2">
            <button
              type="button"
              onClick={(event) =>
                onOpenContextPopover("homes", event.currentTarget.getBoundingClientRect(), "left")
              }
            >
              <Home className="mt-0.5 h-3.5 w-3.5 text-[#4dd0e1]" />
            </button>
            {hasElectricalConversion ? `~${homes.toLocaleString()} European homes equivalent` : "Research machine - no grid-equivalent output"}
          </li>
          <li className="flex items-start gap-2">
            <button
              type="button"
              onClick={(event) =>
                onOpenContextPopover("data_centers", event.currentTarget.getBoundingClientRect(), "left")
              }
            >
              <Database className="mt-0.5 h-3.5 w-3.5 text-[#4dd0e1]" />
            </button>
            {hasElectricalConversion ? `~${dataCenters.toFixed(1)} hyperscale data centers` : "Electrical conversion not installed in this preset"}
          </li>
          <li className="flex items-start gap-2">
            <button
              type="button"
              onClick={(event) =>
                onOpenContextPopover("grid_share", event.currentTarget.getBoundingClientRect(), "left")
              }
            >
              <PlugZap className="mt-0.5 h-3.5 w-3.5 text-[#5be584]" />
            </button>
            {hasElectricalConversion ? `~${(franceDemand * 100).toFixed(2)}% of France grid demand` : "Use DEMO preset to explore grid-delivered output"}
          </li>
        </ul>
      </section>

      <FuelReactionCard
        fuel={inputs.fuel}
        onOpenInfo={(anchorRect, placement) => onOpenFuelReactionPopover("overview", inputs.fuel, anchorRect, placement)}
        onOpenDeepDive={(anchorRect, placement) =>
          onOpenFuelReactionPopover("deep_dive", inputs.fuel, anchorRect, placement)
        }
      />
    </aside>
  );
}

function Metric({
  label,
  value,
  unit,
  metricKey,
  touchedMetric,
  touchNonce,
  literal,
  na = false,
  onOpenMetric,
  valueClassName,
}: {
  label: ReactNode;
  value: number;
  unit?: string;
  metricKey?: string;
  touchedMetric?: string | null;
  touchNonce?: number;
  literal?: string;
  na?: boolean;
  onOpenMetric?: (
    metricId: "qSci" | "qEng" | "fusion" | "gross" | "recirc" | "net" | "lawson" | "fuel_mode",
    anchorRect: DOMRect,
    placement: "left" | "right" | "top",
  ) => void;
  valueClassName?: string;
}) {
  const flashing = touchedMetric && metricKey && touchedMetric === metricKey;
  return (
    <>
      <span className="inline-flex items-center gap-1 text-white/58">
        {label}
        {metricKey && onOpenMetric ? (
          <button
            type="button"
            onClick={(event) =>
              onOpenMetric(
                metricKey as "qSci" | "qEng" | "fusion" | "gross" | "recirc" | "net" | "lawson" | "fuel_mode",
                event.currentTarget.getBoundingClientRect(),
                "left",
              )
            }
            className="text-white/45 transition-colors hover:text-white/80"
            aria-label={`${label} details`}
          >
            <Info className="h-3 w-3" />
          </button>
        ) : null}
      </span>
      <span
        key={`${metricKey ?? label}-${touchNonce ?? 0}`}
        className={`justify-self-end font-mono tabular-nums text-white/92 transition-colors duration-500 ${valueClassName ?? ""}`}
        style={{
          animation: flashing ? "metricFlash 500ms ease-out" : "none",
        }}
      >
        {na
          ? "N/A"
          : literal
          ? literal
          : `${value.toLocaleString(undefined, {
              minimumFractionDigits: unit ? 1 : 2,
              maximumFractionDigits: unit ? 1 : 2,
            })}${unit ? ` ${unit}` : ""}`}
      </span>
    </>
  );
}
