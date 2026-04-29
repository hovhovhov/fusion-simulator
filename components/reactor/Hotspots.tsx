"use client";

import { Html } from "@react-three/drei";

type HotspotsProps = {
  selectedHotspot: string | null;
  onSelect: (key: string | null) => void;
};

const HOTSPOTS = [
  { key: "heating", label: "Heating injectors", position: [0.4, 0.85, 1.2] as [number, number, number] },
  { key: "blanket", label: "Blanket", position: [1.8, 0.2, 0.1] as [number, number, number] },
  { key: "divertor", label: "Divertor", position: [0, -1, -1.1] as [number, number, number] },
  { key: "coils", label: "Superconducting coils", position: [-1.8, 0.75, 0.1] as [number, number, number] },
];

export function Hotspots({ selectedHotspot, onSelect }: HotspotsProps) {
  return (
    <group>
      {HOTSPOTS.map((hotspot) => (
        <group key={hotspot.key} position={hotspot.position}>
          <mesh onClick={() => onSelect(hotspot.key)}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color={selectedHotspot === hotspot.key ? "#ffb648" : "#5cf7ff"}
              emissive={selectedHotspot === hotspot.key ? "#ffb648" : "#5cf7ff"}
              emissiveIntensity={2}
            />
          </mesh>
          {selectedHotspot === hotspot.key ? (
            <Html distanceFactor={8} center>
              <div className="rounded-md border border-border bg-background/90 px-2 py-1 text-[11px] text-foreground">
                {hotspot.label}
              </div>
            </Html>
          ) : null}
        </group>
      ))}
    </group>
  );
}
