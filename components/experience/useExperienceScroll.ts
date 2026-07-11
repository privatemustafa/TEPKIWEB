"use client";

import { useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import { scrollStore } from "./scrollStore";
import { activeChapter } from "./rooms";

/**
 * Lenis smooth scrolling + journey derivation + auto-play.
 *
 * Every frame it derives overall progress, hero progress (drives the scrubbed
 * 3D camera/album timeline) and the active chapter. Scroll is locked until
 * `started`. When `playing` is true the page auto-scrolls (programmatic Lenis),
 * acting like an audio-synced timeline; any real user wheel/touch hands control
 * back via `onManualScroll`.
 */
// Full hero journey auto-plays over this many seconds. The studio room takes
// roughly the first third (~40s), matching the ~42s intro video so the camera
// slowly roams the studio for the video's duration before moving on.
const HERO_DURATION_S = 115;

export function useExperienceScroll(
  heroRef: RefObject<HTMLElement>,
  started: boolean,
  enabled: boolean,
  playing: boolean,
  onManualScroll: () => void
) {
  const lenisRef = useRef<Lenis | null>(null);
  const startedRef = useRef(started);
  const playingRef = useRef(playing);
  const manualCbRef = useRef(onManualScroll);
  startedRef.current = started;
  playingRef.current = playing;
  manualCbRef.current = onManualScroll;

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

    let sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]")
    );
    const refreshSections = () => {
      sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-chapter]")
      );
    };
    window.addEventListener("resize", refreshSections);

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
      const docH = document.documentElement.scrollHeight;
      const maxScroll = Math.max(1, docH - vh);

      // auto-play: advance the scroll like a timeline, paced so the hero takes
      // ~HERO_DURATION_S (studio ≈ intro video length) for a slow cinematic roam
      if (startedRef.current && playingRef.current) {
        const cur = window.scrollY;
        if (cur < maxScroll - 2) {
          const hero = heroRef.current;
          const heroRange = hero
            ? Math.max(1, hero.offsetHeight - vh)
            : maxScroll;
          const speed = heroRange / HERO_DURATION_S; // px per second
          lenis.scrollTo(Math.min(cur + speed * dt, maxScroll), {
            immediate: true,
            force: true,
          });
        } else {
          manualCbRef.current(); // reached the end → stop auto
        }
      }

      const scrollY = window.scrollY;
      const progress = clamp(scrollY / maxScroll, 0, 1);

      let heroProgress = 0;
      const hero = heroRef.current;
      if (hero) {
        const range = Math.max(1, hero.offsetHeight - vh);
        heroProgress = clamp((scrollY - hero.offsetTop) / range, 0, 1);
      }

      let domChapter = 0;
      const threshold = scrollY + vh * 0.45;
      for (const s of sections) {
        const top = s.getBoundingClientRect().top + scrollY;
        if (top <= threshold) domChapter = Number(s.dataset.chapter ?? 0);
      }
      // during the hero, take the chapter from the active room so the chrome
      // label + wave marks line up exactly with the room transitions
      const chapter = heroProgress < 0.999 ? activeChapter(heroProgress) : domChapter;

      scrollStore.update(progress, heroProgress, chapter);

      if (typeof window !== "undefined") {
        (window as unknown as { __exp?: unknown }).__exp = {
          scrollY,
          docH,
          heroH: hero ? hero.offsetHeight : 0,
          playing: playingRef.current,
          ...scrollStore.peek(),
        };
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", refreshSections);
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
