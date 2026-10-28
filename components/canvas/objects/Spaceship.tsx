'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { craftFlightProgress, craftPosition } from '@/utils/craftFlight';

const THRUST_PER_ENGINE = 70;
const ENGINE_COUNT = 2;
const TOTAL_THRUST = THRUST_PER_ENGINE * ENGINE_COUNT;
const SPACESHIP_LAYER = 3;

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

// How far into the flight the volley goes off, as a fraction of the scroll
// band. Far enough in that the craft is properly in frame when it fires.
const LASER_ARM_AT = 0.45;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const customGrungeShader = (shader: {
  vertexShader: string;
  fragmentShader: string;
}) => {
  shader.vertexShader = `
    varying vec3 vWorldPosition;
    ${shader.vertexShader}
  `.replace(
    `#include <worldpos_vertex>`,
    `#include <worldpos_vertex>
     vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`,
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
    `,
  );
};

interface SpaceshipProps {
  scrollProgress: React.RefObject<number>;
}
export default function Spaceship({ scrollProgress }: SpaceshipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const thrustRef = useRef<THREE.InstancedMesh>(null);
  const laserRef = useRef<THREE.InstancedMesh>(null);
  const laserArmed = useRef(false);
  const laserTime = useRef(0);
  // Whether the craft's meshes are currently shown, so the toggle below only
  // walks the children when it actually changes.
  const shown = useRef(true);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const { camera } = useThree();

  useEffect(() => {
    if (camera && camera.layers) {
      camera.layers.enable(SPACESHIP_LAYER);
    }
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child.layers) {
          child.layers.set(SPACESHIP_LAYER);
        }
      });
    }
    return () => {
      if (camera && camera.layers) {
        camera.layers.disable(SPACESHIP_LAYER);
      }
    };
  }, [camera]);

  const pData = useRef(new Float32Array(PARTICLE_DATA));

  useEffect(() => {
    if (thrustRef.current) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      for (let i = 0; i < TOTAL_THRUST; i++)
        thrustRef.current.setMatrixAt(i, dummy.matrix);
      thrustRef.current.instanceMatrix.needsUpdate = true;

      // Claim the instance-color buffer now, while the loading splash is still
      // up. three.js allocates it lazily on the first setColorAt, and that call
      // otherwise lands in the fly-in branch below — where it flips
      // USE_INSTANCING_COLOR on, changes this material's program cache key, and
      // forces a recompile on the one frame the craft arrives (BUG-002).
      for (let i = 0; i < TOTAL_THRUST; i++)
        thrustRef.current.setColorAt(i, tempColor.setRGB(0, 0, 0));
      if (thrustRef.current.instanceColor)
        thrustRef.current.instanceColor.needsUpdate = true;
    }
    if (laserRef.current) {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      for (let i = 0; i < LASER_COUNT; i++)
        laserRef.current.setMatrixAt(i, dummy.matrix);
      laserRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, tempColor]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !thrustRef.current || !laserRef.current) return;

    const progress = scrollProgress.current ?? 0;
    const t = clock.getElapsedTime();

    // Position is a pure function of scroll (BUG-003), so standing still in
    // the craft's section keeps the craft there, and scrubbing back walks it
    // out the way it came.
    const flyT = craftFlightProgress(progress);
    const [px, py, pz] = craftPosition(progress);
    groupRef.current.position.set(px, py, pz);

    // Outside its band the craft is not in the scene at all.
    //
    // Hiding it by position alone does not work: at 70° fov the frustum is
    // very wide out where the flight begins, and on a 16:9 window a craft
    // parked at the start of its path sits at NDC x ≈ 0.65 — on screen, a
    // speck hanging behind the merkaba, the UFO and the planet for the whole
    // first half of the scroll. The old code dodged this by parking the craft
    // at a separate hidden spot until its trigger fired; driving position from
    // scroll removed that hiding place, so hide it outright instead.
    //
    // The craft's two engine lights are deliberately left alone. three.js
    // gathers lights with traverseVisible, so hiding them would take the
    // scene from 8 point lights to 6 — and light counts are part of a
    // material's program cache key, so every program warmed during the
    // loading splash would be thrown away and recompiled mid-scroll, which is
    // the whole of BUG-002 undone. They light nothing while the craft is
    // off-stage; their `distance` is 5.5.
    //
    // Also skips the per-frame particle work for the rest of the scroll.
    const flying = flyT > 0 && flyT < 1;
    if (flying !== shown.current) {
      shown.current = flying;
      for (const child of groupRef.current.children) {
        if (!(child as THREE.Light).isLight) child.visible = flying;
      }
    }
    if (!flying) {
      laserArmed.current = false;
      return;
    }

    // The volley is a travelling projectile, so its flight stays on the clock:
    // driving a bolt from scroll would run it backwards when the visitor
    // scrubs back. Scroll controls the trigger instead — crossing into the
    // band fires it, leaving re-arms it, so scrubbing back and forward lets
    // you watch it again.
    if (!laserArmed.current && flyT >= LASER_ARM_AT) {
      laserArmed.current = true;
      laserTime.current = t;
    } else if (flyT < LASER_ARM_AT) {
      laserArmed.current = false;
    }
    const sinceVolley = laserArmed.current ? t - laserTime.current : -1;

    const d = Math.min(delta, 1);
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
        off.z + tail,
      );
      dummy.scale.setScalar(0.022 + age * 0.09);
      dummy.updateMatrix();
      thrustRef.current.setMatrixAt(i, dummy.matrix);

      let r, g, blue;
      if (age < 0.2) {
        const tt = age / 0.2;
        r = 1;
        g = 1;
        blue = lerp(1, 0.35, tt);
      } else if (age < 0.45) {
        const tt = (age - 0.2) / 0.25;
        r = 1;
        g = lerp(1, 0.42, tt);
        blue = lerp(0.35, 0, tt);
      } else if (age < 0.72) {
        const tt = (age - 0.45) / 0.27;
        r = lerp(1, 0.62, tt);
        g = lerp(0.42, 0.07, tt);
        blue = 0;
      } else {
        const tt = (age - 0.72) / 0.28;
        r = lerp(0.62, 0.04, tt);
        g = lerp(0.07, 0, tt);
        blue = 0;
      }

      thrustRef.current.setColorAt(i, tempColor.setRGB(r, g, blue));
    }

    thrustRef.current.instanceMatrix.needsUpdate = true;
    if (thrustRef.current.instanceColor)
      thrustRef.current.instanceColor.needsUpdate = true;

    const LASER_SPEED = 70;
    // Relative to the volley being armed, which scroll now decides — the old
    // 1.8s offset existed to delay the volley past the start of the flight,
    // and LASER_ARM_AT does that job instead.
    const FIRE_START = 0;

    for (let i = 0; i < LASER_COUNT; i++) {
      const isPort = i % 2 === 0;
      const burstIndex = Math.floor(i / 2);
      const fireTime = FIRE_START + burstIndex * 0.15;

      const timeSinceFired = sinceVolley - fireTime;

      if (timeSinceFired > 0 && timeSinceFired < 1.2) {
        const zPos = -0.4 - timeSinceFired * LASER_SPEED;
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
    <group ref={groupRef} rotation={[0.04, 2.2, 0.45]} scale={4}>
      <instancedMesh
        ref={thrustRef}
        args={[undefined, undefined, TOTAL_THRUST]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 5, 4]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <instancedMesh
        ref={laserRef}
        args={[undefined, undefined, LASER_COUNT]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.03, 0.03, 1.8, 6]} />
        <meshBasicMaterial color="#ff2255" toneMapped={false} />
      </instancedMesh>

      <pointLight
        position={[-0.65, -0.05, 2.0]}
        color="#ff7722"
        intensity={12}
        distance={5.5}
      />
      <pointLight
        position={[0.65, -0.05, 2.0]}
        color="#ff7722"
        intensity={12}
        distance={5.5}
      />

      <mesh position={[0, 0, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 2.8, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.9}
          roughness={0.1}
          onBeforeCompile={customGrungeShader}
        />
      </mesh>

      <mesh position={[0, 0, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.8, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.9}
          roughness={0.1}
          onBeforeCompile={customGrungeShader}
        />
      </mesh>

      <mesh position={[-1.6, -0.05, 0.4]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[2.5, 0.08, 1.5]} />
        <meshStandardMaterial
          color="#f0f0f0"
          metalness={0.8}
          roughness={0.15}
          onBeforeCompile={customGrungeShader}
        />
      </mesh>
      <mesh position={[1.6, -0.05, 0.4]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[2.5, 0.08, 1.5]} />
        <meshStandardMaterial
          color="#f0f0f0"
          metalness={0.8}
          roughness={0.15}
          onBeforeCompile={customGrungeShader}
        />
      </mesh>

      <mesh position={[-2.7, 0.2, 0.8]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.06, 0.6, 1.2]} />
        <meshStandardMaterial
          color="#ff3333"
          metalness={0.6}
          roughness={0.2}
          onBeforeCompile={customGrungeShader}
        />
      </mesh>
      <mesh position={[2.7, 0.2, 0.8]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.06, 0.6, 1.2]} />
        <meshStandardMaterial
          color="#ff3333"
          metalness={0.6}
          roughness={0.2}
          onBeforeCompile={customGrungeShader}
        />
      </mesh>

      <mesh position={[0, 0.25, -0.5]} scale={[0.6, 0.4, 1.4]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshPhysicalMaterial
          color="#111111"
          transmission={0.1}
          metalness={0.9}
          roughness={0.2}
          clearcoat={0.5}
        />
      </mesh>

      <mesh position={[-0.65, -0.05, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 1.4, 12]} />
        <meshStandardMaterial
          color="#e0e0e0"
          metalness={0.95}
          roughness={0.1}
          onBeforeCompile={customGrungeShader}
        />
      </mesh>
      <mesh position={[0.65, -0.05, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 1.4, 12]} />
        <meshStandardMaterial
          color="#e0e0e0"
          metalness={0.95}
          roughness={0.1}
          onBeforeCompile={customGrungeShader}
        />
      </mesh>

      <mesh position={[-0.65, -0.05, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.22, 0.2, 12]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.9} />
      </mesh>
      <mesh position={[0.65, -0.05, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.22, 0.2, 12]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.9} />
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
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.6} />
      </mesh>
      <mesh position={[2.2, -0.05, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 1.2, 8]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.6} />
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
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 0.2, 0.2]}>
        <boxGeometry args={[0.1, 0.1, 1.0]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.8} />
      </mesh>
    </group>
  );
}
