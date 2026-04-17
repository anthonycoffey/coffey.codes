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
import Galaxy from './objects/Galaxy';
import Spaceship from './objects/Spaceship';

// ── Constants ────────────────────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 2000;
const MERKABA_RADIUS = 1.6;

// Dispersal: how far each particle drifts outward before being fully faded.
// Keep > a few units so the explosion clearly moves off-center, but small
// enough that nothing survives past the end of the animation window.
const DISPERSE_DISTANCE = 10;

// Background star field — static, always visible (the ONLY source of stars).
const BG_STAR_COUNT = 1500;
const BG_STAR_Z_MIN = -65;
const BG_STAR_Z_MAX = -180;
const BG_STAR_POSITIONS = (() => {
  const arr = new Float32Array(BG_STAR_COUNT * 3);
  for (let i = 0; i < BG_STAR_COUNT; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 160;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 160;
    arr[i * 3 + 2] =
      BG_STAR_Z_MIN + Math.random() * (BG_STAR_Z_MAX - BG_STAR_Z_MIN);
  }
  return arr;
})();

// ── Pre-computed geometry data (computed once at module load) ──────────
const MERKABA_POSITIONS = sampleMerkaba(MERKABA_RADIUS, PARTICLE_COUNT);

// Per-particle outward explosion direction (uniform on the unit sphere)
// and a speed multiplier for natural variation.
const DISPERSE_DIRECTIONS = new Float32Array(PARTICLE_COUNT * 3);
const DISPERSE_SPEEDS = new Float32Array(PARTICLE_COUNT);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const sinPhi = Math.sin(phi);
  DISPERSE_DIRECTIONS[i * 3] = sinPhi * Math.cos(theta);
  DISPERSE_DIRECTIONS[i * 3 + 1] = sinPhi * Math.sin(theta);
  DISPERSE_DIRECTIONS[i * 3 + 2] = Math.cos(phi);
  DISPERSE_SPEEDS[i] = 0.6 + Math.random() * 1.2; // 0.6× – 1.8×
}

// ── Colors ───────────────────────────────────────────────────────────────────────────────
const COLOR_GREEN = '#39FF49';

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
  // Working buffer — starts in Merkaba formation. Mutated per frame in place.
  const currentPositions = useRef(new Float32Array(MERKABA_POSITIONS));

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    // Dispersal factor: 0 while formed, 1 once fully exploded.
    // Driven purely by scroll — no per-frame lerp, so position is a pure
    // function of scroll progress (reversible, no catch-up lag).
    const disperse = progress < 0.25 ? smoothstep(progress / 0.25) : 1;

    // Fully dispersed → hide the whole <points> object. three.js skips
    // drawing it entirely, so there is no chance of stray particles
    // re-appearing as the camera dollies forward later in the scroll.
    if (disperse >= 1) {
      pointsRef.current.visible = false;
      return;
    }
    pointsRef.current.visible = true;

    // ── Positions: each particle = merkaba origin + outward drift ───
    const drift = disperse * DISPERSE_DISTANCE;
    const buf = currentPositions.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const speed = DISPERSE_SPEEDS[i];
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;
      buf[ix] = MERKABA_POSITIONS[ix] + DISPERSE_DIRECTIONS[ix] * drift * speed;
      buf[iy] = MERKABA_POSITIONS[iy] + DISPERSE_DIRECTIONS[iy] * drift * speed;
      buf[iz] = MERKABA_POSITIONS[iz] + DISPERSE_DIRECTIONS[iz] * drift * speed;
    }

    const geo = pointsRef.current.geometry;
    (geo.attributes.position as THREE.BufferAttribute).array = buf;
    geo.attributes.position.needsUpdate = true;

    // ── Opacity: fade from 0.75 → 0 across the dispersal window ───
    // Tuning note: if the explosion feels too abrupt, shift the opacity
    // curve from (1 - disperse) to (1 - disperse)² so it holds brightness
    // during the initial outward motion and then snaps dark near the end.
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = (1 - disperse) * 0.75;

    // ── Rotation: spin while formed; stop once exploded ────────
    pointsRef.current.rotation.y = t * 0.08 * (1 - disperse);
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
        color={COLOR_GREEN}
        transparent
        opacity={0.75}
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
        <Galaxy scrollProgress={scrollProgress} />
        <Spaceship scrollProgress={scrollProgress} />

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
