"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { roomPresence, type Room } from "./rooms";

/**
 * A curved gradient cyclorama wall behind a room (the GQ sunset/blue horizon).
 * Each room owns one at its own world position, so as the camera travels the
 * correct wall is simply there in space — during a pass you see one room's wall
 * next to the next room's wall (ref 02), no colour morph on a single sphere.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float y = vUv.y;
    vec3 lower = mix(uBottom, uHorizon, smoothstep(0.0, 0.42, y));
    vec3 upper = mix(uHorizon, uTop, smoothstep(0.42, 0.9, y));
    vec3 col = y < 0.42 ? lower : upper;
    float band = 1.0 - smoothstep(0.0, 0.10, abs(y - 0.42));
    col += uHorizon * band * 0.35;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

export default function RoomWall({ room }: { room: Room }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(room.wall.top) },
      uHorizon: { value: new THREE.Color(room.wall.horizon) },
      uBottom: { value: new THREE.Color(room.wall.bottom) },
      uOpacity: { value: 0 },
    }),
    [room]
  );

  useFrame(() => {
    const p = roomPresence(room, scrollStore.peek().heroProgress);
    if (groupRef.current) groupRef.current.visible = p > 0.001;
    if (matRef.current) matRef.current.uniforms.uOpacity.value = p;
  });

  return (
    <group ref={groupRef} position={room.wall.pos} visible={false}>
      <mesh>
        <cylinderGeometry args={[24, 24, 15, 64, 1, true, Math.PI - 0.75, 1.5]} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={vertex}
          fragmentShader={fragment}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
