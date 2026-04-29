"use client";

import { useMemo } from "react";
import { useState } from "react";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

import { useSimulation, useSimulatorStore } from "@/lib/store";

type SankeyNodeDatum = {
  id: string;
  name: string;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
};

type SankeyLinkDatum = {
  source: string;
  target: string;
  value: number;
  key: string;
};

const WIDTH = 940;
const HEIGHT = 250;

export function SankeyFlow() {
  const simulation = useSimulation();
  const selectedFlowKey = useSimulatorStore((state) => state.selectedFlowKey);
  const setSelectedFlowKey = useSimulatorStore((state) => state.setSelectedFlowKey);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const graph = useMemo(() => {
    const generator = sankey<SankeyNodeDatum, SankeyLinkDatum>()
      .nodeId((node) => node.id)
      .nodeWidth(16)
      .nodePadding(24)
      .extent([
        [12, 12],
        [WIDTH - 12, HEIGHT - 20],
      ]);

    return generator({
      nodes: simulation.sankey.nodes.map((node) => ({ id: node.id, name: node.label })),
      links: simulation.sankey.links.map((link) => ({ ...link })),
    });
  }, [simulation.sankey.links, simulation.sankey.nodes]);

  const linkGenerator = useMemo(() => sankeyLinkHorizontal(), []);

  return (
    <section className="panel rounded-md p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="section-label">Energy Flow</h3>
        <button
          type="button"
          className="text-xs uppercase tracking-[0.16em] text-muted-foreground"
          onClick={() => setSelectedFlowKey(null)}
        >
          Clear highlight
        </button>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="min-w-[780px]">
          {graph.links.map((link, index) => {
            const isHovered = hoverKey === link.key;
            const isSelected = selectedFlowKey === link.key;
            const isActive = (!hoverKey || isHovered) && (!selectedFlowKey || isSelected);
            const stroke = colorForFlow(link.key);
            const path = linkGenerator(link);

            if (!path) {
              return null;
            }

            return (
              <path
                key={`${link.key}-${index}`}
                d={path}
                fill="none"
                stroke={stroke}
                strokeOpacity={isActive ? 0.82 : 0.12}
                strokeWidth={Math.max(1, link.width ?? 1)}
                className="cursor-pointer transition-opacity"
                onClick={() => setSelectedFlowKey(link.key)}
                onMouseEnter={() => setHoverKey(link.key)}
                onMouseLeave={() => setHoverKey(null)}
              />
            );
          })}

          {graph.nodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x0}
                y={node.y0}
                width={(node.x1 ?? 0) - (node.x0 ?? 0)}
                height={Math.max(2, (node.y1 ?? 0) - (node.y0 ?? 0))}
                rx={3}
                fill="rgb(255 255 255 / 0.03)"
                stroke="rgb(255 255 255 / 0.2)"
              />
              <text
                x={(node.x0 ?? 0) - 6}
                y={(node.y0 ?? 0) - 4}
                textAnchor="start"
                fontSize={11}
                fill="rgb(255 255 255 / 0.8)"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                {node.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

function colorForFlow(key: string): string {
  if (key.includes("rejected") || key.includes("loss") || key.includes("house")) {
    return "rgb(255 60 60 / 0.72)";
  }
  if (key.includes("net")) {
    return "rgb(0 212 255 / 0.95)";
  }
  return "rgb(0 212 255 / 0.65)";
}
