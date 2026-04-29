"use client";

import { Atom } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FUEL_ORDER, FUEL_PROFILES, type FuelKey } from "@/lib/physics/fuels";
import { useSimulatorStore } from "@/lib/store";

export function FuelSelector() {
  const fuel = useSimulatorStore((state) => state.inputs.fuel);
  const setInput = useSimulatorStore((state) => state.setInput);

  const profile = FUEL_PROFILES[fuel];

  return (
    <div className="panel space-y-2 rounded-md p-3">
      <div className="flex items-center justify-between">
        <p className="section-label">Fuel</p>
        <Atom className="h-3.5 w-3.5 text-primary" />
      </div>

      <Select value={fuel} onValueChange={(value) => setInput("fuel", value as FuelKey)}>
        <SelectTrigger className="h-8 rounded-none border-border bg-transparent text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FUEL_ORDER.map((fuelKey) => (
            <SelectItem key={fuelKey} value={fuelKey}>
              {FUEL_PROFILES[fuelKey].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-1 text-[11px] text-muted-foreground">
        <p className="font-semibold tracking-[0.06em] text-foreground">{profile.reaction}</p>
        <p>Neutron fraction: {(profile.neutronFraction * 100).toFixed(0)}%</p>
        <p>{profile.notes}</p>
      </div>
    </div>
  );
}
