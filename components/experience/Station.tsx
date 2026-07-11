"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import AlbumTable from "./AlbumTable";
import Album from "./Album";
import Vinyl from "./Vinyl";
import { scrollStore } from "./scrollStore";
import { roomPresence, type Room } from "./rooms";
import type { Track } from "@/lib/types";
import type { ExperienceAudio } from "./useExperienceAudio";

/**
 * A glossy-table station (table + flat album + optional vinyl) placed at a
 * room's world anchor and gated by that room's presence, so studio and lab each
 * have their own physical table in space.
 */
export default function Station({
  room,
  lowPerf,
  withVinyl,
  track,
  audio,
}: {
  room: Room;
  lowPerf: boolean;
  withVinyl: boolean;
  track: Track | null;
  audio: ExperienceAudio;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.visible = roomPresence(room, scrollStore.peek().heroProgress) > 0.001;
    }
  });

  return (
    <group ref={ref} position={room.anchor}>
      <AlbumTable lowPerf={lowPerf} />
      <Suspense fallback={null}>
        <Album />
      </Suspense>
      {withVinyl && (
        <Suspense fallback={null}>
          <Vinyl track={track} audio={audio} />
        </Suspense>
      )}
    </group>
  );
}
