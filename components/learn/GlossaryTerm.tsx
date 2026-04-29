"use client";

import { useRef, useState } from "react";

export function GlossaryTerm({
  term,
  definition,
}: {
  term: string;
  definition: string;
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  return (
    <span className="relative inline-flex items-center">
      <span
        className="cursor-help border-b border-dotted border-white/35"
        onMouseEnter={() => {
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => setOpen(true), 300);
        }}
        onMouseLeave={() => {
          if (timerRef.current) window.clearTimeout(timerRef.current);
          setOpen(false);
        }}
        onClick={(event) => {
          event.preventDefault();
          setOpen((v) => !v);
        }}
      >
        {term}
      </span>
      <span className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/20 text-[9px] text-white/70">
        ?
      </span>
      {open ? (
        <div className="absolute left-0 top-5 z-50 w-64 border border-white/12 bg-[#0d1015]/95 p-2 text-[11px] text-white/78 backdrop-blur">
          <p>{definition}</p>
        </div>
      ) : null}
    </span>
  );
}
