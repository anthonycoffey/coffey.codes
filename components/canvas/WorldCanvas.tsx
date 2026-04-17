'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sampleMerkaba } from '@/utils/merkaba';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import CameraRig from './CameraRig';
import UFO from './objects/UFO';
import Planet from './objects/Planet';
import Satellite from './objects/Satellite';
import Wormhole from './objects/Wormhole';

// ── Constants ──────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 2000;
const MERKABA_RADIUS = 1.6;
const LERP_SPEED = 0.04;

// Star field spread — always ahead of camera (camera max z = -56)
const STAR_SPREAD_XY = 80;
const STAR_SPREAD_Z_MIN = -65;
const STAR_SPREAD_Z_MAX = -180;

// Background star field — static, always visible
const BG_STAR_COUNT = 1500;
const BG_STAR_POSITIONS = (() => {
  const arr = new Float32Array(BG_STAR_COUNT * 3);
  for (let i = 0; i < BG_STAR_COUNT; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 160;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 160;
    arr[i * 3 + 2] =
      STAR_SPREAD_Z_MIN +
      Math.random() * (STAR_SPREAD_Z_MAX - STAR_SPREAD_Z_MIN);
  }
  return arr;
})();

// ── Pre-computed geometry data (computed once at module load) ──────────────
const MERKABA_POSITIONS = sampleMerkaba(MERKABA_RADIUS, PARTICLE_COUNT);

const STAR_POSITIONS = (() => {
  const arr = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    arr[i * 3] = (Math.random() - 0.5) * STAR_SPREAD_XY;
    arr[i * 3 + 1] = (Math.random() - 0.5) * STAR_SPREAD_XY;
    arr[i * 3 + 2] =
      STAR_SPREAD_Z_MIN +
      Math.random() * (STAR_SPREAD_Z_MAX - STAR_SPREAD_Z_MIN);
  }
  return arr;
})();

// Start in Merkaba formation
const INITIAL_POSITIONS = new Float32Array(MERKABA_POSITIONS);

// ── Colors ─────────────────────────────────────────────────────────────────
const COLOR_GOLD = new THREE.Color('#f59e0b');
const COLOR_WHITE = new THREE.Color('#e8e8ff');

// ── Helpers ────────────────────────────────────────────────────────────────
function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ── Particle system — Merkaba → Stars ─────────────────────────────────────
interface ParticleSystemProps {
  scrollProgress: React.RefObject<number>;
}

function ParticleSystem({ scrollProgress }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const currentPositions = useRef(new Float32Array(INITIAL_POSITIONS));

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    // ── Formation factor — holds until 10%, disperses 10–25% ──
    // progress < 0.10 → formFactor = 1 (full Merkaba)
    // progress 0.10–0.25 → formFactor 1→0 (dispersing)
    // progress > 0.25 → formFactor = 0 (full star field)
    const formFactor =
      progress < 0.1
        ? 1
        : progress < 0.25
          ? 1 - smoothstep((progress - 0.1) / 0.15)
          : 0;

    // ── Lerp positions toward target ──────────────────────────
    const buf = currentPositions.current;
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      const target =
        MERKABA_POSITIONS[i] * formFactor +
        STAR_POSITIONS[i] * (1 - formFactor);
      buf[i] += (target - buf[i]) * LERP_SPEED;
    }

    const geo = pointsRef.current.geometry;
    (geo.attributes.position as THREE.BufferAttribute).array = buf;
    geo.attributes.position.needsUpdate = true;

    // ── Color: gold during formation → white as stars ─────────
    const colorT = smoothstep(1 - formFactor);
    const blended = COLOR_GOLD.clone().lerp(COLOR_WHITE, colorT);
    (pointsRef.current.material as THREE.PointsMaterial).color.copy(blended);

    // ── Opacity: crossfades with background star layer ─────────
    // Merkaba layer fades out (0.7→0) while background star layer takes over
    const opacity = formFactor > 0.01 ? formFactor * 0.7 : 0.6;
    (pointsRef.current.material as THREE.PointsMaterial).opacity = opacity;

    // ── Rotation — perfectly upright Y-axis spin (like a top) ──
    // X and Z rotations are always 0 so the Merkaba stays upright.
    // The cross-section reveals itself naturally as it spins on Y.
    const rotationSpeed = formFactor > 0.01 ? 0.08 : 0;
    pointsRef.current.rotation.y = t * rotationSpeed;
    pointsRef.current.rotation.x = 0;
    pointsRef.current.rotation.z = 0;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[currentPositions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.013}
        color="#f59e0b"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// ── FlybyOrb — time-based sphere flyby triggered at 75% scroll ────────────
interface FlybyOrbProps {
  scrollProgress: React.RefObject<number>;
}

function FlybyOrb({ scrollProgress }: FlybyOrbProps) {
  const groupRef = useRef<THREE.Group>(null);
  const triggered = useRef(false);
  const triggerTime = useRef(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    if (progress < 0.74) {
      groupRef.current.position.set(50, 0, -80);
      triggered.current = false;
      return;
    }

    if (!triggered.current) {
      triggered.current = true;
      triggerTime.current = t;
    }

    const elapsed = t - triggerTime.current;
    const flyT = Math.min(1, elapsed / 10); // 10-second flyby

    const x = lerp(10, -14, flyT);
    const y = lerp(2, -1, flyT);
    const z = lerp(-100, -55, flyT);
    groupRef.current.position.set(x, y, z);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color="#ff88cc"
          emissive="#ff55bb"
          emissiveIntensity={4}
        />
      </mesh>
      <pointLight color="#ff88cc" intensity={6} distance={12} />
    </group>
  );
}

// ── WorldCanvas — full-viewport canvas, IS the visual experience ──────────
interface WorldCanvasProps {
  scrollProgress: React.RefObject<number>;
}

export default function WorldCanvas({ scrollProgress }: WorldCanvasProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 70 }}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
        frameloop="always"
      >
        {/* Lighting — ambient base + directional sun from upper-left */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1.2}
          color="#ffe8cc"
        />

        <CameraRig scrollProgress={scrollProgress} />

        {/* Static background star field — always visible, never animated */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[BG_STAR_POSITIONS, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.007}
            color="#ddeeff"
            transparent
            opacity={0.3}
            sizeAttenuation
          />
        </points>

        <ParticleSystem scrollProgress={scrollProgress} />
        <UFO scrollProgress={scrollProgress} />
        <Planet scrollProgress={scrollProgress} />
        <Satellite scrollProgress={scrollProgress} />
        <Wormhole scrollProgress={scrollProgress} />
        <FlybyOrb scrollProgress={scrollProgress} />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.8}
            luminanceSmoothing={0.3}
            intensity={1.5}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
