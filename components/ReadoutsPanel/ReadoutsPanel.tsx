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
        <QComparisonBlock
          qSci={qSci}
          qEng={simulation.qEng}
          hasElectricalConversion={hasElectricalConversion}
          onOpenMetric={onOpenCoreMetricPopover}
        />
        <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1.5 text-[12px]">
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

function QComparisonBlock({
  qSci,
  qEng,
  hasElectricalConversion,
  onOpenMetric,
}: {
  qSci: number;
  qEng: number | null;
  hasElectricalConversion: boolean;
  onOpenMetric: (
    metricId: "qSci" | "qEng" | "fusion" | "gross" | "recirc" | "net" | "lawson" | "fuel_mode",
    anchorRect: DOMRect,
    placement: "left" | "right" | "top",
  ) => void;
}) {
  const clampedQEng = Math.max(0, Math.min(5, qEng ?? 0));
  const qEngPercent = (clampedQEng / 5) * 100;
  const breakEvenPercent = 20;
  const qEngGood = (qEng ?? 0) >= 1;

  return (
    <div className="mb-2 border border-white/8 bg-white/[0.02] p-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-white/8 p-2">
          <div className="mb-1 inline-flex items-center gap-1">
            <span className="text-[11px] text-white/65">Q_sci</span>
            <button
              type="button"
              onClick={(event) =>
                onOpenMetric("qSci", event.currentTarget.getBoundingClientRect(), "left")
              }
              className="text-white/45 transition-colors hover:text-white/80"
              aria-label="Q_sci details"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>
          <p className="font-mono text-[20px] leading-none text-white/92">{qSci.toFixed(2)}</p>
          <p className="mt-1 text-[10px] leading-4 text-white/58">
            Reaction physics. &gt;1 means fusion produces more energy than the plasma absorbed.
          </p>
        </div>

        <div className="border border-white/8 p-2">
          <div className="mb-1 inline-flex items-center gap-1">
            <span className="text-[11px] text-white/65">Q_eng</span>
            <button
              type="button"
              onClick={(event) =>
                onOpenMetric("qEng", event.currentTarget.getBoundingClientRect(), "left")
              }
              className="text-white/45 transition-colors hover:text-white/80"
              aria-label="Q_eng details"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>
          <p className="font-mono text-[20px] leading-none text-white/92">
            {hasElectricalConversion && qEng !== null ? qEng.toFixed(2) : "N/A"}
          </p>
          <p className="mt-1 text-[10px] leading-4 text-white/58">
            Wall-plug. &gt;1 means the plant produces more electricity than it consumes.
          </p>
        </div>
      </div>

      <div className="mt-2 border-t border-white/8 pt-2">
        <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-white/52">
          Engineering break-even gauge
        </p>
        <div className="relative h-2 rounded-full bg-white/10">
          <div
            className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-white/60"
            style={{ left: `${breakEvenPercent}%` }}
          />
          <div
            className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${
              qEngGood ? "bg-[#5be584]" : "bg-[#ef5757]"
            }`}
            style={{ left: `calc(${qEngPercent}% - 5px)` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-white/48">
          <span className="font-mono">0</span>
          <span className="font-mono">5</span>
        </div>
        <p className="mt-0.5 text-[10px] text-white/62">
          <span className="font-mono">1.0</span> break-even
          {!hasElectricalConversion ? " — no electrical conversion in this configuration." : ""}
        </p>
      </div>
    </div>
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
