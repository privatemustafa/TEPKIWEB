"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Edges } from "@react-three/drei";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { roomPresence, MONOLITH } from "./rooms";

/**
 * ROOM 2 hero: a tall standing slab (monolith) carrying the album art, rising
 * from an infinite reflective floor. No screens — pure sculptural architecture.
 * Present only during the monolith room; rises/rotates as you move through it.
 */
export default function Monolith() {
  const group = useRef<THREE.Group>(null);
  const tex = useTexture("/album-cover.png");
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = scrollStore.peek().heroProgress;
    g.visible = roomPresence(MONOLITH, t) > 0.001;
    if (!g.visible) return;

    const time = state.clock.elapsedTime;
    g.rotation.y += delta * 0.14;
    g.rotation.z = Math.sin(time * 0.35) * 0.01;
  });

  return (
    <group ref={group} position={[MONOLITH.anchor[0], 2.6, MONOLITH.anchor[2]]}>
      <mesh castShadow>
        <boxGeometry args={[1.7, 4.6, 0.34]} />
        <meshStandardMaterial attach="material-0" color="#0c0c0e" metalness={0.7} roughness={0.28} />
        <meshStandardMaterial attach="material-1" color="#0c0c0e" metalness={0.7} roughness={0.28} />
        <meshStandardMaterial attach="material-2" color="#0c0c0e" metalness={0.7} roughness={0.28} />
        <meshStandardMaterial attach="material-3" color="#0c0c0e" metalness={0.7} roughness={0.28} />
        <meshStandardMaterial attach="material-4" map={tex} metalness={0.1} roughness={0.5} />
        <meshStandardMaterial attach="material-5" map={tex} metalness={0.12} roughness={0.55} />
        <Edges threshold={20} color="#e0904a" />
      </mesh>
    </group>
  );
}

useTexture.preload("/album-cover.png");
