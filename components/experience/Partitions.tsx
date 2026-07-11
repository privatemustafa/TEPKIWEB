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

      {/* partition 2 (monolith → lab) at z≈-42, gap on the left (x < -1) */}
      <mesh position={[11, 7, -42]}>
        <boxGeometry args={[24, 22, 1.4]} />
        <meshStandardMaterial color="#060709" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  );
}
