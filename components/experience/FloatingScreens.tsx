"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { roomPresence, LAB } from "./rooms";

/**
 * ROOM 3 (blue lab / space): the big screen returns — a large central hero panel
 * flanked by floating x-ray + artwork panels, all with a cool rim glow. Gated to
 * the lab room so it reads as a completely different world from room 1's warm
 * curved studio wall. Real artwork can replace the album map / x-ray canvas.
 */

function makeXrayTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#081426";
    ctx.fillRect(0, 0, 512, 512);
    ctx.translate(256, 256);
    ctx.strokeStyle = "rgba(120,190,255,0.55)";
    ctx.lineWidth = 1.5;
    for (let r = 30; r < 240; r += 16) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(150,210,255,0.4)";
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 240, Math.sin(a) * 240);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(190,230,255,0.7)";
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 180;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 3 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.strokeStyle = "rgba(120,190,255,0.6)";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 496);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface Panel {
  pos: [number, number, number];
  rot: [number, number, number];
  size: [number, number];
  kind: "xray" | "art" | "big";
  phase: number;
}

const PANELS: Panel[] = [
  { pos: [0, 3.0, -3.4], rot: [0, 0, 0], size: [4.6, 2.8], kind: "big", phase: 0 },
  { pos: [-3.9, 2.5, -1.0], rot: [0, 0.6, 0.05], size: [2.5, 1.9], kind: "xray", phase: 1.4 },
  { pos: [3.9, 2.8, -1.2], rot: [0, -0.6, -0.05], size: [2.5, 1.9], kind: "art", phase: 2.7 },
];

export default function FloatingScreens() {
  const xray = useMemo(() => makeXrayTexture(), []);
  const art = useTexture("/album-cover.png");
  art.colorSpace = THREE.SRGBColorSpace;

  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const vis = roomPresence(LAB, scrollStore.peek().heroProgress);
    const time = state.clock.elapsedTime;
    PANELS.forEach((p, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.visible = vis > 0.001;
      g.position.y = p.pos[1] + Math.sin(time * 0.6 + p.phase) * 0.1;
      g.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
        if (m && "opacity" in m) m.opacity = vis * (m.userData?.max ?? 1);
      });
    });
  });

  return (
    <group position={LAB.anchor}>
      {PANELS.map((p, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={p.pos}
          rotation={p.rot}
        >
          {/* glow frame */}
          <mesh position={[0, 0, -0.03]}>
            <planeGeometry args={[p.size[0] + 0.16, p.size[1] + 0.16]} />
            <meshBasicMaterial
              color="#5f9fff"
              transparent
              opacity={0}
              toneMapped={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              userData={{ max: 0.5 }}
            />
          </mesh>
          {/* content */}
          <mesh>
            <planeGeometry args={p.size} />
            <meshBasicMaterial
              map={p.kind === "xray" ? xray : art}
              transparent
              opacity={0}
              toneMapped={false}
              side={THREE.DoubleSide}
              userData={{ max: 0.98 }}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

useTexture.preload("/album-cover.png");
