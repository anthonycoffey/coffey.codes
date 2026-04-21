'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const THRUST_PER_ENGINE = 70;
const ENGINE_COUNT = 2;
const TOTAL_THRUST = THRUST_PER_ENGINE * ENGINE_COUNT;

const ENGINE_OFFSETS = [
  new THREE.Vector3(-0.65, -0.05, 1.5), 
  new THREE.Vector3(0.65, -0.05, 1.5), 
];

const PARTICLE_DATA = (() => {
  const arr = new Float32Array(TOTAL_THRUST * 4);
  for (let i = 0; i < TOTAL_THRUST; i++) {
    arr[i * 4 + 0] = Math.random(); 
    arr[i * 4 + 1] = 0.5 + Math.random() * 0.8; 
    arr[i * 4 + 2] = (Math.random() - 0.5) * 0.16; 
    arr[i * 4 + 3] = (Math.random() - 0.5) * 0.16; 
  }
  return arr;
})();

const LASER_COUNT = 6;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const customGrungeShader = (shader: THREE.Shader) => {
  shader.vertexShader = `
    varying vec3 vWorldPosition;
    ${shader.vertexShader}
  `.replace(
    `#include <worldpos_vertex>`,
    `#include <worldpos_vertex>
     vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
  );

  shader.fragmentShader = `
    varying vec3 vWorldPosition;
    
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
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
      i = mod(i, 289.0 );
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
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    ${shader.fragmentShader}
  `.replace(
    `#include <color_fragment>`,
    `#include <color_fragment>
     float n1 = snoise(vWorldPosition * 12.0);
     float n2 = snoise(vWorldPosition * 35.0);
     float grunge = smoothstep(-0.3, 0.8, n1 * 0.7 + n2 * 0.3);
     diffuseColor.rgb *= mix(0.35, 1.0, grunge);
    `
  );
};

