"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ControlsPanel } from "@/components/ControlsPanel/ControlsPanel";
import { ReadoutsPanel } from "@/components/ReadoutsPanel/ReadoutsPanel";
import { SankeyFlowPanel } from "@/components/SankeyFlow/SankeyFlowPanel";
import { TokamakHero } from "@/components/Tokamak/TokamakHero";
import {
  AnchoredPopover,
  type CompactPopoverData,
  type PopoverAnchor,
} from "@/components/ui/anchored-popover";
import {
  CONTROL_EXPLANATIONS,
  CORE_METRIC_EXPLANATIONS,
  PRESET_STORIES,
  SANKEY_NODE_TOOLTIPS,
} from "@/lib/content";
import type { PresetId, SimulatorInputs } from "@/lib/presets";
import { FUEL_REACTION_INFO } from "@/lib/fuel-reaction";
import type { FuelKey } from "@/lib/physics/fuels";
import { labelForControl, labelForNode } from "@/lib/ui-labels";
import { useSimulation, useSimulatorStore } from "@/store";
import { useTweenNumber } from "@/lib/useTweenNumber";

type DeepDivePanel =
  | { kind: "preset"; id: PresetId; side: "left" }
  | { kind: "node"; id: string; side: "right" }
  | { kind: "control"; id: string; side: "right" }
  | null;

type PopoverSource =
  | { kind: "preset"; id: PresetId }
  | { kind: "node"; id: string }
  | { kind: "flow"; id: string; sourceId: string; targetId: string; valueMW: number }
  | { kind: "control"; id: string }
  | { kind: "fuel_reaction"; id: "overview" | "deep_dive"; fuel: FuelKey }
  | { kind: "context"; id: "homes" | "data_centers" | "grid_share" }
  | { kind: "core_metric"; id: "qSci" | "qEng" | "fusion" | "gross" | "recirc" | "net" | "lawson" | "fuel_mode" };

