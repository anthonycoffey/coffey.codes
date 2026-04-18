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

const GALAXY_COUNT = 1000;
// Minimum spiral-particle radius — creates a visible gap around the core ("eye"
// of the galaxy) so stars don't overlap the glowing sun sphere.
const CORE_GAP = 6;
// Galaxy Y-axis spin rate (radians/sec).
const GALAXY_SPIN = 0.2;
// Planet axial-rotation rates (rad/s). Picked to approximate natural physics
// ratios — gas giants spin roughly 2.3× faster than Earth-like terrestrials
// (Jupiter ≈ 0.41 d, Saturn ≈ 0.45 d vs Earth ≈ 1.0 d). All prograde (+Y).
const TERRESTRIAL_SPIN = (2 * Math.PI) / 15; // ≈ 0.42 rad/s (15s / rev)
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

// Planet INITIAL positions — used only for the first render frame before
// useFrame overrides each planet's position from its PLANET_*_ORBIT config.
// Radii must match PLANET_*_ORBIT.r below to avoid a one-frame position pop
// on mount.
const PLANET_1_POS = gapPosition(4, 0, 0.3);
const PLANET_2_POS = gapPosition(20, 0, -0.5);
const PLANET_3_POS = gapPosition(13, 1, 0.2);

// ── Planet orbits around the sun ────────────────────────────────────
// The galaxy group already rotates rigidly at GALAXY_SPIN, so planets embedded
// in that group orbit the sun at the same rate as the stars (no visible
// differential). To make the differential visible, we add a Kepler-scaled
// extra angular velocity Δω per planet (ω ∝ 1/r^1.5) — inner planets orbit
// noticeably faster than outer ones. Collisions with the star field are
// prevented by carving empty "orbital lanes" in the star generator below
// (see LANE_RADII / LANE_HALF_WIDTH), mimicking the dust-clear gaps seen in
// protoplanetary discs.
//   Planet 1 (r=4):  lap ≈ 18 s  (Mercury-like tight inner orbit)
//   Planet 3 (r=13): lap ≈ 105 s
//   Planet 2 (r=20): lap ≈ 200 s
const ORBIT_DW_REF = 0.06; // Δω at reference radius (rad/s)
const ORBIT_R_REF = 13; // reference radius for Kepler scaling
function keplerDW(r: number): number {
  return ORBIT_DW_REF * Math.pow(ORBIT_R_REF / r, 1.5);
}
// θ₀ values below match the gap-center angles used by gapPosition() so each
// planet starts exactly in its gap at t=0.
const PLANET_1_ORBIT = {
  r: 4,
  y: 0.3,
  theta0: 4 * SPIRAL_PITCH + Math.PI / 2,
  dw: keplerDW(4),
};
const PLANET_2_ORBIT = {
  r: 20,
  y: -0.5,
  theta0: 20 * SPIRAL_PITCH + Math.PI / 2,
  dw: keplerDW(20),
};
const PLANET_3_ORBIT = {
  r: 13,
  y: 0.2,
  theta0: 13 * SPIRAL_PITCH + Math.PI / 2 + Math.PI,
  dw: keplerDW(13),
};

