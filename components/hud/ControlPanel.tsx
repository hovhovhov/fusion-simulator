"use client";

import { RotateCcw, Share2 } from "lucide-react";

import { FuelSelector } from "@/components/hud/FuelSelector";
import { PresetRail } from "@/components/hud/PresetRail";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulatorStore } from "@/lib/store";

type ControlPanelProps = {
  onShare: () => void;
  onReset?: () => void;
};

const PERCENT = 100;

export function ControlPanel({ onShare, onReset }: ControlPanelProps) {
  const inputs = useSimulatorStore((state) => state.inputs);
  const displayMode = useSimulatorStore((state) => state.displayMode);
  const setDisplayMode = useSimulatorStore((state) => state.setDisplayMode);
  const setInput = useSimulatorStore((state) => state.setInput);
  const reset = useSimulatorStore((state) => state.reset);

  return (
    <section className="space-y-2">
      <PresetRail />
      <FuelSelector />

      <div className="panel space-y-3 rounded-md p-3">
        <div className="flex items-center justify-between">
          <h2 className="section-label">Reactor Controls</h2>
          <Tabs
            value={displayMode}
            onValueChange={(mode) => setDisplayMode(mode as "power" | "energy")}
          >
            <TabsList className="h-7 rounded-none border border-border bg-transparent p-0">
              <TabsTrigger value="power" className="rounded-none px-2 text-[10px] tracking-[0.18em]">
                Power
              </TabsTrigger>
              <TabsTrigger value="energy" className="rounded-none px-2 text-[10px] tracking-[0.18em]">
                Energy
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <SliderLine
          label="Heating / pulse"
          value={inputs.heatingEnergyPerPulseMJ}
          min={1}
          max={120}
          step={1}
          unit="MJ"
          onChange={(value) => setInput("heatingEnergyPerPulseMJ", value)}
        />

        <SliderLine
          label="Pulse rate"
          value={inputs.pulseRateHz}
          min={0.01}
          max={8}
          step={0.01}
          unit="Hz"
          onChange={(value) => setInput("pulseRateHz", value)}
        />

        <SliderLine
          label="Scientific gain Qsci"
          value={inputs.qSci}
          min={0.2}
          max={60}
          step={0.1}
          unit=""
          onChange={(value) => setInput("qSci", value)}
        />

        <SliderLine
          label="House load"
          value={inputs.houseLoadMW}
          min={1}
          max={500}
          step={1}
          unit="MW"
          onChange={(value) => setInput("houseLoadMW", value)}
        />

        <div className="grid grid-cols-1 gap-3">
          <ToggleLine
            label="Steady State"
            checked={inputs.operationMode === "steady"}
            onCheckedChange={(checked) =>
              setInput("operationMode", checked ? "steady" : "pulsed")
            }
          />
          <ToggleLine
            label="Split Conversion"
            checked={inputs.conversionMode === "split"}
            onCheckedChange={(checked) =>
              setInput("conversionMode", checked ? "split" : "simple")
            }
          />
        </div>

        <div className="space-y-2 border-t border-border pt-2">
          <p className="section-label">Advanced</p>

          <SliderLine
            label="Electric conversion"
            value={inputs.etaConversion * PERCENT}
            min={5}
            max={65}
            step={1}
            unit="%"
            onChange={(value) => setInput("etaConversion", value / PERCENT)}
          />
          <SliderLine
            label="Heating efficiency"
            value={inputs.etaHeating * PERCENT}
            min={10}
            max={95}
            step={1}
            unit="%"
            onChange={(value) => setInput("etaHeating", value / PERCENT)}
          />
          <SliderLine
            label="Neutron conversion"
            value={inputs.etaNeutron * PERCENT}
            min={5}
            max={80}
            step={1}
            unit="%"
            onChange={(value) => setInput("etaNeutron", value / PERCENT)}
          />
          <SliderLine
            label="Charged conversion"
            value={inputs.etaCharged * PERCENT}
            min={5}
            max={80}
            step={1}
            unit="%"
            onChange={(value) => setInput("etaCharged", value / PERCENT)}
          />
          <SliderLine
            label="Blanket multiplication"
            value={inputs.blanketMult}
            min={0.5}
            max={1.4}
            step={0.01}
            unit="x"
            onChange={(value) => setInput("blanketMult", value)}
          />
          <SliderLine
            label="Temperature"
            value={inputs.temperatureKeV}
            min={2}
            max={120}
            step={1}
            unit="keV"
            onChange={(value) => setInput("temperatureKeV", value)}
          />
          <SliderLine
            label="Density"
            value={inputs.densityPerM3 / 1e20}
            min={0.1}
            max={3000}
            step={0.1}
            unit="x1e20 m-3"
            onChange={(value) => setInput("densityPerM3", value * 1e20)}
          />
          <SliderLine
            label="Confinement"
            value={inputs.confinementTimeS}
            min={1e-10}
            max={8}
            step={0.01}
            unit="s"
            onChange={(value) => setInput("confinementTimeS", value)}
          />
        </div>

        <div className="mt-1 flex gap-2">
          <Button
            variant="outline"
            className="h-8 flex-1 rounded-none border-border bg-transparent text-[11px] uppercase tracking-[0.14em]"
            onClick={() => {
              reset();
              onReset?.();
            }}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
          <Button className="h-8 flex-1 rounded-none text-[11px] uppercase tracking-[0.14em]" onClick={onShare}>
            <Share2 className="mr-1 h-3.5 w-3.5" /> Share
          </Button>
        </div>
      </div>
    </section>
  );
}

function SliderLine({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <Label className="tracking-[0.12em] text-muted-foreground">{label.toUpperCase()}</Label>
        <span className="font-mono tabular-nums text-foreground">
          {value.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unit}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full appearance-none rounded-none bg-white/15 accent-primary"
      />
    </div>
  );
}

function ToggleLine({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border border-border px-2 py-1.5">
      <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
