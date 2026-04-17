'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const GALAXY_COUNT = 3000;
// Minimum spiral-particle radius — creates a visible gap around the core ("eye"
// of the galaxy) so stars don't overlap the glowing sun sphere.
const CORE_GAP = 3.2;
// Galaxy Y-axis spin rate (radians/sec).
const GALAXY_SPIN = 0.24;
// Planet axial-rotation rates (rad/s). Picked to approximate natural physics
// ratios — gas giants spin roughly 2.3× faster than Earth-like terrestrials
// (Jupiter ≈ 0.41 d, Saturn ≈ 0.45 d vs Earth ≈ 1.0 d). All prograde (+Y).
const TERRESTRIAL_SPIN = (2 * Math.PI) / 17; // ≈ 0.37 rad/s (17s / rev)
const GAS_GIANT_SPIN = (2 * Math.PI) / 7.5; // ≈ 0.838 rad/s (7.5s / rev)

// Axial tilt (obliquity) in radians. Inspired by real solar-system values:
// Earth ≈ 0.41 rad (23.5°), Saturn ≈ 0.47 rad (26.7°), Mars ≈ 0.44 rad (25°).
const PLANET_1_TILT = 0.41;
const PLANET_2_TILT = 0.47;
const PLANET_3_TILT = 0.3;

// Axial precession (wobble) amplitude in radians. Real-world obliquity
// wobble is very small, but we exaggerate for a visible, living feel.
const WOBBLE_AMP = 0.25; // ~14.3°
// Precession angular rate (rad/s). Massive bodies precess more slowly in
// reality (larger moment of inertia), so the gas giant wobbles the slowest.
const PRECESSION_1 = (2 * Math.PI) / 8; // ~8s period (terrestrial)
const PRECESSION_2 = (2 * Math.PI) / 15; // ~15s period (massive gas giant)
const PRECESSION_3 = (2 * Math.PI) / 7; // ~7s period (smaller terrestrial)
// Spiral pitch: theta grows this fast per unit of radius. Must stay in sync
// with the particle generator below so gap math lines up.
const SPIRAL_PITCH = 0.42;

/**
 * Given a radius and gap index (0 or 1), return a position that falls squarely
 * between the two spiral arms. The arms are centered on theta = r*SPIRAL_PITCH
 * and that value + π; the two gaps sit π/2 and 3π/2 offset from arm 0.
 */
function gapPosition(
  r: number,
  gapIndex: 0 | 1,
  y: number,
): [number, number, number] {
  const theta = r * SPIRAL_PITCH + Math.PI / 2 + gapIndex * Math.PI;
  return [r * Math.cos(theta), y, r * Math.sin(theta)];
}

// Planet positions — placed in gaps between the two spiral arms so they never
// sit inside a star stream. Ringed gas giant (Planet 2) lives in the outer
// region; earth-tone terrestrial (Planet 3) now occupies the middle slot.
const PLANET_1_POS = gapPosition(9, 0, 0.3);
const PLANET_2_POS = gapPosition(20, 0, -0.5);
const PLANET_3_POS = gapPosition(13, 1, 0.2);

// Star-color gradient anchors — inner stars take on the sun's warm tint and
// fade to cooler near-white toward the spiral arms' outer edge.
const STAR_COLOR_INNER = new THREE.Color('#ffe3a6');
const STAR_COLOR_OUTER = new THREE.Color('#f7faff');
const STAR_MAX_R = 24;

interface GalaxyProps {
  scrollProgress: React.RefObject<number>;
}

