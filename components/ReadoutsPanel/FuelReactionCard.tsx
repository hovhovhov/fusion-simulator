"use client";

import { Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  FUEL_REACTION_INFO,
  SPECIES,
  type ReactionBranch,
  type SpeciesKey,
} from "@/lib/fuel-reaction";
import type { FuelKey } from "@/lib/physics/fuels";

const LOOP_SECONDS = 4;
const WIDTH = 300;
const HEIGHT = 160;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2 - 8;

type ParticlePose = {
  x: number;
  y: number;
  opacity: number;
  scale: number;
};

export function FuelReactionCard({
  fuel,
  onOpenInfo,
  onOpenDeepDive,
}: {
  fuel: FuelKey;
  onOpenInfo: (anchorRect: DOMRect, placement: "left" | "right" | "top") => void;
  onOpenDeepDive: (anchorRect: DOMRect, placement: "left" | "right" | "top") => void;
}) {
  const [progress, setProgress] = useState(0);
  const [loopIndex, setLoopIndex] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [hoverTip, setHoverTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const previousTsRef = useRef<number | null>(null);
  const reactionInfo = FUEL_REACTION_INFO[fuel];

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    let frame = 0;
    const step = (ts: number) => {
      if (previousTsRef.current === null) previousTsRef.current = ts;
      const delta = (ts - previousTsRef.current) / 1000;
      previousTsRef.current = ts;

      if (isPageVisible && !hoverTip) {
        setProgress((old) => {
          const next = old + delta / LOOP_SECONDS;
          if (next >= 1) {
            setLoopIndex((idx) => idx + 1);
            return next - 1;
          }
          return next;
        });
      }

      frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [isPageVisible, hoverTip]);

  const activeBranch = useMemo<ReactionBranch>(() => {
    if (!reactionInfo.branchB) return reactionInfo.branchA;
    return loopIndex % 2 === 0 ? reactionInfo.branchA : reactionInfo.branchB;
  }, [reactionInfo, loopIndex]);

  const reactantPoses = useMemo(() => {
    const wobble = Math.sin(progress * Math.PI * 8) * 2.4;
    return activeBranch.reactants.map((_, index) => reactantPose(progress, index, wobble));
  }, [activeBranch.reactants, progress]);

  const productPoses = useMemo(() => {
    return activeBranch.products.map((_, index) =>
      productPose(progress, index, activeBranch.products.length, fuel),
    );
  }, [activeBranch.products, fuel, progress]);

  const flashOpacity =
    progress >= 0.375 && progress <= 0.45
      ? 0.95 - Math.min(0.95, Math.abs(progress - 0.412) * 8)
      : 0;

  return (
    <section className="border border-white/6 p-2">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="section-label">Fuel Reaction</p>
          <button
            type="button"
            className="text-white/45 transition-colors hover:text-white/80"
            onClick={(event) => onOpenInfo(event.currentTarget.getBoundingClientRect(), "left")}
            aria-label="Fuel reaction overview"
          >
            <Info className="h-3 w-3" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => onOpenDeepDive(event.currentTarget.getBoundingClientRect(), "left")}
        className="w-full text-left"
      >
        <div className="relative overflow-hidden border border-white/10 bg-[#090d14] p-1">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={fuel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-[160px] w-full">
                <defs>
                  <filter id="atom-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.2" result="blurred" />
                    <feMerge>
                      <feMergeNode in="blurred" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <circle
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={22 + flashOpacity * 34}
                  fill={`rgba(255,255,255,${flashOpacity * 0.5})`}
                />

                {activeBranch.reactants.map((species, index) => (
                  <AtomGlyph
                    key={`r-${index}-${species}`}
                    species={species}
                    pose={reactantPoses[index]}
                    primary={reactionInfo.theme.primary}
                    secondary={reactionInfo.theme.secondary}
                    glow={reactionInfo.theme.glow}
                    onHover={setHoverTip}
                  />
                ))}

                {activeBranch.products.map((species, index) => (
                  <AtomGlyph
                    key={`p-${index}-${species}`}
                    species={species}
                    pose={productPoses[index]}
                    primary={reactionInfo.theme.secondary}
                    secondary={reactionInfo.theme.primary}
                    glow={reactionInfo.theme.glow}
                    trail={fuel === "dt" && species === "n"}
                    onHover={setHoverTip}
                  />
                ))}
              </svg>
            </motion.div>
          </AnimatePresence>
          {hoverTip ? (
            <div
              className="pointer-events-none absolute z-20 max-w-[240px] rounded border border-white/12 bg-[#131925] px-2 py-1 text-[11px] text-white/85"
              style={{
                left: Math.min(Math.max(6, hoverTip.x + 10), WIDTH - 120),
                top: Math.max(8, hoverTip.y - 28),
              }}
            >
              {hoverTip.text}
            </div>
          ) : null}
        </div>

        <div className="mt-2 border border-white/6 p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${fuel}-facts`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1"
            >
              {reactionInfo.facts.map((row) => (
                <div key={row.label} className="grid grid-cols-[90px_1fr] gap-2 text-[11px]">
                  <span className="text-white/55">{row.label}</span>
                  <span className="font-mono tabular-nums text-white/86">{row.value}</span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </button>
    </section>
  );
}

function AtomGlyph({
  species,
  pose,
  primary,
  secondary,
  glow,
  trail = false,
  onHover,
}: {
  species: SpeciesKey;
  pose: ParticlePose;
  primary: string;
  secondary: string;
  glow: string;
  trail?: boolean;
  onHover: (tip: { text: string; x: number; y: number } | null) => void;
}) {
  const speciesInfo = SPECIES[species];
  const nucleons = buildNucleons(speciesInfo.protons, speciesInfo.neutrons);
  const radius = species === "b11" ? 15 : species === "he4" ? 12 : 9;

  return (
    <g
      transform={`translate(${pose.x} ${pose.y}) scale(${pose.scale})`}
      opacity={pose.opacity}
      style={{ cursor: "pointer" }}
      onMouseEnter={(event) => {
        onHover({ text: speciesInfo.tooltip, x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
      }}
      onMouseMove={(event) => {
        onHover({ text: speciesInfo.tooltip, x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
      }}
      onMouseLeave={() => onHover(null)}
    >
      {trail ? (
        <rect
          x={-radius * 1.2}
          y={-2}
          width={radius * 3.2}
          height={4}
          fill="rgba(193,220,255,0.35)"
          rx={2}
          opacity={Math.min(0.9, pose.opacity)}
        />
      ) : null}
      <circle r={radius + 2} fill={glow} filter="url(#atom-glow)" />
      <circle r={radius} fill="rgba(8,13,18,0.9)" stroke={primary} strokeWidth={1.3} />
      {nucleons.map((nucleon) => (
        <circle
          key={nucleon.key}
          cx={nucleon.x}
          cy={nucleon.y}
          r={2}
          fill={nucleon.kind === "p" ? "#ef5757" : "#a8b0bf"}
          stroke={secondary}
          strokeWidth={0.2}
        />
      ))}
      <text
        x={0}
        y={radius + 13}
        textAnchor="middle"
        fill="rgba(255,255,255,0.78)"
        style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 11, letterSpacing: "0.04em" }}
      >
        {speciesInfo.label}
      </text>
    </g>
  );
}

function reactantPose(progress: number, index: number, wobble: number): ParticlePose {
  if (progress >= 0.45) {
    return { x: CENTER_X, y: CENTER_Y, opacity: 0, scale: 0.75 };
  }
  const t = clamp(progress / 0.375, 0, 1);
  const startX = index === 0 ? 28 : WIDTH - 28;
  const endX = index === 0 ? CENTER_X - 11 : CENTER_X + 11;
  return {
    x: lerp(startX, endX, t),
    y: CENTER_Y + wobble * (index === 0 ? 1 : -1),
    opacity: 1,
    scale: 1,
  };
}

function productPose(progress: number, index: number, count: number, fuel: FuelKey): ParticlePose {
  if (progress < 0.45) {
    return { x: CENTER_X, y: CENTER_Y, opacity: 0, scale: 0.8 };
  }

  const t = clamp((progress - 0.45) / 0.425, 0, 1);
  const fade = progress > 0.875 ? 1 - clamp((progress - 0.875) / 0.125, 0, 1) : 1;

  if (count === 2) {
    const direction = index === 0 ? -1 : 1;
    const speed = fuel === "dt" && index === 1 ? 1.35 : 1;
    return {
      x: CENTER_X + direction * 118 * t * speed,
      y: CENTER_Y + (index === 0 ? -10 : 10) * t,
      opacity: fade,
      scale: 1,
    };
  }

  const angle = (-Math.PI / 2) + (index * (Math.PI * 2)) / count;
  return {
    x: CENTER_X + Math.cos(angle) * 78 * t,
    y: CENTER_Y + Math.sin(angle) * 62 * t,
    opacity: fade,
    scale: 1,
  };
}

function buildNucleons(protons: number, neutrons: number) {
  const points = [
    { x: 0, y: 0 },
    { x: -3.8, y: -2.3 },
    { x: 3.8, y: -2.3 },
    { x: -3.8, y: 2.3 },
    { x: 3.8, y: 2.3 },
    { x: 0, y: -4.5 },
    { x: 0, y: 4.5 },
    { x: -6, y: 0 },
    { x: 6, y: 0 },
    { x: -6, y: -4.5 },
    { x: 6, y: 4.5 },
    { x: -6, y: 4.5 },
  ];

  const nucleons: Array<{ key: string; x: number; y: number; kind: "p" | "n" }> = [];
  for (let i = 0; i < protons; i += 1) {
    const point = points[i] ?? { x: 0, y: 0 };
    nucleons.push({ key: `p-${i}`, x: point.x, y: point.y, kind: "p" });
  }
  for (let i = 0; i < neutrons; i += 1) {
    const point = points[protons + i] ?? { x: 0, y: 0 };
    nucleons.push({ key: `n-${i}`, x: point.x, y: point.y, kind: "n" });
  }
  return nucleons;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
