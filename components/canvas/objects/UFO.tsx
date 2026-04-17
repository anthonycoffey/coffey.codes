'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

interface UFOProps {
  scrollProgress: React.RefObject<number>;
}

/**
 * S-curve UFO flyby — camera NEVER follows it.
 *
 * Phase 1 (0.15–0.38): Enters from far right (+X), settles left of content center (-X).
 *   Hovers gently with a y-bob and slow idle spin.
 *
 * Phase 2 (0.38–0.52): Diagonal flyby sweep — moves from left (-X) to right (+X)
 *   while flying toward and PAST the camera (z goes positive = behind camera).
 *   UFO rises above the camera so the underside is visible from below.
 *   Y bob fades out smoothly at phase boundary (no jump).
 *
 * After 0.52: Parked behind+above camera, invisible.
 */
export default function UFO({ scrollProgress }: UFOProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    if (progress < 0.15) {
      // Far off-screen right — not yet visible
      groupRef.current.position.set(80, 0, -22);
      groupRef.current.rotation.set(0, 0, 0);
      return;
    }

    if (progress < 0.38) {
      // ── Phase 1: Enter from right → settle left of center ──────────────
      // Enters at x=14, settles at x=-2 (left of content)
      const enterT = smoothstep(Math.min(1, (progress - 0.15) / 0.12));
      const x = lerp(14, -2, enterT);
      const y = 3.8 + Math.sin(t * 0.8) * 0.25;
      groupRef.current.position.set(x, y, -22);
      groupRef.current.rotation.y = t * 0.06;
      groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.03;
    } else if (progress < 0.52) {
      // ── Phase 2: Diagonal flyby — left→right while shooting past camera ─
      const flyT = smoothstep((progress - 0.38) / 0.14);

      // Y continuity: bob preserved at flyT=0, fades out during flyby
      const yBob = 3.8 + Math.sin(t * 0.8) * 0.25 * (1 - flyT);
      const x = lerp(-2, 9, flyT); // sweeps right across screen
      const y = lerp(yBob, 6, flyT); // rises above camera (camera y≈2-3 here)
      const z = lerp(-22, 12, flyT); // shoots past camera into positive Z
      groupRef.current.position.set(x, y, z);
      groupRef.current.rotation.y = t * 0.5; // faster spin during zoom
      groupRef.current.rotation.z = 0;
    } else {
      // ── Parked behind + above camera — invisible ─────────────────────────
      groupRef.current.position.set(12, 8, 20);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body — octagonal cylinder */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.8, 0.2, 8]} />
        <meshStandardMaterial color="#444466" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Dome */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.3, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#555577" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.05, 6, 16]} />
        <meshStandardMaterial color="#555577" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Lights */}
      <pointLight
        position={[0.5, -0.1, 0.5]}
        color="#00e5ff"
        intensity={2}
        distance={5}
      />
      <pointLight
        position={[-0.5, -0.1, -0.5]}
        color="#00ff88"
        intensity={2}
        distance={5}
      />
      <pointLight
        position={[0, -0.2, 0]}
        color="#8b5cf6"
        intensity={1}
        distance={3}
      />
    </group>
  );
}
