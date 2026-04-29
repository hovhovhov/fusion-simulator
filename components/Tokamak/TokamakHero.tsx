"use client";

import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { useSimulation, useSimulatorStore } from "@/store";

const MAJOR_RADIUS = 6;
const VESSEL_MINOR_X = 2;
const VESSEL_MINOR_Y = 2.3;

const plasmaVertexShader = `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  uniform float uTime;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 p = position;
    float wave = sin((p.x + p.y * 1.7 + p.z * 0.8) * 2.1 + uTime * 0.6) * 0.06;
    p += normal * wave;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const plasmaFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uOpacity;
  uniform vec3 uCore;
  uniform vec3 uEdge;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453);
  }

  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.1);
    float n1 = noise(vWorldPos * 0.28 + vec3(uTime * 0.2));
    float n2 = noise(vWorldPos * 0.45 + vec3(-uTime * 0.15));
    float helical = 0.5 + 0.5 * sin(atan(vWorldPos.z, vWorldPos.x) * 18.0 + vWorldPos.y * 5.0 - uTime * 1.2);
    vec3 color = mix(uCore, uEdge, fresnel + n1 * 0.35);
    color += vec3(helical * 0.08);
    float alpha = clamp((0.26 + n1 * 0.35 + n2 * 0.25 + fresnel * 0.7) * uOpacity, 0.08, 0.95);
    gl_FragColor = vec4(color * (0.55 + uIntensity), alpha);
  }
`;

type PlasmaUniformMaterial = THREE.ShaderMaterial & {
  uniforms: {
    uTime: { value: number };
    uIntensity: { value: number };
    uOpacity: { value: number };
    uCore: { value: THREE.Color };
    uEdge: { value: THREE.Color };
  };
};

const fuelPalette = {
  dt: { core: "#ff8a3c", edge: "#ff5e9c" },
  dd: { core: "#ffb17f", edge: "#ff7cae" },
  dhe3: { core: "#a8e8ff", edge: "#3cc8ff" },
  pb11: { core: "#e8d4ff", edge: "#c45cff" },
};

export function TokamakHero() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [interacting, setInteracting] = useState(false);

  return (
    <section
      className="panel relative h-full"
      onDoubleClick={() => controlsRef.current?.reset()}
    >
      <div className="absolute left-3 top-2 z-20">
        <p className="section-label">Tokamak Physical View</p>
      </div>
      <button
        onClick={() => controlsRef.current?.reset()}
        className="absolute right-3 top-2 z-20 border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-white/65"
      >
        Reset View
      </button>

      <Canvas camera={{ position: [11, 5.6, 10], fov: 34 }} gl={{ antialias: true }}>
        <color attach="background" args={["#050608"]} />
        <ambientLight intensity={0.12} />
        <TokamakScene controlsRef={controlsRef} interacting={interacting} />
        <Environment preset="studio" />
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.72} luminanceSmoothing={0.22} />
          <ChromaticAberration offset={new THREE.Vector2(0.0005, 0.0008)} />
          <Vignette eskil={false} offset={0.1} darkness={0.55} />
        </EffectComposer>
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={8}
          maxDistance={18}
          autoRotate={!interacting}
          autoRotateSpeed={0.5}
          onStart={() => setInteracting(true)}
          onEnd={() => setInteracting(false)}
        />
      </Canvas>
    </section>
  );
}