export function SimulatorPage() {
  const hydrateFromQuery = useSimulatorStore((state) => state.hydrateFromQuery);
  const toQueryString = useSimulatorStore((state) => state.toQueryString);
  const resetStore = useSimulatorStore((state) => state.reset);
  const applyPreset = useSimulatorStore((state) => state.applyPreset);
  const inputs = useSimulatorStore((state) => state.inputs);
  const hasElectricalConversion = useSimulatorStore(
    (state) => state.inputs.hasElectricalConversion,
  );
  const simulation = useSimulation();
  const netDisplay = simulation.power.netElectricMW;
  const smoothNet = useTweenNumber(netDisplay);
  const [clock, setClock] = useState("--:--:--");
  const [overlayPanel, setOverlayPanel] = useState<DeepDivePanel>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<PopoverAnchor | null>(null);
  const [popoverSource, setPopoverSource] = useState<PopoverSource | null>(null);
  const [highlightedControlId, setHighlightedControlId] = useState<string | null>(null);

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }
    hydrateFromQuery(new URLSearchParams(window.location.search));
    hydratedRef.current = true;
  }, [hydrateFromQuery]);

  const handleShare = async () => {
    const query = toQueryString();
    const url = `${window.location.origin}?${query}`;
    try {
      await navigator.clipboard.writeText(url);
      window.history.replaceState({}, "", `?${query}`);
    } catch {
      window.prompt("Copy this scenario URL", url);
    }
  };

  const handleReset = () => {
    resetStore();
    window.history.replaceState({}, "", window.location.pathname);
    setOverlayPanel(null);
  };

  useEffect(() => {
    const kickoff = window.setTimeout(() => setClock(new Date().toLocaleTimeString()), 0);
    const timer = window.setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(timer);
    };
  }, []);


  const activePresetStory = overlayPanel?.kind === "preset" ? PRESET_STORIES[overlayPanel.id] : null;
  const activePresetId = overlayPanel?.kind === "preset" ? overlayPanel.id : null;
  const activeNodeTooltip =
    overlayPanel?.kind === "node" ? SANKEY_NODE_TOOLTIPS[overlayPanel.id] ?? "Fusion subsystem details." : null;
  const activeControl = overlayPanel?.kind === "control" ? CONTROL_EXPLANATIONS[overlayPanel.id] : null;
  const popoverData = useMemo<CompactPopoverData | null>(
    () => buildPopoverData(popoverSource, simulation, hasElectricalConversion, inputs),
    [popoverSource, simulation, hasElectricalConversion, inputs],
  );

  return (
    <div className="grid-bg h-screen overflow-visible">
      <header className="h-[112px] overflow-visible border-b border-white/8 px-8 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 text-white/90">
              <svg className="h-[34px] w-[34px] text-white/65" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <ellipse cx="12" cy="12" rx="10" ry="3.5" stroke="currentColor" strokeWidth="0.7" opacity="0.7" />
                <ellipse
                  cx="12"
                  cy="12"
                  rx="10"
                  ry="3.5"
                  stroke="currentColor"
                  strokeWidth="0.7"
                  opacity="0.7"
                  transform="rotate(60 12 12)"
                />
                <ellipse
                  cx="12"
                  cy="12"
                  rx="10"
                  ry="3.5"
                  stroke="currentColor"
                  strokeWidth="0.7"
                  opacity="0.7"
                  transform="rotate(120 12 12)"
                />
                <circle cx="12" cy="12" r="1.6" fill="#7DD3FC" />
              </svg>
              <p
                className="leading-none tracking-[0.005em] text-white/95"
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: "42px",
                  fontWeight: 400,
                }}
              >
                Fusion Simulator
              </p>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
                {clock}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end overflow-visible text-right">
            <p className="text-[11px] uppercase tracking-[0.08em] text-white/60">NET ELECTRIC</p>
            {hasElectricalConversion ? (
              <>
                <div className="mt-2 flex items-end justify-end gap-2">
                  <p
                    className="font-mono tabular-nums leading-none"
                    style={{
                      fontSize: "64px",
                      lineHeight: "1.1",
                      color:
                        smoothNet > 0
                          ? "#5be584"
                          : smoothNet < -0.5
                            ? "#ef5757"
                            : "#ffb547",
                      textShadow: "none",
                    }}
                  >
                    {smoothNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="mb-2 font-mono text-[18px] uppercase tracking-[0.08em] text-white/65">
                    MW
                  </p>
                </div>
              </>
            ) : (
              <div className="mt-1 inline-flex items-center border border-[#ffb547]/50 bg-[#ffb547]/10 px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-[#ffb547]">
                RESEARCH
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative grid h-[calc(100vh-112px)] grid-cols-[280px_1fr_340px] gap-2 p-2">
        <ControlsPanel
          onShare={handleShare}
          onReset={handleReset}
          highlightedControlId={highlightedControlId}
          onOpenPresetInfo={(presetId, anchorRect, placement) => {
            setPopoverSource({ kind: "preset", id: presetId as PresetId });
            setPopoverAnchor({ rect: anchorRect, placement });
          }}
          onOpenControl={(controlId, anchorRect, placement) => {
            setPopoverSource({ kind: "control", id: controlId });
            setPopoverAnchor({ rect: anchorRect, placement });
          }}
        />

        <section className="relative grid h-full grid-rows-[36%_64%] gap-0 overflow-hidden">
          <TokamakHero />
          <SankeyFlowPanel
            onOpenNodeDetails={(nodeId, anchorRect, placement) => {
              setPopoverSource({ kind: "node", id: nodeId });
              setPopoverAnchor({ rect: anchorRect, placement });
            }}
            onOpenFlowDetails={(flowKey, sourceId, targetId, valueMW, anchorRect, placement) => {
              setPopoverSource({
                kind: "flow",
                id: flowKey,
                sourceId,
                targetId,
                valueMW,
              });
              setPopoverAnchor({ rect: anchorRect, placement });
            }}
          />
        </section>

        <ReadoutsPanel
          onOpenFuelReactionPopover={(id, fuel, anchorRect, placement) => {
            setPopoverSource({ kind: "fuel_reaction", id, fuel });
            setPopoverAnchor({ rect: anchorRect, placement });
          }}
          onOpenContextPopover={(id, anchorRect, placement) => {
            setPopoverSource({ kind: "context", id });
            setPopoverAnchor({ rect: anchorRect, placement });
          }}
          onOpenCoreMetricPopover={(id, anchorRect, placement) => {
            setPopoverSource({ kind: "core_metric", id });
            setPopoverAnchor({ rect: anchorRect, placement });
          }}
        />

        <aside
          className={`absolute bottom-2 top-2 z-30 w-[480px] border border-white/10 bg-[#0d1015] p-4 transition-transform duration-300 ${
            overlayPanel?.side === "left" ? "left-0 translate-x-0" : "left-0 -translate-x-[110%]"
          }`}
        >
          {activePresetStory ? (
            <div className="flex h-full flex-col">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="section-label">{activePresetStory.tagline}</p>
                  <h2 className="text-2xl font-medium">{activePresetStory.title}</h2>
                </div>
                <button onClick={() => setOverlayPanel(null)} className="text-[11px] uppercase tracking-[0.08em] text-white/60">
                  Close
                </button>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2 border border-white/8 p-2 text-[12px]">
                <PanelStat label="Q_sci" value={activePresetStory.hero.qSci} />
                <PanelStat label="Fusion" value={activePresetStory.hero.fusion} />
                <PanelStat label="Net Electric" value={activePresetStory.hero.net} />
                <PanelStat label="Status" value={activePresetStory.hero.status} />
              </div>
              <div className="column-scroll space-y-2 overflow-y-auto pr-1 text-[12px] text-white/76">
                {activePresetStory.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <div>
                  <p className="section-label mb-1">What it would teach us</p>
                  <ul className="list-disc space-y-1 pl-4">
                    {activePresetStory.teaches.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="section-label mb-1">Real-world status (sourced)</p>
                  <ul className="space-y-1">
                    {activePresetStory.milestones.map((milestone) => (
                      <li key={milestone.source}>
                        <span>{milestone.label} </span>
                        <a href={milestone.source} target="_blank" rel="noreferrer" className="text-[var(--accent-productive)] underline">
                          source
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="section-label mb-1">
                    {activePresetId && PRESET_STORIES[activePresetId].hero.net.includes("No")
                      ? "Why no electricity?"
                      : "How does it make electricity?"}
                  </p>
                  {activePresetId && PRESET_STORIES[activePresetId].hero.net.includes("No") ? (
                    <p>
                      {activePresetStory.title} is a research device, not a power plant. It is designed to prove its scientific objective first. To keep cost and complexity focused on plasma physics, it has no full thermal blanket, steam cycle, or turbines. The heat from fusion is rejected. The follow-on machine adds electrical conversion.
                    </p>
                  ) : (
                    <p>
                      {activePresetStory.title} is a first-generation plant design intended to deliver electricity to the grid. A lithium-bearing blanket captures fusion neutrons, transfers thermal energy to coolant, drives a turbine cycle, and generates electricity.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOverlayPanel(null)}
                  className="border border-white/12 py-2 text-[11px] uppercase tracking-[0.08em] text-white/75"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    if (activePresetId) {
                      applyPreset(activePresetId);
                    }
                    setOverlayPanel(null);
                  }}
                  className="border border-[var(--accent-productive)] bg-[rgba(77,208,225,0.12)] py-2 text-[11px] uppercase tracking-[0.08em]"
                >
                  Apply this preset
                </button>
              </div>
            </div>
          ) : null}
        </aside>

        <aside
          className={`absolute bottom-2 top-2 right-0 z-30 w-[480px] border border-white/10 bg-[#0d1015] p-4 transition-transform duration-300 ${
            overlayPanel?.side === "right" ? "translate-x-0" : "translate-x-[110%]"
          }`}
        >
          {overlayPanel?.kind === "node" ? (
            <div className="flex h-full flex-col">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="section-label">Sankey Detail</p>
                  <h2 className="text-xl font-medium">{labelForNode(overlayPanel.id)}</h2>
                </div>
                <button onClick={() => setOverlayPanel(null)} className="text-[11px] uppercase tracking-[0.08em] text-white/60">
                  Close
                </button>
              </div>
              <div className="mb-3 border border-white/8 p-2">
                <p className="section-label">Current value</p>
                <p className="font-mono text-2xl tabular-nums">
                  {(nodeValue(overlayPanel.id, simulation.power) ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} MW
                </p>
              </div>
              <div className="column-scroll flex-1 space-y-2 overflow-y-auto pr-1 text-[12px] text-white/74">
                <p>{activeNodeTooltip}</p>
                <p>
                  This stage sits inside a closed energy loop. Productive flows move rightward toward net electric output; losses peel off or return through recirculation.
                </p>
                <p>
                  Because each branch width is proportional to MW, small visual changes in this node often correspond to large shifts in total plant economics.
                </p>
                <div className="border border-white/8 p-2">
                  <p className="section-label mb-1">Why this matters</p>
                  <p>Improving this stage by even a few percentage points can move the system from subcritical economics to sustained grid contribution.</p>
                </div>
                <div>
                  <p className="section-label mb-1">Related controls</p>
                  <div className="flex flex-wrap gap-2">
                    {relatedControlsForNode(overlayPanel.id).map((controlId) => (
                      <button
                        key={controlId}
                        onClick={() => setOverlayPanel({ kind: "control", id: controlId, side: "right" })}
                        className="border border-white/12 px-2 py-1 text-[11px] text-white/75"
                      >
                        {labelForControl(controlId)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {overlayPanel?.kind === "control" && activeControl ? (
            <div className="flex h-full flex-col">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="section-label">Control Detail</p>
                  <h2 className="text-xl font-medium">{activeControl.title}</h2>
                </div>
                <button onClick={() => setOverlayPanel(null)} className="text-[11px] uppercase tracking-[0.08em] text-white/60">
                  Close
                </button>
              </div>
              <div className="column-scroll flex-1 space-y-2 overflow-y-auto pr-1 text-[12px] text-white/74">
                {activeControl.long.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <div className="border border-white/8 p-2">
                  <p className="section-label mb-1">Why this matters</p>
                  <p>{activeControl.why}</p>
                </div>
                <div>
                  <p className="section-label mb-1">Related Sankey stages</p>
                  <div className="flex flex-wrap gap-2">
                    {activeControl.relatedNodes.map((nodeId) => (
                      <button
                        key={nodeId}
                        onClick={() => setOverlayPanel({ kind: "node", id: nodeId, side: "right" })}
                        className="border border-white/12 px-2 py-1 text-[11px] text-white/75"
                      >
                        {labelForNode(nodeId)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </aside>
        <AnchoredPopover
          open={Boolean(popoverAnchor && popoverSource && popoverData)}
          anchor={popoverAnchor}
          data={popoverData}
          onClose={() => {
            setPopoverAnchor(null);
            setPopoverSource(null);
          }}
          onLearnMore={() => {
            if (!popoverSource) return;
            setPopoverAnchor(null);
            setPopoverSource(null);
            if (popoverSource.kind === "preset") {
              setOverlayPanel({ kind: "preset", id: popoverSource.id, side: "left" });
            } else if (popoverSource.kind === "node") {
              setOverlayPanel({ kind: "node", id: popoverSource.id, side: "right" });
            } else if (popoverSource.kind === "control") {
              setOverlayPanel({ kind: "control", id: popoverSource.id, side: "right" });
            } else if (popoverSource.kind === "core_metric") {
              const next = deepDiveForCoreMetric(popoverSource.id);
              if (next) {
                setOverlayPanel(next);
              }
            }
          }}
          onSelectRelated={(controlId) => {
            setPopoverAnchor(null);
            setPopoverSource(null);
            setHighlightedControlId(controlId);
            window.setTimeout(() => setHighlightedControlId(null), 600);
          }}
        />
      </main>
    </div>
  );
}

function PanelStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="section-label">{label}</p>
      <p className="font-mono text-[13px]">{value}</p>
    </div>
  );
}

function nodeValue(
  nodeId: string,
  power: ReturnType<typeof useSimulation>["power"],
) {
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
  return map[nodeId];
}

function relatedControlsForNode(nodeId: string): string[] {
  const map: Record<string, string[]> = {
    heating: ["heatingPowerMW", "etaHeating"],
    plasma: ["qSci", "temperatureKeV", "confinementTimeS"],
    fusion: ["qSci", "heatingPowerMW", "fuel"],
    neutron: ["etaNeutron", "blanketMult", "fuel"],
    alpha: ["etaCharged", "fuel"],
    conversion: ["etaNeutron", "etaCharged", "etaHeatingThrough"],
    gross: ["etaNeutron", "etaCharged", "etaHeatingThrough"],
    recirc: ["houseLoadMW", "heatingPowerMW"],
    heat_output: ["qSci", "heatingPowerMW", "fuel"],
    research_reject: ["qSci", "heatingPowerMW", "etaHeating"],
    net: ["houseLoadMW", "qSci", "etaNeutron", "etaCharged"],
    loss_heat: ["etaHeatingThrough", "etaHeating"],
    loss_reject: ["etaNeutron", "etaCharged"],
  };
  return map[nodeId] ?? ["qSci", "heatingPowerMW"];
}

function buildPopoverData(
  source: PopoverSource | null,
  simulation: ReturnType<typeof useSimulation>,
  hasElectricalConversion: boolean,
  inputs: SimulatorInputs,
): CompactPopoverData | null {
  if (!source) return null;

  if (source.kind === "preset") {
    const story = PRESET_STORIES[source.id];
    return {
      breadcrumb: "PRESET · SUMMARY",
      title: story.title,
      currentValue: story.hero.net,
      description: story.description.slice(0, 2),
      relatedControls: [
        { id: "qSci", label: labelForControl("qSci") },
        { id: "heatingPowerMW", label: labelForControl("heatingPowerMW") },
      ],
    };
  }

  if (source.kind === "node") {
    return {
      breadcrumb: "SANKEY · NODE",
      title: labelForNode(source.id),
      currentValue: `${(nodeValue(source.id, simulation.power) ?? 0).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })} MW`,
      description: [SANKEY_NODE_TOOLTIPS[source.id] ?? "Fusion subsystem details."],
      relatedControls: relatedControlsForNode(source.id).map((controlId) => ({
        id: controlId,
        label: labelForControl(controlId),
      })),
    };
  }

  if (source.kind === "flow") {
    return {
      breadcrumb: "SANKEY · FLOW",
      title: `${labelForNode(source.sourceId)} → ${labelForNode(source.targetId)}`,
      currentValue: `${source.valueMW.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })} MW`,
      description: [flowDescription(source.id, source.sourceId, source.targetId)],
      relatedControls: relatedControlsForNode(source.targetId).map((controlId) => ({
        id: controlId,
        label: labelForControl(controlId),
      })),
    };
  }

  if (source.kind === "control") {
    const control = CONTROL_EXPLANATIONS[source.id];
    if (!control) return null;
    return {
      breadcrumb: "CONTROL · PARAMETER",
      title: control.title,
      description: control.long.slice(0, 2),
      relatedControls: [],
    };
  }

  if (source.kind === "fuel_reaction") {
    const info = FUEL_REACTION_INFO[source.fuel];
    return {
      breadcrumb:
        source.id === "overview" ? "FUEL REACTION · OVERVIEW" : "FUEL REACTION · DEEP DIVE",
      title:
        source.id === "overview"
          ? "What fusion does at atomic scale"
          : `${info.title} - practical tradeoffs`,
      currentValue: source.id === "overview" ? info.facts[0]?.value : undefined,
      description:
        source.id === "overview"
          ? [
              "Two light atomic nuclei fuse into a heavier one, converting a small fraction of mass into energy (E = mc2).",
              "Different fuels produce very different mixes of charged particles and neutrons, which drives engineering complexity.",
              "Temperature thresholds, fuel sourcing, and neutron loading decide whether a pathway is practical for power plants.",
            ]
          : info.deepDive,
      relatedControls: [
        { id: "fuel", label: labelForControl("fuel") },
        { id: "temperatureKeV", label: labelForControl("temperatureKeV") },
        { id: "qSci", label: labelForControl("qSci") },
      ],
    };
  }

  if (source.kind === "core_metric") {
    const explanation = CORE_METRIC_EXPLANATIONS[source.id];
    return {
      breadcrumb: "CORE METRIC · DETAILS",
      title: explanation.title,
      currentValue: coreMetricValue(source.id, simulation, hasElectricalConversion, inputs),
      description: explanation.short,
      relatedControls: explanation.relatedControls.map((controlId) => ({
        id: controlId,
        label: labelForControl(controlId),
      })),
    };
  }

  const contextTitle =
    source.id === "homes"
      ? "Homes equivalent"
      : source.id === "data_centers"
      ? "Data center equivalent"
      : "Grid share";
  const contextValue =
    source.id === "homes"
      ? hasElectricalConversion
        ? `${Math.max(0, Math.round((simulation.power.netElectricMW * 1000) / 3.7)).toLocaleString()} homes`
        : "N/A (research device)"
      : source.id === "data_centers"
      ? hasElectricalConversion
        ? `${Math.max(0, simulation.power.netElectricMW / 80).toFixed(1)} hyperscale sites`
        : "N/A (research device)"
      : hasElectricalConversion
      ? `${Math.max(0, (simulation.power.netElectricMW / 130000) * 100).toFixed(2)}% of France demand`
      : "N/A (research device)";

  return {
    breadcrumb: "READOUT · CONTEXT",
    title: contextTitle,
    currentValue: contextValue,
    description: [
      "This translation helps compare simulator output to real-world electrical demand.",
    ],
    relatedControls: [
      { id: "qSci", label: labelForControl("qSci") },
      { id: "houseLoadMW", label: labelForControl("houseLoadMW") },
    ],
  };
}

function flowDescription(key: string, sourceId: string, targetId: string) {
  if (key.includes("rejected")) return SANKEY_NODE_TOOLTIPS.loss_reject;
  if (key.includes("loss")) return SANKEY_NODE_TOOLTIPS.loss_heat;
  if (key.includes("recirc")) return SANKEY_NODE_TOOLTIPS.recirc;
  return (
    SANKEY_NODE_TOOLTIPS[targetId] ??
    SANKEY_NODE_TOOLTIPS[sourceId] ??
    "Fusion energy transfer between plant subsystems."
  );
}

function coreMetricValue(
  id: "qSci" | "qEng" | "fusion" | "gross" | "recirc" | "net" | "lawson" | "fuel_mode",
  simulation: ReturnType<typeof useSimulation>,
  hasElectricalConversion: boolean,
  inputs: SimulatorInputs,
) {
  switch (id) {
    case "qSci":
      return inputs.qSci.toFixed(2);
    case "qEng":
      return hasElectricalConversion && simulation.qEng !== null ? simulation.qEng.toFixed(2) : "N/A";
    case "fusion":
      return `${simulation.power.fusionMW.toLocaleString(undefined, { maximumFractionDigits: 1 })} MW`;
    case "gross":
      return hasElectricalConversion
        ? `${simulation.power.grossElectricMW.toLocaleString(undefined, { maximumFractionDigits: 1 })} MW`
        : "N/A";
    case "recirc":
      return hasElectricalConversion
        ? `${simulation.power.recirculationMW.toLocaleString(undefined, { maximumFractionDigits: 1 })} MW`
        : "N/A";
    case "net":
      return hasElectricalConversion
        ? `${simulation.power.netElectricMW.toLocaleString(undefined, { maximumFractionDigits: 1 })} MW`
        : "N/A";
    case "lawson":
      return `${simulation.lawsonMargin.toFixed(2)}x`;
    case "fuel_mode":
      return inputs.fuel.toUpperCase();
    default:
      return "N/A";
  }
}

function deepDiveForCoreMetric(
  id: "qSci" | "qEng" | "fusion" | "gross" | "recirc" | "net" | "lawson" | "fuel_mode",
): Exclude<DeepDivePanel, null> | null {
  if (id === "qSci") return { kind: "control", id: "qSci", side: "right" };
  if (id === "qEng") return { kind: "node", id: "gross", side: "right" };
  if (id === "fusion") return { kind: "node", id: "fusion", side: "right" };
  if (id === "gross") return { kind: "node", id: "gross", side: "right" };
  if (id === "recirc") return { kind: "node", id: "recirc", side: "right" };
  if (id === "net") return { kind: "node", id: "net", side: "right" };
  return null;
}

export default function Home() {
  return (
    <iframe
      src="/landing.html?v=20260429-2"
      title="Fusion simulator landing page"
      className="h-screen w-screen border-0"
    />
  );
}
