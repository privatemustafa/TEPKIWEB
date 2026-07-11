"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { activeRoom } from "./rooms";

/**
 * One long reflective floor running the length of the whole corridor (studio →
 * lab). A faint grid overlay tints per active room (warm → neutral → blue).
 */

const gridVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gridFragment = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;

  float hash(vec2 p){
    return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
  }

  void main() {
    // no grid — a soft, room-tinted floor sheen with the faintest grain.
    vec2 c = vUv - 0.5;
    // gentle glow running down the corridor centre, fading to the edges
    float glow = smoothstep(0.62, 0.0, length(c * vec2(1.5, 0.75)));
    float grain = (hash(floor(vUv * vec2(1400.0, 1400.0))) - 0.5) * 0.04;
    vec3 col = uColor * glow + grain;
    float a = (glow * 0.85 + 0.05) * uOpacity;
    gl_FragColor = vec4(col, a);
  }
`;

export default function Stage({ lowPerf }: { lowPerf: boolean }) {
  const gridMat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uOpacity: { value: 0.4 }, uColor: { value: new THREE.Color("#5f7bb0") } }),
    []
  );

  useFrame(() => {
    const room = activeRoom(scrollStore.peek().heroProgress);
    if (gridMat.current) {
      gridMat.current.uniforms.uColor.value.set(
        room.id === "lab" ? "#3f6bc0" : room.id === "monolith" ? "#8a6a44" : "#7c7365"
      );
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -28]} receiveShadow>
        <planeGeometry args={[70, 110]} />
        {lowPerf ? (
          <meshStandardMaterial color="#050506" metalness={0.5} roughness={0.55} />
        ) : (
          <MeshReflectorMaterial
            resolution={512}
            mirror={0.55}
            mixBlur={6}
            mixStrength={1.4}
            blur={[300, 90]}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            roughness={0.75}
            metalness={0.45}
            color="#070709"
          />
        )}
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -28]}>
        <planeGeometry args={[70, 110]} />
        <shaderMaterial
          ref={gridMat}
          uniforms={uniforms}
          vertexShader={gridVertex}
          fragmentShader={gridFragment}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
