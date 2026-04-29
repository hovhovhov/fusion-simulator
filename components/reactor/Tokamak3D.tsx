"use client";

import { useMemo } from "react";

import { useSimulation, useSimulatorStore } from "@/lib/store";
import { useTweenNumber } from "@/lib/useTweenNumber";

export function TokamakSchematic() {
  const temperatureKeV = useSimulatorStore((state) => state.inputs.temperatureKeV);
  const qSci = useSimulatorStore((state) => state.inputs.qSci);
  const fuel = useSimulatorStore((state) => state.inputs.fuel);
  const selectedHotspot = useSimulatorStore((state) => state.selectedHotspot);
  const setSelectedHotspot = useSimulatorStore((state) => state.setSelectedHotspot);
  const simulation = useSimulation();

  const animatedTemp = useTweenNumber(temperatureKeV);
  const animatedQ = useTweenNumber(qSci);
  const plasmaOpacity = Math.max(0.25, Math.min(0.95, 0.25 + animatedTemp / 140 + animatedQ / 160));
  const neutronOpacity = fuel === "pb11" ? 0.02 : Math.min(0.36, simulation.powerMW.neutron / 2000);

  const neutronBursts = useMemo(
    () =>
      Array.from({ length: 28 }, (_, idx) => {
        const angle = (idx / 28) * Math.PI * 2;
        const x1 = 340 + Math.cos(angle) * 140;
        const y1 = 170 + Math.sin(angle) * 78;
        const x2 = 340 + Math.cos(angle) * 186;
        const y2 = 170 + Math.sin(angle) * 102;
        return { x1, y1, x2, y2 };
      }),
    [],
  );

  return (
    <div className="panel relative h-[420px] overflow-hidden px-3 py-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="section-label">Tokamak Cross-Section</p>
        <button className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground" onClick={() => setSelectedHotspot(null)}>
          Clear
        </button>
      </div>
      <svg viewBox="0 0 680 340" className="h-[360px] w-full">
        <ellipse cx="340" cy="170" rx="220" ry="120" fill="none" stroke="rgb(255 255 255 / 0.2)" strokeWidth="1" />
        <ellipse cx="340" cy="170" rx="184" ry="98" fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth="1" />
        <ellipse cx="340" cy="170" rx="145" ry="76" fill="rgb(0 212 255 / 0.05)" stroke="rgb(0 212 255 / 0.45)" strokeWidth="1.5" />
        <ellipse
          cx="340"
          cy="170"
          rx="116"
          ry="56"
          fill="none"
          stroke="rgb(0 212 255 / 1)"
          strokeWidth="10"
          strokeOpacity={plasmaOpacity}
        />

        {Array.from({ length: 14 }, (_, i) => {
          const x = 140 + i * 30;
          return (
            <rect
              key={`coil-${i}`}
              x={x}
              y={68}
              width={9}
              height={204}
              rx={2}
              fill={selectedHotspot === "coils" ? "rgb(0 212 255 / 0.85)" : "rgb(255 255 255 / 0.22)"}
              onMouseEnter={() => setSelectedHotspot("coils")}
            />
          );
        })}

        {fuel !== "pb11" &&
          neutronBursts.map((line, idx) => (
            <line
              key={`n-${idx}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgb(255 255 255 / 0.6)"
              strokeOpacity={neutronOpacity}
              strokeWidth="1"
            />
          ))}

        <circle
          cx="250"
          cy="110"
          r="6"
          fill={selectedHotspot === "heating" ? "rgb(0 212 255)" : "rgb(255 255 255 / 0.7)"}
          onMouseEnter={() => setSelectedHotspot("heating")}
        />
        <circle
          cx="480"
          cy="170"
          r="6"
          fill={selectedHotspot === "blanket" ? "rgb(0 212 255)" : "rgb(255 255 255 / 0.7)"}
          onMouseEnter={() => setSelectedHotspot("blanket")}
        />
        <circle
          cx="340"
          cy="250"
          r="6"
          fill={selectedHotspot === "divertor" ? "rgb(0 212 255)" : "rgb(255 255 255 / 0.7)"}
          onMouseEnter={() => setSelectedHotspot("divertor")}
        />
      </svg>
    </div>
  );
}
