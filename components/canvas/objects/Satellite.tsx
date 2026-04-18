'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SatelliteProps {
  scrollProgress: React.RefObject<number>;
}

/**
 * Satellite — always-visible continuous orbit around the central planet,
 * accompanied by a tumbling rock on a separate orbit higher above the planet.
 *
 * Design notes:
 *   - Both bodies are rendered at ALL scroll positions (including 0.00).
 *     There is no activation gate or hide state; the only input to position
 *     is `clock.getElapsedTime()`, so the scene feels alive from the moment
 *     the canvas mounts.
 *   - Satellite orbit center is pushed to z = -75 so every angle on the
 *     orbit falls within the camera's FOV at both the about-pan camera and
 *     the craft-window camera. No invisible arc.
 *   - Satellite starts at INITIAL_SAT_ANGLE = π/4 (upper-right). With
 *     ORBIT_SPEED = 0.3 rad/s the satellite reaches 12 o'clock ≈ 2.6 s after
 *     page load, aligning the first fly-by with typical time-to-craft scroll.
 *     Subsequent fly-bys repeat every ~21 s.
 *   - Satellite also wobbles on a drifting axis: a gentle Y-axis spin plus
 *     small X and Z sinusoidal tilts make the main rotation axis feel
 *     slightly precessing (like a real de-stabilized satellite).
 *   - The rock orbits the SAME center, plane, and radius as the satellite,
 *     starting π offset so it sits on the opposite side of the orbit. Rock
 *     speed is independent of the satellite (|0.5| rad/s, reverse direction)
 *     so the two bodies drift and occasionally pass each other as they
 *     revolve around their shared orbit.
 *
 * Orbit geometry:
 *   Shared orbit center: (0, -22, -75) — XY plane, radius 26
 *   Satellite: starts at π/4, advances at +0.30 rad/s
 *   Rock:      starts at π/4 + π,   advances at -0.50 rad/s (reverse, faster)
 */

const ORBIT_CENTER = new THREE.Vector3(0, -22, -75);
const ORBIT_RADIUS = 26;
const ORBIT_SPEED = 0.3; // rad/s → full orbit ≈ 21 s
const INITIAL_SAT_ANGLE = Math.PI / 4; // 1-2 o'clock, climbing toward 12

// Satellite attitude wobble: slow Y-axis spin plus X/Z sinusoidal tilts.
// Gives the satellite a "drifting attitude" feel without full tumbling
// (silhouette stays roughly legible on most frames).
const SAT_SPIN_Y = 0.1; // yaw spin rad/s (1 rev / ~63 s)
const SAT_WOBBLE_X_AMP = 0.14; // pitch wobble amplitude (rad, ~8°)
const SAT_WOBBLE_Z_AMP = 0.09; // roll wobble amplitude (rad, ~5°)
const SAT_WOBBLE_X_RATE = 0.4; // pitch wobble oscillation rate
const SAT_WOBBLE_Z_RATE = 0.3; // roll wobble oscillation rate (slightly
// different from pitch so the two combine into a non-repeating wobble)

// Rock orbit: shares the SAME center, plane (XY), and radius as the
// satellite. Starts π offset so it sits on the opposite side of the orbit
// (nearly opposite the thing they're both orbiting). Rock speed is
// independent (faster + reverse direction) so the two bodies drift and pass
// each other over time, adding motion without locking in rigid symmetry.
const ROCK_ANGLE_SPEED = -0.5; // rad/s, negative = reverse direction, faster
const ROCK_INITIAL_ANGLE = INITIAL_SAT_ANGLE + Math.PI; // opposite of sat's starting angle
const ROCK_TUMBLE_X = 0.7; // rad/s
const ROCK_TUMBLE_Y = 1.3;
const ROCK_TUMBLE_Z = 0.5;

export default function Satellite({ scrollProgress: _scrollProgress }: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rockRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // ── Satellite: XY-plane orbit ───────────────────────────────
    const satAngle = INITIAL_SAT_ANGLE + t * ORBIT_SPEED;
    groupRef.current.position.set(
      ORBIT_CENTER.x + ORBIT_RADIUS * Math.cos(satAngle),
      ORBIT_CENTER.y + ORBIT_RADIUS * Math.sin(satAngle),
      ORBIT_CENTER.z,
    );
    // Wobbling-axis attitude: slow Y spin + small sinusoidal pitch/roll.
    groupRef.current.rotation.set(
      Math.sin(t * SAT_WOBBLE_X_RATE) * SAT_WOBBLE_X_AMP,
      t * SAT_SPIN_Y,
      Math.cos(t * SAT_WOBBLE_Z_RATE) * SAT_WOBBLE_Z_AMP,
    );

    // ── Rock: same orbit as sat, opposite side, independent speed & direction ─
    if (rockRef.current) {
      const rockAngle = ROCK_INITIAL_ANGLE + t * ROCK_ANGLE_SPEED;
      rockRef.current.position.set(
        ORBIT_CENTER.x + ORBIT_RADIUS * Math.cos(rockAngle),
        ORBIT_CENTER.y + ORBIT_RADIUS * Math.sin(rockAngle),
        ORBIT_CENTER.z,
      );
      // Multi-axis tumble at independent rates for a chaotic rock feel.
      rockRef.current.rotation.set(
        t * ROCK_TUMBLE_X,
        t * ROCK_TUMBLE_Y,
        t * ROCK_TUMBLE_Z,
      );
    }
  });

  return (
    <>
    <group ref={groupRef} scale={4}>
      {/* Satellite body */}
      <mesh>
        <boxGeometry args={[1, 0.5, 0.5]} />
        <meshStandardMaterial color="#3a3a5a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Solar panel — left */}
      <mesh position={[-1.5, 0, 0]}>
        <planeGeometry args={[2, 0.8]} />
        <meshStandardMaterial
          color="#1a1a44"
          metalness={0.6}
          roughness={0.3}
          emissive="#111133"
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Solar panel — right */}
      <mesh position={[1.5, 0, 0]}>
        <planeGeometry args={[2, 0.8]} />
        <meshStandardMaterial
          color="#1a1a44"
          metalness={0.6}
          roughness={0.3}
          emissive="#111133"
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Screen on hull face */}
      <mesh position={[0, 0, 0.26]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Satellite light */}
      <pointLight
        position={[0, 0, 1]}
        color="#00e5ff"
        intensity={3}
        distance={10}
      />
    </group>

    {/* Tumbling rock on perpendicular orbit — roughly opposite the
        satellite at all times. Position and rotation driven from the same
        useFrame loop as the satellite above. */}
    <mesh ref={rockRef}>
      <icosahedronGeometry args={[1.5, 0]} />
      <meshStandardMaterial
        color="#9C9C9C"
        roughness={0.95}
        metalness={0.05}
      />
    </mesh>
    </>
  );
}
