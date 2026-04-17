'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VORTEX_COUNT = 500

interface WormholeProps {
  scrollProgress: React.RefObject<number>
}

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

/**
 * Swirling particle vortex that opens during scroll 78–100%.
 * Particles orbit a center point with sinusoidal paths.
 * Deep violet → electric blue gradient. Bloom makes it glow.
 */
export default function Wormhole({ scrollProgress }: WormholeProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const positions = useRef(new Float32Array(VORTEX_COUNT * 3))

  // Pre-compute random phase offsets for organic swirl
  const phases = useMemo(() => {
    const arr = new Float32Array(VORTEX_COUNT)
    for (let i = 0; i < VORTEX_COUNT; i++) {
      arr[i] = Math.random() * Math.PI * 2
    }
    return arr
  }, [])

  const radii = useMemo(() => {
    const arr = new Float32Array(VORTEX_COUNT)
    for (let i = 0; i < VORTEX_COUNT; i++) {
      arr[i] = 0.3 + Math.random() * 3
    }
    return arr
  }, [])

  // Wormhole center — matches Gate CENTER exactly
  const CENTER = useMemo(() => new THREE.Vector3(0, 3, -71), [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return

    const progress = scrollProgress.current ?? 0
    const t = clock.getElapsedTime()

    // Wormhole opens at scroll 78%, stabilizes by 85%
    const openT = smoothstep(Math.max(0, Math.min(1, (progress - 0.78) / 0.07)))

    const buf = positions.current
    for (let i = 0; i < VORTEX_COUNT; i++) {
      const phase = phases[i]
      const baseRadius = radii[i]
      const radius = baseRadius * openT
      const speed = 1.5 - baseRadius * 0.3 // inner particles orbit faster
      const angle = t * speed + phase

      buf[i * 3]     = CENTER.x + Math.cos(angle) * radius
      buf[i * 3 + 1] = CENTER.y + Math.sin(angle) * radius
      buf[i * 3 + 2] = CENTER.z + Math.sin(angle * 0.5 + phase) * 0.5 * openT
    }

    const geo = pointsRef.current.geometry
    ;(geo.attributes.position as THREE.BufferAttribute).array = buf
    geo.attributes.position.needsUpdate = true

    // Fade in opacity with opening
    ;(pointsRef.current.material as THREE.PointsMaterial).opacity = openT * 0.7
  })

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
          size={0.04}
          color="#7733ff"
          transparent
          opacity={0}
          sizeAttenuation
        />
      </points>

      {/* Core glow — emissive sphere at center */}
      <mesh position={CENTER.toArray()}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#4400cc"
          emissive="#6633ff"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Wormhole light */}
      <pointLight
        position={CENTER.toArray()}
        color="#7733ff"
        intensity={5}
        distance={20}
      />
    </>
  )
}
