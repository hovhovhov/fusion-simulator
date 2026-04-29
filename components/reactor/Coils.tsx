"use client";

export function Coils() {
  return (
    <group>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const x = Math.cos(angle) * 1.65;
        const z = Math.sin(angle) * 1.65;
        return (
          <mesh key={index} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <torusGeometry args={[0.35, 0.05, 16, 48]} />
            <meshStandardMaterial color="#2a5f78" emissive="#1f425a" emissiveIntensity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}
