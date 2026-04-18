'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SatelliteProps {
  scrollProgress: React.RefObject<number>;
}

const ORBIT_CENTER = new THREE.Vector3(0, -30, -50);
const ORBIT_RADIUS = 32;
const ORBIT_SPEED = 0.1;
const INITIAL_SAT_ANGLE = Math.PI / 2;

export default function Satellite({
  scrollProgress: _scrollProgress,
}: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();
    const satAngle = INITIAL_SAT_ANGLE + t * ORBIT_SPEED;

    // 1. Position the satellite in the orbit path
    groupRef.current.position.set(
      ORBIT_CENTER.x + ORBIT_RADIUS * Math.cos(satAngle),
      ORBIT_CENTER.y + ORBIT_RADIUS * Math.sin(satAngle),
      ORBIT_CENTER.z,
    );

    // 2. Point the +Z axis (the "front") at the orbit center
    groupRef.current.lookAt(ORBIT_CENTER);
  });

  return (
    <group ref={groupRef} scale={4}>
      {/* CORRECTION GROUP:
          Since lookAt points the +Z axis at the target, and your
          dish was on the -Z side, we rotate this inner group 180° (Math.PI)
          on the Y axis to "inverse" which side faces forward.
      */}
      <group rotation={[0, Math.PI, 0]}>
        {/* Satellite body */}
        <mesh>
          <boxGeometry args={[1, 0.5, 0.5]} />
          <meshStandardMaterial
            color="#c8d0d8"
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>

        {/* Solar panels */}
        {[-1.5, 1.5].map((xPos, i) => (
          <group key={`panel-group-${i}`} position={[xPos, 0, 0]}>
            <mesh>
              <planeGeometry args={[2, 0.8]} />
              <meshStandardMaterial
                color="#c8d0d8"
                metalness={0.3}
                roughness={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Panel LEDs */}
            {[
              [-0.9, 0.3],
              [0.9, 0.3],
              [-0.9, -0.3],
              [0.9, -0.3],
            ].map(([lx, ly], j) => (
              <mesh key={`led-${j}`} position={[lx, ly, 0.01]}>
                <sphereGeometry args={[0.025, 4, 4]} />
                <meshStandardMaterial
                  color="#ff2222"
                  emissive="#ff2222"
                  emissiveIntensity={3}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Dish support & Satellite dish */}
        <mesh position={[0, 0, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 12]} />
          <meshStandardMaterial
            color="#aaaacc"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        <group position={[0, 0, -0.99]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <sphereGeometry
              args={[0.7, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.3]}
            />
            <meshStandardMaterial
              color="#c8d0d8"
              metalness={0.5}
              roughness={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* Antenna */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
          <meshStandardMaterial
            color="#aaaacc"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        <mesh position={[0, 0.95, 0]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>

        {/* Screen (Now points at center thanks to the rotation PI) */}
        <mesh position={[0, 0, 0.26]}>
          <planeGeometry args={[0.8, 0.4]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={1.2}
            toneMapped={false}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Essential Lights */}
        <pointLight
          position={[0, 0, 0.8]}
          color="#00e5ff"
          intensity={8}
          distance={12}
        />
        <pointLight
          position={[0, 1.2, 0]}
          color="#aaddff"
          intensity={5}
          distance={10}
        />
      </group>
    </group>
  );
}
