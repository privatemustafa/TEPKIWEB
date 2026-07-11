"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { trackerStore } from "./trackerStore";

/**
 * Projects the studio album's world position into screen pixels every frame and
 * publishes it to trackerStore, so the DOM "Çıkış Tarihi" hotspot in HeroBeats
 * can magnetically ride on top of the album as the camera moves/roams.
 *
 * Studio album world pos = STUDIO.anchor [0,0,-3] + album local [0, ~1.5, -0.3].
 */
const ALBUM_WORLD = new THREE.Vector3(0, 1.55, -3.3);

export default function AlbumTracker() {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    v.copy(ALBUM_WORLD).project(camera);
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    // z < 1 means in front of the camera and inside the frustum depth
    const onScreen =
      v.z < 1 && v.x > -1.2 && v.x < 1.2 && v.y > -1.2 && v.y < 1.2;
    trackerStore.set({ x, y, visible: onScreen });
  });

  return null;
}