function TokamakScene({
  controlsRef,
  interacting,
}: {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  interacting: boolean;
}) {
  const simulation = useSimulation();
  const inputs = useSimulatorStore((s) => s.inputs);
  const selectedFlowKey = useSimulatorStore((s) => s.selectedFlowKey);
  const selectedNodeId = useSimulatorStore((s) => s.selectedNodeId);

  const focusMode = deriveFocusMode(selectedFlowKey, selectedNodeId);
  const palette = fuelPalette[inputs.fuel];
  const plasmaMaterialRef = useRef<PlasmaUniformMaterial | null>(null);
  const vesselEdgesRef = useRef<THREE.LineSegments>(null);
  const tfCoilsRef = useRef<THREE.Group>(null);
  const neutronPointsRef = useRef<THREE.Points>(null);
  const alphaPointsRef = useRef<THREE.Points>(null);

  const vesselGeometry = useMemo(
    () => createToroidalDGeometry(MAJOR_RADIUS, VESSEL_MINOR_X, VESSEL_MINOR_Y, 0.55),
    [],
  );
  const plasmaGeometry = useMemo(
    () => createToroidalDGeometry(5.72, 1.24, 1.56, 0.42),
    [],
  );
  const tfCoilGeometry = useMemo(() => createDCoilGeometry(2.65, 3.2, 1.7, 0.35), []);
  const neutronState = useMemo(() => createNeutronState(700), []);
  const alphaState = useMemo(() => createAlphaState(520), []);

  const plasmaMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0.55 },
          uOpacity: { value: 0.65 },
          uCore: { value: new THREE.Color(palette.core) },
          uEdge: { value: new THREE.Color(palette.edge) },
        },
        vertexShader: plasmaVertexShader,
        fragmentShader: plasmaFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [palette.core, palette.edge],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const plasmaPower = Math.max(0, inputs.heatingPowerMW * inputs.qSci);
    const baseIntensity = Math.min(2.4, 0.18 + (plasmaPower * plasmaPower) / 180000);
    const pulseFactor =
      inputs.operationMode === "pulsed"
        ? 0.82 + 0.18 * Math.sin(t * Math.max(0.1, inputs.pulseRateHz * Math.PI * 2))
        : 1;
    const transitionJitter =
      simulation.systemState === "transition"
        ? 0.65 + Math.sin(t * 11.5) * 0.22
        : 1;
    const offlineFactor = simulation.systemState === "offline" ? 0.12 : 1;

    const focusPlasmaBoost = focusMode === "plasma" ? 1.35 : 1;
    const focusCoilsDim = focusMode === "coils" ? 0.58 : 1;
    const focusNeutronCooling = focusMode === "neutron" ? 0.9 : 1;

    if (plasmaMaterialRef.current) {
      plasmaMaterialRef.current.uniforms.uTime.value = t;
      plasmaMaterialRef.current.uniforms.uIntensity.value =
        baseIntensity * pulseFactor * transitionJitter * offlineFactor * focusPlasmaBoost;
      plasmaMaterialRef.current.uniforms.uOpacity.value = Math.min(
        0.92,
        (0.24 + simulation.lawsonMargin * 0.38) * focusCoilsDim,
      );
      plasmaMaterialRef.current.uniforms.uCore.value = new THREE.Color(palette.core).multiplyScalar(
        focusNeutronCooling,
      );
      plasmaMaterialRef.current.uniforms.uEdge.value = new THREE.Color(palette.edge).multiplyScalar(
        focusNeutronCooling,
      );
    }

    if (vesselEdgesRef.current) {
      (vesselEdgesRef.current.material as THREE.LineBasicMaterial).opacity =
        focusMode === "coils" ? 0.6 : 0.24;
    }
    if (tfCoilsRef.current) {
      tfCoilsRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = focusMode === "coils" ? 0.42 : 0.08;
        material.opacity = focusMode === "neutron" ? 0.42 : 0.72;
      });
    }

    updateNeutrons(neutronState, delta);
    updateAlphas(alphaState, delta);
    if (neutronPointsRef.current) {
      neutronPointsRef.current.geometry.attributes.position.needsUpdate = true;
      const neutronOpacityBase =
        inputs.fuel === "pb11"
          ? 0.04
          : Math.min(0.75, simulation.power.neutronMW / 1200);
      (neutronPointsRef.current.material as THREE.PointsMaterial).opacity =
        focusMode === "plasma" ? 0 : focusMode === "neutron" ? neutronOpacityBase * 1.6 : neutronOpacityBase;
    }
    if (alphaPointsRef.current) {
      alphaPointsRef.current.geometry.attributes.position.needsUpdate = true;
      (alphaPointsRef.current.material as THREE.PointsMaterial).opacity =
        focusMode === "plasma" ? 0.25 : focusMode === "coils" ? 0.08 : 0.16;
    }

    if (!interacting && focusMode === "plasma") {
      const desired = new THREE.Vector3(9, 4.4, 8.2);
      state.camera.position.lerp(desired, 0.025);
      controlsRef.current?.target.lerp(new THREE.Vector3(0, 0.2, 0), 0.05);
      controlsRef.current?.update();
    }
  });

  return (
    <>
      <pointLight
        position={[0, 1.4, 0]}
        intensity={simulation.systemState === "offline" ? 0.4 : 2.9}
        color={palette.edge}
      />
      <pointLight position={[2.5, 0.8, -1.5]} intensity={1.2} color={palette.core} />

      <mesh geometry={vesselGeometry}>
        <meshStandardMaterial
          color="#3f4754"
          metalness={0.65}
          roughness={0.35}
          transparent
          opacity={0.1}
        />
      </mesh>
      <lineSegments ref={vesselEdgesRef} geometry={new THREE.EdgesGeometry(vesselGeometry)}>
        <lineBasicMaterial color="#94a0b2" transparent opacity={0.24} />
      </lineSegments>

      <group ref={tfCoilsRef}>
        {Array.from({ length: 18 }, (_, index) => {
          const angle = (index / 18) * Math.PI * 2;
          return (
            <mesh
              key={`tf-coil-${index}`}
              geometry={tfCoilGeometry}
              position={[
                Math.cos(angle) * MAJOR_RADIUS,
                0,
                Math.sin(angle) * MAJOR_RADIUS,
              ]}
              rotation={[0, angle, 0]}
            >
              <meshStandardMaterial
                color="#87929f"
                metalness={0.78}
                roughness={0.33}
                transparent
                opacity={0.72}
                emissive="#4dd0e1"
                emissiveIntensity={0.08}
              />
            </mesh>
          );
        })}
      </group>

      <group>
        {[-3.6, -2.8, -2.1, 2.1, 2.8, 3.6].map((y, index) => (
          <mesh key={`pf-${index}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[7.1 + (index % 3) * 0.6, 0.13, 20, 120]} />
            <meshStandardMaterial
              color="#717b88"
              metalness={0.72}
              roughness={0.42}
              transparent
              opacity={0.56}
            />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 11.2, 24]} />
        <meshStandardMaterial color="#4d5663" metalness={0.6} roughness={0.5} />
      </mesh>

      <mesh geometry={plasmaGeometry}>
        <primitive
          object={plasmaMaterial}
          attach="material"
          ref={(mat: unknown) => {
            plasmaMaterialRef.current = mat as PlasmaUniformMaterial | null;
          }}
        />
      </mesh>

      <points
        ref={neutronPointsRef}
        geometry={neutronState.geometry}
      >
        <pointsMaterial
          size={0.045}
          color="#ffffff"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </points>
      <points ref={alphaPointsRef} geometry={alphaState.geometry}>
        <pointsMaterial
          size={0.03}
          color="#ffb57d"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </points>
    </>
  );
}

function createToroidalDGeometry(
  majorRadius: number,
  halfWidth: number,
  halfHeight: number,
  bottomPinch: number,
) {
  const profile = createDShape(halfWidth, halfHeight, bottomPinch);
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 181 }, (_, i) => {
      const angle = (i / 180) * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(angle) * majorRadius,
        0,
        Math.sin(angle) * majorRadius,
      );
    }),
    true,
  );

  return new THREE.ExtrudeGeometry(profile, {
    steps: 240,
    bevelEnabled: false,
    extrudePath: curve,
  });
}

function createDCoilGeometry(
  outerW: number,
  outerH: number,
  innerW: number,
  depth: number,
) {
  const outer = createDShape(outerW, outerH, 0.8);
  const inner = createDShape(innerW, outerH - 0.6, 0.55);
  outer.holes.push(inner);
  return new THREE.ExtrudeGeometry(outer, {
    depth,
    bevelEnabled: false,
    curveSegments: 28,
  });
}

function createDShape(width: number, height: number, bottomPinch: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width * 0.92, height * 0.88);
  shape.quadraticCurveTo(width * 0.94, height * 0.8, width, 0);
  shape.quadraticCurveTo(width * 0.94, -height * 0.85, -width * 0.25, -height);
  shape.lineTo(-width * 0.86, -height * bottomPinch);
  shape.quadraticCurveTo(-width * 1.04, 0, -width * 0.92, height * 0.88);
  return shape;
}

function deriveFocusMode(
  selectedFlowKey: string | null,
  selectedNodeId: string | null,
): "default" | "neutron" | "plasma" | "coils" {
  const key = `${selectedFlowKey ?? ""} ${selectedNodeId ?? ""}`.toLowerCase();
  if (key.includes("neutron")) return "neutron";
  if (key.includes("plasma") || key.includes("fusion")) return "plasma";
  if (key.includes("recirc") || key.includes("heating") || key.includes("coils")) return "coils";
  return "default";
}

function createNeutronState(count: number) {
  const positions = new Float32Array(count * 3);
  const origins = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const life = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    respawnNeutron(i, positions, origins, velocities, life);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return { positions, origins, velocities, life, geometry };
}

function respawnNeutron(
  i: number,
  positions: Float32Array,
  origins: Float32Array,
  velocities: Float32Array,
  life: Float32Array,
) {
  const toroidal = Math.random() * Math.PI * 2;
  const poloidal = Math.random() * Math.PI * 2;
  const r = 5.72 + 1.1 * Math.cos(poloidal);
  const x = Math.cos(toroidal) * r;
  const y = Math.sin(poloidal) * 1.3;
  const z = Math.sin(toroidal) * r;
  const dir = new THREE.Vector3(x, y, z).normalize();

  origins[i * 3] = x;
  origins[i * 3 + 1] = y;
  origins[i * 3 + 2] = z;
  positions[i * 3] = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;
  velocities[i * 3] = dir.x * (1.5 + Math.random() * 1.4);
  velocities[i * 3 + 1] = dir.y * (1.5 + Math.random() * 1.4);
  velocities[i * 3 + 2] = dir.z * (1.5 + Math.random() * 1.4);
  life[i] = Math.random() * 2.2;
}

function updateNeutrons(
  state: {
    positions: Float32Array;
    origins: Float32Array;
    velocities: Float32Array;
    life: Float32Array;
  },
  delta: number,
) {
  const count = state.life.length;
  for (let i = 0; i < count; i += 1) {
    state.life[i] += delta;
    if (state.life[i] > 3) {
      respawnNeutron(i, state.positions, state.origins, state.velocities, state.life);
      continue;
    }
    state.positions[i * 3] = state.origins[i * 3] + state.velocities[i * 3] * state.life[i];
    state.positions[i * 3 + 1] = state.origins[i * 3 + 1] + state.velocities[i * 3 + 1] * state.life[i];
    state.positions[i * 3 + 2] = state.origins[i * 3 + 2] + state.velocities[i * 3 + 2] * state.life[i];
  }
}

function createAlphaState(count: number) {
  const positions = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const offset = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    phase[i] = Math.random() * Math.PI * 2;
    offset[i] = (Math.random() - 0.5) * 0.7;
    const p = alphaPosition(phase[i], offset[i]);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return { positions, phase, offset, geometry };
}

function alphaPosition(phase: number, offset: number) {
  const local = phase * 1.7;
  const r = 5.72 + Math.cos(local) * 1.05;
  return {
    x: Math.cos(phase) * r,
    y: Math.sin(local) * 0.95 + offset,
    z: Math.sin(phase) * r,
  };
}

function updateAlphas(
  state: {
    positions: Float32Array;
    phase: Float32Array;
    offset: Float32Array;
  },
  delta: number,
) {
  const count = state.phase.length;
  for (let i = 0; i < count; i += 1) {
    state.phase[i] += delta * (0.65 + (i % 7) * 0.04);
    const p = alphaPosition(state.phase[i], state.offset[i]);
    state.positions[i * 3] = p.x;
    state.positions[i * 3 + 1] = p.y;
    state.positions[i * 3 + 2] = p.z;
  }
}
