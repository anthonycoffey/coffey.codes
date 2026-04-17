'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import nowData from '@/data/now.json';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

interface SatelliteProps {
  scrollProgress: React.RefObject<number>;
}

/**
 * Satellite with holographic content panel.
 * Active scroll 0.68–0.82 (camera at planet horizon, looking down-forward).
 *
 * Camera at this zone: pos ~(0, 8, -48), lookAt ~(0, -14, -62)
 * View center ~10 units ahead: approx (0, -1, -54)
 * Satellite parks at (0, -1, -54), enters from right (12, -1, -54).
 *
 * NO rotation — satellite keeps fixed orientation so it's always legible.
 * Gentle y-bob only.
 */
export default function Satellite({ scrollProgress }: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    // Satellite active 68–82%
    if (progress < 0.65 || progress > 0.8) {
      // Park far offscreen
      groupRef.current.position.set(30, -1, -54);
      return;
    }

    // Fly in from right over 68–76%, park at 76%+
    const flyT = smoothstep(Math.min(1, (progress - 0.68) / 0.08));
    const x = lerp(14, 0, flyT);
    const y = -1 + Math.sin(t * 0.5) * 0.15; // gentle hover

    groupRef.current.position.set(x, y, -54);

    // No rotation — always face the same direction (toward camera)
    groupRef.current.rotation.set(0, 0, 0);
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

      {/* Screen on hull face — glowing display */}
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

      {/* Holographic content — real HTML projected forward from screen */}
      {/*<Html
        transform
        position={[2.5, 0, 0.5]}
        scale={1}
        style={{ width: '500px', pointerEvents: 'auto' }}
      >
        <div
          style={{
            background: 'rgba(10, 10, 30, 0.82)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '12px',
            padding: '24px',
            color: '#e8e8ff',
            fontFamily: 'var(--font-outfit), sans-serif',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(240, 240, 255, 0.3)',
              margin: '0 0 16px 0',
            }}
          >
            Right now &mdash;
          </p>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {nowData.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                  fontSize: '0.9rem',
                  color: 'rgba(240, 240, 255, 0.65)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    color: 'rgba(0, 229, 255, 0.4)',
                    flexShrink: 0,
                  }}
                >
                  &rarr;
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </Html>*/}

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
