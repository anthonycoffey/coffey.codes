'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

interface GateProps {
  scrollProgress: React.RefObject<number>
}

/**
 * Monolith gate that emerges from the center of the wormhole.
 * Scroll 82–88%: scales up from 0.
 * Connect content is surface-mounted on its face via drei <Html>.
 */
export default function Gate({ scrollProgress }: GateProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Positioned on camera lookAt line at scroll 85–100%
  // Camera at t=0.82–1.00: pos (0,6-7,-58-65), lookAt (0,2-3,-72-80)
  // Center sits right on that lookAt trajectory
  const CENTER = useMemo(() => new THREE.Vector3(0, 3, -71), [])

  useFrame(() => {
    if (!groupRef.current) return

    const progress = scrollProgress.current ?? 0

    // Gate emerges at scroll 82%, fully visible by 88%
    const emergeT = smoothstep(Math.max(0, Math.min(1, (progress - 0.82) / 0.06)))

    groupRef.current.position.set(CENTER.x, CENTER.y, CENTER.z)
    groupRef.current.scale.setScalar(emergeT)
  })

  return (
    <group ref={groupRef}>
      {/* Monolith — tall dark slab */}
      <mesh>
        <boxGeometry args={[3, 4.5, 0.2]} />
        <meshStandardMaterial
          color="#0a0a1a"
          metalness={0.9}
          roughness={0.1}
          emissive="#1a1a3a"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Edge glow — thin border */}
      <mesh>
        <boxGeometry args={[3.1, 4.6, 0.15]} />
        <meshStandardMaterial
          color="#4400cc"
          emissive="#6633ff"
          emissiveIntensity={1}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Surface-mounted content on the monolith face */}
      <Html
        transform
        position={[0, 0, 0.15]}
        scale={0.5}
        style={{
          width: '400px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '32px',
            color: '#e8e8ff',
            fontFamily: 'var(--font-outfit), sans-serif',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em',
            }}
          >
            I don&apos;t pitch.
            <br />
            I talk.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'rgba(240, 240, 255, 0.45)',
              textDecoration: 'none',
              letterSpacing: '0.06em',
              transition: 'color 0.25s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0ff' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240, 240, 255, 0.45)' }}
          >
            &rarr;&nbsp; reach out
          </a>
        </div>
      </Html>
    </group>
  )
}
