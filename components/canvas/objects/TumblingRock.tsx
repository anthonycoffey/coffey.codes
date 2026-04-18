'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ORBIT_CENTER = new THREE.Vector3(0, -22, -75);
const ORBIT_RADIUS = 25;
const INITIAL_SAT_ANGLE = Math.PI / 4;

const ROCK_ANGLE_SPEED = -0.7;
const ROCK_INITIAL_ANGLE = INITIAL_SAT_ANGLE + Math.PI;
const ROCK_TUMBLE_X = 0.9;
const ROCK_TUMBLE_Y = 1.7;
const ROCK_TUMBLE_Z = 0.5;

export default function TumblingRock() {
  const rockRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!rockRef.current) return;
    const t = clock.getElapsedTime();

    const rockAngle = ROCK_INITIAL_ANGLE + t * ROCK_ANGLE_SPEED;
    rockRef.current.position.set(
      ORBIT_CENTER.x + (ORBIT_RADIUS / 1.5) * Math.cos(rockAngle / 2),
      ORBIT_CENTER.y + (ORBIT_RADIUS / 1.5) * Math.sin(rockAngle / 2),
      ORBIT_CENTER.z,
    );

    rockRef.current.rotation.set(
      t * ROCK_TUMBLE_X,
      t * ROCK_TUMBLE_Y,
      t * ROCK_TUMBLE_Z,
    );
  });

  return (
    <mesh ref={rockRef}>
      <icosahedronGeometry args={[2, 0]} />
      <meshStandardMaterial color="#b3dafd" roughness={0.82} metalness={0.01} />
    </mesh>
  );
}
