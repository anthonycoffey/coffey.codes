'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VORTEX_COUNT = 2000;

interface WormholeProps {
  scrollProgress: React.RefObject<number>;
}

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/**
 * Swirling particle vortex that opens during scroll 78–100%.
 * Particles orbit a center point with sinusoidal paths.
 * Deep violet → electric blue gradient. Bloom makes it glow.
 */
export default function Wormhole({ scrollProgress }: WormholeProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useRef(new Float32Array(VORTEX_COUNT * 3));

  // Pre-compute random phase offsets for organic swirl
  const phases = useMemo(() => {
    const arr = new Float32Array(VORTEX_COUNT);
    for (let i = 0; i < VORTEX_COUNT; i++) {
      arr[i] = Math.random() * Math.PI * 100;
    }
    return arr;
  }, []);

  const radii = useMemo(() => {
    const arr = new Float32Array(VORTEX_COUNT);
    for (let i = 0; i < VORTEX_COUNT; i++) {
      arr[i] = 1.5 + Math.random() * 15 * 2;
    }
    return arr;
  }, []);

  // Wormhole center — matches Gate CENTER exactly
  const CENTER = useMemo(() => new THREE.Vector3(0, 2, -65), []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    // Wormhole opens at scroll 78%, stabilizes by 85%
    const openT = smoothstep(Math.max(0, Math.min(1, (progress - 0.92) / 0.3)));

    const buf = positions.current;
    for (let i = 0; i < VORTEX_COUNT; i++) {
      const phase = phases[i];
      const baseRadius = radii[i];
      const radius = baseRadius * openT;
      const speed = 1.5 - baseRadius * 0.05; // inner particles orbit faster
      const angle = t * speed + phase;

      buf[i * 3] = CENTER.x + Math.cos(angle) * radius;
      buf[i * 3 + 1] = CENTER.y + Math.sin(angle) * radius;
      buf[i * 3 + 2] = CENTER.z + Math.sin(angle * 0.5 + phase) * 0.5 * openT;
    }

    const geo = pointsRef.current.geometry;
    (geo.attributes.position as THREE.BufferAttribute).array = buf;
    geo.attributes.position.needsUpdate = true;

    // Fade in opacity with opening
    (pointsRef.current.material as THREE.PointsMaterial).opacity = openT * 0.9;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions.current, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#D3AF37"
          transparent
          sizeAttenuation
        />
      </points>
      {/* Core glow — emissive sphere at center */}
      {/*<mesh position={[0, 2.5, -65]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#4400cc"
          emissive="#6633ff"
          emissiveIntensity={20}
          transparent
          opacity={0.5}
        />
      </mesh>*/}
      {/* Wormhole light */}
      <pointLight position={CENTER.toArray()} color="#7733ff" intensity={100} />
    </>
  );
}
