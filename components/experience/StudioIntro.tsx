"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";

/**
 * Music-studio intro that surrounds the camera at heroProgress ~0: a sculptural
 * curved white mixing console backed by an arc of white studio monitors (soffit
 * mains + floor stacks, ref: Brooklyn Beckham control room), a glass partition,
 * ceiling light strips and a matte digital rug instead of the harsh grid floor.
 * Fades out fast (before the camera pushes through it toward the video wall)
 * with gentle mouse parallax.
 */

const FADE_END = 0.05; // heroProgress safety cutoff
const START_FADE_S = 0.9; // seconds to dissolve the intro after the sound click
const LISTEN = new THREE.Vector3(0, 2.5, 13); // point the wall units aim at

function heroCutoff(t: number) {
  return THREE.MathUtils.clamp(1 - t / FADE_END, 0, 1);
}

/** lookAt helper: aims a group's +Z front at the listening position. */
function aimAtListener(g: THREE.Object3D, position: [number, number, number]) {
  const [px, py, pz] = position;
  // lookAt orients +Z away from its target, so look at the mirror point behind.
  g.lookAt(2 * px - LISTEN.x, 2 * py - LISTEN.y, 2 * pz - LISTEN.z);
}

// ---- curved console segments (concave "wing" desk opening toward camera) ----
interface Seg {
  x: number;
  z: number;
  ry: number;
}

function useConsole(): Seg[] {
  return useMemo(() => {
    const segs: Seg[] = [];
    const N = 20;
    const halfW = 5.4;
    for (let i = 0; i < N; i++) {
      const x = -halfW + 2 * halfW * (i / (N - 1));
      const z = 7.8 - (x * x) / 16;
      const dzdx = -(2 * x) / 16;
      const ry = -Math.atan2(dzdx, 1);
      segs.push({ x, z, ry });
    }
    return segs;
  }, []);
}

// ---- glowing softbox studio lights mounted behind the desk -------------------
// soffit arc + big side softboxes; each glows (bloom) with a small lens flare.
const SOFTBOXES: { p: [number, number, number]; s: number }[] = [
  { p: [-9.2, 5.0, -0.6], s: 1.15 },
  { p: [-5.9, 5.5, -1.9], s: 1.3 },
  { p: [-2.7, 5.9, -2.8], s: 1.4 },
  { p: [0.5, 6.05, -3.1], s: 1.45 },
  { p: [3.8, 5.75, -2.5], s: 1.35 },
  { p: [6.9, 5.35, -1.5], s: 1.25 },
  { p: [9.6, 4.95, -0.3], s: 1.15 },
  // big side softboxes
  { p: [-12.2, 2.6, 2.4], s: 2.2 },
  { p: [12.2, 2.6, 2.4], s: 2.2 },
];

// lazily-built radial glow sprite texture (client only)
let _glowTex: THREE.Texture | null = null;
function glowTexture(): THREE.Texture | null {
  if (_glowTex) return _glowTex;
  if (typeof document === "undefined") return null;
  const s = 128;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,252,245,1)");
  g.addColorStop(0.25, "rgba(255,248,235,0.55)");
  g.addColorStop(1, "rgba(255,245,230,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}

function Softbox({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    if (ref.current) aimAtListener(ref.current, position);
  }, [position]);
  const tex = glowTexture();
  return (
    <group ref={ref} position={position} scale={scale}>
      {/* thin softbox frame */}
      <mesh>
        <boxGeometry args={[1.72, 1.72, 0.14]} />
        <meshStandardMaterial color="#c9ccd2" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* glowing diffusion panel (emissive → blooms like a studio light) */}
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#fff4e4"
          emissiveIntensity={2.1}
          toneMapped={false}
        />
      </mesh>
      {/* soft halo spill + tiny lens flare (billboard, additive) */}
      {tex && (
        <>
          <sprite position={[0, 0, 0.2]} scale={[3.2, 3.2, 1]}>
            <spriteMaterial
              map={tex}
              blending={THREE.AdditiveBlending}
              transparent
              opacity={0.45}
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
          <sprite position={[0, 0, 0.22]} scale={[1.1, 1.1, 1]}>
            <spriteMaterial
              map={tex}
              blending={THREE.AdditiveBlending}
              transparent
              opacity={0.8}
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
          {/* faint anamorphic streak */}
          <sprite position={[0, 0, 0.21]} scale={[5.5, 0.28, 1]}>
            <spriteMaterial
              map={tex}
              blending={THREE.AdditiveBlending}
              transparent
              opacity={0.28}
              depthWrite={false}
              toneMapped={false}
            />
          </sprite>
        </>
      )}
    </group>
  );
}

// ---- matte digital rug (replaces the harsh grid on the visible intro floor) --
const rugVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const rugFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;

  float hash(vec2 p){
    return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
  }

  void main() {
    // soft radial fade so the rug blends into the dark floor (no hard rectangle)
    vec2 g = vUv - 0.5;
    float vig = smoothstep(0.5, 0.42, length(g));

    // flat, seamless fabric: very fine grain only (no square cells / grid)
    float grain =
      (hash(floor(vUv * vec2(900.0, 900.0))) - 0.5) * 0.05 +
      (hash(floor(vUv * vec2(300.0, 300.0))) - 0.5) * 0.03;

    // gentle large-scale shading variation so it reads as a soft textile
    float sheen = 0.5 + 0.5 * sin(vUv.x * 6.2831 * 1.5) * 0.04;

    vec3 col = uColor * (0.96 + sheen * 0.08) + grain;
    gl_FragColor = vec4(col, vig * uOpacity);
  }
