"use client";

import { Button } from "@/components/ui/button";
import { PRESETS, useSimulatorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PresetRail() {
  const activePreset = useSimulatorStore((state) => state.activePreset);
  const applyPreset = useSimulatorStore((state) => state.applyPreset);

  return (
    <div className="panel rounded-md p-3">
      <p className="section-label mb-2">Presets</p>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            className={cn(
              "h-8 justify-start rounded-none border-border bg-transparent text-[10px] tracking-[0.16em]",
              activePreset === preset.id && "border-primary text-primary",
            )}
            onClick={() => applyPreset(preset.id)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
