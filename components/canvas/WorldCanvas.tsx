'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { sampleMerkaba } from '@/utils/merkaba';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CameraRig from './CameraRig';
import UFO from './objects/UFO';
import Planet from './objects/Planet';
import Satellite from './objects/Satellite';
import Galaxy from './objects/Galaxy';
import Spaceship from './objects/Spaceship';

// ── Constants ────────────────────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 2000;
const MERKABA_RADIUS = 2;

// Dispersal: how far each particle drifts outward before being fully faded.
// Keep > a few units so the explosion clearly moves off-center, but small
// enough that nothing survives past the end of the animation window.
const DISPERSE_DISTANCE = 10;

// Background star field — static, always visible (the ONLY source of stars).
// Mobile gets a sparser field to cut per-frame draw cost and init work.
const BG_STAR_COUNT_DESKTOP = 1500;
const BG_STAR_COUNT_MOBILE = 700;
const BG_STAR_Z_MIN = -65;
const BG_STAR_Z_MAX = -180;
function buildBgStars(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 160;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 160;
    arr[i * 3 + 2] =
      BG_STAR_Z_MIN + Math.random() * (BG_STAR_Z_MAX - BG_STAR_Z_MIN);
  }
  return arr;
}

// ── Pre-computed geometry data (computed once at module load) ──────────
const MERKABA_POSITIONS = sampleMerkaba(MERKABA_RADIUS, PARTICLE_COUNT);

// Per-particle outward explosion direction (uniform on the unit sphere)
// and a speed multiplier for natural variation.
const DISPERSE_DIRECTIONS = new Float32Array(PARTICLE_COUNT * 3);
const DISPERSE_SPEEDS = new Float32Array(PARTICLE_COUNT);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const sinPhi = Math.sin(phi);
  DISPERSE_DIRECTIONS[i * 3] = sinPhi * Math.cos(theta);
  DISPERSE_DIRECTIONS[i * 3 + 1] = sinPhi * Math.sin(theta);
  DISPERSE_DIRECTIONS[i * 3 + 2] = Math.cos(phi);
  DISPERSE_SPEEDS[i] = 0.6 + Math.random() * 1.2; // 0.6× – 1.8×
}

// ── Colors ───────────────────────────────────────────────────────────────────────────────
const COLOR_GOLD = '#FFCC00';
const BASE_COLOR = new THREE.Color(COLOR_GOLD);

// ── Helpers ────────────────────────────────────────────────────────────────
function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// ── Particle system — Merkaba → Stars ─────────────────────────────────────
interface ParticleSystemProps {
  scrollProgress: React.RefObject<number>;
}

function ParticleSystem({ scrollProgress }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  // Working buffer — starts in Merkaba formation. Mutated per frame in place.
  const currentPositions = useRef(new Float32Array(MERKABA_POSITIONS));

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    // Dispersal factor: 0 while formed, 1 once fully exploded.
    // Driven purely by scroll — no per-frame lerp, so position is a pure
    // function of scroll progress (reversible, no catch-up lag).
    const disperse = progress < 0.25 ? smoothstep(progress / 0.25) : 1;

    // Fully dispersed → hide the whole <points> object. three.js skips
    // drawing it entirely, so there is no chance of stray particles
    // re-appearing as the camera dollies forward later in the scroll.
    if (disperse >= 1) {
      pointsRef.current.visible = false;
      return;
    }
    pointsRef.current.visible = true;

    // ── Positions: each particle = merkaba origin + outward drift ───
    const drift = disperse * DISPERSE_DISTANCE;
    const buf = currentPositions.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const speed = DISPERSE_SPEEDS[i];
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;
      buf[ix] = MERKABA_POSITIONS[ix] + DISPERSE_DIRECTIONS[ix] * drift * speed;
      buf[iy] = MERKABA_POSITIONS[iy] + DISPERSE_DIRECTIONS[iy] * drift * speed;
      buf[iz] = MERKABA_POSITIONS[iz] + DISPERSE_DIRECTIONS[iz] * drift * speed;
    }

    const geo = pointsRef.current.geometry;
    (geo.attributes.position as THREE.BufferAttribute).array = buf;
    geo.attributes.position.needsUpdate = true;

    // ── Opacity: fade from 0.75 → 0 across the dispersal window ───
    // Tuning note: if the explosion feels too abrupt, shift the opacity
    // curve from (1 - disperse) to (1 - disperse)² so it holds brightness
    // during the initial outward motion and then snaps dark near the end.
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = (1 - disperse) * 0.75;

    // ── Color/Bloom: over-bright when dense, dimming as it spreads ───
    const glowIntensity = 0.02 + (1 - disperse) * 2;
    mat.color.copy(BASE_COLOR).multiplyScalar(glowIntensity);

    // ── Rotation: spin while formed; stop once exploded ────────
    pointsRef.current.rotation.y = t * 0.5 * (1 - disperse);
    pointsRef.current.rotation.x = 0;
    pointsRef.current.rotation.z = 0;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[currentPositions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.013}
        color={COLOR_GOLD}
        transparent
        opacity={0.75}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

