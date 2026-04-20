'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PlanetProps {
  scrollProgress: React.RefObject<number>
}

// ── Flat, Saturn-like Orbital Rings ───────────────────────────────────────
function OrbitalParticles() {
  const count = 5000 // More particles for a dense ring
  const particlesRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      
      // Create a dense inner ring and a sparser outer ring
      const isInner = Math.random() > 0.3
      const radius = isInner 
        ? 24 + Math.random() * 4 
        : 29 + Math.random() * 8
        
      // VERY flat height spread to look like a true planetary ring
      const height = (Math.random() - 0.5) * 0.15
      
      p[i * 3] = Math.cos(angle) * radius
      p[i * 3 + 1] = height
      p[i * 3 + 2] = Math.sin(angle) * radius
    }
    return p
  }, [count])

  const colors = useMemo(() => {
    const c = new Float32Array(count * 3)
    const baseColor = new THREE.Color('#4488ff') // Cyan/Blue
    const dustColor = new THREE.Color('#88aaff') // Light Ice
    
    for (let i = 0; i < count; i++) {
      const color = Math.random() > 0.5 ? baseColor : dustColor
      // Add slight variation
      c[i * 3] = color.r * (0.8 + Math.random() * 0.2)
      c[i * 3 + 1] = color.g * (0.8 + Math.random() * 0.2)
      c[i * 3 + 2] = color.b * (0.8 + Math.random() * 0.2)
    }
    return c
  }, [count])

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      // Ring rotation
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  return (
    // Tilt the ring so it looks majestic from the camera angle
    <points ref={particlesRef} rotation={[0.3, 0, -0.1]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        vertexColors
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

const NOISE_GLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  // Fractional Brownian Motion for cloud layers
  float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 6; ++i) {
      v += a * snoise(x);
      x = x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }
`;

// Layer 1 is dedicated specifically to the Planet and its exclusive lighting
const PLANET_LIGHTING_LAYER = 1;

export default function Planet({ scrollProgress }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  
  const eclipseLightRef = useRef<THREE.PointLight>(null)
  const frontLightRef = useRef<THREE.DirectionalLight>(null)
  const fillLightRef = useRef<THREE.DirectionalLight>(null)
  const planetMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), [])

  useEffect(() => {
    // 1. Assign the planet mesh to Layer 1 (and keep it on Layer 0 so camera sees it)
    // Add safety check: react-three-fiber mock in Vitest doesn't always populate `layers`
    if (meshRef.current && meshRef.current.layers) {
      meshRef.current.layers.enable(PLANET_LIGHTING_LAYER);
    }
    
    // 2. Isolate the custom planet lights entirely to Layer 1.
    // This prevents them from hitting the UFO or Spaceship (which are on Layer 0).
    if (eclipseLightRef.current && eclipseLightRef.current.layers) {
      eclipseLightRef.current.layers.set(PLANET_LIGHTING_LAYER);
    }
    if (frontLightRef.current && frontLightRef.current.layers) {
      frontLightRef.current.layers.set(PLANET_LIGHTING_LAYER);
    }
    if (fillLightRef.current && fillLightRef.current.layers) {
      fillLightRef.current.layers.set(PLANET_LIGHTING_LAYER);
    }
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      // Very slow, majestic rotation
      groupRef.current.rotation.y = t * 0.05 
    }

    if (eclipseLightRef.current) {
      const progress = scrollProgress.current ?? 0
      const localT = Math.max(0, Math.min(1, (progress - 0.35) / 0.2))
      eclipseLightRef.current.intensity = localT * 12
    }

    uniforms.uTime.value = t
    
    if (planetMatRef.current && planetMatRef.current.userData?.shader) {
      planetMatRef.current.userData.shader.uniforms.uTime.value = t
    }
  })

  const handleBeforeCompile = (shader: any) => {
    if (planetMatRef.current) {
      planetMatRef.current.userData.shader = shader
    }
    shader.uniforms.uTime = uniforms.uTime

    // Add local position varying
    shader.vertexShader = `
      varying vec3 vLocalPos;
    ` + shader.vertexShader

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      // Crucial fix: We pass the UNTRANSFORMED local position to the fragment shader.
      // This means the textures/noise will rotate WITH the planet, fixing the "swimming" effect.
      vLocalPos = position;
      `
    )

    shader.fragmentShader = `
      uniform float uTime;
      varying vec3 vLocalPos;
      ${NOISE_GLSL}
    ` + shader.fragmentShader

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      
      // GAS GIANT STORMS - Domain Warping technique
      // We use the latitude (vLocalPos.y) to stretch the noise horizontally into bands like Jupiter/Neptune.
      
      vec3 coord = vLocalPos * 0.15;
      
      // Stretch horizontally
      coord.x *= 0.5; 
      coord.z *= 0.5;
      coord.y *= 2.0; 
      
      // Animate the clouds slightly over time
      coord.x += uTime * 0.02;

      // Layer 1
      float q = fbm(coord + vec3(0.0, uTime * 0.01, 0.0));
      
      // Layer 2 (warped by layer 1)
      float r = fbm(coord + 2.0 * q + vec3(1.7, 9.2, 3.5));
      
      // Final noise value
      float gasNoise = fbm(coord + 3.0 * r);
      
      // Banding effect based on latitude
      float bands = sin(vLocalPos.y * 0.8 + gasNoise * 4.0) * 0.5 + 0.5;
      
      // Deep Neptune / Mystic Space Color Palette
      vec3 colorDeep = vec3(0.02, 0.05, 0.2);   // Deep space blue void
      vec3 colorMid = vec3(0.1, 0.3, 0.7);      // Rich ocean blue
      vec3 colorHigh = vec3(0.0, 0.8, 1.0);     // Bright cyan storms
      vec3 colorStorm = vec3(0.8, 0.9, 1.0);    // White/Cyan swirling clouds
      
      // Mix colors based on the complex warped noise
      vec3 finalColor = mix(colorDeep, colorMid, clamp(gasNoise * 1.5, 0.0, 1.0));
      finalColor = mix(finalColor, colorHigh, clamp(bands * gasNoise * 2.0, 0.0, 1.0));
      finalColor = mix(finalColor, colorStorm, clamp((gasNoise - 0.6) * 4.0, 0.0, 1.0));
      
      diffuseColor.rgb = finalColor;
      `
    )
  }

  return (
    <group ref={groupRef} position={[0, -30, -50]}>
      {/* 
        PERFECTLY SMOOTH GAS GIANT
        Zero vertex displacement. Beautiful, mathematically generated swirling cloud bands.
      */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[20, 128, 128]} />
        <meshStandardMaterial
          ref={planetMatRef}
          roughness={0.6} // Gas giants are relatively smooth/matte
          metalness={0.1}
          onBeforeCompile={handleBeforeCompile}
        />
      </mesh>

      <OrbitalParticles />

      {/* Lighting tailored for a smooth, massive body */}
      <pointLight
        ref={eclipseLightRef}
        position={[0, 5, -25]}
        color="#0088ff"
        intensity={0}
        distance={100}
        decay={1.5}
      />

      <directionalLight
        ref={frontLightRef}
        position={[25, 15, 30]}
        color="#ffffff" 
        intensity={2.5}
      />
      
      <directionalLight
        ref={fillLightRef}
        position={[-20, -10, 10]}
        color="#1a2b4c"
        intensity={0.8}
      />
    </group>
  )
}
