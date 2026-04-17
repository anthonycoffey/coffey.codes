'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// ── Thruster particle constants ────────────────────────────────────────────
const THRUST_PER_ENGINE = 70;
const ENGINE_COUNT = 2;
const TOTAL_THRUST = THRUST_PER_ENGINE * ENGINE_COUNT;

// Engine nozzle exit positions in local ship space.
// Ship is built with nose in -Z, tail in +Z.
const ENGINE_OFFSETS = [
  new THREE.Vector3(-0.7, -0.1, 1.88), // port engine nozzle
  new THREE.Vector3(0.7, -0.1, 1.88), // starboard engine nozzle
];

// Per-particle state: [age, speed, spreadX, spreadY] per particle.
// Initialized once at module load (client-only — 'use client' guard).
const PARTICLE_DATA = (() => {
  const arr = new Float32Array(TOTAL_THRUST * 4);
  for (let i = 0; i < TOTAL_THRUST; i++) {
    arr[i * 4 + 0] = Math.random(); // staggered initial age
    arr[i * 4 + 1] = 0.5 + Math.random() * 0.8; // speed multiplier
    arr[i * 4 + 2] = (Math.random() - 0.5) * 0.16; // spread X
    arr[i * 4 + 3] = (Math.random() - 0.5) * 0.16; // spread Y
  }
  return arr;
})();

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface SpaceshipProps {
  scrollProgress: React.RefObject<number>;
}

/**
 * Rebel Alliance-style fighter with InstancedMesh thruster fire.
 *
 * Triggers at scroll 0.74 — same path and timing as the old FlybyOrb.
 * Flies from screen-right (x=10, z=-100) to screen-left (x=-14, z=-55).
 *
 * Ship orientation: nose in -Z local space, rotated to face travel direction
 * (toward camera and left), banking ~23° into the turn.
 *
 * New THREE.js features:
 *   - InstancedMesh with per-frame setColorAt (140 thruster particles)
 *   - MeshPhysicalMaterial clearcoat + iridescence on hull
 *   - MeshPhysicalMaterial transmission + ior on cockpit glass
 *   - MeshBasicMaterial toneMapped={false} for unlit bloom-ready fire
 */
