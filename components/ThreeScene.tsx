'use client';
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Mesh } from 'three';
function Box(props) {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useFrame((_, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
function Sphere(props) {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useFrame((state) => {
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
  });

  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[0.75, 32, 32]} />
      <meshStandardMaterial color={hovered ? 'lightblue' : 'royalblue'} />
    </mesh>
  );
}

export default function BasicScene() {
  return (
    <div className="h-64 w-full rounded-lg overflow-hidden shadow-lg">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ alpha: false }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight
          position={[-10, 2, 4]}
          angle={0.3}
          penumbra={0.8}
          intensity={2}
          castShadow
          color="purple"
        />
        <directionalLight position={[0, 5, 5]} intensity={1.2} color="cyan" />
        <Box position={[-1.2, 0, 0]} />
        <Sphere position={[1.2, 0, 0]} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

export function InteractiveModel() {
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const SpinningTorus = () => {
    const meshRef = useRef<Mesh>(null!);

    useFrame((state, delta) => {
      meshRef.current.rotation.x += delta * rotationSpeed;
      meshRef.current.rotation.y += delta * rotationSpeed * 0.5;
    });

    return (
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.4, 16, 32]} />
        <meshNormalMaterial />
      </mesh>
    );
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="h-64 w-full rounded-lg overflow-hidden shadow-lg mb-4">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <SpinningTorus />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Rotation Speed: {rotationSpeed.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={rotationSpeed}
          onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}