/**
 * Galaxy — replaces the old Galaxy vortex.
 *
 * A spiral-arm disc galaxy that flies toward the camera during scroll 0.75–1.00.
 * By scroll ~0.95 it fills the viewport (~41° angular half-width > 35° FOV half).
 *
 * Geometry:
 *   - 3000 disc particles with two spiral arms (exponential radius + core deadzone)
 *     • per-vertex color gradient: warm yellow near the sun → cool white at the rim
 *     • additive blending so overlap reads as brighter clumps
 *   - Tilted 36° on X axis for depth and drama
 *   - Glowing yellow-white core sphere
 *   - 3 low-poly icosahedron planets placed in gaps between the spiral arms
 *     • Planet 1 (inner): earth-tone sage + pale moon
 *     • Planet 2 (outer): Neptune-blue ringed planet + swirling particle rings + tan moon
 *     • Planet 3 (middle): earth-tone terracotta, no moon
 *   - Point light at center illuminates the planets
 *
 * Motion:
 *   - scroll < 0.75: parked at z=-220 (invisible)
 *   - scroll 0.75–0.95: z lerps from -220 → -100 (rushes toward camera)
 *   - scroll > 0.95: z continues to -95 (fits viewport with a small margin)
 *   - Constant Y-axis spin (GALAXY_SPIN rad/s)
 *   - Each planet spins on its own axis (prograde) and slowly precesses
 *   - Moons orbit their parent planets on independent, inclined timers
 */

