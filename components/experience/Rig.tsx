"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { sampleVec3 } from "./interp";
import { CAM_POS, CAM_LOOK } from "./rooms";

/**
 * Continuous cinematic camera. Instead of snapping per room, it glides along one
 * world-space path through the whole corridor (studio → monolith → lab), banking
 * past the dark partitions so you physically travel between rooms. The path
 * includes two "top-down" apexes where it rises straight over a table and looks
 * down at the album cover (the reveal beats).
 */
// The camera path is composed for a widescreen (desktop) frame. On phones —
// especially portrait — a narrow aspect crops the wide studio/table off the
// sides. We compensate with a modest FOV widen + a dolly-back along the view
// axis so the whole room fits without fisheye distortion.
const REF_ASPECT = 1.55;

export default function Rig({ lowPerf }: { lowPerf: boolean }) {
  const { camera, pointer, size } = useThree();
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const currentLook = useMemo(() => new THREE.Vector3(0, 2.6, -4), []);
  const dollyDir = useMemo(() => new THREE.Vector3(), []);

  // aspect-responsive vertical FOV (wider on portrait so more width is visible)
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.isPerspectiveCamera) return;
    const aspect = size.width / Math.max(1, size.height);
    const deficit = Math.max(0, REF_ASPECT - aspect);
    cam.fov = 40 + Math.min(deficit * 15, 18); // 40 → ~58 on tall phones
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useFrame((state, delta) => {
    const t = scrollStore.peek().heroProgress;

    sampleVec3(CAM_POS, t, targetPos);
    sampleVec3(CAM_LOOK, t, lookTarget);

    // dolly back on narrow screens so the composed frame still fits sideways
    const aspect = size.width / Math.max(1, size.height);
    if (aspect < REF_ASPECT) {
      const back = Math.min((REF_ASPECT / aspect - 1) * 3.4, 7);
      dollyDir.copy(targetPos).sub(lookTarget).normalize();
      targetPos.addScaledVector(dollyDir, back);
    }

    // slow, breathing roam while dwelling in the studio (past the screen focus,
    // before the top-down apex) so the camera gently wanders the room during the
    // intro video instead of sitting still
    const time = state.clock.elapsedTime;
    const studioRoam = Math.min(
      Math.max((t - 0.15) / 0.03, 0), // ramp in after screen focus
      Math.max((0.29 - t) / 0.03, 0), // ramp out before top-down
      1
    );
    if (studioRoam > 0) {
      targetPos.x += Math.sin(time * 0.18) * 0.7 * studioRoam;
      targetPos.y += Math.sin(time * 0.13 + 1.5) * 0.35 * studioRoam;
      targetPos.z += Math.cos(time * 0.11) * 0.5 * studioRoam;
    }

    // gentle parallax, damped down near the top-down apexes so the bird's-eye
    // framing stays clean
    if (!lowPerf) {
      const topdown = Math.max(
        1 - Math.abs(t - 0.31) / 0.05,
        1 - Math.abs(t - 0.86) / 0.05,
        0
      );
      const par = 0.3 * (1 - topdown);
      targetPos.x += pointer.x * par;
      targetPos.y += pointer.y * par * 0.6;
    }

    const damping = lowPerf ? 6 : 4.5;
    const k = 1 - Math.exp(-damping * delta);
    camera.position.lerp(targetPos, k);
    currentLook.lerp(lookTarget, k);
    camera.lookAt(currentLook);
  });

  return null;
}
