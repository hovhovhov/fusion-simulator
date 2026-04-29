"use client";

import { useMemo } from "react";
import { line, scaleLog } from "d3";

import { lawsonCurveForFuel } from "@/lib/physics/lawson";
import { useSimulation, useSimulatorStore } from "@/lib/store";

const WIDTH = 360;
const HEIGHT = 220;
const MARGIN = 28;

export function LawsonPlot() {
  const fuel = useSimulatorStore((state) => state.inputs.fuel);
  const temperatureKeV = useSimulatorStore((state) => state.inputs.temperatureKeV);
  const simulation = useSimulation();

  const curve = useMemo(() => lawsonCurveForFuel(fuel), [fuel]);

  const x = useMemo(
    () =>
      scaleLog()
        .domain([2, 200])
        .range([MARGIN, WIDTH - MARGIN]),
    [],
  );
  const y = useMemo(
    () =>
      scaleLog()
        .domain([1e21, 1e25])
        .range([HEIGHT - MARGIN, MARGIN]),
    [],
  );

  const path = useMemo(
    () =>
      line<{ temperatureKeV: number; requiredNttau: number }>()
        .x((point) => x(point.temperatureKeV))
        .y((point) => y(point.requiredNttau))(curve) ?? "",
    [curve, x, y],
  );

  const px = x(Math.max(2, Math.min(200, temperatureKeV)));
  const py = y(Math.max(1e21, Math.min(1e25, simulation.ntTau)));
  const offset =
    simulation.ignitionRatio >= 1
      ? "Confinement: above ignition threshold"
      : simulation.ignitionRatio > 0
        ? `Confinement: ${(1 / simulation.ignitionRatio).toFixed(0)}x under ignition threshold`
        : "Confinement: far under ignition threshold";

  return (
    <section className="panel rounded-md p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="section-label">Lawson</h3>
        <p className="text-[11px] font-mono text-foreground/80">{offset}</p>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="transparent" />
        <path d={path} fill="none" stroke="rgb(255 255 255 / 0.55)" strokeWidth={1.5} />
        <line
          x1={MARGIN}
          x2={WIDTH - MARGIN}
          y1={HEIGHT - MARGIN}
          y2={HEIGHT - MARGIN}
          stroke="rgb(255 255 255 / 0.28)"
        />
        <line
          x1={MARGIN}
          x2={MARGIN}
          y1={MARGIN}
          y2={HEIGHT - MARGIN}
          stroke="rgb(255 255 255 / 0.28)"
        />
        <circle cx={px} cy={py} r={5} fill="rgb(0 212 255)" />
        <text
          x={px + 8}
          y={py - 6}
          fill="rgb(255 255 255 / 0.82)"
          fontSize={11}
          style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
        >
          operating point
        </text>
        <text x={MARGIN} y={HEIGHT - 8} fill="rgb(255 255 255 / 0.52)" fontSize={10}>
          Temperature (keV)
        </text>
        <text x={6} y={MARGIN} fill="rgb(255 255 255 / 0.52)" fontSize={10}>
          nTtau
        </text>
      </svg>
    </section>
  );
}