// Orbital lanes — narrow radial bands cleared of stars so the planets can
// orbit at visible Keplerian rates without ever passing through an arm.
// Mimics dust-clear gaps in real protoplanetary discs / planetary rings.
const LANE_RADII = [PLANET_1_ORBIT.r, PLANET_3_ORBIT.r, PLANET_2_ORBIT.r];
const LANE_HALF_WIDTH = 0.6;

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
 *   - 1000 disc particles with two spiral arms (exponential radius + core deadzone)
 *     • per-vertex color gradient: warm yellow near the sun → cool white at the rim
 *     • additive blending so overlap reads as brighter clumps
 *     • narrow empty lanes at each planet's orbital radius (dust-clear gaps)
 *   - Tilted 36° on X axis for depth and drama
 *   - Glowing yellow-white core sphere
 *   - 3 low-poly icosahedron planets at different orbital radii
 *     • Planet 1 (r=4, tight inner): warm gold + small pale moon
 *     • Planet 2 (r=20, outer): Neptune-blue ringed planet + swirling particle
 *       rings + single inclined ice-blue moon
 *     • Planet 3 (r=13, middle): deep forest green + single steeply-inclined moon
 *   - Point light at center illuminates the planets
 *
 * Motion:
 *   - scroll < 0.75: parked at z=-220 (invisible)
 *   - scroll 0.75–0.95: z lerps from -220 → -100 (rushes toward camera)
 *   - scroll > 0.95: z continues to -95 (fits viewport with a small margin)
 *   - Constant Y-axis spin (GALAXY_SPIN rad/s)
 *   - Each planet spins on its own axis (prograde) and slowly precesses
 *   - Each planet orbits the sun at GALAXY_SPIN + Δω(r) — Kepler-scaled rate,
 *     inner planets noticeably faster than outer ones; orbital lanes in the
 *     star field keep planets collision-free
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
    // Rejection-sample until the radius falls outside every orbital lane so
    // planets have clear paths to orbit through. A bounded attempt count
    // guarantees termination (falls back to accepting the last sample).
    let r = Math.min(
      STAR_MAX_R,
      CORE_GAP + -Math.log(Math.random() + 0.001) * 5.5,
    );
    for (let attempt = 0; attempt < 12; attempt++) {
      if (!LANE_RADII.some((pr) => Math.abs(r - pr) < LANE_HALF_WIDTH)) break;
      r = Math.min(
        STAR_MAX_R,
        CORE_GAP + -Math.log(Math.random() + 0.001) * 5.5,
      );
    }
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
        size={0.1}
        color="#4F6178"
        transparent
        opacity={0.1}
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
  // Refs for per-planet orbit-position groups. Each frame we set .position to
  // (r*cos(θ), y, r*sin(θ)) where θ(t) = θ₀ + Δω*t, producing visible
  // differential drift through the galaxy's star field.
  const planet1OrbitRef = useRef<THREE.Group>(null);
  const planet2OrbitRef = useRef<THREE.Group>(null);
  const planet3OrbitRef = useRef<THREE.Group>(null);

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

    // ── Orbital drift around the sun ─────────────────────────────
    // Planet angular position in the galaxy-local frame advances at Δω; the
    // galaxy group's own rotation adds GALAXY_SPIN on top for total orbital
    // rate. Starting angles match the gap-center math so planets begin in
    // their respective gaps.
    if (planet1OrbitRef.current) {
      const th1 = PLANET_1_ORBIT.theta0 + PLANET_1_ORBIT.dw * t;
      planet1OrbitRef.current.position.set(
        PLANET_1_ORBIT.r * Math.cos(th1),
        PLANET_1_ORBIT.y,
        PLANET_1_ORBIT.r * Math.sin(th1),
      );
    }
    if (planet2OrbitRef.current) {
      const th2 = PLANET_2_ORBIT.theta0 + PLANET_2_ORBIT.dw * t;
      planet2OrbitRef.current.position.set(
        PLANET_2_ORBIT.r * Math.cos(th2),
        PLANET_2_ORBIT.y,
        PLANET_2_ORBIT.r * Math.sin(th2),
      );
    }
    if (planet3OrbitRef.current) {
      const th3 = PLANET_3_ORBIT.theta0 + PLANET_3_ORBIT.dw * t;
      planet3OrbitRef.current.position.set(
        PLANET_3_ORBIT.r * Math.cos(th3),
        PLANET_3_ORBIT.y,
        PLANET_3_ORBIT.r * Math.sin(th3),
      );
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
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial
          color="#fffde0"
          emissive="#ffe895"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Planet 1 — tight inner terrestrial (r=4, well inside the core gap),
          warm gold with a small pale moon. Orbits the sun every ~18 s via
          PLANET_1_ORBIT. Axial spin (+Y) with a slow obliquity wobble. */}
      <group ref={planet1OrbitRef} position={PLANET_1_POS}>
        <group ref={planet1TiltRef}>
          <mesh ref={planet1MeshRef}>
            <icosahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial
              color="#D9B763"
              emissive="#CD9E26"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
        {/* Moon orbits on its own inclined plane — intentionally outside the
            tilt group so lunar orbit is not tied to the planet's wobble. */}
        <OrbitingMoon
          radius={0.85}
          speed={0.7}
          size={0.1}
          color="#cfd4dd"
          tilt={0.25}
        />
      </group>

      {/* Planet 2 — outer ringed gas giant (r=20).
          Low-poly icosahedron in Neptune-blue with a swirling particle-dust
          ring system (RingParticles) and a single ice-blue moon inclined
          ~57° off the ring plane. Orbits the sun every ~200 s via
          PLANET_2_ORBIT. Axial spin (+Y) matches ring revolution direction;
          axis wobble animated in useFrame. */}
      <group ref={planet2OrbitRef} position={PLANET_2_POS}>
        <group ref={planet2TiltRef}>
          <mesh ref={planet2MeshRef}>
            <icosahedronGeometry args={[0.75, 0]} />
            <meshStandardMaterial
              color="#3a6fa0"
              emissive="#152a44"
              emissiveIntensity={1}
            />
          </mesh>
          {/* Particle rings — swirling dust annulus, Keplerian rotation. */}
          <RingParticles />
          {/* Moon — orbital plane sits between parallel and perpendicular to
              the rings (~57° inclination). Inside the tilt group so the
              inclination is preserved as the planet wobbles. */}
          <OrbitingMoon
            radius={1.5}
            speed={0.75}
            phase={1.2}
            size={0.14}
            color="#B8ECF6"
            tilt={1.0}
          />
        </group>
      </group>

      {/* Planet 3 — middle terrestrial (r=13), deep forest green with a
          single steeply-inclined moon. Orbits the sun every ~105 s via
          PLANET_3_ORBIT. Axial spin (+Y) with obliquity wobble. */}
      <group ref={planet3OrbitRef} position={PLANET_3_POS}>
        <group ref={planet3TiltRef}>
          <mesh ref={planet3MeshRef}>
            <icosahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color="#3A6225"
              emissive="#3A6225"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
        {/* Single moon — pale grey, steeply inclined orbital plane. */}
        <OrbitingMoon
          radius={0.9}
          speed={0.8}
          phase={0.5}
          size={0.15}
          color="#CFCFCF"
          tilt={0 - 35}
        />
      </group>

      {/* Center light — illuminates planets
        TODO: doesnt appear to be working, no surface to catch light
        */}
      <pointLight color="#ffeeaa" intensity={30} distance={100} />
    </group>
  );
}
