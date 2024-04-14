import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, TorusKnot } from "@react-three/drei";

export default function ThreeBackground() {
  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    >
      <color attach="background" args={["black"]} />
      <Camera />
      <GyratingTorusKnot />
      <Stars
        radius={100} // Outer radius of the star field
        depth={50} // Layer depth
        count={5000} // Number of stars
        factor={4} // Size factor
        saturation={0} // Saturation (0 for no color)
        fade // Fade in/out based on camera position
      />
    </Canvas>
  );
}

function Camera() {
  const { camera } = useThree();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  useFrame(() => {
    const x = (mousePosition.x / window.innerWidth) * 2 - 1;
    const y = -(mousePosition.y / window.innerHeight) * 2 + 1;
    camera.position.x += (x - camera.position.x) * 0.05;
    camera.position.y += (-y - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function GyratingTorusKnot() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.x = Math.sin(clock.getElapsedTime()) * 0.5;
    ref.current.rotation.y = Math.sin(clock.getElapsedTime()) * 0.5;
  });

  return (
    <TorusKnot ref={ref} args={[1, 0.4, 64, 100]} position={[0, 0, 0]}>
      <meshStandardMaterial
        attach="material"
        color="green"
        emissive="green"
        emissiveIntensity={10}
      />
    </TorusKnot>
  );
}
