'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PlanetProps {
  scrollProgress: React.RefObject<number>
}

/**
 * Large planet with atmospheric Fresnel glow.
 * Positioned below the camera path, revealed as camera tilts down (scroll 35–55%).
 * Eclipse lighting comes from a directional light behind the planet.
 */
export default function Planet({ scrollProgress }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const eclipseLightRef = useRef<THREE.PointLight>(null)

  // Slow rotation
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.02

    // Eclipse light intensity ramps up as we enter the planet zone
    if (eclipseLightRef.current) {
      const progress = scrollProgress.current ?? 0
      const localT = Math.max(0, Math.min(1, (progress - 0.35) / 0.2))
      eclipseLightRef.current.intensity = localT * 8
    }
  })

  // Simple procedural surface color via vertex colors
  const surfaceColor = useMemo(() => '#1a2a4a', [])
  const atmosphereColor = useMemo(() => '#4488ff', [])

  return (
    // Positioned so top arc appears at bottom ~1/3 of frame.
    // Camera at t=0.52 is (0,3,-28) looking at (0,-5,-55) — gentle downward tilt.
    // Planet moved lower+further vs. old steep-camera position.
    <group ref={groupRef} position={[0, -30, -50]}>
      {/* Planet surface */}
      <mesh>
        <sphereGeometry args={[20, 64, 64]} />
        <meshStandardMaterial
          color={surfaceColor}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere — slightly larger, Fresnel-like glow via emissive + transparency */}
      <mesh>
        <sphereGeometry args={[20.3, 32, 32]} />
        <meshStandardMaterial
          color={atmosphereColor}
          transparent
          opacity={0.08}
          emissive={atmosphereColor}
          emissiveIntensity={0.5}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Eclipse light — behind the planet, creates rim glow */}
      <pointLight
        ref={eclipseLightRef}
        position={[0, 5, -25]}
        color="#ffcc44"
        intensity={0}
        distance={80}
      />

      {/* Rim light — gives the planet edge a visible glow */}
      <pointLight
        position={[0, 22, -5]}
        color="#ffffff"
        intensity={3}
        distance={30}
      />
    </group>
  )
}
