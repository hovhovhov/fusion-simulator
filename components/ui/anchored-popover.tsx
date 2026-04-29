"use client";
/* eslint-disable react-hooks/refs */

import {
  FloatingArrow,
  FloatingPortal,
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  type Placement,
  type VirtualElement,
} from "@floating-ui/react";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type PopoverAnchor = {
  rect: DOMRect;
  placement: Placement;
};

export type CompactPopoverData = {
  breadcrumb: string;
  title: string;
  currentValue?: string;
  description: string[];
  relatedControls?: Array<{ id: string; label: string }>;
};

export function AnchoredPopover({
  open,
  anchor,
  data,
  onClose,
  onLearnMore,
  onSelectRelated,
}: {
  open: boolean;
  anchor: PopoverAnchor | null;
  data: CompactPopoverData | null;
  onClose: () => void;
  onLearnMore: () => void;
  onSelectRelated: (controlId: string) => void;
}) {
  const [arrowElement, setArrowElement] = useState<SVGSVGElement | null>(null);
  const virtualReference = useMemo<VirtualElement | null>(() => {
    if (!anchor) return null;
    return {
      getBoundingClientRect: () => anchor.rect,
    };
  }, [anchor]);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (next) => {
      if (!next) onClose();
    },
    placement: anchor?.placement ?? "right",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(12),
      flip({ padding: 24 }),
      shift({ padding: 24 }),
      arrow({ element: arrowElement }),
    ],
  });

  useEffect(() => {
    if (!virtualReference) return;
    refs.setPositionReference(virtualReference);
  }, [refs, virtualReference]);

  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context);
  const { getFloatingProps } = useInteractions([dismiss, role]);

  if (!open || !anchor || !data) {
    return null;
  }

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className="z-50 w-[340px] max-w-[340px] overflow-hidden rounded-[8px] border border-white/8 bg-[#0d1015]/96 shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[12px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        data-state={open ? "open" : "closed"}
      >
        <FloatingArrow
          ref={setArrowElement}
          context={context}
          width={8}
          height={8}
          fill="rgba(13,16,21,0.96)"
          stroke="rgba(255,255,255,0.08)"
        />
        <div className="max-h-[420px] overflow-y-auto p-5">
          <div className="mb-1 flex items-start justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.08em] text-white/55">
              {data.breadcrumb}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-white/40 transition-colors hover:text-white/80"
              aria-label="Close details"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <h3 className="text-[18px] font-medium text-white/92">{data.title}</h3>
          {data.currentValue ? (
            <div className="mt-3 border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-[0.08em] text-white/52">
                Current Value
              </p>
              <p className="font-mono text-[28px] leading-none text-white/95">
                {data.currentValue}
              </p>
            </div>
          ) : null}
          <div className="mt-3 space-y-2 text-[13px] leading-5 text-white/75">
            {data.description.slice(0, 3).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="my-3 h-px bg-white/10" />
          {data.relatedControls?.length ? (
            <p className="text-[11px] text-white/60">
              Related:{" "}
              {data.relatedControls.map((item, index, all) => (
                <span key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectRelated(item.id)}
                    className="text-[11px] text-white/85 underline-offset-2 transition-colors hover:text-[var(--accent-productive)] hover:underline"
                  >
                    {item.label}
                  </button>
                  {index < all.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onLearnMore}
            className="mt-3 text-[12px] text-[var(--accent-productive)] underline underline-offset-2"
          >
            Learn more →
          </button>
        </div>
      </div>
    </FloatingPortal>
  );
}