// ── Readiness signal ──────────────────────────────────────────────────────
//
// Reports "the scene is on screen" — deliberately NOT r3f's `onCreated`, which
// fires the moment the WebGL context exists, well before geometry upload,
// shader compile and the first draw. The loader announces "SCENE LOADED." off
// this signal, so it has to mean pixels.
//
// r3f runs frame callbacks BEFORE the draw, so the first invocation happens
// with nothing painted yet; waiting for the second means frame 1 is complete —
// including the EffectComposer passes, which register at a higher frame
// priority and therefore run after this callback within the same frame.
export function FirstFrameSignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  const fired = useRef(false);

  useFrame(() => {
    if (fired.current) return;
    frames.current += 1;
    if (frames.current < 2) return;
    fired.current = true;
    onReady?.();
  });

  return null;
}

// ── Shader warm-up ────────────────────────────────────────────────────────
//
// three.js compiles a material's WebGL program on the first frame that actually
// DRAWS it. Objects that stay outside the frustum never reach that path, so
// anything which only enters frame partway through the scroll pays its whole
// compile cost on the single frame it arrives.
//
// The spaceship is the expensive case (BUG-002): it is parked at x=250 until
// scroll 0.62, and four programs — two of them ~76KB of generated fragment
// source, from the grunge shader and the physical cockpit material — all
// compiled on the frame it flew in, stalling the loop for roughly 3x the
// surrounding frame budget.
//
// `compileAsync` walks the scene graph instead of the render list, so it warms
// those programs regardless of where their objects are standing. Running it
// here puts that cost under the loading splash, where nothing is animating.
export const WARMUP_CAP_MS = 2500;

export function SceneWarmup({ onWarm }: { onWarm?: () => void }) {
  const { gl, scene, camera } = useThree();
  const started = useRef(false);
  const settled = useRef(false);
  const flushed = useRef(false);

  // Whichever arrives first — the compile, a compile failure, or the cap.
  const settle = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    onWarm?.();
  }, [onWarm]);

  // The entry gate unlocks off this signal, so it has to arrive even when the
  // warm-up cannot. A driver that never reports the programs ready costs the
  // visitor smoothness; it must never cost them entry.
  //
  // Setting `flushed` here is also what paces the warm-up below: React runs a
  // commit's passive effects as one synchronous batch, so a frame that sees
  // this flag has the whole batch behind it, whatever order the scene's
  // children happen to sit in.
  useEffect(() => {
    flushed.current = true;
    const cap = setTimeout(settle, WARMUP_CAP_MS);
    return () => clearTimeout(cap);
  }, [settle]);

  // Frame-driven, and deliberately not the FIRST frame. Objects in this scene
  // park their lights on private layers from mount effects — Planet moves
  // three of its four onto PLANET_LIGHTING_LAYER, which the camera never
  // enables — and those effects flush after frame 1 has already run. Light
  // counts are part of a program's cache key, so warming before they settle
  // builds a full set of programs against 3 directional / 9 point lights that
  // the renderer, seeing 1 and 8, never looks up. The stall then returns
  // untouched, with the wasted compile added to it.
  useFrame(() => {
    if (started.current || !flushed.current) return;
    started.current = true;

    // A program's cache key depends on the render target that is bound while
    // it is built: tone mapping and output color space are read straight off
    // the screen when the target is null, and forced to NoToneMapping /
    // LinearSRGB when it is not. This scene always draws through
    // EffectComposer — into a buffer — so warming with no target bound builds
    // a whole set of programs under a key the renderer will never look up, and
    // leaves the real ones to compile mid-scroll exactly as before. Any
    // non-XR target produces the right key; a 1x1 is enough.
    const proxy = new THREE.WebGLRenderTarget(1, 1);
    const previous = gl?.getRenderTarget?.() ?? null;

    let compiling;
    try {
      gl?.setRenderTarget?.(proxy);
      // compileAsync builds the programs synchronously and only awaits the
      // driver reporting them ready, so restoring the target below cannot
      // race it.
      compiling = gl?.compileAsync?.(scene, camera);
    } catch {
      compiling = undefined;
    } finally {
      gl?.setRenderTarget?.(previous);
    }

    const finish = () => {
      proxy.dispose();
      settle();
    };

    if (compiling && typeof compiling.then === 'function') {
      compiling.then(finish, finish);
    } else {
      finish();
    }
  });

  return null;
}

