"use client";

import { useMemo, useState, type MouseEvent as ReactMouseEvent, type MutableRefObject } from "react";
import {
  sankey,
  sankeyLinkHorizontal,
  type SankeyGraph,
  type SankeyLink,
  type SankeyNode,
} from "d3-sankey";
import { useRef } from "react";

import { labelForNode } from "@/lib/ui-labels";
import { useSimulation, useSimulatorStore } from "@/store";

type NodeDatum = {
  id: string;
  name: string;
  description: string;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
};

type LinkDatum = {
  source: string;
  target: string;
  value: number;
  key: string;
};

type ResolvedNode = SankeyNode<NodeDatum, LinkDatum> & NodeDatum;
type ResolvedLink = SankeyLink<NodeDatum, LinkDatum> & {
  key: string;
  source: ResolvedNode;
  target: ResolvedNode;
  y0: number;
  y1: number;
  width: number;
};

const WIDTH = 1140;
const HEIGHT = 340;

type HoverCard = {
  x: number;
  y: number;
  text: string;
  valueMW: number;
};

export function SankeyFlowPanel({
  onOpenNodeDetails,
  onOpenFlowDetails,
}: {
  onOpenNodeDetails: (
    nodeId: string,
    anchorRect: DOMRect,
    placement: "left" | "right" | "top",
  ) => void;
  onOpenFlowDetails: (
    flowKey: string,
    sourceId: string,
    targetId: string,
    valueMW: number,
    anchorRect: DOMRect,
    placement: "left" | "right" | "top",
  ) => void;
}) {
  const simulation = useSimulation();
  const selectedFlowKey = useSimulatorStore((s) => s.selectedFlowKey);
  const setSelectedFlowKey = useSimulatorStore((s) => s.setSelectedFlowKey);
  const selectedNodeId = useSimulatorStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useSimulatorStore((s) => s.setSelectedNodeId);

  const [hoverFlow, setHoverFlow] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [hoverCard, setHoverCard] = useState<HoverCard | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const dataLinks = simulation.sankey.links.filter((link) => link.key !== "recirc_to_heating");
  const recircLoop = simulation.sankey.links.find((link) => link.key === "recirc_to_heating");

  const graph = useMemo<SankeyGraph<NodeDatum, LinkDatum>>(() => {
    const generator = sankey<NodeDatum, LinkDatum>()
      .nodeId((d) => d.id)
      .nodeWidth(18)
      .nodePadding(24)
      .extent([
        [20, 18],
        [WIDTH - 42, HEIGHT - 24],
      ]);

    return generator({
      nodes: simulation.sankey.nodes.map((n) => ({
        id: n.id,
        name: n.label,
        description: n.description,
      })),
      links: dataLinks.map((l) => ({ ...l })),
    });
  }, [dataLinks, simulation.sankey.nodes]);

  const resolvedLinks = graph.links as Array<ResolvedLink>;
  const resolvedNodes = graph.nodes as Array<ResolvedNode>;
  const linkGen = useMemo(() => sankeyLinkHorizontal<NodeDatum, LinkDatum>(), []);

  const focusedSet = useMemo(() => {
    const flow = hoverFlow || selectedFlowKey;
    const node = hoverNode || selectedNodeId;
    if (!flow && !node) return null;
    const result = new Set<string>();

    if (flow) {
      const seed = resolvedLinks.find((item) => item.key === flow);
      if (!seed) return result;
      walkUp(seed.source.id, resolvedLinks, result);
      walkDown(seed.target.id, resolvedLinks, result);
      result.add(flow);
      return result;
    }

    if (node) {
      walkUp(node, resolvedLinks, result);
      walkDown(node, resolvedLinks, result);
      resolvedLinks
        .filter((item) => item.source.id === node || item.target.id === node)
        .forEach((item) => result.add(item.key));
      return result;
    }

    return null;
  }, [hoverFlow, hoverNode, resolvedLinks, selectedFlowKey, selectedNodeId]);

  return (
    <section className="panel relative h-full border-t border-white/8 p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="section-label">Energy Flow Sankey</p>
        <button
          onClick={() => {
            setSelectedFlowKey(null);
            setSelectedNodeId(null);
          }}
          className="text-[10px] uppercase tracking-[0.08em] text-white/55"
        >
          Clear focus
        </button>
      </div>

      <div className="h-[calc(100%-20px)] overflow-hidden">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full">
          {resolvedLinks.map((link, index) => {
            const path = linkGen(link);
            if (!path) return null;
            const focused = !focusedSet || focusedSet.has(link.key);
            return (
              <g key={`${link.key}-${index}`}>
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={Math.max(10, (link.width ?? 1) + 10)}
                  style={{ pointerEvents: "stroke", cursor: "pointer" }}
                  onMouseEnter={(event) => {
                    setHoverFlow(link.key);
                    queueHoverCard({
                      event,
                      text: `${labelForNode(link.source.id)} → ${labelForNode(link.target.id)}`,
                      valueMW: link.value,
                      setHoverCard,
                      hoverTimeoutRef,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoverFlow(null);
                    clearHoverCard(setHoverCard, hoverTimeoutRef);
                  }}
                  onClick={(event) => {
                    setSelectedFlowKey(link.key);
                    onOpenFlowDetails(
                      link.key,
                      link.source.id,
                      link.target.id,
                      link.value,
                      event.currentTarget.getBoundingClientRect(),
                      preferredPlacement(event.currentTarget.getBoundingClientRect()),
                    );
                  }}
                />
                <path
                  d={path}
                  fill="none"
                  stroke={flowColor(link.key)}
                  strokeWidth={Math.max(1, link.width ?? 1)}
                  strokeOpacity={focused ? 1 : 0.15}
                  className="transition-all duration-300"
                  style={{ pointerEvents: "none" }}
                />
                <text
                  x={((link.source.x1 ?? 0) + (link.target.x0 ?? 0)) / 2}
                  y={((link.y0 ?? 0) + (link.y1 ?? 0)) / 2 - 2}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.75)"
                  fontSize={10}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {link.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} MW
                </text>
              </g>
            );
          })}

          {recircLoop ? (
            <g>
              <path
                d="M 830 268 C 690 322, 470 330, 230 304 C 160 296, 130 270, 124 232"
                stroke="rgba(77,208,225,0.45)"
                strokeWidth={Math.max(2, Math.sqrt(recircLoop.value))}
                fill="none"
                strokeDasharray="6 4"
                strokeOpacity={!focusedSet || focusedSet.has("recirc_to_heating") ? 0.8 : 0.2}
              />
              <text x={520} y={332} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.6)">
                {recircLoop.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} MW recirculated to heating
              </text>
            </g>
          ) : null}

          {resolvedNodes.map((node) => {
            const focused = !focusedSet || resolvedLinks.some((link) => focusedSet.has(link.key) && (link.source.id === node.id || link.target.id === node.id));
            const hovered = hoverNode === node.id;
            const nodeX = node.x0 ?? 0;
            const nodeY = node.y0 ?? 0;
            const nodeW = (node.x1 ?? 0) - nodeX;
            const nodeH = Math.max(14, (node.y1 ?? 0) - nodeY);
            return (
              <g
                key={node.id}
                className="sankey-node cursor-pointer"
                onMouseEnter={(event) => {
                  setHoverNode(node.id);
                  queueHoverCard({
                    event,
                    text: labelForNode(node.id),
                    valueMW: flowForNode(node.id, simulation.power) ?? 0,
                    setHoverCard,
                    hoverTimeoutRef,
                  });
                }}
                onMouseLeave={() => {
                  setHoverNode(null);
                  clearHoverCard(setHoverCard, hoverTimeoutRef);
                }}
                onClick={(event) => {
                  setSelectedNodeId(node.id);
                  const rect = event.currentTarget.getBoundingClientRect();
                  const fallback = new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 1, 1);
                  const anchorRect = rect ?? fallback;
                  onOpenNodeDetails(node.id, anchorRect, preferredPlacement(anchorRect));
                }}
              >
                <rect
                  x={nodeX - 8}
                  y={nodeY - 8}
                  width={nodeW + 16}
                  height={nodeH + 16}
                  rx={4}
                  fill="transparent"
                  style={{ pointerEvents: "all", cursor: "pointer" }}
                />
                <rect
                  x={nodeX}
                  y={nodeY}
                  width={nodeW}
                  height={nodeH}
                  rx={2}
                  fill={hovered ? "rgba(13,16,21,1)" : "rgba(13,16,21,0.95)"}
                  stroke={hovered ? "rgba(77,208,225,0.95)" : focused ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)"}
                  style={{ filter: hovered ? "brightness(1.1)" : "none", pointerEvents: "all" }}
                />
                <text x={nodeX + 6} y={nodeY + 12} fill="rgba(255,255,255,0.88)" fontSize={10} style={{ pointerEvents: "none" }}>
                  {node.name}
                </text>
              </g>
            );
          })}

          <g transform="translate(1085, 142)">
            <line x1="-18" x2="12" y1="15" y2="15" stroke="rgba(91,229,132,0.9)" strokeWidth={3} />
            <polygon points="12,8 24,15 12,22" fill="rgba(91,229,132,0.95)" />
            <line x1="30" x2="30" y1="5" y2="28" stroke="rgba(91,229,132,0.95)" strokeWidth={2} />
            <line x1="25" x2="35" y1="28" y2="28" stroke="rgba(91,229,132,0.95)" strokeWidth={2} />
          </g>
        </svg>
      </div>
      {hoverCard ? (
        <div
          className="pointer-events-none absolute z-20 w-[320px] border border-white/12 bg-[#0d1015]/95 p-2 text-[11px] text-white/75"
          style={{ left: hoverCard.x, top: hoverCard.y }}
        >
          <p className="font-medium text-white/88">{hoverCard.text}</p>
          <p className="mt-1 font-mono tabular-nums text-white/90">
            {hoverCard.valueMW.toLocaleString(undefined, { maximumFractionDigits: 0 })} MW
          </p>
          <p className="mt-1 text-[10px] text-white/55">Click for details</p>
        </div>
      ) : null}
    </section>
  );
}

