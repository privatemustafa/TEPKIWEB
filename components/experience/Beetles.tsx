"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { STUDIO, roomPresence } from "./rooms";
import { TABLE_SURFACE_Y } from "./AlbumTable";

/**
 * A single small beetle — a nod to the creature on the MMXVIII cover — that
 * slowly crawls at random across the studio table surface, pausing now and then.
 * No flying. Coordinates are LOCAL to the studio anchor (0,0,-3); the table top
 * sits at world TABLE_SURFACE_Y, so local y == world y.
 */

const WALK_Y = TABLE_SURFACE_Y + 0.05;

// keep the walk on the table and clear of the centre album (~[0,-0.3])
function pickTarget(out: THREE.Vector3) {
  for (let i = 0; i < 12; i++) {
    const x = -3.1 + Math.random() * 6.2;
    const z = -1.9 + Math.random() * 3.8;
    if (Math.hypot(x, z + 0.3) > 1.5) {
      out.set(x, WALK_Y, z);
      return out;
    }
  }
  out.set(2.6, WALK_Y, 1.4);
  return out;
}

type Mode = "walk" | "pause";

function Beetle() {
  const group = useRef<THREE.Group>(null);
  const st = useRef<{
    pos: THREE.Vector3;
    target: THREE.Vector3;
    dir: THREE.Vector3;
    mode: Mode;
    timer: number;
    yaw: number;
    step: number;
  }>(null!);
  if (!st.current) {
    const pos = pickTarget(new THREE.Vector3());
    st.current = {
      pos,
      target: pickTarget(new THREE.Vector3()),
      dir: new THREE.Vector3(0, 0, 1),
      mode: "walk",
      timer: 0,
      yaw: Math.random() * Math.PI * 2,
      step: 0,
    };
  }

  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0c0d10", metalness: 0.75, roughness: 0.32 }),
    []
  );

  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(0.05, dtRaw);
    const s = st.current;

    if (s.mode === "walk") {
      s.dir.copy(s.target).sub(s.pos);
      s.dir.y = 0;
      const d = s.dir.length();
      const speed = 0.32;
      const stepLen = speed * dt;
      if (d <= stepLen + 1e-3) {
        s.pos.copy(s.target);
        s.mode = "pause";
        s.timer = 0.4 + Math.random() * 2.2;
      } else {
        s.dir.multiplyScalar(1 / d);
        s.pos.addScaledVector(s.dir, stepLen);
        // face travel direction (head is +Z locally)
        const targetYaw = Math.atan2(s.dir.x, s.dir.z);
        let diff = targetYaw - s.yaw;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        s.yaw += diff * Math.min(1, dt * 4);
        s.step += dt * 10;
      }
    } else {
      s.timer -= dt;
      if (s.timer <= 0) {
        pickTarget(s.target);
        s.mode = "walk";
      }
    }

    // tiny crawling bob
    const bob = s.mode === "walk" ? Math.abs(Math.sin(s.step)) * 0.006 : 0;
    g.position.set(s.pos.x, s.pos.y + bob, s.pos.z);
    g.rotation.y = s.yaw;
  });

  return (
    <group ref={group} scale={0.85}>
      {/* elytra (wing cases / abdomen) */}
      <mesh castShadow material={bodyMat} position={[0, 0, -0.02]} scale={[0.11, 0.08, 0.16]}>
        <sphereGeometry args={[1, 14, 12]} />
      </mesh>
      {/* dorsal seam ridge */}
      <mesh material={bodyMat} position={[0, 0.06, -0.02]} scale={[0.01, 0.02, 0.15]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      {/* thorax */}
      <mesh castShadow material={bodyMat} position={[0, 0.005, 0.09]} scale={[0.07, 0.055, 0.06]}>
        <sphereGeometry args={[1, 12, 10]} />
      </mesh>
      {/* head */}
      <mesh material={bodyMat} position={[0, 0, 0.15]} scale={[0.045, 0.04, 0.045]}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      {/* small horn */}
      <mesh material={bodyMat} position={[0, 0.02, 0.19]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.018, 0.07, 8]} />
      </mesh>

      {/* legs (6) */}
      {[
        [0.06, 0.11, 0.6],
        [0.07, 0.0, 0.9],
        [0.06, -0.11, 0.6],
      ].map(([lx, lz, rot], i) => (
        <group key={`legs-${i}`}>
          <mesh material={bodyMat} position={[lx, -0.045, lz * 0.1]} rotation={[0, 0, -rot]} scale={[0.008, 0.08, 0.008]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
          <mesh material={bodyMat} position={[-lx, -0.045, lz * 0.1]} rotation={[0, 0, rot]} scale={[0.008, 0.08, 0.008]}>
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Beetles() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current)
      ref.current.visible =
        roomPresence(STUDIO, scrollStore.peek().heroProgress) > 0.001;
  });
  return (
    <group ref={ref} position={STUDIO.anchor}>
      <Beetle />
    </group>
  );
}
