'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

// ── Camera keyframes ───────────────────────────────────────────────────────
//
// Core principle: camera NEVER chases objects. It moves on its own
// predetermined cinematic path. Objects enter/exit the frame.
//
// Planet is at (0, -22, -42), radius 20.
// At t=0.52 (pos y=3, lookAt y=-5), the planet top arc sits at bottom ~1/3.
// At t=0.52→0.68 the camera barely moves → planet holds in frame.
// At t=0.82→1.00 lookAt y rises from -5 back to +2 → pans up to gate.
//
const KEYFRAMES = [
  // t    pos                lookAt
  { t: 0.00, pos: [0, 0,  4] as const, lookAt: [0,  0,   0] as const }, // Merkaba
  { t: 0.15, pos: [0, 0,  4] as const, lookAt: [0,  0, -25] as const }, // Stars, straight ahead
  { t: 0.40, pos: [0, 2, -18] as const, lookAt: [0,  0, -45] as const }, // UFO hover — gentle dolly, still forward
  { t: 0.52, pos: [0, 3, -28] as const, lookAt: [0, -5, -55] as const }, // After UFO — subtle tilt, planet arc appears
  { t: 0.68, pos: [0, 3, -38] as const, lookAt: [0, -5, -62] as const }, // HOLD — craft + satellite (planet stays in frame)
  { t: 0.82, pos: [0, 3, -48] as const, lookAt: [0,  2, -68] as const }, // Pan UP — gate incoming
  { t: 1.00, pos: [0, 2, -56] as const, lookAt: [0,  2, -76] as const }, // Gate center-frame
]

const KF_POS  = KEYFRAMES.map(k => new THREE.Vector3(...k.pos))
const KF_LOOK = KEYFRAMES.map(k => new THREE.Vector3(...k.lookAt))

interface CameraRigProps {
  scrollProgress: React.RefObject<number>
}

export default function CameraRig({ scrollProgress }: CameraRigProps) {
  const { camera } = useThree()
  const mouseRef   = useRef({ x: 0, y: 0 })
  const targetPos  = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3())

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    const progress = scrollProgress.current ?? 0

    // Find surrounding keyframe pair
    let a = KEYFRAMES.length - 2
    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
      if (progress <= KEYFRAMES[i + 1].t) { a = i; break }
    }
    const b = Math.min(a + 1, KEYFRAMES.length - 1)

    const segStart = KEYFRAMES[a].t
    const segEnd   = KEYFRAMES[b].t
    const segRange = segEnd - segStart
    const localT   = segRange > 0 ? smoothstep((progress - segStart) / segRange) : 0

    targetPos.current.lerpVectors(KF_POS[a], KF_POS[b], localT)
    targetLook.current.lerpVectors(KF_LOOK[a], KF_LOOK[b], localT)

    // Reduced mouse parallax — keeps the cinematic feel stable
    const parallaxX = mouseRef.current.x * 0.15
    const parallaxY = mouseRef.current.y * 0.08

    camera.position.lerp(
      targetPos.current.clone().add(new THREE.Vector3(parallaxX, parallaxY, 0)),
      0.05, // slower lerp = smoother feeling
    )
    camera.lookAt(targetLook.current)
  })

  return null
}
