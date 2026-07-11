"use client";

import { useMemo } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * GQ glossy table — a raised brutalist table: a mirror top slab elevated off the
 * floor on two monolithic end-plinths + a connecting spine, so it reads as a
 * real table standing on legs (not a slab lying on the ground). Central riser,
 * scattered blueprint cards.
 *
 * SURFACE_Y is the world height of the mirror top; Album/Vinyl are placed to sit
 * on it (see TABLE_SURFACE_Y export).
 */

export const TABLE_SURFACE_Y = 1.15;

const SCRIPT_FONT =
  "'Bradley Hand', 'Segoe Script', 'Snell Roundhand', 'Comic Sans MS', cursive";

// draft tracklist — only #1 is legible (struck through), the rest stay blurred.
const TRACKS = [
  "BANDS ON BANDS",
  "Sefaköy Gece",
  "832 Yanyol",
  "Tiflis",
  "E-5",
  "Monolit",
  "Ateş & Kül",
  "Duman",
  "Yankı",
  "Karanlık Oda",
  "MMXVIII",
];

/** Full handwritten tracklist sheet: #1 crossed out, #2–#11 blurred. */
function makeTracklistTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#f5f2e9");
    grad.addColorStop(1, "#e8e4d6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 384, 512);

    // faint ruled lines
    ctx.strokeStyle = "rgba(60,70,90,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 11; i++) {
      const y = 128 + i * 33;
      ctx.beginPath();
      ctx.moveTo(28, y + 7);
      ctx.lineTo(356, y + 7);
      ctx.stroke();
    }

    // header
    ctx.fillStyle = "rgba(30,35,50,0.6)";
    ctx.font = "600 17px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText("TEPKİ — MMXVIII", 28, 58);
    ctx.fillStyle = "rgba(30,35,50,0.32)";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText("TRACKLIST — TASLAK", 28, 80);

    // blurred lines 2..11
    ctx.filter = "blur(3.6px)";
    ctx.fillStyle = "rgba(22,26,42,0.82)";
    ctx.font = `27px ${SCRIPT_FONT}`;
    for (let i = 1; i < TRACKS.length; i++) {
      const y = 128 + i * 33;
      const num = `0${i + 1}`.slice(-2);
      ctx.fillText(`${num}   ${TRACKS[i]}`, 34, y);
    }
    ctx.filter = "none";

    // line 1 crisp + strikethrough
    const y1 = 128;
    ctx.fillStyle = "rgba(14,17,26,0.96)";
    ctx.font = `28px ${SCRIPT_FONT}`;
    const t1 = `01   ${TRACKS[0]}`;
    ctx.fillText(t1, 34, y1);
    const w = ctx.measureText(t1).width;
    ctx.strokeStyle = "rgba(150,20,20,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, y1 - 9);
    ctx.lineTo(40 + w, y1 - 6);
    ctx.stroke();

    ctx.strokeStyle = "rgba(20,28,44,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 368, 496);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A small handwritten scrap — a few blurred lines / scribbles. */
function makeScrapTexture(seed: number): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 340;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#f1eee4";
    ctx.fillRect(0, 0, 256, 340);
    const rnd = (n: number) => Math.abs(Math.sin(seed * 12.9 + n * 78.2)) % 1;
    ctx.filter = "blur(3px)";
    ctx.fillStyle = "rgba(22,26,42,0.7)";
    ctx.font = `26px ${SCRIPT_FONT}`;
    const words = ["nakarat", "808", "kick", "reverb", "gece", "vers 2", "hook", "mix"];
    for (let i = 0; i < 5; i++) {
      const y = 90 + i * 46;
      const w1 = words[Math.floor(rnd(i + 1) * words.length)];
      const w2 = words[Math.floor(rnd(i + 5) * words.length)];
      ctx.fillText(`${w1}  ${w2}`, 26, y);
    }
    ctx.filter = "none";
    ctx.strokeStyle = "rgba(20,28,44,0.28)";
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, 244, 328);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type CardKind = "list" | "scrap";
const CARDS: { x: number; z: number; rot: number; s: number; kind: CardKind; seed: number }[] = [
  { x: 2.0, z: 1.4, rot: 0.15, s: 1.5, kind: "list", seed: 1 }, // handwritten tracklist
  { x: -1.7, z: 1.7, rot: -0.4, s: 0.9, kind: "scrap", seed: 2 },
  { x: 2.9, z: 0.1, rot: 1.9, s: 0.85, kind: "scrap", seed: 3 },
  { x: -3.0, z: -0.7, rot: 1.3, s: 0.9, kind: "scrap", seed: 5 },
  { x: 0.5, z: 2.0, rot: -0.2, s: 0.95, kind: "scrap", seed: 6 },
];

