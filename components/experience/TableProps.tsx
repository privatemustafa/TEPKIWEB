"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { STUDIO, roomPresence } from "./rooms";
import { TABLE_SURFACE_Y } from "./AlbumTable";

/**
 * Studio table dressing: a glass ashtray with a lit cigar (glowing ember +
 * drifting smoke). Placed on the studio table surface, gated to the studio room.
 * Coordinates local to the studio anchor (0,0,-3); table top at TABLE_SURFACE_Y.
 */

// soft smoke puff texture (client only)
let _smokeTex: THREE.Texture | null = null;
function smokeTexture(): THREE.Texture | null {
  if (_smokeTex) return _smokeTex;
  if (typeof document === "undefined") return null;
  const s = 128;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(214,216,222,0.9)");
  g.addColorStop(0.5, "rgba(200,202,210,0.4)");
  g.addColorStop(1, "rgba(190,192,200,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  _smokeTex = new THREE.CanvasTexture(c);
  return _smokeTex;
}

function Puff({ tex, offset }: { tex: THREE.Texture; offset: number }) {
  const ref = useRef<THREE.Sprite>(null);
  useFrame((state) => {
    const sp = ref.current;
    if (!sp) return;
    const t = state.clock.elapsedTime;
    const phase = (t * 0.16 + offset) % 1;
    const rise = phase * 1.15;
    const sway = Math.sin((t + offset * 6) * 0.7) * 0.06 * phase;
    sp.position.set(sway, rise, Math.cos((t + offset * 5) * 0.6) * 0.04 * phase);
    const sc = 0.1 + phase * 0.55;
    sp.scale.set(sc, sc * 1.35, 1);
    (sp.material as THREE.SpriteMaterial).opacity = Math.sin(phase * Math.PI) * 0.2;
  });
  return (
    <sprite ref={ref}>
      <spriteMaterial map={tex} transparent opacity={0} depthWrite={false} color="#c9cbd1" />
    </sprite>
  );
}

function Smoke() {
  const tex = smokeTexture();
  if (!tex) return null;
  return (
    <group position={[-0.2, 0.12, 0.06]}>
      {[0, 0.33, 0.66].map((o, i) => (
        <Puff key={i} tex={tex} offset={o} />
      ))}
    </group>
  );
}

function AshtrayCigar() {
  return (
    <group position={[-2.3, TABLE_SURFACE_Y, 1.4]}>
      {/* glass dish */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.06, 40]} />
        <meshStandardMaterial color="#0d0e12" metalness={0.5} roughness={0.15} />
      </mesh>
      {/* recessed well */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.03, 40]} />
        <meshStandardMaterial color="#050506" metalness={0.4} roughness={0.35} />
      </mesh>
      {/* rim */}
      <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.035, 12, 40]} />
        <meshStandardMaterial color="#14161b" metalness={0.55} roughness={0.18} />
      </mesh>

      {/* cigar resting across the rim */}
      <group position={[0, 0.11, 0]} rotation={[0, 0.4, 0.1]}>
        {/* body */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.06, 0, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.5, 20]} />
          <meshStandardMaterial color="#5e3f27" metalness={0.1} roughness={0.7} />
        </mesh>
        {/* gold band */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.24, 0, 0]}>
          <cylinderGeometry args={[0.051, 0.051, 0.04, 20]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* ash tip */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.18, 0, 0]}>
          <cylinderGeometry args={[0.043, 0.045, 0.06, 16]} />
          <meshStandardMaterial color="#8f8c86" roughness={0.9} />
        </mesh>
        {/* glowing ember */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.22, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.043, 0.03, 16]} />
          <meshStandardMaterial
            color="#000000"
            emissive="#ff5a1e"
            emissiveIntensity={3.2}
            toneMapped={false}
          />
        </mesh>
      </group>

      <Smoke />
    </group>
  );
}

export default function TableProps() {
  const gate = useRef<THREE.Group>(null);
  useFrame(() => {
    if (gate.current)
      gate.current.visible =
        roomPresence(STUDIO, scrollStore.peek().heroProgress) > 0.001;
  });
  return (
    <group ref={gate} position={STUDIO.anchor}>
      <AshtrayCigar />
    </group>
  );
}
