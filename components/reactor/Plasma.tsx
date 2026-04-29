"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

type PlasmaProps = {
  temperatureKeV: number;
  pulseRateHz: number;
};

export function Plasma({ temperatureKeV, pulseRateHz }: PlasmaProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pulse = 1 + Math.sin(t * Math.max(0.4, pulseRateHz * 2)) * 0.08;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(pulse);
      meshRef.current.rotation.y += 0.002;
    }
  });

  const hue = Math.max(0.48, Math.min(0.68, 0.5 + temperatureKeV / 600));

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1.2, 0.35, 32, 128]} />
      <meshStandardMaterial
        color={`hsl(${hue * 360}, 95%, 62%)`}
        emissive={`hsl(${hue * 360}, 95%, 55%)`}
        emissiveIntensity={2.1}
        roughness={0.08}
        metalness={0.2}
      />
    </mesh>
  );
}