// Pre-compute spiral galaxy particle positions AND per-star color gradient
// (module level — computed once). Inner stars inherit warm sun-light tint;
// outer stars fade to cool near-white.
const { positions: GALAXY_POSITIONS, colors: GALAXY_COLORS } = (() => {
  const positions = new Float32Array(GALAXY_COUNT * 3);
  const colors = new Float32Array(GALAXY_COUNT * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < GALAXY_COUNT; i++) {
    const arm = i % 2; // two arms, 180° apart
    // Exponential radius distribution — dense core, long sparse arms.
    // CORE_GAP pushes the inner edge outward to create the central deadzone.
    const r = Math.min(
      STAR_MAX_R,
      CORE_GAP + -Math.log(Math.random() + 0.001) * 5.5,
    );
    const armOffset = arm * Math.PI;
    // Spiral: angle grows with radius (tighter at center, opening outward)
    const theta = r * SPIRAL_PITCH + armOffset + (Math.random() - 0.5) * 0.85;
    // Lateral scatter increases with radius (spiral arms widen outward)
    const scatter = (1 - Math.exp(-r * 0.12)) * 2.5;
    positions[i * 3] = r * Math.cos(theta) + (Math.random() - 0.5) * scatter;
    positions[i * 3 + 1] =
      (Math.random() - 0.5) * Math.max(0.15, 0.7 - r * 0.022); // thin disc
    positions[i * 3 + 2] =
      r * Math.sin(theta) + (Math.random() - 0.5) * scatter;

    // Radial color blend — warm→cool with smoothstep falloff.
    const tRaw = Math.min(
      1,
      Math.max(0, (r - CORE_GAP) / (STAR_MAX_R - CORE_GAP)),
    );
    const tEased = smoothstep(tRaw);
    tmp.copy(STAR_COLOR_INNER).lerp(STAR_COLOR_OUTER, tEased);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  return { positions, colors };
})();

/**
 * Small helper — a moon that orbits a parent point.
 *
 * The moon sits at (radius, 0, 0) inside a group whose Y rotation is driven
 * by elapsed time. `tilt` rotates the orbital plane, `phase` offsets the
 * starting angle so multiple moons don't align.
 */
function OrbitingMoon({
  radius,
  speed,
  phase = 0,
  size,
  color,
  tilt = 0,
}: {
  radius: number;
  speed: number;
  phase?: number;
  size: number;
  color: string;
  tilt?: number;
}) {
  const orbitRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = clock.getElapsedTime() * speed + phase;
    }
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={orbitRef}>
        <mesh position={[radius, 0, 0]}>
          <icosahedronGeometry args={[size, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Particle ring system — a swirling annulus of dust-size points around a
 * planet. Each particle has a stable radius and a Keplerian-ish angular
 * velocity (inner particles revolve faster than outer), producing visible
 * differential rotation over time. The buffer is updated every frame.
 *
 * Tuned for low density, a thin radial band, small particle size, and a
 * cool icy color so the ring reads distinctly from the warm galaxy stars.
 */
const RING_COUNT = 200;
const RING_INNER = 1.1;
const RING_OUTER = 1.6;

function RingParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  // Stable per-particle state (angle, radius, angular speed, y-scatter).
  const { positions, angles, radii, speeds, ys } = useMemo(() => {
    const positions = new Float32Array(RING_COUNT * 3);
    const angles = new Float32Array(RING_COUNT);
    const radii = new Float32Array(RING_COUNT);
    const speeds = new Float32Array(RING_COUNT);
    const ys = new Float32Array(RING_COUNT);
    for (let i = 0; i < RING_COUNT; i++) {
      // Bias radius so the ring has a faint gap-and-band texture
      const u = Math.random();
      const r = RING_INNER + u * (RING_OUTER - RING_INNER);
      const theta = Math.random() * Math.PI * 2;
      angles[i] = theta;
      radii[i] = r;
      // Keplerian-ish: v ∝ 1/sqrt(r). Scaled for visual swirl.
      speeds[i] = 0.55 / Math.sqrt(r / RING_INNER);
      ys[i] = (Math.random() - 0.5) * 0.04;
      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = ys[i];
      positions[i * 3 + 2] = r * Math.sin(theta);
    }
    return { positions, angles, radii, speeds, ys };
  }, []);

  useFrame(({ clock }) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const t = clock.getElapsedTime();
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < RING_COUNT; i++) {
      const a = angles[i] + t * speeds[i];
      const r = radii[i];
      arr[i * 3] = r * Math.cos(a);
      arr[i * 3 + 1] = ys[i];
      arr[i * 3 + 2] = r * Math.sin(a);
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.01}
        color="#4F6178"
        transparent
        opacity={0.33}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Galaxy({ scrollProgress }: GalaxyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  // Refs for per-planet axial spin. Each planet rotates about its local Y-axis
  // independent of the galaxy's overall rotation.
  const planet1MeshRef = useRef<THREE.Mesh>(null);
  const planet2MeshRef = useRef<THREE.Mesh>(null);
  const planet3MeshRef = useRef<THREE.Mesh>(null);
  // Refs for per-planet tilt-wobble groups. These carry the axial obliquity
  // and a slow precession animation (rotation.x / rotation.z).
  const planet1TiltRef = useRef<THREE.Group>(null);
  const planet2TiltRef = useRef<THREE.Group>(null);
  const planet3TiltRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !pointsRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    // ── Z position: galaxy approaches camera on scroll 0.75–0.95 ──
    // Final Z is tuned so the full spiral fits in frame with a modest margin
    // — a touch closer than the previous tuning.
    let groupZ: number;
    if (progress < 0.75) {
      groupZ = -220;
    } else if (progress < 0.95) {
      groupZ = lerp(-220, -100, smoothstep((progress - 0.75) / 0.2));
    } else {
      groupZ = lerp(-100, -95, smoothstep((progress - 0.95) / 0.05));
    }

    groupRef.current.position.z = groupZ;

    // ── Constant Y-axis spin ────────────────────────────────────
    groupRef.current.rotation.y = t * GALAXY_SPIN;

    // ── Particle opacity: always fully visible ─────────────────────
    (pointsRef.current.material as THREE.PointsMaterial).opacity = 1.0;

    // ── Planet axial rotation (prograde, +Y) ───────────────────────
    // Gas giant spins the same direction as its rings so both read as unified.
    if (planet1MeshRef.current) {
      planet1MeshRef.current.rotation.y = t * TERRESTRIAL_SPIN;
    }
    if (planet2MeshRef.current) {
      planet2MeshRef.current.rotation.y = t * GAS_GIANT_SPIN;
    }
    if (planet3MeshRef.current) {
      planet3MeshRef.current.rotation.y = t * TERRESTRIAL_SPIN;
    }

    // ── Axial wobble / precession ───────────────────────────────
    // Each planet's axis traces a small circle over time. rotation.x/z vary
    // as sin/cos(t*ω)*amp around the planet's base obliquity.
    if (planet1TiltRef.current) {
      planet1TiltRef.current.rotation.x =
        PLANET_1_TILT + Math.sin(t * PRECESSION_1) * WOBBLE_AMP;
      planet1TiltRef.current.rotation.z =
        Math.cos(t * PRECESSION_1) * WOBBLE_AMP;
    }
    if (planet2TiltRef.current) {
      planet2TiltRef.current.rotation.x =
        PLANET_2_TILT + Math.sin(t * PRECESSION_2) * WOBBLE_AMP;
      planet2TiltRef.current.rotation.z =
        Math.cos(t * PRECESSION_2) * WOBBLE_AMP;
    }
    if (planet3TiltRef.current) {
      planet3TiltRef.current.rotation.x =
        PLANET_3_TILT + Math.sin(t * PRECESSION_3) * WOBBLE_AMP;
      planet3TiltRef.current.rotation.z =
        Math.cos(t * PRECESSION_3) * WOBBLE_AMP;
    }
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 5, 0, 0]}>
      {/* Spiral disc particles — per-vertex warm→cool gradient, additive
          blending so overlapping stars accumulate into brighter clumps. */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[GALAXY_POSITIONS, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[GALAXY_COLORS, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.048}
          vertexColors
          transparent
          opacity={1.0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      {/* Galactic core — glowing sun (lighter tint) */}
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color="#fffde0"
          emissive="#ffe895"
          emissiveIntensity={6}
        />
      </mesh>

      {/* Planet 1 — inner terrestrial, earth-tone sage/olive with a pale moon.
          Placed in a spiral-arm gap (PLANET_1_POS). Axial spin (+Y) with a
          slow obliquity wobble driven from the Galaxy useFrame. */}
      <group position={PLANET_1_POS}>
        <group ref={planet1TiltRef}>
          <mesh ref={planet1MeshRef}>
            <icosahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial
              color="#7a8a5a"
              emissive="#2a3018"
              emissiveIntensity={0.45}
            />
          </mesh>
        </group>
        {/* Moon orbits on its own inclined plane — intentionally outside the
            tilt group so lunar orbit is not tied to the planet's wobble. */}
        <OrbitingMoon
          radius={1.1}
          speed={0.7}
          size={0.12}
          color="#cfd4dd"
          tilt={0.25}
        />
      </group>

      {/* Planet 2 — outer ringed gas giant.
          Low-poly icosahedron (matches siblings) in Neptune-blue. Wrapped by
          a swirling particle ring (RingParticles, dark-blue rocks) and a
          single tan moon on a polar orbit (perpendicular to the ring plane).
          Sits in the outer spiral-arm gap (PLANET_2_POS). Axial spin (+Y)
          matches ring revolution direction; axis wobble animated in useFrame. */}
      <group position={PLANET_2_POS}>
        <group ref={planet2TiltRef}>
          <mesh ref={planet2MeshRef}>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color="#3a6fa0"
              emissive="#152a44"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Particle rings — swirling dust annulus, Keplerian rotation. */}
          <RingParticles />
          {/* Moon — orbital plane sits between parallel and perpendicular to
              the rings (~57° inclination). Inside the tilt group so the
              inclination is preserved as the planet wobbles. */}
          <OrbitingMoon
            radius={1.9}
            speed={0.75}
            phase={1.2}
            size={0.14}
            color="#d8c8a8"
            tilt={1.0}
          />
        </group>
      </group>

      {/* Planet 3 — middle terrestrial, earth-tone terracotta/clay.
          Two moons on distinct inclined orbits with Kepler-scaled speeds
          (ω ∝ 1/r^1.5): a tiny close-in fast moon on a steep incline, and a
          larger outer moon on a low retrograde-leaning tilt. Axial spin (+Y)
          with obliquity wobble. */}
      <group position={PLANET_3_POS}>
        <group ref={planet3TiltRef}>
          <mesh ref={planet3MeshRef}>
            <icosahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color="#a86a4a"
              emissive="#3a1e14"
              emissiveIntensity={0.55}
            />
          </mesh>
        </group>
        {/* Tiny inner moon — fast, steep incline, small size. */}
        <OrbitingMoon
          radius={0.85}
          speed={1.03}
          phase={0.5}
          size={0.06}
          color="#bfc4cc"
          tilt={0.45}
        />
        {/* Larger outer moon — brought in slightly; speed adjusted to stay
            Kepler-consistent with the tighter orbit (ω ∝ 1/r^1.5). */}
        <OrbitingMoon
          radius={1.15}
          speed={0.66}
          phase={2.2}
          size={0.11}
          color="#9a8a70"
          tilt={-0.15}
        />
      </group>

      {/* Center light — illuminates planets */}
      <pointLight color="#ffeeaa" intensity={20} distance={30} />
    </group>
  );
}
