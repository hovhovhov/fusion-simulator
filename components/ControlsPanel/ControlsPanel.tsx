"use client";

import { ChevronDown, CircleHelp, Info } from "lucide-react";
import { useState } from "react";

import { GlossaryTerm } from "@/components/learn/GlossaryTerm";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CONTROL_EXPLANATIONS, PRESET_STORIES } from "@/lib/content";
import { GLOSSARY } from "@/lib/learn";
import type { FuelKey } from "@/lib/physics/fuels";
import { fuelDescription } from "@/lib/presets";
import { PRESETS, useSimulatorStore } from "@/store";

export function ControlsPanel({
  onShare,
  onReset,
  onOpenPresetInfo,
  onOpenControl,
  highlightedControlId,
}: {
  onShare: () => void;
  onReset: () => void;
  onOpenPresetInfo: (presetId: string, anchorRect: DOMRect, placement: "left" | "right" | "top") => void;
  onOpenControl: (controlId: string, anchorRect: DOMRect, placement: "left" | "right" | "top") => void;
  highlightedControlId?: string | null;
}) {
  const inputs = useSimulatorStore((s) => s.inputs);
  const activePreset = useSimulatorStore((s) => s.activePreset);
  const setInput = useSimulatorStore((s) => s.setInput);
  const applyPreset = useSimulatorStore((s) => s.applyPreset);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const fuelMeta = fuelDescription(inputs.fuel);
  const hasElectricalConversion = inputs.hasElectricalConversion;
  const fuelGlossaryKey =
    inputs.fuel === "dt"
      ? "dt"
      : inputs.fuel === "dd"
        ? "dd"
        : inputs.fuel === "dhe3"
          ? "dhe3"
          : "pb11";

  return (
    <aside className="panel column-scroll flex h-full flex-col overflow-y-auto p-3">
      <Section title="Presets">
        <div className="space-y-1">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              role="button"
              tabIndex={0}
              onClick={() => applyPreset(preset.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  applyPreset(preset.id);
                }
              }}
              className="group w-full border border-white/6 px-2 py-2 text-left transition-colors hover:border-white/20"
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-0.5 h-14 w-[2px]"
                  style={{
                    background: activePreset === preset.id ? "var(--accent-productive)" : "transparent",
                  }}
                />
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-medium text-white/92">{preset.name}</p>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenPresetInfo(
                          preset.id,
                          event.currentTarget.getBoundingClientRect(),
                          "right",
                        );
                      }}
                      className="inline-flex h-4 w-4 items-center justify-center border border-white/15 text-[10px] text-white/70 hover:text-white/95"
                      aria-label={`Preset details for ${preset.name}`}
                    >
                      i
                    </button>
                    <span
                      className="inline-flex items-center gap-1 border border-white/12 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em]"
                      style={{
                        color: preset.tag === "research" ? "rgba(255,181,71,0.9)" : "rgba(91,229,132,0.9)",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: preset.tag === "research" ? "#ffb547" : "#5be584",
                        }}
                      />
                      {preset.tag === "research" ? "Research" : "Power Plant"}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70">{PRESET_STORIES[preset.id].tagline}</p>
                  <div className="mt-1 grid grid-cols-3 gap-2 text-[10px] text-white/50">
                    <span>{PRESET_STORIES[preset.id].year}</span>
                    <span>{PRESET_STORIES[preset.id].hero.qSci}</span>
                    <span>{PRESET_STORIES[preset.id].hero.fusion}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Fuel">
        <div className="space-y-2">
          <select
            value={inputs.fuel}
            onChange={(event) => setInput("fuel", event.target.value as FuelKey)}
            className="w-full border border-white/10 bg-[#0d1015] px-2 py-1.5 text-[12px] text-white/92"
          >
            <option value="dt">D-T</option>
            <option value="dd">D-D</option>
            <option value="dhe3">D-He3</option>
            <option value="pb11">p-B11</option>
          </select>
          <p className="text-[11px] text-white/75">
            <GlossaryTerm
              term={GLOSSARY[fuelGlossaryKey].term}
              definition={GLOSSARY[fuelGlossaryKey].definition}
            />
            {" "}
            reaction: {fuelMeta.equation}
          </p>
          <p className="text-[11px] text-white/52">
            Neutron fraction: {(fuelMeta.neutronFraction * 100).toFixed(0)}%. {fuelMeta.text}
          </p>
        </div>
      </Section>

      <Section title="Reactor Controls">
        <div className="space-y-2">
          <div className="flex items-center justify-between border border-white/8 px-2 py-1.5">
            <span className="text-[11px] uppercase tracking-[0.08em] text-white/65">Mode</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setInput("operationMode", inputs.operationMode === "steady" ? "pulsed" : "steady")}
                className="text-[11px] font-medium text-[var(--accent-productive)]"
              >
                {inputs.operationMode === "steady" ? "STEADY STATE" : "PULSED"}
              </button>
              <div>
                {/* Root cause of persistent dev "1 issue" banner: an earlier version rendered a nested interactive helper inside the mode toggle button, which triggered React runtime warnings. Keep this helper as a sibling button. */}
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white"
                    aria-label="Mode glossary"
                  >
                    <CircleHelp className="h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="z-[60] w-64 border border-white/12 bg-[#0d1015]/95 p-2 text-[11px] text-white/78">
                    <p>{inputs.operationMode === "steady" ? GLOSSARY.steady.definition : GLOSSARY.pulsed.definition}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <ControlSlider
            label="Heating power"
            value={inputs.heatingPowerMW}
            min={1}
            max={150}
            step={1}
            unit="MW"
            tooltip="External power used to heat the plasma. Higher values raise fusion output but increase recirculation burden."
            onChange={(value) => setInput("heatingPowerMW", value)}
            baseline={50}
            controlId="heatingPowerMW"
            onOpenControl={onOpenControl}
            highlighted={highlightedControlId === "heatingPowerMW"}
          />

          {inputs.operationMode === "pulsed" ? (
            <ControlSlider
              label="Pulse rate"
              value={inputs.pulseRateHz}
              min={0.05}
              max={10}
              step={0.05}
              unit="Hz"
              tooltip="Pulse frequency. Higher rates reduce dwell gaps but stress thermal systems."
              onChange={(value) => setInput("pulseRateHz", value)}
              baseline={1}
              controlId="pulseRateHz"
              onOpenControl={onOpenControl}
              highlighted={highlightedControlId === "pulseRateHz"}
            />
          ) : null}

          <ControlSlider
            label="Scientific gain Qsci"
            value={inputs.qSci}
            min={0.2}
            max={40}
            step={0.1}
            unit=""
            tooltip="Ratio between fusion power and absorbed heating power in plasma."
            onChange={(value) => setInput("qSci", value)}
            baseline={10}
            controlId="qSci"
            onOpenControl={onOpenControl}
            highlighted={highlightedControlId === "qSci"}
          />

          <ControlSlider
            label="House load"
            value={inputs.houseLoadMW}
            min={1}
            max={250}
            step={1}
            unit="MW"
            tooltip="Internal electrical load for cryogenics, pumps, controls, and auxiliaries."
            onChange={(value) => setInput("houseLoadMW", value)}
            baseline={60}
            controlId="houseLoadMW"
            onOpenControl={onOpenControl}
            highlighted={highlightedControlId === "houseLoadMW"}
          />
        </div>
      </Section>

      <Section
        title="Advanced"
        right={
          <button onClick={() => setAdvancedOpen((value) => !value)} className="text-white/55">
            <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </button>
        }
      >
        {advancedOpen ? (
          <div className="space-y-2">
            <ControlSlider
              label="Heating system efficiency"
              value={inputs.etaHeating * 100}
              min={10}
              max={90}
              step={1}
              unit="%"
              tooltip="Fraction of input electrical power that actually couples into the plasma."
              onChange={(value) => setInput("etaHeating", value / 100)}
              baseline={50}
              controlId="etaHeating"
              onOpenControl={onOpenControl}
              highlighted={highlightedControlId === "etaHeating"}
            />
            <ControlSlider
              label="Neutron conversion efficiency"
              value={inputs.etaNeutron * 100}
              min={0}
              max={70}
              step={1}
              unit="%"
              tooltip="Efficiency converting neutron-heated blanket energy into electricity."
              onChange={(value) => setInput("etaNeutron", value / 100)}
              baseline={34}
              controlId="etaNeutron"
              onOpenControl={onOpenControl}
              highlighted={highlightedControlId === "etaNeutron"}
              disabled={!hasElectricalConversion}
              disabledReason="Research device - no electrical output"
            />
            <ControlSlider
              label="Charged-particle conversion efficiency"
              value={inputs.etaCharged * 100}
              min={0}
              max={80}
              step={1}
              unit="%"
              tooltip="Efficiency of converting charged particle energy (alphas) into electrical output."
              onChange={(value) => setInput("etaCharged", value / 100)}
              baseline={22}
              controlId="etaCharged"
              onOpenControl={onOpenControl}
              highlighted={highlightedControlId === "etaCharged"}
              disabled={!hasElectricalConversion}
              disabledReason="Research device - no electrical output"
            />
            <ControlSlider
              label="Heating-through conversion efficiency"
              value={inputs.etaHeatingThrough * 100}
              min={0}
              max={70}
              step={1}
              unit="%"
              tooltip="Fraction of heating-chain and thermal losses that can still be recovered by the conversion system."
              onChange={(value) => setInput("etaHeatingThrough", value / 100)}
              baseline={36}
              controlId="etaHeatingThrough"
              onOpenControl={onOpenControl}
              highlighted={highlightedControlId === "etaHeatingThrough"}
              disabled={!hasElectricalConversion}
              disabledReason="Research device - no electrical output"
            />
            <ControlSlider
              label="Blanket multiplication"
              value={inputs.blanketMult}
              min={0.8}
              max={1.4}
              step={0.01}
              unit="x"
              tooltip="Neutron energy multiplication in breeding blanket reactions."
              onChange={(value) => setInput("blanketMult", value)}
              baseline={1.1}
              controlId="blanketMult"
              onOpenControl={onOpenControl}
              highlighted={highlightedControlId === "blanketMult"}
            />
            <ControlSlider
              label="Temperature"
              value={inputs.temperatureKeV}
              min={2}
              max={80}
              step={0.5}
              unit="keV"
              tooltip="Ion temperature in plasma. Lawson margin depends heavily on this with confinement."
              onChange={(value) => setInput("temperatureKeV", value)}
              baseline={20}
              controlId="temperatureKeV"
              onOpenControl={onOpenControl}
              highlighted={highlightedControlId === "temperatureKeV"}
            />
            <ControlSlider
              label="Density"
              value={inputs.densityPerM3 / 1e20}
              min={0.1}
              max={400}
              step={0.1}
              unit="x1e20 m-3"
              tooltip="Particle density of confined plasma."
              onChange={(value) => setInput("densityPerM3", value * 1e20)}
              baseline={1}
              controlId="densityPerM3"
              onOpenControl={onOpenControl}
              highlighted={highlightedControlId === "densityPerM3"}
            />
            <ControlSlider
              label="Confinement time"
              value={inputs.confinementTimeS}
              min={0.01}
              max={8}
              step={0.01}
              unit="s"
              tooltip="Average energy confinement time before losses."
              onChange={(value) => setInput("confinementTimeS", value)}
              baseline={2.8}
              controlId="confinementTimeS"
              onOpenControl={onOpenControl}
              highlighted={highlightedControlId === "confinementTimeS"}
            />
          </div>
        ) : null}
      </Section>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
        <Button onClick={onReset} variant="outline" className="rounded-none border-white/20 bg-transparent">
          Reset
        </Button>
        <Button onClick={onShare} className="rounded-none">
          Share
        </Button>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="mb-3 border border-white/6 p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="section-label">{title}</p>
        {right}
      </div>
      {children}
    </section>
  );
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  tooltip,
  onChange,
  baseline,
  controlId,
  onOpenControl,
  highlighted = false,
  disabled = false,
  disabledReason,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  tooltip: string;
  onChange: (value: number) => void;
  baseline: number;
  controlId: string;
  onOpenControl: (controlId: string, anchorRect: DOMRect, placement: "left" | "right" | "top") => void;
  highlighted?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const baselinePct = ((baseline - min) / (max - min)) * 100;
  return (
    <div
      className="space-y-1 border border-transparent p-1 transition-colors"
      style={{
        animation: highlighted ? "metricFlash 600ms ease-out" : "none",
        borderColor: highlighted ? "rgba(77,208,225,0.55)" : "transparent",
      }}
    >
      <div className="flex items-start justify-between gap-3 text-[11px]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-white/65">
            <span className="uppercase tracking-[0.06em]">{label}</span>
            <Tooltip>
              <TooltipTrigger
                type="button"
                className="inline-flex text-white/45 hover:text-white/75"
                onClick={(event) => {
                  event.preventDefault();
                  onOpenControl(controlId, event.currentTarget.getBoundingClientRect(), "right");
                }}
              >
                <Info className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={10}
                className="z-[60] w-64 border border-white/12 bg-[#0d1015]/95 p-2 text-[11px] leading-4 text-white/75"
              >
                <p>{disabled && disabledReason ? disabledReason : CONTROL_EXPLANATIONS[controlId]?.short ?? tooltip}</p>
                <p className="mt-1 text-[10px] text-white/55">Click for details</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <span className="shrink-0 whitespace-nowrap font-mono tabular-nums text-white/92">
          {value.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            if (!disabled) onChange(Number(event.target.value));
          }}
          disabled={disabled}
          className="slider-thin h-4 w-full appearance-none bg-transparent disabled:opacity-40"
        />
        <span className="pointer-events-none absolute top-[8px] h-[2px] w-[1px] bg-white/45" style={{ left: `${baselinePct}%` }} />
      </div>
    </div>
  );
}
