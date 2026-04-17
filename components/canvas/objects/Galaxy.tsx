'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const GALAXY_COUNT = 3000;

interface GalaxyProps {
  scrollProgress: React.RefObject<number>;
}

/**
 * Galaxy — replaces the old Galaxy vortex.
 *
 * A spiral-arm disc galaxy that flies toward the camera during scroll 0.75–1.00.
 * By scroll ~0.95 it fills the viewport (~41° angular half-width > 35° FOV half).
 *
 * Geometry:
 *   - 3000 disc particles with two spiral arms using exponential radius distribution
 *   - Tilted 36° on X axis for depth and drama
 *   - Glowing yellow-white core sphere
 *   - 3 low-poly icosahedron planets at fixed positions in the disc
 *   - Point light at center illuminates the planets
 *
 * Motion:
 *   - scroll < 0.75: parked at z=-220 (invisible)
 *   - scroll 0.75–0.95: z lerps from -220 → -70 (rushes toward camera)
 *   - scroll > 0.95: z continues to -65 (fully close)
 *   - Constant slow Y-axis spin (time-based)
 *   - Disc particle opacity fades in as galaxy enters frame
 */

// Pre-compute spiral galaxy particle positions (module level — computed once)
const GALAXY_POSITIONS = (() => {
  const arr = new Float32Array(GALAXY_COUNT * 3);
  for (let i = 0; i < GALAXY_COUNT; i++) {
    const arm = i % 2; // two arms, 180° apart
    // Exponential radius distribution — dense core, long sparse arms
    const r = Math.min(28, -Math.log(Math.random() + 0.001) * 5.5);
    const armOffset = arm * Math.PI;
    // Spiral: angle grows with radius (tighter at center, opening outward)
    const theta = r * 0.42 + armOffset + (Math.random() - 0.5) * 0.85;
    // Lateral scatter increases with radius (spiral arms widen outward)
    const scatter = (1 - Math.exp(-r * 0.12)) * 2.5;
    arr[i * 3] = r * Math.cos(theta) + (Math.random() - 0.5) * scatter;
    arr[i * 3 + 1] = (Math.random() - 0.5) * Math.max(0.15, 0.7 - r * 0.022); // thin disc
    arr[i * 3 + 2] = r * Math.sin(theta) + (Math.random() - 0.5) * scatter;
  }
  return arr;
})();

export default function Galaxy({ scrollProgress }: GalaxyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !pointsRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    // ── Z position: galaxy approaches camera on scroll 0.75–0.95 ──
    let groupZ: number;
    if (progress < 0.75) {
      groupZ = -220;
    } else if (progress < 0.95) {
      groupZ = lerp(-220, -70, smoothstep((progress - 0.75) / 0.2));
    } else {
      groupZ = lerp(-70, -65, smoothstep((progress - 0.95) / 0.05));
    }

    groupRef.current.position.z = groupZ;

    // ── Constant slow Y-axis spin ──────────────────────────────────
    groupRef.current.rotation.y = t * 0.04;

    // ── Particle opacity: always fully visible ─────────────────────
    (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.85;
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 5, 0, 0]}>
      {/* Spiral disc particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[GALAXY_POSITIONS, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ffe8aa"
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>

      {/* Galactic core — glowing sun */}
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color="#fff8cc"
          emissive="#ffdd44"
          emissiveIntensity={6}
        />
      </mesh>

      {/* Planet 1 — blue-grey */}
      <mesh position={[8, 0.3, 3]}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#4466aa"
          emissive="#223366"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Planet 2 — red-brown */}
      <mesh position={[-12, -0.5, 6]}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color="#aa5533"
          emissive="#552211"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Planet 3 — purple */}
      <mesh position={[5, 0.2, -16]}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#6633aa"
          emissive="#331155"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Center light — illuminates planets */}
      <pointLight color="#ffeeaa" intensity={20} distance={30} />
    </group>
  );
}
