'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  MeshTransmissionMaterial,
  Environment,
} from '@react-three/drei';
import * as THREE from 'three';

// Type definitions
interface FishProps {
  position: [number, number, number];
  color: string;
  speed: number;
  radius: number;
  rotationOffset: number;
}

// Fish component
const Fish: React.FC<FishProps> = ({
  position,
  color,
  speed,
  radius,
  rotationOffset,
}) => {
  const fishRef = useRef<THREE.Group>(null);
  const time = useRef<number>(0);
  const initialPosition = useRef<[number, number, number]>(position);

  // Animation loop for fish movement
  useFrame((state) => {
    if (!fishRef.current) return;

    time.current += speed;

    // Circular swimming motion with some variation
    fishRef.current.position.x =
      initialPosition.current[0] +
      Math.sin(time.current + rotationOffset) * radius;
    fishRef.current.position.y =
      initialPosition.current[1] + Math.sin(time.current * 0.8) * radius * 0.3;
    fishRef.current.position.z =
      initialPosition.current[2] +
      Math.cos(time.current + rotationOffset) * radius;

    // Rotate fish to face swimming direction
    fishRef.current.rotation.y = Math.atan2(
      initialPosition.current[0] +
        Math.sin(time.current + rotationOffset + 0.1) * radius -
        fishRef.current.position.x,
      initialPosition.current[2] +
        Math.cos(time.current + rotationOffset + 0.1) * radius -
        fishRef.current.position.z,
    );
  });

  return (
    <group ref={fishRef} position={position}>
      {/* Fish body */}
      <mesh>
        <tetrahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>

      {/* Fish tail */}
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.1, 0.2, 4, 1]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
};

// Water particles for ambience
const WaterParticles: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 50;
  const positions = useRef<number[]>(
    Array(count * 3)
      .fill(0)
      .map(() => (Math.random() - 0.5) * 1.8),
  );

  useFrame(() => {
    if (!particlesRef.current) return;

    const positionArray = particlesRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positionArray[i3 + 1] += 0.003 * Math.random();

      // Reset particles that reach the top
      if (positionArray[i3 + 1] > 1) {
        positionArray[i3] = (Math.random() - 0.5) * 1.8;
        positionArray[i3 + 1] = -1;
        positionArray[i3 + 2] = (Math.random() - 0.5) * 1.8;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(positions.current), 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#8cdfff" transparent opacity={0.6} />
    </points>
  );
};

// Fishbowl component
const Fishbowl: React.FC = () => {
  const bowlRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* Glass bowl */}
      <mesh ref={bowlRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 16, 12]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          roughness={0.1}
          ior={1.5}
          chromaticAberration={0.06}
          transmission={1}
          distortion={0.4}
          distortionScale={0.5}
          temporalDistortion={0.3}
        />
      </mesh>

      {/* Bowl base */}
      <mesh position={[0, -2, 0]} rotation={[Math.PI / 1, 0, 0]}>
        <cylinderGeometry args={[0.8, 1.2, 0.5, 16]} />
        <meshStandardMaterial color="#444" roughness={0.8} />
      </mesh>

      {/* Fish */}
      <Fish
        position={[0, 0, 0]}
        color="#ff6b6b"
        speed={0.02}
        radius={1.2}
        rotationOffset={0}
      />
      <Fish
        position={[0, -0.4, 0]}
        color="#48dbfb"
        speed={0.03}
        radius={1.0}
        rotationOffset={2}
      />
      <Fish
        position={[0, 0.3, 0]}
        color="#feca57"
        speed={0.025}
        radius={1.3}
        rotationOffset={4}
      />

      {/* Water particles */}
      <WaterParticles />
    </group>
  );
};

// Scene setup with lighting
const Scene: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, [camera]);

  return (
    <>
      {/* Dramatic lighting setup */}
      <ambientLight intensity={0.3} />
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={0.7}
        intensity={1.5}
        castShadow
        color="#fff8e6"
      />
      <spotLight
        position={[-5, -2, 3]}
        angle={0.3}
        penumbra={0.7}
        intensity={0.8}
        castShadow
        color="#4dabf7"
      />

      {/* Main fishbowl */}
      <Fishbowl />

      {/* Controls */}
      <OrbitControls enableZoom={true} enablePan={true} />
    </>
  );
};

// Main component
const FishbowlScene: React.FC = () => {
  return (
    <div className="rounded-lg overflow-hidden h-[400px] mt-4">
      <Canvas dpr={[1, 2]} shadows>
        <color attach="background" args={['#000720']} />
        <fog attach="fog" args={['#000720', 5, 20]} />
        <Scene />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default FishbowlScene;
