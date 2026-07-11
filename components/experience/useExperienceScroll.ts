"use client";

import { useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import { scrollStore } from "./scrollStore";
import { activeChapter, PHASE1_MAX } from "./rooms";

/**
 * Lenis smooth scrolling + journey derivation + auto-play.
 *
 * Every frame it derives overall progress, hero progress (drives the scrubbed
 * 3D camera/album timeline) and the active chapter. Scroll is locked until
 * `started`. When `playing` is true the page auto-scrolls (programmatic Lenis),
 * acting like an audio-synced timeline; any real user wheel/touch hands control
 * back via `onManualScroll`.
 */
// PHASE 1: the studio auto-plays to the PHASE1_MAX cutoff over ~the intro video
// length, then the experience locks (frosted screen + ÇOK YAKINDA).
const PHASE1_DURATION_S = 42;

export function useExperienceScroll(
  heroRef: RefObject<HTMLElement>,
  started: boolean,
  enabled: boolean,
  playing: boolean,
  onManualScroll: () => void,
  onLock: () => void
) {
  const lenisRef = useRef<Lenis | null>(null);
  const startedRef = useRef(started);
  const playingRef = useRef(playing);
  const manualCbRef = useRef(onManualScroll);
  const lockCbRef = useRef(onLock);
  const lockedRef = useRef(false);
  startedRef.current = started;
  playingRef.current = playing;
  manualCbRef.current = onManualScroll;
  lockCbRef.current = onLock;

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    lenis.stop();

    // user input hands control back from auto-play
    const onUserInput = () => {
      if (playingRef.current) manualCbRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(
          e.key
        )
      )
        onUserInput();
    };
    window.addEventListener("wheel", onUserInput, { passive: true });
    window.addEventListener("touchstart", onUserInput, { passive: true });
    window.addEventListener("keydown", onKey);

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    let rafId = 0;
    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;
      lenis.raf(time);

      const vh = window.innerHeight;

      const hero = heroRef.current;
      const heroTop = hero ? hero.offsetTop : 0;
      const heroRange = hero ? Math.max(1, hero.offsetHeight - vh) : 1;
      // phase-1 scroll ceiling (end of the studio beat)
      const cutoff = heroTop + PHASE1_MAX * heroRange;

      // auto-play: roam the studio to the cutoff over ~the intro video length,
      // then lock. Manual scrolling that reaches the cutoff also locks.
      if (startedRef.current && !lockedRef.current) {
        const cur = window.scrollY;
        if (playingRef.current && cur < cutoff - 2) {
          const speed = (PHASE1_MAX * heroRange) / PHASE1_DURATION_S;
          lenis.scrollTo(Math.min(cur + speed * dt, cutoff), {
            immediate: true,
            force: true,
          });
        }
        if (window.scrollY >= cutoff - 2) {
          lockedRef.current = true;
          lenis.scrollTo(cutoff, { immediate: true, force: true });
          lockCbRef.current();
        }
      }

      const scrollY = window.scrollY;
      let heroProgress = clamp((scrollY - heroTop) / heroRange, 0, 1);
      heroProgress = Math.min(heroProgress, PHASE1_MAX); // never past the studio
      const progress = clamp(heroProgress / PHASE1_MAX, 0, 1);

      const chapter = activeChapter(heroProgress);

      scrollStore.update(progress, heroProgress, chapter);

      if (typeof window !== "undefined") {
        (window as unknown as { __exp?: unknown }).__exp = {
          scrollY,
          locked: lockedRef.current,
          playing: playingRef.current,
          ...scrollStore.peek(),
        };
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", onUserInput);
      window.removeEventListener("touchstart", onUserInput);
      window.removeEventListener("keydown", onKey);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [heroRef, enabled]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (started) lenis.start();
    else lenis.stop();
  }, [started]);

  return lenisRef;
}
