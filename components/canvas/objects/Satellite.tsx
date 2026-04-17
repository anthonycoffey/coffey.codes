'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SatelliteProps {
  scrollProgress: React.RefObject<number>;
}

/**
 * Satellite — scroll-locked orbit start, time-driven thereafter.
 *
 * Orbit plane: XY (vertical from camera's perspective).
 * Planet center: (0, -22, -42), orbit radius 26 (just outside planet surface).
 *
 * Trigger: when scroll first crosses 0.50, the satellite snaps to exactly
 * 3 o'clock (right side of planet) and begins orbiting counterclockwise.
 * Elapsed time is measured FROM the trigger moment, not from page load —
 * so the satellite always starts at the same position relative to scroll.
 *
 *   3 o'clock → 12 o'clock (top) → 9 o'clock (left) → ...
 *
 * Full orbit: ~30 seconds at 0.21 rad/s.
 * No rotation — fixed orientation so it's always legible.
 */

const PLANET_CENTER = new THREE.Vector3(0, -22, -42);
const ORBIT_RADIUS = 26;
const ORBIT_SPEED = 0.21; // rad/s → full orbit ≈ 30 s

export default function Satellite({ scrollProgress }: SatelliteProps) {
  const groupRef      = useRef<THREE.Group>(null);
  const activatedRef  = useRef(false);
  const activateTime  = useRef(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    if (progress < 0.50) {
      // Hidden below planet — out of camera view, activation reset
      activatedRef.current = false;
      groupRef.current.position.set(0, -80, -42);
      return;
    }

    // Lock the start moment the first time scroll crosses 0.50
    if (!activatedRef.current) {
      activatedRef.current = true;
      activateTime.current = t;
    }

    // Angle 0 = 3 o'clock (right), increases counterclockwise:
    //   π/2 → 12 o'clock (top)
    //   π   → 9 o'clock (left)
    const elapsed = t - activateTime.current;
    const angle = elapsed * ORBIT_SPEED;

    const x = PLANET_CENTER.x + ORBIT_RADIUS * Math.cos(angle);
    const y = PLANET_CENTER.y + ORBIT_RADIUS * Math.sin(angle);
    const z = PLANET_CENTER.z;

    groupRef.current.position.set(x, y, z);
    groupRef.current.rotation.set(0, 0, 0); // fixed orientation always
  });

  return (
    <group ref={groupRef}>
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
  );
}
