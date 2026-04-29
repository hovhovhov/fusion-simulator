"use client";

export function Blanket() {
  return (
    <mesh>
      <torusGeometry args={[1.8, 0.48, 36, 128]} />
      <meshStandardMaterial
        color="#132638"
        emissive="#18242d"
        emissiveIntensity={0.5}
        roughness={0.65}
        metalness={0.2}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}
