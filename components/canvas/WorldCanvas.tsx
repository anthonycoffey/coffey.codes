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
import Gate from './objects/Gate';

// ── Constants ──────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 2000;
const MERKABA_RADIUS = 1.6;
const LERP_SPEED = 0.04;

// Star field spread — wide volume along the camera travel path
const STAR_SPREAD_XY = 50;
const STAR_SPREAD_Z_MIN = -10;
const STAR_SPREAD_Z_MAX = -100;

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

    // ── Formation factor — disperses immediately as user scrolls ──
    // progress=0 → formFactor=1 (full Merkaba)
    // progress=0.15 → formFactor=0 (full star field)
    const formFactor = progress < 0.15 ? 1 - smoothstep(progress / 0.15) : 0;

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

    // ── Rotation — constant slow idle while Merkaba, stops once stars ──
    const rotationSpeed = formFactor > 0.01 ? 0.08 : 0;
    pointsRef.current.rotation.y = t * rotationSpeed;
    pointsRef.current.rotation.x = t * rotationSpeed * 0.4;
  });

  console.log(currentPositions.current);

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
        opacity={0.6}
        sizeAttenuation
      />
    </points>
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
        <ParticleSystem scrollProgress={scrollProgress} />
        <UFO scrollProgress={scrollProgress} />
        <Planet scrollProgress={scrollProgress} />
        <Satellite scrollProgress={scrollProgress} />
        <Wormhole scrollProgress={scrollProgress} />
        <Gate scrollProgress={scrollProgress} />

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
