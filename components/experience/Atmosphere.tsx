"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { roomPresence, MONOLITH } from "./rooms";

const beamVertex = /* glsl */ `
  uniform float uHeight;
  uniform float uRadius;
  varying float vAlong;
  varying float vRadial;
  void main() {
    // ConeGeometry: base at y=0 (wide), apex at y=uHeight (point)
    vAlong = clamp(position.y / uHeight, 0.0, 1.0);
    float sliceR = max(uRadius * (1.0 - vAlong), 0.001);
    vRadial = length(position.xz) / sliceR;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beamFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uColor;
  varying float vAlong;
  varying float vRadial;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    // Soft radial falloff — no hard cone edges
    float radial = smoothstep(1.0, 0.08, vRadial);
    radial = pow(radial, 1.8);

    // Fade in from source, dissolve before floor
    float along = smoothstep(0.0, 0.12, vAlong) * smoothstep(1.0, 0.35, vAlong);
    along = pow(along, 1.4);

    // Subtle film grain / dust in the beam
    float n = noise(vec2(vAlong * 8.0 + uTime * 0.15, vRadial * 6.0)) * 0.12;

    float alpha = radial * along * uOpacity * (0.88 + n);
    vec3 col = uColor * (0.7 + along * 0.35);

    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * Cinematic volumetric light shafts — soft, low-opacity, shader-driven falloff
 * instead of solid game-like cones.
 */
function Beams() {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<THREE.ShaderMaterial[]>([]);

  const beams = useMemo(
    () => [
      { x: -3.2, z: -4, rot: 0.1, w: 0.55, h: 14 },
      { x: 2.2, z: -5, rot: -0.13, w: 0.72, h: 15 },
      { x: 4.0, z: -2.5, rot: 0.16, w: 0.48, h: 13 },
      { x: -0.6, z: -6, rot: -0.04, w: 0.58, h: 14.5 },
      { x: 1.2, z: -3, rot: 0.06, w: 0.42, h: 12 },
      { x: -2.0, z: -2.2, rot: 0.22, w: 0.38, h: 11 },
    ],
    []
  );

  const materials = useMemo(() => {
    const list: THREE.ShaderMaterial[] = [];
    beams.forEach((b) => {
      const m = new THREE.ShaderMaterial({
        uniforms: {
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#ffd4a8") },
          uHeight: { value: b.h },
          uRadius: { value: b.w },
        },
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      list.push(m);
    });
    mats.current = list;
    return list;
  }, [beams]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = roomPresence(MONOLITH, scrollStore.peek().heroProgress);
    g.visible = p > 0.001;
    g.rotation.y += delta * 0.008;

    // Slow cinematic breathe — not arcade flicker
    const breathe = 0.92 + Math.sin(state.clock.elapsedTime * 0.45) * 0.08;
    const targetOpacity = p * 0.028 * breathe;

    mats.current.forEach((m, i) => {
      m.uniforms.uTime.value = state.clock.elapsedTime + i * 1.7;
      const cur = m.uniforms.uOpacity.value;
      m.uniforms.uOpacity.value = THREE.MathUtils.damp(cur, targetOpacity, 3, delta);
    });
  });

  return (
    <group ref={group} position={[MONOLITH.anchor[0], 0, MONOLITH.anchor[2]]}>
      {beams.map((b, i) => (
        <mesh key={i} position={[b.x, b.h * 0.5, b.z + 3]} rotation={[0, 0, b.rot]} material={materials[i]}>
          <coneGeometry args={[b.w, b.h, 32, 1, true]} />
        </mesh>
      ))}
    </group>
  );
}

function Dust() {
  const points = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 700;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = Math.random() * -72 + 8;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state, delta) => {
    const p = points.current;
    if (!p) return;
    const mat = p.material as THREE.PointsMaterial;
    mat.opacity = THREE.MathUtils.damp(mat.opacity, 0.32, 4, delta);
    p.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
  });

  return (
    <points ref={points} geometry={geom}>
      <pointsMaterial
        size={0.028}
        transparent
        opacity={0}
        color="#ffd9b0"
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

export default function Atmosphere({ lowPerf }: { lowPerf: boolean }) {
  if (lowPerf) return null;
  return (
    <>
      <Beams />
      <Dust />
    </>
  );
}
