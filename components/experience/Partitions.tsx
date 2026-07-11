"use client";

import * as THREE from "three";

/**
 * Dark partition walls between the rooms, each leaving an offset opening the
 * camera path passes through. As you travel you see the edge of the room you're
 * leaving, the dark divider, and the next room's wall — the spatial "walk into
 * the next room" composition (ref 02), instead of a fade to black.
 */
export default function Partitions() {
  return (
    <group>
      {/* partition 1 (studio → monolith) at z≈-16, gap on the right (x > 1) */}
      <mesh position={[-11, 7, -16]}>
        <boxGeometry args={[24, 22, 1.4]} />
        <meshStandardMaterial color="#070708" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* thin lit edge to catch the eye as you pass */}
      <mesh position={[1.1, 5, -16]}>
        <boxGeometry args={[0.08, 16, 1.5]} />
        <meshBasicMaterial color="#e0b070" toneMapped={false} transparent opacity={0.5} />
      </mesh>

      {/* partition 2 (monolith → lab) at z≈-42, gap on the left (x < -1) */}
      <mesh position={[11, 7, -42]}>
        <boxGeometry args={[24, 22, 1.4]} />
        <meshStandardMaterial color="#060709" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[-1.1, 5, -42]}>
        <boxGeometry args={[0.08, 16, 1.5]} />
        <meshBasicMaterial color="#5f9fff" toneMapped={false} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
