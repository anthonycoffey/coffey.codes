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
 * Two-phase UFO — camera NEVER follows it.
 *
 * Phase 1 (0.15–0.38): Enters from right, hovers gently in front of camera.
 *   Camera is at z≈-18, UFO at z=-28 — visible mid-distance.
 *
 * Phase 2 (0.38–0.52): Flies straight at camera (z: -28 → -2).
 *   Stays near center-screen (x≈0, slight y offset).
 *   Natural perspective makes it grow dramatically.
 *   At z≈-2 it fills the frame and disappears (snaps behind camera).
 *
 * No camera tracking. No x/y drift during flyby.
 */
export default function UFO({ scrollProgress }: UFOProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    if (progress < 0.15) {
      // Off-screen, waiting
      groupRef.current.position.set(20, 1, -28);
      groupRef.current.rotation.set(0, 0, 0);
      return;
    }

    if (progress < 0.38) {
      // ── Phase 1: Enter + hover ──────────────────────────────
      const enterT = smoothstep(Math.min(1, (progress - 0.15) / 0.1));
      const x = lerp(10, 0.5, enterT); // enters from right → slightly off-center
      const y = 2.5 + Math.sin(t * 0.8) * 0.25;
      groupRef.current.position.set(x, y, -28);
      groupRef.current.rotation.y = t * 0.06; // very slow idle spin
      groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.03;
    } else if (progress < 0.52) {
      // ── Phase 2: Fly directly at camera ─────────────────────
      // z: -28 → -2  (stops just before camera near clip)
      // x/y: barely drifts — UFO stays center-screen
      const flyT = smoothstep((progress - 0.38) / 0.14);
      const z = lerp(-28, -2, flyT);
      const x = lerp(0.5, 0.8, flyT); // tiny drift right — "barely misses"
      const y = lerp(2.5, 2.5, flyT); // slight upward drift — flies "over"
      groupRef.current.position.set(x, y, z);
      groupRef.current.rotation.y = t * 0.4; // faster spin during zoom
      groupRef.current.rotation.z = 0;
    } else {
      // ── Snap behind camera — invisible ──────────────────────
      groupRef.current.position.set(1, 2, 15);
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
