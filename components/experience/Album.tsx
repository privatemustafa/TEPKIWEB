"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Edges } from "@react-three/drei";
import * as THREE from "three";
import { TABLE_SURFACE_Y } from "./AlbumTable";

const ALBUM_Y = TABLE_SURFACE_Y + 0.32;

/**
 * Hero album sleeve, lying FLAT on the table riser with the cover facing up, so
 * the camera's top-down apex reveals the artwork from above. Gentle idle spin +
 * float in place.
 */
export default function Album() {
  const group = useRef<THREE.Group>(null);
  const tex = useTexture("/album-cover.png");
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const time = state.clock.elapsedTime;
    g.rotation.y += delta * 0.12;
    g.position.y = ALBUM_Y + Math.sin(time * 0.7) * 0.03;
  });

  return (
    <group ref={group} position={[0, ALBUM_Y, -0.3]}>
      {/* laid flat: front face (+z) rotated to point up */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 2.2, 0.16]} />
        <meshStandardMaterial attach="material-0" color="#0d0d0f" metalness={0.7} roughness={0.32} />
        <meshStandardMaterial attach="material-1" color="#0d0d0f" metalness={0.7} roughness={0.32} />
        <meshStandardMaterial attach="material-2" color="#0d0d0f" metalness={0.7} roughness={0.32} />
        <meshStandardMaterial attach="material-3" color="#0d0d0f" metalness={0.7} roughness={0.32} />
        <meshStandardMaterial attach="material-4" map={tex} metalness={0.05} roughness={0.5} />
        <meshStandardMaterial attach="material-5" map={tex} metalness={0.08} roughness={0.6} />
        <Edges threshold={20} color="#c9a84c" />
      </mesh>
    </group>
  );
}

useTexture.preload("/album-cover.png");
