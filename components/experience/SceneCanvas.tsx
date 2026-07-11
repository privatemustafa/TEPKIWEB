"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "./Scene";
import type { Track } from "@/lib/types";
import type { ExperienceAudio } from "./useExperienceAudio";

/**
 * R3F canvas wrapper. Mounted into a fixed, full-screen layer behind the DOM
 * overlays. Dynamically imported with `ssr: false` so three.js never runs on
 * the server.
 */
export default function SceneCanvas({
  lowPerf,
  audioOn,
  audio,
  firstTrack,
  started,
}: {
  lowPerf: boolean;
  audioOn: boolean;
  audio: ExperienceAudio;
  firstTrack: Track | null;
  started: boolean;
}) {
  return (
    <Canvas
      shadows={!lowPerf}
      dpr={lowPerf ? [1, 1.5] : [1, 2]}
      gl={{
        antialias: !lowPerf,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ position: [0, 2.2, 12], fov: 40, near: 0.1, far: 100 }}
    >
      <Scene
        lowPerf={lowPerf}
        audioOn={audioOn}
        audio={audio}
        firstTrack={firstTrack}
        started={started}
      />
    </Canvas>
  );
}