// ── WorldCanvas — full-viewport canvas, IS the visual experience ──────────
interface WorldCanvasProps {
  scrollProgress: React.RefObject<number>;
  /**
   * Called once the scene is both painted and warm — a frame has been drawn
   * (BUG-001) and every material's program is compiled (BUG-002). The loading
   * splash is sized to cover both; covering real work is its whole purpose.
   */
  onReady?: () => void;
}

export default function WorldCanvas({
  scrollProgress,
  onReady,
}: WorldCanvasProps) {
  // Spaceship (with thrust particles, lasers, and per-frame work) is desktop-only.
  // Below 1024px the scene reads cleaner and avoids the GPU/CPU cost on mobile.
  const showSpaceship = useMediaQuery('(min-width: 1024px)');
  // Single quality gate for the whole scene: < 1024px runs the low tier
  // (fewer particles, lower dpr, lighter post-processing, simpler shaders).
  const isMobile = !showSpaceship;

  // Readiness is two independent signals that both have to land before the
  // splash can honestly say "SCENE LOADED." Neither is ordered against the
  // other — whichever finishes last fires onReady, exactly once.
  const readyParts = useRef({ painted: false, warm: false, fired: false });
  const markReady = useCallback(
    (part: 'painted' | 'warm') => {
      const parts = readyParts.current;
      parts[part] = true;
      if (parts.fired || !parts.painted || !parts.warm) return;
      parts.fired = true;
      onReady?.();
    },
    [onReady],
  );
  const handlePainted = useCallback(() => markReady('painted'), [markReady]);
  const handleWarm = useCallback(() => markReady('warm'), [markReady]);

  // Static background star field — fewer points on mobile.
  const bgStars = useMemo(
    () => buildBgStars(isMobile ? BG_STAR_COUNT_MOBILE : BG_STAR_COUNT_DESKTOP),
    [isMobile],
  );

  // Pause the render loop while the tab is backgrounded — the scene animates
  // continuously, so 'demand' isn't viable, but there's no reason to keep
  // rendering when the page isn't visible.
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');
  useEffect(() => {
    const onVisibility = () =>
      setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 70 }}
        dpr={[1, isMobile ? 1 : 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        style={{ background: 'transparent' }}
        frameloop={frameloop}
      >
        {/* Lighting — ambient base + directional sun from upper-left */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1.2}
          color="#ffe8cc"
        />

        <FirstFrameSignal onReady={handlePainted} />
        {/* Keyed on the scene's composition: crossing the 1024px breakpoint
            mounts or unmounts the craft, and a craft that arrives after the
            warm-up has run has cold programs again — the BUG-002 stall, back
            once. Remounting re-runs the compile over the new scene. */}
        <SceneWarmup
          key={showSpaceship ? 'with-craft' : 'without-craft'}
          onWarm={handleWarm}
        />

        <CameraRig scrollProgress={scrollProgress} />

        {/* Static background star field — always visible, never animated */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[bgStars, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.007}
            color="#ddeeff"
            transparent
            opacity={0.3}
            sizeAttenuation
          />
        </points>

        <ParticleSystem scrollProgress={scrollProgress} />
        <UFO scrollProgress={scrollProgress} />
        <Planet scrollProgress={scrollProgress} isMobile={isMobile} />
        <Satellite scrollProgress={scrollProgress} />
        <Galaxy scrollProgress={scrollProgress} isMobile={isMobile} />
        {showSpaceship && <Spaceship scrollProgress={scrollProgress} />}

        <EffectComposer multisampling={0}>
          {/* Bloom is the heaviest post pass; mobile uses fewer mip levels and
              a lower intensity to cut fragment cost while keeping the glow. */}
          <Bloom
            luminanceThreshold={0.9}
            luminanceSmoothing={0.3}
            intensity={isMobile ? 1.0 : 1.5}
            mipmapBlur
            radius={isMobile ? 0.7 : 0.85}
            levels={isMobile ? 3 : 5}
          />
          <Vignette eskil={false} offset={0.3} darkness={0.55} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
