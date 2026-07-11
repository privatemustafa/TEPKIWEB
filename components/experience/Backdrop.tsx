"use client";

import * as THREE from "three";

/**
 * A large, constant dark void surrounding the whole corridor. Each room now
 * carries its OWN curved gradient wall (see RoomWall), so the backdrop just
 * provides deep darkness + fog blending between them rather than recolouring.
 */
export default function Backdrop() {
  return (
    <mesh>
      <sphereGeometry args={[90, 32, 24]} />
      <meshBasicMaterial color="#050507" side={THREE.BackSide} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
