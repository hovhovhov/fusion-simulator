# Fusion Mission Control Simulator

Interactive fusion power plant simulator with:

- Real-time tokamak 3D scene (R3F + bloom post-processing)
- Extended reactor modeling (`Q_sci`, `Q_eng`, net electric output)
- Fuel switching (`D-T`, `D-D`, `D-He3`, `p-B11`)
- Lawson criterion panel (`nTtau` vs ignition threshold)
- Clickable Sankey flow graph for energy recirculation and losses
- Shareable scenario state through URL query params

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind v4 + shadcn/ui
- Zustand for simulation state
- Three.js via `@react-three/fiber` and `@react-three/drei`
- D3 / d3-sankey for flow and chart rendering
- Framer Motion for HUD transitions

## Core Structure

- `app/page.tsx`: mission-control composition and URL hydration/sharing
- `lib/physics/*`: fuel models, presets, Lawson helpers, and core simulation math
- `lib/store.ts`: Zustand store, state derivations, query serialization
- `components/hud/*`: controls, readouts, Sankey, Lawson plot
- `components/reactor/*`: tokamak scene primitives and interactive hotspots

## Build & Verify

```bash
npm run lint
npm run build
```

## Deploy

Deploy directly to Vercel:

```bash
npx vercel
```
