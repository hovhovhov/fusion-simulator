"use client";

import { BadgeCheck, Flame, TriangleAlert, type LucideIcon } from "lucide-react";

import type { ViabilityStatus } from "@/lib/physics/calculate";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  ViabilityStatus,
  { label: string; icon: LucideIcon; classes: string }
> = {
  "below-breakeven": {
    label: "Below Breakeven",
    icon: TriangleAlert,
    classes: "border-destructive/60 text-destructive",
  },
  "ignition-window": {
    label: "Ignition Window",
    icon: Flame,
    classes: "border-[var(--warn)]/60 text-[var(--warn)]",
  },
  "commercial-viable": {
    label: "Commercial Viable",
    icon: BadgeCheck,
    classes: "border-[var(--ok)]/60 text-[var(--ok)]",
  },
};

export function StatusBadge({ status }: { status: ViabilityStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
        meta.classes,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </div>
  );
}
