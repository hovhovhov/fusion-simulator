"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { FUEL_SEQUENCE, REACTIONS, type FuelReactionId, type ReactionBranch } from "@/lib/reactions";
import { useSimulatorStore } from "@/store";

const TOTAL_MS = 4000;
const APPROACH_END = 0.42;
const FLASH_PEAK = 0.47;
const FLASH_END = 0.52;
const SEP_END = 0.85;

export function FuelReactionPanel() {
  const fuel = useSimulatorStore((s) => s.inputs.fuel);
  const setInput = useSimulatorStore((s) => s.setInput);
  const [open, setOpen] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [isInView, setIsInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);

  const fuelId: FuelReactionId = fuel === "dd" ? "D-D" : fuel === "pb11" ? "p-B11" : "D-T";
  const reaction = REACTIONS[fuelId];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!panelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { root: null, threshold: 0.2 },
    );
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={panelRef} className="frpanel">
      <div className="frpanel-header">
        <div className="frpanel-eyebrow">
          <span
            className="dot"
            style={{
              background: reaction.eyebrowDot,
              boxShadow: `0 0 6px ${reaction.eyebrowDot}`,
            }}
          />
          Fuel reaction
        </div>
        <div className="frpanel-eyebrow frpanel-label">{reaction.label}</div>
      </div>

      <div className="fuel-switcher">
        {FUEL_SEQUENCE.map((id) => (
          <FuelChip
            key={id}
            id={id}
            active={id === fuelId}
            onClick={() => {
              setInput("fuel", id === "D-D" ? "dd" : id === "p-B11" ? "pb11" : "dt");
              setReplayKey((v) => v + 1);
            }}
          />
        ))}
      </div>

      <div className="fr-stage">
        <div className="fr-frame-note">~10⁻¹⁵ m · single event</div>
        <button
          type="button"
          className="fr-replay"
          onClick={() => setReplayKey((v) => v + 1)}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          Replay
        </button>
        <ReactionDiagram
          key={`${reaction.id}-${replayKey}-${reducedMotion ? "reduced" : "loop"}`}
          reaction={reaction}
          playing={isInView}
          reducedMotion={reducedMotion}
        />
        <div className="fr-legend">
          <div className="grp">
            <div className="item"><span className="swatch fr-swatch-solid" /> Solid → neutral</div>
            <div className="item"><span className="fr-dashed" /> Dashed → charged</div>
          </div>
          <div>arrow length ≈ energy</div>
        </div>
      </div>

      <div className="fr-equation-wrap">
        <Equation parts={reaction.equation} energy={reaction.energy} />
      </div>
      <div className="fr-anchor">{reaction.anchor}</div>

      <div className="fr-details">
        <button
          type="button"
          className="fr-details-toggle"
          data-open={open ? "true" : "false"}
          onClick={() => setOpen((v) => !v)}
        >
          <span>Technical details</span>
          <svg className="caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open ? (
          <dl className="fr-details-body">
            {reaction.details.map(([key, value]) => (
              <div key={key} className="fr-detail-row">
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

function FuelChip({
  id,
  active,
  onClick,
}: {
  id: FuelReactionId;
  active: boolean;
  onClick: () => void;
}) {
  const dots = id === "D-T"
    ? [
        { color: "p-deuterium", size: 5 },
        { color: "p-tritium", size: 6 },
        { arrow: true },
        { color: "p-alpha", size: 6 },
        { color: "p-neutron", size: 4 },
      ]
    : id === "D-D"
      ? [
          { color: "p-deuterium", size: 5 },
          { color: "p-deuterium", size: 5 },
          { arrow: true },
          { color: "p-helium3", size: 5 },
          { color: "p-tritium", size: 5 },
        ]
      : [
          { color: "p-proton", size: 4 },
          { color: "p-boron", size: 7 },
          { arrow: true },
          { color: "p-alpha", size: 5 },
          { color: "p-alpha", size: 5 },
          { color: "p-alpha", size: 5 },
        ];

  return (
    <button
      type="button"
      className="fuel-chip"
      data-active={active ? "true" : "false"}
      onClick={onClick}
    >
      <div className="fuel-chip-label">{id}</div>
      <div className="fuel-chip-mini">
        {dots.map((dot, index) =>
          "arrow" in dot ? (
            <div key={`arrow-${index}`} className="fuel-chip-arrow" />
          ) : (
            <div
              key={`orb-${index}`}
              className="fuel-chip-orb"
              style={{
                width: dot.size,
                height: dot.size,
                background: `hsl(var(--${dot.color}))`,
                boxShadow: `0 0 5px hsl(var(--${dot.color}) / 0.7)`,
              }}
            />
          ),
        )}
      </div>
    </button>
  );
}

function Equation({
  parts,
  energy,
}: {
  parts: Array<{ sym?: string; iso?: string; op?: string; arrow?: true; branchText?: string }>;
  energy: string;
}) {
  return (
    <div className="fr-equation">
      {parts.map((part, index) => {
        if (part.arrow) return <span key={`arr-${index}`} className="arrow">→</span>;
        if (part.op) return <span key={`op-${index}`} className="arrow">{part.op}</span>;
        if (part.branchText) return <span key={`branch-${index}`}>{part.branchText}</span>;
        return (
          <span key={`sym-${index}`} className="iso">
            {part.iso ? <sup>{part.iso}</sup> : null}
            <span>{part.sym}</span>
          </span>
        );
      })}
      <span className="energy">+ {energy}</span>
    </div>
  );
}

function ReactionDiagram({
  reaction,
  playing,
  reducedMotion,
}: {
  reaction: (typeof REACTIONS)[FuelReactionId];
  playing: boolean;
  reducedMotion: boolean;
}) {
  const t = useLoopingTime(playing && !reducedMotion);
  const frameT = reducedMotion ? SEP_END : t;
  const cx = 240;
  const cy = 115;

  return (
    <svg viewBox="0 0 480 230" preserveAspectRatio="xMidYMid meet" className={reducedMotion ? "fr-reduced" : ""}>
      <defs>
        <radialGradient id="stage-vignette" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="hsla(0,0%,100%,0.04)" />
          <stop offset="100%" stopColor="hsla(0,0%,100%,0)" />
        </radialGradient>
        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="hsla(0,0%,100%,0.04)" />
        </pattern>
      </defs>
      <rect width="480" height="230" fill="url(#dots)" />
      <rect width="480" height="230" fill="url(#stage-vignette)" />

      <g stroke="hsla(0,0%,100%,0.06)" strokeWidth="0.75">
        <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} />
        <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} />
      </g>

      {reaction.branches.map((branch) => (
        <Branch key={branch.label ?? branch.weight} branch={branch} t={frameT} cx={cx} cy={cy} />
      ))}
    </svg>
  );
}

function Branch({
  branch,
  t,
  cx,
  cy,
}: {
  branch: ReactionBranch;
  t: number;
  cx: number;
  cy: number;
}) {
  const oy = branch.yOffset ?? 0;
  const baseY = cy + oy;
  const approachT = clamp01(t / APPROACH_END);
  const sepT = clamp01((t - FLASH_END) / (SEP_END - FLASH_END));
  const reactantOpacity = t < APPROACH_END ? 1 : t < FLASH_PEAK ? 1 - clamp01((t - APPROACH_END) / (FLASH_PEAK - APPROACH_END)) : 0;
  const productOpacity = t < FLASH_PEAK ? 0 : t < FLASH_END ? clamp01((t - FLASH_PEAK) / (FLASH_END - FLASH_PEAK)) : 1;
  const flashCurve = t < APPROACH_END || t > FLASH_END ? 0 : Math.sin(((t - APPROACH_END) / (FLASH_END - APPROACH_END)) * Math.PI);
  const ePos = easeOutCubic(approachT);
  const sPos = easeOutCubic(sepT);

  return (
    <g>
      {branch.reactants.map((particle, index) => (
        <Particle
          key={`r-${particle.id}`}
          x={lerp(particle.fromX, particle.toX, ePos)}
          y={baseY + (index === 0 ? -2 : 2)}
          r={particle.r}
          colorVar={particle.color}
          opacity={reactantOpacity}
        />
      ))}

      {flashCurve > 0.02 ? (
        <g>
          <circle cx={cx} cy={baseY} r={70 * flashCurve} fill="hsla(48, 100%, 80%, 0.35)" style={{ filter: "blur(18px)" }} />
          <circle cx={cx} cy={baseY} r={28 * flashCurve} fill="hsla(48, 100%, 92%, 0.7)" style={{ filter: "blur(6px)" }} />
          <circle cx={cx} cy={baseY} r={6 + 10 * flashCurve} fill="hsla(0, 0%, 100%, 1)" />
        </g>
      ) : null}

      {branch.products.map((particle) => {
        const norm = Math.hypot(particle.dx, particle.dy);
        const tx = cx + particle.dx * sPos;
        const ty = baseY + particle.dy * sPos;
        const arrowProgress = clamp01(sepT * 1.6);
        const ax2 = cx + (particle.dx / norm) * particle.arrowLen * arrowProgress;
        const ay2 = baseY + (particle.dy / norm) * particle.arrowLen * arrowProgress;
        return (
          <g key={`p-${particle.id}`}>
            <ProductArrow
              x1={cx}
              y1={baseY}
              x2={ax2}
              y2={ay2}
              opacity={productOpacity * 0.9}
              charged={particle.charged}
            />
            <Particle
              x={tx}
              y={ty}
              r={particle.r}
              colorVar={particle.color}
              label={t > 0.6 ? particle.label : undefined}
              opacity={productOpacity}
              trail={
                sepT > 0.05
                  ? {
                      x1: cx + particle.dx * Math.max(0, sPos - 0.2),
                      y1: baseY + particle.dy * Math.max(0, sPos - 0.2),
                      x2: tx,
                      y2: ty,
                    }
                  : undefined
              }
            />
          </g>
        );
      })}

      {branch.label ? (
        <text x={cx + 200} y={baseY - 40} textAnchor="end" className="fr-branch-label">
          {branch.label}
        </text>
      ) : null}
    </g>
  );
}

function Particle({
  x,
  y,
  r,
  colorVar,
  label,
  opacity = 1,
  trail,
}: {
  x: number;
  y: number;
  r: number;
  colorVar: string;
  label?: string;
  opacity?: number;
  trail?: { x1: number; y1: number; x2: number; y2: number };
}) {
  return (
    <g style={{ opacity }}>
      {trail ? (
        <line x1={trail.x1} y1={trail.y1} x2={trail.x2} y2={trail.y2} stroke={`hsl(var(--${colorVar}))`} strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
      ) : null}
      <circle cx={x} cy={y} r={r * 2.4} fill={`hsl(var(--${colorVar}) / 0.18)`} style={{ filter: "blur(6px)" }} />
      <circle cx={x} cy={y} r={r * 1.35} fill={`hsl(var(--${colorVar}) / 0.30)`} />
      <circle cx={x} cy={y} r={r} fill={`hsl(var(--${colorVar}) / 0.95)`} />
      <circle cx={x - r * 0.32} cy={y - r * 0.32} r={r * 0.35} fill="hsla(0, 0%, 100%, 0.28)" />
      {label ? (
        <text x={x} y={y + r + 14} textAnchor="middle" className="fr-particle-label">
          {label}
        </text>
      ) : null}
    </g>
  );
}

function ProductArrow({
  x1,
  y1,
  x2,
  y2,
  opacity = 1,
  charged,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity?: number;
  charged: boolean;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 8) return null;
  const ux = dx / len;
  const uy = dy / len;
  const hx = x2 - ux;
  const hy = y2 - uy;
  const head = 5;
  const px = -uy;
  const py = ux;
  const a = `${hx},${hy}`;
  const b = `${hx - ux * head + px * head * 0.55},${hy - uy * head + py * head * 0.55}`;
  const c = `${hx - ux * head - px * head * 0.55},${hy - uy * head - py * head * 0.55}`;

  return (
    <g style={{ opacity }}>
      <line
        x1={x1}
        y1={y1}
        x2={hx}
        y2={hy}
        stroke="hsla(0, 0%, 100%, 0.42)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray={charged ? "1.5 3" : undefined}
      />
      <polygon points={`${a} ${b} ${c}`} fill="hsla(0, 0%, 100%, 0.55)" />
    </g>
  );
}

function useLoopingTime(playing: boolean) {
  const [t, setT] = useState(0);
  const startRef = useRef(performance.now());
  const rafRef = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();
    setT(0);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      const elapsed = (now - startRef.current) % TOTAL_MS;
      setT(elapsed / TOTAL_MS);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [playing]);

  return t;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}