export default function Spaceship({ scrollProgress }: SpaceshipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const thrustRef = useRef<THREE.InstancedMesh>(null);
  const triggered = useRef(false);
  const triggerTime = useRef(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  // Mutable working copy of particle state (not const — ages change each frame)
  const pData = useRef(new Float32Array(PARTICLE_DATA));

  // Zero-scale all instances on mount so nothing renders at origin
  useEffect(() => {
    if (!thrustRef.current) return;
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    for (let i = 0; i < TOTAL_THRUST; i++) {
      thrustRef.current.setMatrixAt(i, dummy.matrix);
    }
    thrustRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !thrustRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    if (progress < 0.62) {
      // Parked far off-screen right — invisible at any scroll position
      groupRef.current.position.set(200, 0, -80);
      triggered.current = false;
      return;
    }

    if (!triggered.current) {
      triggered.current = true;
      triggerTime.current = t;
    }

    const elapsed = t - triggerTime.current;
    const flyT = Math.min(1, elapsed / 5); // 12-second flyby

    // Path: back-right → front-left, flying past the camera.
    // Starts at x=70 which is just off the right edge of the viewport
    // at this camera position, so the ship enters frame naturally.
    // Ends at x=-65 — well off left edge, thrusters also off-screen.
    groupRef.current.position.set(
      lerp(70, -65, flyT),
      lerp(1, 6, flyT),
      lerp(-120, -22, flyT),
    );

    // ── Thruster particle update ──────────────────────────────────────────
    const d = Math.min(delta, 0.05); // cap delta — prevents jump on tab-switch
    const pd = pData.current;

    for (let i = 0; i < TOTAL_THRUST; i++) {
      const base = i * 4;
      const engine = Math.floor(i / THRUST_PER_ENGINE);

      // Cycle age [0, 1)
      pd[base] = (pd[base] + d * pd[base + 1]) % 1.0;
      const age = pd[base];

      const off = ENGINE_OFFSETS[engine];
      const tail = age * 3.8; // distance aft of nozzle
      const spread = age * 1.3; // lateral bloom grows with age

      dummy.position.set(
        off.x + pd[base + 2] * spread,
        off.y + pd[base + 3] * spread,
        off.z + tail,
      );
      dummy.scale.setScalar(0.022 + age * 0.09); // particle grows as it cools
      dummy.updateMatrix();
      thrustRef.current.setMatrixAt(i, dummy.matrix);

      // ── Fire color ramp ─────────────────────────────────────────────────
      // white-hot → yellow → orange → red → dark ember
      let r: number, g: number, blue: number;
      if (age < 0.2) {
        const tt = age / 0.2;
        r = 1;
        g = 1;
        blue = lerp(1, 0.35, tt); // white → bright yellow
      } else if (age < 0.45) {
        const tt = (age - 0.2) / 0.25;
        r = 1;
        g = lerp(1, 0.42, tt);
        blue = lerp(0.35, 0, tt); // yellow → orange
      } else if (age < 0.72) {
        const tt = (age - 0.45) / 0.27;
        r = lerp(1, 0.62, tt);
        g = lerp(0.42, 0.07, tt);
        blue = 0; // orange → red
      } else {
        const tt = (age - 0.72) / 0.28;
        r = lerp(0.62, 0.04, tt);
        g = lerp(0.07, 0, tt);
        blue = 0; // red → dark ember
      }

      thrustRef.current.setColorAt(i, tempColor.setRGB(r, g, blue));
    }

    thrustRef.current.instanceMatrix.needsUpdate = true;
    if (thrustRef.current.instanceColor) {
      thrustRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    /**
     * Rotation for path (70,1,-120) → (-65,6,-22):
     *   Travel direction ≈ (-0.807, 0.031, 0.590)
     *   x:  0.04 — slight nose-up (path rises slightly in Y)
     *   y:  2.20 — yaw: nose faces toward camera and hard left (≈ π - 0.94)
     *   z:  0.45 — banking right into the sharp left turn (~26°)
     */
    <group ref={groupRef} rotation={[0.04, 2.2, 0.45]} scale={5}>
      {/* ── Thruster fire — 140 InstancedMesh particles ───────────────────── */}
      <instancedMesh
        ref={thrustRef}
        args={[undefined, undefined, TOTAL_THRUST]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 5, 4]} />
        {/* Unlit, toneMapped=false → bright enough to hit Bloom threshold */}
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Engine point lights — backwash glow on surrounding geometry */}
      <pointLight
        position={[-0.7, -0.1, 2.4]}
        color="#ff7722"
        intensity={12}
        distance={5.5}
      />
      <pointLight
        position={[0.7, -0.1, 2.4]}
        color="#ff7722"
        intensity={12}
        distance={5.5}
      />

      {/* ── Hull ──────────────────────────────────────────────────────────── */}

      {/* Main fuselage — battle-worn metal with clearcoat + iridescent sheen */}
      <mesh>
        <boxGeometry args={[0.82, 0.54, 4.2]} />
        <meshPhysicalMaterial
          color="#445566"
          metalness={0.75}
          roughness={0.58}
          clearcoat={0.45}
          clearcoatRoughness={0.75}
          iridescence={0.38}
          iridescenceIOR={1.8}
        />
      </mesh>

      {/* Cockpit bubble — transmission glass */}
      <mesh position={[0, 0.28, -0.45]} scale={[1, 0.72, 1.35]}>
        <sphereGeometry args={[0.26, 8, 6]} />
        <meshPhysicalMaterial
          color="#88aaff"
          transmission={0.88}
          ior={1.45}
          thickness={0.4}
          roughness={0.04}
          metalness={0}
          transparent
        />
      </mesh>

      {/* Wing — port (left), swept aft */}
      <mesh position={[-1.88, -0.08, 0.38]} rotation={[0, 0.2, -0.07]}>
        <boxGeometry args={[3.1, 0.07, 1.1]} />
        <meshPhysicalMaterial
          color="#3a4e5e"
          metalness={0.7}
          roughness={0.65}
          clearcoat={0.25}
          clearcoatRoughness={0.88}
          iridescence={0.2}
          iridescenceIOR={1.6}
        />
      </mesh>

      {/* Wing — starboard (right), swept aft */}
      <mesh position={[1.88, -0.08, 0.38]} rotation={[0, -0.2, 0.07]}>
        <boxGeometry args={[3.1, 0.07, 1.1]} />
        <meshPhysicalMaterial
          color="#3a4e5e"
          metalness={0.7}
          roughness={0.65}
          clearcoat={0.25}
          clearcoatRoughness={0.88}
          iridescence={0.2}
          iridescenceIOR={1.6}
        />
      </mesh>

      {/* Dorsal tail fin */}
      <mesh position={[0, 0.43, 1.2]}>
        <boxGeometry args={[0.06, 0.65, 0.88]} />
        <meshPhysicalMaterial
          color="#3a4e5e"
          metalness={0.7}
          roughness={0.62}
          clearcoat={0.2}
          clearcoatRoughness={0.9}
        />
      </mesh>

      {/* Engine pod — port */}
      <mesh position={[-0.7, -0.1, 1.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.24, 1.52, 8]} />
        <meshPhysicalMaterial
          color="#1e2233"
          metalness={0.92}
          roughness={0.28}
          clearcoat={0.6}
          clearcoatRoughness={0.35}
        />
      </mesh>

      {/* Engine pod — starboard */}
      <mesh position={[0.7, -0.1, 1.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.24, 1.52, 8]} />
        <meshPhysicalMaterial
          color="#1e2233"
          metalness={0.92}
          roughness={0.28}
          clearcoat={0.6}
          clearcoatRoughness={0.35}
        />
      </mesh>

      {/* Engine nozzle rings — orange emissive, Bloom-ready */}
      <mesh position={[-0.7, -0.1, 1.9]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.042, 6, 14]} />
        <meshStandardMaterial
          color="#ff9944"
          emissive="#ff6600"
          emissiveIntensity={5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.7, -0.1, 1.9]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.042, 6, 14]} />
        <meshStandardMaterial
          color="#ff9944"
          emissive="#ff6600"
          emissiveIntensity={5}
          toneMapped={false}
        />
      </mesh>

      {/* Engine inner glow discs */}
      <mesh position={[-0.7, -0.1, 1.88]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 8]} />
        <meshBasicMaterial color="#ffcc55" toneMapped={false} />
      </mesh>
      <mesh position={[0.7, -0.1, 1.88]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 8]} />
        <meshBasicMaterial color="#ffcc55" toneMapped={false} />
      </mesh>

      {/* Wing-mounted gun barrels (rebel fighter style) */}
      <mesh position={[-2.45, -0.14, -0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 1.5, 5]} />
        <meshStandardMaterial
          color="#252535"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>
      <mesh position={[2.45, -0.14, -0.52]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 1.5, 5]} />
        <meshStandardMaterial
          color="#252535"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Greeble panel boxes — hull detail for the "lived-in" look */}
      <mesh position={[0.22, 0.29, 0.52]}>
        <boxGeometry args={[0.32, 0.07, 0.55]} />
        <meshStandardMaterial
          color="#3a5060"
          metalness={0.6}
          roughness={0.82}
        />
      </mesh>
      <mesh position={[-0.28, 0.29, -0.55]}>
        <boxGeometry args={[0.44, 0.06, 0.28]} />
        <meshStandardMaterial
          color="#445566"
          metalness={0.55}
          roughness={0.9}
        />
      </mesh>
      <mesh position={[0, -0.29, 0.88]}>
        <boxGeometry args={[0.55, 0.07, 0.24]} />
        <meshStandardMaterial
          color="#334455"
          metalness={0.7}
          roughness={0.72}
        />
      </mesh>
      <mesh position={[-0.18, 0.29, 1.4]}>
        <boxGeometry args={[0.24, 0.08, 0.38]} />
        <meshStandardMaterial
          color="#3d4f60"
          metalness={0.65}
          roughness={0.78}
        />
      </mesh>

      {/* Nav lights — port red (left), starboard green (right) */}
      <mesh position={[-3.3, -0.08, 0.38]}>
        <sphereGeometry args={[0.045, 5, 4]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff2222"
          emissiveIntensity={6}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[3.3, -0.08, 0.38]}>
        <sphereGeometry args={[0.045, 5, 4]} />
        <meshStandardMaterial
          color="#44ff44"
          emissive="#22ff22"
          emissiveIntensity={6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
