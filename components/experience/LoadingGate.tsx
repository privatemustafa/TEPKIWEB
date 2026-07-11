"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";

/**
 * Full-screen black preloader with a percentage counter and the TEPKİ
 * wordmark. Waits for the 3D textures (tracked by drei's loading manager),
 * then — once progress hits 100% (or a hard safety timeout elapses) and a
 * minimum display time has passed — fires `onReady` exactly once, fades out,
 * and removes itself from the DOM entirely so it can never block the scene.
 *
 * All timing lives inside a single rAF loop driven by `firedRef` /
 * `revealedAt` refs (not effect cleanups), so re-renders caused by `onReady`
 * changing identity can never cancel the reveal.
 */
const MIN_DISPLAY_MS = 1400;
const SAFETY_TIMEOUT_MS = 6000;
const FADE_MS = 900;

export default function LoadingGate({ onReady }: { onReady: () => void }) {
  const { progress, active } = useProgress();
  const [display, setDisplay] = useState(0);
  const [phase, setPhase] = useState<"loading" | "revealing" | "gone">(
    "loading"
  );

  const mountedAt = useRef(Date.now());
  const firedRef = useRef(false);
  const startedRef = useRef(false);
  const revealedAt = useRef(0);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - mountedAt.current;

      // remember once the loader has actually started fetching something
      if (active) startedRef.current = true;

      const timedOut = elapsed > SAFETY_TIMEOUT_MS;
      const assetsDone =
        (startedRef.current && progress >= 100) || progress >= 100 || timedOut;

      const target = assetsDone ? 100 : Math.min(progress, 90);
      setDisplay((d) => {
        const next = d + (target - d) * 0.14;
        return assetsDone && next > 99 ? 100 : next;
      });

      // reveal exactly once, after the minimum on-screen time
      if (!firedRef.current && assetsDone && elapsed > MIN_DISPLAY_MS) {
        firedRef.current = true;
        revealedAt.current = Date.now();
        onReadyRef.current();
        setPhase("revealing");
      }

      // remove the gate after the fade-out completes
      if (
        firedRef.current &&
        Date.now() - revealedAt.current > FADE_MS
      ) {
        setPhase((p) => (p === "revealing" ? "gone" : p));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, active]);

  // fully unmount once gone — guarantees the overlay can never block input
  if (phase === "gone") return null;

  const fading = phase !== "loading";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink transition-opacity duration-[900ms] ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={fading}
    >
      <div className="relative flex flex-col items-center">
        <span className="font-display text-[18vw] leading-none tracking-tight text-chalk sm:text-[12vw]">
          TEPKİ
        </span>
        <span className="mt-1 text-[11px] uppercase tracking-ultra text-gold">
          MMXVIII
        </span>
      </div>

      <div className="mt-10 flex w-48 flex-col items-center gap-3">
        <div className="h-[2px] w-full bg-white/10">
          <div
            className="h-full bg-gold transition-[width] duration-150"
            style={{ width: `${Math.round(display)}%` }}
          />
        </div>
        <span className="font-mono text-xs text-white/50">
          {Math.round(display).toString().padStart(3, "0")}%
        </span>
      </div>
    </div>
  );
}
