"use client";

import { useSyncExternalStore } from "react";
import { scrollStore } from "./scrollStore";
import { CHAPTERS } from "./chapters";
import SiriWave from "./SiriWave";

function useScrollSnapshot() {
  return useSyncExternalStore(
    scrollStore.subscribe,
    scrollStore.getSnapshot,
    scrollStore.getSnapshot
  );
}

/** Persistent GQ-style UI: wordmark, sound, scroll hint, wave scrubber, play. */
export default function Chrome({
  visible,
  playing,
  onTogglePlay,
  audioOn,
  onToggleSound,
}: {
  visible: boolean;
  playing: boolean;
  onTogglePlay: () => void;
  audioOn: boolean;
  onToggleSound: () => void;
}) {
  const { progress, chapter } = useScrollSnapshot();
  const active = CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)];

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[60] transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* top progress bar */}
      <div className="absolute left-0 top-0 h-[2px] w-full bg-white/10">
        <div
          className="h-full bg-gold transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* top-left wordmark */}
      <div className="absolute left-4 top-4 flex items-center gap-2 text-chalk sm:left-6 sm:top-5 sm:gap-3">
        <span className="font-display text-lg tracking-wide sm:text-xl">TEPKİ X EMERALD</span>
        <span className="text-white/30">×</span>
        <span className="text-[10px] uppercase tracking-ultra text-white/50">
          MMXVIII
        </span>
      </div>

      {/* top-center scroll hint (desktop only — no room on phones) */}
      <div className="absolute left-1/2 top-5 hidden -translate-x-1/2 text-center text-[10px] uppercase tracking-ultra text-white/45 sm:block">
        Kaydırarak gez <span className="ml-1">↓</span>
      </div>

      {/* top-right sound toggle */}
      <button
        onClick={onToggleSound}
        aria-label={audioOn ? "Sesi kapat" : "Sesi aç"}
        className="pointer-events-auto absolute right-4 top-4 flex items-center gap-2 px-1 py-2 text-[11px] uppercase tracking-ultra text-chalk transition hover:text-gold sm:right-6"
      >
        <span className="flex items-end gap-[2px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`w-[2px] bg-current transition-all duration-300 ${
                audioOn ? "exp-eq" : ""
              }`}
              style={{
                height: audioOn ? `${6 + ((i * 5) % 14)}px` : "4px",
                animationDelay: `${i * 120}ms`,
              }}
            />
          ))}
        </span>
        Sound
      </button>

      {/* bottom waveform scrubber */}
      <div
        className="absolute left-0 w-full px-4 sm:px-6"
        style={{ bottom: "calc(2.75rem + env(safe-area-inset-bottom))" }}
      >
        <SiriWave playing={playing} />
      </div>

      {/* bottom controls: play/pause + chapter label */}
      <div
        className="absolute left-0 flex w-full items-center justify-between px-4 sm:px-6"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={onTogglePlay}
          aria-label={playing ? "Duraklat" : "Oynat"}
          className="pointer-events-auto flex items-center gap-2 text-[10px] uppercase tracking-ultra text-white/60 transition hover:text-gold"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/30">
            {playing ? "❚❚" : "▶"}
          </span>
          {playing ? "Oynatılıyor" : "Oynat"}
        </button>

        <div className="text-[10px] uppercase tracking-ultra text-white/45">
          <span className="text-gold">{active.ordinal}</span>
          <span className="mx-2 text-white/20">·</span>
          {active.label}
        </div>

        <div className="w-24 text-right font-mono text-[10px] text-white/35">
          {Math.round(progress * 100)
            .toString()
            .padStart(2, "0")}
          %
        </div>
      </div>
    </div>
  );
}
