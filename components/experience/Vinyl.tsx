"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Track } from "@/lib/types";
import type { ExperienceAudio } from "./useExperienceAudio";
import { TABLE_SURFACE_Y } from "./AlbumTable";

const VINYL_Y = TABLE_SURFACE_Y + 0.12;

/**
 * First-track vinyl resting on the table. Hovering spins it up, lifts a light
 * and starts the track preview (or a soft ambient swell when no preview URL
 * exists). Built to extend to more tracks later.
 */

function makeGrooveTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#0a0a0b";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    for (let r = 70; r < 248; r += 3) {
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // sheen highlight
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, "rgba(255,255,255,0.05)");
    grad.addColorStop(0.5, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(255,255,255,0.04)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function Vinyl({
  track,
  audio,
}: {
  track: Track | null;
  audio: ExperienceAudio;
}) {
  const disc = useRef<THREE.Group>(null);
  const tonearm = useRef<THREE.Group>(null);
  const spotRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  const groove = useMemo(() => makeGrooveTexture(), []);
  const label = useTexture("/album-cover.png");
  label.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (disc.current) {
      disc.current.rotation.y += delta * (hovered ? 3.2 : 0.7);
    }
    if (tonearm.current) {
      const target = hovered ? -0.5 : -0.05;
      tonearm.current.rotation.y = THREE.MathUtils.damp(
        tonearm.current.rotation.y,
        target,
        4,
        delta
      );
    }
    if (spotRef.current) {
      spotRef.current.intensity = THREE.MathUtils.damp(
        spotRef.current.intensity,
        hovered ? 9 : 1.2,
        5,
        delta
      );
    }
  });

  const onOver = () => {
    setHovered(true);
    document.body.style.cursor = "pointer";
    audio.playTrack(track?.preview_url ?? null);
  };
  const onOut = () => {
    setHovered(false);
    document.body.style.cursor = "";
    audio.stopTrack();
  };

  return (
    <group position={[2.05, VINYL_Y, 0.5]}>
      <pointLight ref={spotRef} position={[0, 1.4, 0]} intensity={1.2} distance={6} color="#ffe6b0" />

      {/* spinning disc */}
      <group
        ref={disc}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onOver}
      >
        <mesh castShadow>
          <cylinderGeometry args={[1.05, 1.05, 0.05, 64]} />
          <meshStandardMaterial attach="material-0" color="#0a0a0b" metalness={0.4} roughness={0.45} />
          <meshStandardMaterial attach="material-1" map={groove} metalness={0.5} roughness={0.35} />
          <meshStandardMaterial attach="material-2" color="#0a0a0b" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* center label */}
        <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.38, 48]} />
          <meshStandardMaterial map={label} metalness={0.1} roughness={0.6} />
        </mesh>
        {/* spindle */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
          <meshStandardMaterial color="#caa94e" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* tonearm */}
      <group ref={tonearm} position={[1.05, 0.03, -1.05]}>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.36, 16]} />
          <meshStandardMaterial color="#15151a" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.55, 0.32, 0.55]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[1.5, 0.04, 0.05]} />
          <meshStandardMaterial color="#2a2a30" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

useTexture.preload("/album-cover.png");