// heights (world Y)
const TOP = TABLE_SURFACE_Y; // 1.15 — mirror plane
const SLAB_H = 0.34; // top slab thickness
const SLAB_CENTER = TOP - SLAB_H / 2; // 0.98
const UNDERSIDE = SLAB_CENTER - SLAB_H / 2; // 0.81
const LEG_H = UNDERSIDE; // legs run floor(0) → underside

const concrete = {
  color: "#111318",
  metalness: 0.35,
  roughness: 0.55,
};

export default function AlbumTable({ lowPerf }: { lowPerf: boolean }) {
  const cards = useMemo(
    () =>
      CARDS.map((c) => ({
        ...c,
        tex: c.kind === "list" ? makeTracklistTexture() : makeScrapTexture(c.seed),
      })),
    []
  );

  return (
    <group>
      {/* ---- brutalist base: two monolithic end-plinths + spine, floor→underside ---- */}
      {[-3.05, 3.05].map((x, i) => (
        <mesh key={i} position={[x, LEG_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.15, LEG_H, 5.4]} />
          <meshStandardMaterial {...concrete} />
        </mesh>
      ))}
      {/* connecting spine (adds solidity, sits low) */}
      <mesh position={[0, LEG_H * 0.32, 0]} castShadow>
        <boxGeometry args={[5.2, LEG_H * 0.5, 1.4]} />
        <meshStandardMaterial color="#0d0f13" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* soft contact shadows under plinths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[9.4, 6.6]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* ---- top slab (dark body) ---- */}
      <mesh position={[0, SLAB_CENTER, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.2, SLAB_H, 6.4]} />
        <meshStandardMaterial color="#0a0b0d" metalness={0.68} roughness={0.3} />
      </mesh>

      {/* mirror top surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, TOP + 0.001, 0]} receiveShadow>
        <planeGeometry args={[9.0, 6.2]} />
        {lowPerf ? (
          <meshStandardMaterial color="#e9edf2" metalness={0.5} roughness={0.12} />
        ) : (
          <MeshReflectorMaterial
            resolution={512}
            mirror={1}
            mixBlur={0.2}
            mixStrength={1.8}
            blur={[60, 20]}
            depthScale={0.3}
            minDepthThreshold={0.2}
            maxDepthThreshold={1.0}
            roughness={0.05}
            metalness={0.35}
            color="#e2e6ec"
          />
        )}
      </mesh>

      {/* central riser */}
      <mesh position={[0, TOP + 0.06, -0.3]} castShadow>
        <boxGeometry args={[2.5, 0.12, 2.5]} />
        <meshStandardMaterial color="#d7dbe2" metalness={0.4} roughness={0.25} />
      </mesh>

      {/* blueprint cards lying flat on the surface */}
      {cards.map((c, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, c.rot]}
          position={[c.x, TOP + 0.012, c.z]}
        >
          <planeGeometry args={[0.95 * c.s, 1.26 * c.s]} />
          <meshStandardMaterial
            map={c.tex}
            roughness={0.85}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