interface SpaceshipProps { scrollProgress: React.RefObject<number>; }
export default function Spaceship({ scrollProgress }: SpaceshipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const thrustRef = useRef<THREE.InstancedMesh>(null);
  const laserRef = useRef<THREE.InstancedMesh>(null);
  const triggered = useRef(false);
  const triggerTime = useRef(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const pData = useRef(new Float32Array(PARTICLE_DATA));

  useEffect(() => {
    if (thrustRef.current) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      for (let i = 0; i < TOTAL_THRUST; i++) thrustRef.current.setMatrixAt(i, dummy.matrix);
      thrustRef.current.instanceMatrix.needsUpdate = true;
    }
    if (laserRef.current) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      for (let i = 0; i < LASER_COUNT; i++) laserRef.current.setMatrixAt(i, dummy.matrix);
      laserRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !thrustRef.current || !laserRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    if (progress < 0.62) {
      groupRef.current.position.set(200, 0, -80);
      triggered.current = false;
      return;
    }

    if (!triggered.current) {
      triggered.current = true;
      triggerTime.current = t;
    }

    const elapsed = t - triggerTime.current;
    const flyT = Math.min(1, elapsed / 5);

    groupRef.current.position.set(
      lerp(70, -65, flyT),
      lerp(1, 6, flyT),
      lerp(-120, -22, flyT)
    );

    const d = Math.min(delta, 0.05); 
    const pd = pData.current;

    for (let i = 0; i < TOTAL_THRUST; i++) {
      const base = i * 4;
      const engine = Math.floor(i / THRUST_PER_ENGINE);

      pd[base] = (pd[base] + d * pd[base + 1]) % 1.0;
      const age = pd[base];

      const off = ENGINE_OFFSETS[engine];
      const tail = age * 3.8;
      const spread = age * 1.3;

      dummy.position.set(
        off.x + pd[base + 2] * spread,
        off.y + pd[base + 3] * spread,
        off.z + tail
      );
      dummy.scale.setScalar(0.022 + age * 0.09);
      dummy.updateMatrix();
      thrustRef.current.setMatrixAt(i, dummy.matrix);

      let r, g, blue;
      if (age < 0.2) {
        const tt = age / 0.2;
        r = 1; g = 1; blue = lerp(1, 0.35, tt);
      } else if (age < 0.45) {
        const tt = (age - 0.2) / 0.25;
        r = 1; g = lerp(1, 0.42, tt); blue = lerp(0.35, 0, tt);
      } else if (age < 0.72) {
        const tt = (age - 0.45) / 0.27;
        r = lerp(1, 0.62, tt); g = lerp(0.42, 0.07, tt); blue = 0;
      } else {
        const tt = (age - 0.72) / 0.28;
        r = lerp(0.62, 0.04, tt); g = lerp(0.07, 0, tt); blue = 0;
      }

      thrustRef.current.setColorAt(i, tempColor.setRGB(r, g, blue));
    }

    thrustRef.current.instanceMatrix.needsUpdate = true;
    if (thrustRef.current.instanceColor) thrustRef.current.instanceColor.needsUpdate = true;

    const LASER_SPEED = 70;
    const FIRE_START = 1.6; 

    for (let i = 0; i < LASER_COUNT; i++) {
      const isPort = i % 2 === 0;
      const burstIndex = Math.floor(i / 2);
      const fireTime = FIRE_START + burstIndex * 0.15; 
      
      const timeSinceFired = elapsed - fireTime;
      
      if (timeSinceFired > 0 && timeSinceFired < 1.2) {
        const zPos = -0.4 - (timeSinceFired * LASER_SPEED);
        dummy.position.set(isPort ? -2.2 : 2.2, -0.05, zPos);
        dummy.rotation.set(Math.PI / 2, 0, 0); 
        dummy.scale.setScalar(1);
      } else {
        dummy.position.set(0, 0, 0);
        dummy.scale.setScalar(0);
      }
      
      dummy.updateMatrix();
      laserRef.current.setMatrixAt(i, dummy.matrix);
    }
    laserRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} rotation={[0.04, 2.2, 0.45]} scale={2}>
      <instancedMesh ref={thrustRef} args={[null, null, TOTAL_THRUST]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 4]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={laserRef} args={[null, null, LASER_COUNT]} frustumCulled={false}>
        <cylinderGeometry args={[0.03, 0.03, 1.8, 6]} />
        <meshBasicMaterial color="#ff2255" toneMapped={false} />
      </instancedMesh>

      <pointLight position={[-0.65, -0.05, 2.0]} color="#ff7722" intensity={12} distance={5.5} />
      <pointLight position={[0.65, -0.05, 2.0]} color="#ff7722" intensity={12} distance={5.5} />

      <mesh position={[0, 0, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 2.8, 16]} />
        <meshPhysicalMaterial color="#d0d4d8" metalness={0.6} roughness={0.8} onBeforeCompile={customGrungeShader} />
      </mesh>

      <mesh position={[0, 0, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.8, 16]} />
        <meshPhysicalMaterial color="#d0d4d8" metalness={0.6} roughness={0.8} onBeforeCompile={customGrungeShader} />
      </mesh>

      <mesh position={[-1.6, -0.05, 0.4]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[2.5, 0.08, 1.5]} />
        <meshPhysicalMaterial color="#3a424a" metalness={0.7} roughness={0.85} onBeforeCompile={customGrungeShader} />
      </mesh>
      <mesh position={[1.6, -0.05, 0.4]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[2.5, 0.08, 1.5]} />
        <meshPhysicalMaterial color="#3a424a" metalness={0.7} roughness={0.85} onBeforeCompile={customGrungeShader} />
      </mesh>

      <mesh position={[-2.7, 0.2, 0.8]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.06, 0.6, 1.2]} />
        <meshPhysicalMaterial color="#c04433" metalness={0.5} roughness={0.9} onBeforeCompile={customGrungeShader} />
      </mesh>
      <mesh position={[2.7, 0.2, 0.8]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.06, 0.6, 1.2]} />
        <meshPhysicalMaterial color="#c04433" metalness={0.5} roughness={0.9} onBeforeCompile={customGrungeShader} />
      </mesh>

      <mesh position={[0, 0.25, -0.5]} scale={[0.6, 0.4, 1.4]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshPhysicalMaterial color="#111111" transmission={0.1} metalness={0.9} roughness={0.2} clearcoat={0.5} />
      </mesh>

      <mesh position={[-0.65, -0.05, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 1.4, 12]} />
        <meshPhysicalMaterial color="#2a2e33" metalness={0.8} roughness={0.7} onBeforeCompile={customGrungeShader} />
      </mesh>
      <mesh position={[0.65, -0.05, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 1.4, 12]} />
        <meshPhysicalMaterial color="#2a2e33" metalness={0.8} roughness={0.7} onBeforeCompile={customGrungeShader} />
      </mesh>

      <mesh position={[-0.65, -0.05, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.22, 0.2, 12]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.9} />
      </mesh>
      <mesh position={[0.65, -0.05, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.22, 0.2, 12]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.9} />
      </mesh>

      <mesh position={[-0.65, -0.05, 1.51]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 12]} />
        <meshBasicMaterial color="#ffaa33" toneMapped={false} />
      </mesh>
      <mesh position={[0.65, -0.05, 1.51]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 12]} />
        <meshBasicMaterial color="#ffaa33" toneMapped={false} />
      </mesh>

      <mesh position={[-2.2, -0.05, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 1.2, 8]} />
        <meshPhysicalMaterial color="#222" metalness={0.8} roughness={0.6} />
      </mesh>
      <mesh position={[2.2, -0.05, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 1.2, 8]} />
        <meshPhysicalMaterial color="#222" metalness={0.8} roughness={0.6} />
      </mesh>

      <mesh position={[-2.75, -0.05, -0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#00ffff" toneMapped={false} />
      </mesh>
      <mesh position={[2.75, -0.05, -0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#00ffff" toneMapped={false} />
      </mesh>

      <mesh position={[-0.3, 0.2, 0.2]}>
        <boxGeometry args={[0.1, 0.1, 1.0]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 0.2, 0.2]}>
        <boxGeometry args={[0.1, 0.1, 1.0]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.8} />
      </mesh>
    </group>
  );
}
