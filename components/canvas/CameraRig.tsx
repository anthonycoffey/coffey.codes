'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// ── Camera keyframes ───────────────────────────────────────────────────────
//
// Core principle: camera NEVER chases objects. It moves on its own
// predetermined cinematic path. Objects enter/exit the frame.
// Mouse parallax is intentionally absent — pure cinematic rail.
//
// Planet is at (0, -22, -42), radius 20.
// Galaxy (Galaxy.tsx) approaches from z=-220, reaching z=-70 at scroll 0.95.
// Camera at 0.82→1.00 looks level into the approaching galaxy center.
//
const KEYFRAMES = [
  // t    pos                lookAt
  { t: 0.0, pos: [0, 0, 4] as const, lookAt: [0, 0, 0] as const }, // Merkaba
  { t: 0.15, pos: [0, 0, 4] as const, lookAt: [0, 0, -25] as const }, // Stars, straight ahead
  { t: 0.4, pos: [0, 2, -18] as const, lookAt: [0, 0, -45] as const }, // UFO hover — gentle dolly, still forward
  { t: 0.52, pos: [0, 3, -28] as const, lookAt: [0, -5, -55] as const }, // After UFO — subtle tilt, planet arc appears
  { t: 0.68, pos: [0, 3, -38] as const, lookAt: [0, -5, -62] as const }, // HOLD — craft + satellite (planet stays in frame)
  { t: 0.82, pos: [0, 2, -48] as const, lookAt: [0, 0, -72] as const }, // Level — galaxy incoming
  { t: 1.0, pos: [0, 1, -72] as const, lookAt: [0, 0, -80] as const }, // Galaxy center-frame
];

const KF_POS = KEYFRAMES.map((k) => new THREE.Vector3(...k.pos));
const KF_LOOK = KEYFRAMES.map((k) => new THREE.Vector3(...k.lookAt));

interface CameraRigProps {
  scrollProgress: React.RefObject<number>;
}

export default function CameraRig({ scrollProgress }: CameraRigProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame(() => {
    const progress = scrollProgress.current ?? 0;

    // Find surrounding keyframe pair
    let a = KEYFRAMES.length - 2;
    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
      if (progress <= KEYFRAMES[i + 1].t) {
        a = i;
        break;
      }
    }
    const b = Math.min(a + 1, KEYFRAMES.length - 1);

    const segStart = KEYFRAMES[a].t;
    const segEnd = KEYFRAMES[b].t;
    const segRange = segEnd - segStart;
    const localT =
      segRange > 0 ? smoothstep((progress - segStart) / segRange) : 0;

    targetPos.current.lerpVectors(KF_POS[a], KF_POS[b], localT);
    targetLook.current.lerpVectors(KF_LOOK[a], KF_LOOK[b], localT);

    camera.position.lerp(targetPos.current, 0.05);
    camera.lookAt(targetLook.current);
  });

  return null;
}
