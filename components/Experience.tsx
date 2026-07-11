"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import Chrome from "./experience/Chrome";
import LoadingGate from "./experience/LoadingGate";
import IntroOverlay from "./experience/IntroOverlay";
import Overlays from "./experience/Overlays";
import HeroBeats from "./experience/HeroBeats";
import LockOverlay from "./experience/LockOverlay";
import StaticFallback from "./experience/StaticFallback";
import { useExperienceScroll } from "./experience/useExperienceScroll";
import { useReveal } from "./experience/useReveal";
import { useExperienceAudio } from "./experience/useExperienceAudio";
import { scrollStore } from "./experience/scrollStore";
import { phaseStore } from "./experience/phaseStore";
import { ROOMS } from "./experience/rooms";
import type { MerchItem, Show, Track } from "@/lib/types";
import { mockMerch, mockShows, mockTracks } from "@/lib/mock-data";

// three.js must never run on the server.
const SceneCanvas = dynamic(() => import("./experience/SceneCanvas"), {
  ssr: false,
});

type Mode = "pending" | "3d" | "static";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return (
      !!window.WebGLRenderingContext &&
      !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function Experience() {
  const [tracks] = useState<Track[]>(mockTracks);
  const [shows] = useState<Show[]>(mockShows);
  const [merch] = useState<MerchItem[]>(mockMerch);

  const [mode, setMode] = useState<Mode>("pending");
  const [lowPerf, setLowPerf] = useState(false);
  const [ready, setReady] = useState(false); // loading gate done → intro
  const [started, setStarted] = useState(false); // user enabled sound → journey
  const [playing, setPlaying] = useState(false); // auto-play timeline
  const [audioOn, setAudioOn] = useState(false);
  const [locked, setLocked] = useState(false); // phase-1 end → ÇOK YAKINDA

  const heroRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const audio = useExperienceAudio();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !hasWebGL()) {
      setMode("static");
      return;
    }
    const small =
      window.matchMedia("(max-width: 820px)").matches ||
      window.matchMedia("(pointer: coarse)").matches ||
      (typeof navigator !== "undefined" &&
        "deviceMemory" in navigator &&
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory !==
          undefined &&
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4);
    setLowPerf(small);
    setMode("3d");
  }, []);

  const handleReady = useCallback(() => setReady(true), []);
  const handleManualScroll = useCallback(() => setPlaying(false), []);
  const handleTogglePlay = useCallback(() => setPlaying((p) => !p), []);
  const handleLock = useCallback(() => {
    setLocked(true);
    setPlaying(false);
    phaseStore.setLocked(true);
  }, []);

  const handleEnable = useCallback(() => {
    audio.enable();
    setAudioOn(true);
    setStarted(true);
    setPlaying(true);
  }, [audio]);

  const handleToggleSound = useCallback(() => {
    setAudioOn((on) => {
      if (on) audio.mute();
      else audio.unmute();
      return !on;
    });
  }, [audio]);

  const enabled = mode === "3d";
  useExperienceScroll(
    heroRef,
    started,
    enabled,
    playing,
    handleManualScroll,
    handleLock
  );
  useReveal(rootRef, enabled);

  // re-renders only when the active chapter changes (primitive snapshot)
  const chapter = useSyncExternalStore(
    scrollStore.subscribe,
    () => scrollStore.getSnapshot().chapter,
    () => 0
  );

  // per-room track reveal: play the active room's preview when sound is on
  useEffect(() => {
    if (!audioOn) return;
    const room = ROOMS.find((r) => r.chapter === chapter);
    const url = room ? tracks[room.trackIndex]?.preview_url ?? null : null;
    if (url) audio.playTrack(url);
    else audio.stopTrack();
  }, [chapter, audioOn, tracks, audio]);

  // lock scroll until the user starts the journey, and again once phase-1 locks
  useEffect(() => {
    if (!enabled) return;
    document.body.style.overflow = started && !locked ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [enabled, started, locked]);

  if (mode === "pending") {
    return <div className="fixed inset-0 z-[100] bg-ink" />;
  }

  if (mode === "static") {
    return <StaticFallback tracks={tracks} shows={shows} merch={merch} />;
  }

  return (
    <>
      <LoadingGate onReady={handleReady} />
      <IntroOverlay show={ready && !started} onEnable={handleEnable} />
      <Chrome
        visible={started}
        playing={playing}
        onTogglePlay={handleTogglePlay}
        audioOn={audioOn}
        onToggleSound={handleToggleSound}
      />
      {started && !locked && (
        <HeroBeats tracks={tracks} onInteract={handleManualScroll} />
      )}
      <LockOverlay show={locked} />

      {/* fixed 3D layer behind the scrolling overlays */}
      <div
        className={`fixed inset-0 z-0 transition-opacity duration-[1200ms] ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      >
        <Suspense fallback={null}>
          <SceneCanvas
            lowPerf={lowPerf}
            audioOn={audioOn}
            audio={audio}
            firstTrack={tracks[0] ?? null}
            started={started}
          />
        </Suspense>
      </div>

      <div className="grain" />

      <div
        ref={rootRef}
        className={`relative transition-opacity duration-1000 ${
          started ? "opacity-100" : "opacity-0"
        }`}
      >
        <Overlays heroRef={heroRef} tracks={tracks} shows={shows} merch={merch} />
      </div>
    </>
  );
}
