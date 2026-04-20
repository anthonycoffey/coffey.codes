'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SatelliteProps {
  scrollProgress: React.RefObject<number>;
}

const ORBIT_CENTER = new THREE.Vector3(0, -30, -50);
const ORBIT_RADIUS = 28;
const ORBIT_SPEED = 0.25;
const INITIAL_SAT_ANGLE = Math.PI / 2;

export default function Satellite({
  scrollProgress: _scrollProgress,
}: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null);
  // 1. Create a ref for the LED material so we can animate it
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();
    const satAngle = INITIAL_SAT_ANGLE + t * ORBIT_SPEED;

    // Position the satellite in the orbit path
    groupRef.current.position.set(
      ORBIT_CENTER.x + ORBIT_RADIUS * Math.cos(satAngle),
      ORBIT_CENTER.y + ORBIT_RADIUS * Math.sin(satAngle),
      ORBIT_CENTER.z,
    );

    // Reassign the "up" vector to be perpendicular to the XY orbit plane
    groupRef.current.up.set(0, 0, 1);

    // Point the +Z axis (the "front") at the orbit center
    groupRef.current.lookAt(ORBIT_CENTER);

    // 2. Animate the blinking LED (flash intensely for 0.15s every 1.5s)
    if (ledMatRef.current) {
      ledMatRef.current.emissiveIntensity = t % 1.5 < 0.15 ? 4 : 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={2}>
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

        {/* 3. Tapered Dish support rod (extended to poke through dish) */}
        <mesh position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          {/* args: [radiusTop, radiusBottom, height, radialSegments] */}
          <cylinderGeometry args={[0.02, 0.002, 1.2, 12]} />
          <meshStandardMaterial
            color="#aaaacc"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Satellite dish */}
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

        {/* 4. Blinking Red LED at the tip of the tapered rod */}
        {/* Positioned exactly at the end of the 1.2 unit long rod centered at -0.6 */}
        <mesh position={[0, 0, -1.2]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            ref={ledMatRef}
            color="#ff2222"
            emissive="#ff2222"
            toneMapped={false}
          />
        </mesh>

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

        {/* Screen */}
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
