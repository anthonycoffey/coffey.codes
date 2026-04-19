'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PlanetProps {
  scrollProgress: React.RefObject<number>
}

// ── Orbital Particles Component ──────────────────────────────────────────
function OrbitalParticles() {
  const count = 2000
  const particlesRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 23 + Math.random() * 15 // Ring from 23 to 38
      const height = (Math.random() - 0.5) * (Math.random() * 3)
      p[i * 3] = Math.cos(angle) * radius
      p[i * 3 + 1] = height
      p[i * 3 + 2] = Math.sin(angle) * radius
    }
    return p
  }, [count])

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.015
      particlesRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.05) * 0.05
    }
  })

  return (
    <points ref={particlesRef} rotation={[0.2, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.06} 
        color="#cceeff" 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/**
 * Large planet with custom moon surface shader, volumetric atmospheric fog, and orbital particles.
 */
export default function Planet({ scrollProgress }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const eclipseLightRef = useRef<THREE.PointLight>(null)
  const atmosphereRef = useRef<THREE.ShaderMaterial>(null)
  const planetMatRef = useRef<THREE.MeshStandardMaterial>(null)

  // Custom shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAtmosphereColor: { value: new THREE.Color('#4488ff') }
  }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.02
    }

    // Eclipse light intensity ramps up
    if (eclipseLightRef.current) {
      const progress = scrollProgress.current ?? 0
      const localT = Math.max(0, Math.min(1, (progress - 0.35) / 0.2))
      eclipseLightRef.current.intensity = localT * 12 // boosted
    }

    // Animate shaders
    uniforms.uTime.value = t
    
    // Animate planet surface material if `userData` was set in onBeforeCompile
    if (planetMatRef.current && planetMatRef.current.userData?.shader) {
      planetMatRef.current.userData.shader.uniforms.uTime.value = t
    }
  })

  // Set up the custom moon surface shader modification
  const handleBeforeCompile = (shader: any) => {
    if (planetMatRef.current) {
      planetMatRef.current.userData.shader = shader
    }
    shader.uniforms.uTime = uniforms.uTime

    shader.vertexShader = `
      varying vec3 vWorldPos;
    ` + shader.vertexShader

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      `
    )

    shader.fragmentShader = `
      uniform float uTime;
      varying vec3 vWorldPos;

      // GLSL Simplex 3D Noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v) { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
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
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }

      float getTerrain(vec3 p) {
        float n1 = snoise(p * 0.08);
        float n2 = snoise(p * 0.25);
        float n3 = snoise(p * 0.8);
        
        float crater = smoothstep(0.0, 0.7, abs(n1)); 
        float detail = n2 * 0.5 + n3 * 0.25;
        return crater * 1.5 + detail;
      }
    ` + shader.fragmentShader

    // Apply procedural bump map
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `#include <normal_fragment_maps>
      
      float tVal = getTerrain(vWorldPos);
      float dx = dFdx(tVal);
      float dy = dFdy(tVal);
      
      vec3 dpdx = dFdx(vWorldPos);
      vec3 dpdy = dFdy(vWorldPos);
      
      // Compute modified normal
      vec3 bump = normalize(normal - (dx * dpdx + dy * dpdy) * 2.0);
      normal = bump;
      `
    )

    // Apply lunar color variation
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
      
      float terrainH = getTerrain(vWorldPos);
      vec3 baseMoon = vec3(0.35, 0.38, 0.42);
      vec3 darkMare = vec3(0.12, 0.13, 0.16);
      
      diffuseColor.rgb = mix(darkMare, baseMoon, clamp(terrainH * 0.6 + 0.4, 0.0, 1.0));
      `
    )
  }

  // Atmospheric fog fragment shader
  const atmVertex = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * vec4(vPosition, 1.0);
    }
  `

  const atmFragment = `
    uniform float uTime;
    uniform vec3 uAtmosphereColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Simple hash-based noise for fog
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + .1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                     mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                     mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = dot(viewDir, vNormal);
      fresnel = max(0.0, fresnel);
      
      // Invert fresnel for rim effect
      float edge = 1.0 - fresnel;
      edge = pow(edge, 2.5);
      
      // Add moving noise for dust/fog effect
      vec3 worldPos = vPosition + vec3(0.0, uTime * 0.5, uTime * 0.2);
      float n = noise(worldPos * 0.5) * 0.5 + noise(worldPos * 1.5) * 0.25;
      
      float alpha = edge * 0.4 + (edge * n * 0.6);
      gl_FragColor = vec4(uAtmosphereColor, alpha * 0.8);
    }
  `

  return (
    <group ref={groupRef} position={[0, -30, -50]}>
      {/* 1. Procedural Moon Surface */}
      <mesh>
        <sphereGeometry args={[20, 64, 64]} />
        <meshStandardMaterial
          ref={planetMatRef}
          roughness={0.85}
          metalness={0.1}
          onBeforeCompile={handleBeforeCompile}
        />
      </mesh>

      {/* 2. Atmospheric Fog Shell */}
      <mesh>
        <sphereGeometry args={[20.5, 64, 64]} />
        <shaderMaterial
          ref={atmosphereRef}
          vertexShader={atmVertex}
          fragmentShader={atmFragment}
          uniforms={uniforms}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Orbital Particles */}
      <OrbitalParticles />

      {/* 4. Enhanced Illumination */}
      <pointLight
        ref={eclipseLightRef}
        position={[0, 5, -25]}
        color="#ffcc44"
        intensity={0}
        distance={100}
        decay={1.5}
      />

      <pointLight
        position={[0, 22, -5]}
        color="#ffffff"
        intensity={4}
        distance={40}
        decay={2}
      />
      
      {/* Raking light for crater emphasis */}
      <directionalLight
        position={[-20, 15, 20]}
        color="#dce6f2"
        intensity={1.2}
      />
    </group>
  )
}