`;

function Carpet({ opRef }: { opRef: MutableRefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uOpacity: { value: 1 }, uColor: { value: new THREE.Color("#161a22") } }),
    []
  );
  useFrame(() => {
    if (mat.current) mat.current.uniforms.uOpacity.value = opRef.current;
  });
  return (
    // pushed forward (z 13) and sized so it never reaches the studio table (z ~-3)
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 13]}>
      <planeGeometry args={[40, 26]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={rugVertex}
        fragmentShader={rugFragment}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function StudioIntro({ started }: { started: boolean }) {
  const group = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const opRef = useRef(1);
  const fadeStart = useRef<number | null>(null);
  const segs = useConsole();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // Full intro during the sound gate; the moment the user clicks (started) it
    // dissolves quickly (time-based) so the panels/console vanish right away and
    // the main scene begins. heroCutoff is only a safety net.
    let op = 1;
    if (started) {
      if (fadeStart.current === null) fadeStart.current = state.clock.elapsedTime;
      const dt = state.clock.elapsedTime - fadeStart.current;
      op = THREE.MathUtils.clamp(1 - dt / START_FADE_S, 0, 1);
    }
    op = Math.min(op, heroCutoff(scrollStore.peek().heroProgress));
    opRef.current = op;

    g.visible = op > 0.001;
    if (!g.visible) return;

    const ty = pointer.current.x * 0.05;
    const tx = pointer.current.y * 0.03;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 3, delta);

    if (keyLight.current) keyLight.current.intensity = 90 * op;
    if (fill.current) fill.current.intensity = 22 * op;
    if (rim.current) rim.current.intensity = 30 * op;

    g.traverse((obj) => {
      const m = (obj as THREE.Mesh).material as THREE.Material | undefined;
      if (!m || (m as THREE.ShaderMaterial).isShaderMaterial) return; // rug fades itself
      if ("opacity" in m) {
        const mat = m as THREE.Material & { opacity: number; userData: { baseOpacity?: number } };
        if (mat.userData.baseOpacity === undefined) mat.userData.baseOpacity = mat.opacity;
        const base = mat.userData.baseOpacity;
        mat.transparent = op < 0.999 || base < 1;
        mat.depthWrite = op > 0.999 && base >= 1;
        mat.opacity = base * op;
      }
    });
  });

  return (
    <group ref={group}>
      {/* lighting (fades with intro) */}
      <spotLight
        ref={keyLight}
        position={[0, 11, 14]}
        angle={0.9}
        penumbra={0.8}
        distance={60}
        color="#fff2e2"
        intensity={0}
      />
      <pointLight ref={fill} position={[0, 5, 12]} distance={40} color="#dfe7ff" intensity={0} />
      <pointLight ref={rim} position={[0, 6, -6]} distance={45} color="#9fc0ff" intensity={0} />

      {/* curved white console */}
      {segs.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]} rotation={[0, s.ry, 0]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.66, 1.0, 1.7]} />
            <meshStandardMaterial color="#e9ebee" metalness={0.12} roughness={0.28} />
          </mesh>
          <mesh position={[0, 1.03, 0.1]} rotation={[-0.22, 0, 0]}>
            <boxGeometry args={[0.66, 0.07, 1.5]} />
            <meshStandardMaterial color="#d7dbe0" metalness={0.2} roughness={0.32} />
          </mesh>
        </group>
      ))}
      {[segs[0], segs[segs.length - 1]].map((s, i) => (
        <mesh key={`cap-${i}`} position={[s.x, 0.5, s.z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.0, 24, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#e9ebee" metalness={0.12} roughness={0.28} />
        </mesh>
      ))}

      {/* glowing softbox studio lights behind the desk */}
      {SOFTBOXES.map((m, i) => (
        <Softbox key={`sb-${i}`} position={m.p} scale={m.s} />
      ))}

      {/* glass control-room partition behind */}
      <mesh position={[0, 4, -4.2]}>
        <planeGeometry args={[30, 8.5]} />
        <meshStandardMaterial
          color="#101826"
          metalness={0.9}
          roughness={0.08}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[-9, -3, 3, 9].map((x) => (
        <mesh key={`mull-${x}`} position={[x, 4, -4.15]}>
          <boxGeometry args={[0.08, 8.5, 0.08]} />
          <meshStandardMaterial color="#2a3242" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {[0.1, 7.9].map((y) => (
        <mesh key={`rail-${y}`} position={[0, y, -4.15]}>
          <boxGeometry args={[30, 0.14, 0.14]} />
          <meshStandardMaterial color="#2a3242" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* linear ceiling light strips */}
      {[-3.5, 3.5].map((x) => (
        <mesh key={`strip-${x}`} position={[x, 8.4, 4]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 16]} />
          <meshBasicMaterial color="#fff6ea" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 8.6, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[34, 26]} />
        <meshStandardMaterial color="#141821" metalness={0.1} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* matte digital rug over the visible intro floor */}
      <Carpet opRef={opRef} />
    </group>
  );
}