function flowColor(key: string) {
  if (key.includes("loss") || key.includes("rejected")) return "#ef5757";
  if (key.includes("heating") || key.includes("fusion") || key.includes("alpha") || key.includes("neutron")) return "#ff9248";
  if (key.includes("recirc")) return "rgba(77,208,225,0.45)";
  if (key.includes("net")) return "#5be584";
  return "#4dd0e1";
}

function walkUp(nodeId: string, links: Array<ResolvedLink>, set: Set<string>) {
  links
    .filter((link) => link.target.id === nodeId)
    .forEach((link) => {
      if (!set.has(link.key)) {
        set.add(link.key);
        walkUp(link.source.id, links, set);
      }
    });
}

function walkDown(nodeId: string, links: Array<ResolvedLink>, set: Set<string>) {
  links
    .filter((link) => link.source.id === nodeId)
    .forEach((link) => {
      if (!set.has(link.key)) {
        set.add(link.key);
        walkDown(link.target.id, links, set);
      }
    });
}

function flowForNode(nodeId: string | null, power: ReturnType<typeof useSimulation>["power"]) {
  if (!nodeId) return null;
  const map: Record<string, number> = {
    heating: power.heatingInMW,
    plasma: power.heatingInMW - power.heatingChainLossMW,
    fusion: power.fusionMW,
    neutron: power.neutronMW,
    alpha: power.alphaMW,
    conversion: power.grossElectricMW,
    gross: power.grossElectricMW,
    net: power.netElectricMW,
    recirc: power.recirculationMW,
    heat_output: power.neutronMW + power.alphaMW,
    research_reject: power.rejectedHeatMW + power.heatingChainLossMW,
    loss_heat: power.rejectedHeatMW + power.heatingChainLossMW,
    loss_reject: power.rejectedHeatMW,
  };
  return map[nodeId] ?? null;
}

function preferredPlacement(rect: DOMRect): "left" | "right" | "top" {
  if (rect.top > window.innerHeight * 0.62) return "top";
  return rect.left < window.innerWidth / 2 ? "right" : "left";
}

function queueHoverCard({
  event,
  text,
  valueMW,
  setHoverCard,
  hoverTimeoutRef,
}: {
  event: ReactMouseEvent<SVGElement, MouseEvent>;
  text: string;
  valueMW: number;
  setHoverCard: (card: HoverCard | null) => void;
  hoverTimeoutRef: MutableRefObject<number | null>;
}) {
  if (hoverTimeoutRef.current) {
    window.clearTimeout(hoverTimeoutRef.current);
  }
  const { clientX, clientY } = event;
  hoverTimeoutRef.current = window.setTimeout(() => {
    setHoverCard({
      x: clientX + 14,
      y: clientY + 14,
      text,
      valueMW,
    });
  }, 250);
}

function clearHoverCard(
  setHoverCard: (card: HoverCard | null) => void,
  hoverTimeoutRef: MutableRefObject<number | null>,
) {
  if (hoverTimeoutRef.current) {
    window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
  }
  setHoverCard(null);
}
