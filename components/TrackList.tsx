"use client";

import { useRef, useState } from "react";
import { Track } from "@/lib/types";

const CITY_LABEL: Record<string, string> = {
  sefakoy: "Sefaköy",
  tiflis: "Tiflis",
  buenos_aires: "Buenos Aires",
};

function fmt(d: number) {
  const m = Math.floor(d / 60);
  const s = d % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TrackList({ tracks }: { tracks: Track[] }) {
  const [active, setActive] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const onPlay = (t: Track) => {
    if (active === t.id) {
      audioRef.current?.pause();
      setActive(null);
      return;
    }
    setActive(t.id);
    if (t.preview_url && audioRef.current) {
      audioRef.current.src = t.preview_url;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <audio ref={audioRef} onEnded={() => setActive(null)} />
      <ol className="divide-y divide-white/10 border-y border-white/10">
        {tracks.map((t) => {
          const isActive = active === t.id;
          return (
            <li key={t.id}>
              <button
                onClick={() => onPlay(t)}
                className="group flex w-full items-center gap-5 px-2 py-5 text-left transition hover:bg-white/[0.03]"
              >
                <span className="w-8 font-display text-2xl text-white/40 group-hover:text-gold">
                  {t.order.toString().padStart(2, "0")}
                </span>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                    isActive
                      ? "border-gold bg-gold text-ink"
                      : "border-white/30 text-chalk group-hover:border-gold group-hover:text-gold"
                  }`}
                  aria-hidden
                >
                  {isActive ? "❚❚" : "▶"}
                </span>
                <span className="flex-1">
                  <span className="block font-display text-2xl tracking-wide">
                    {t.title}
                  </span>
                  <span className="text-xs uppercase tracking-ultra text-white/40">
                    {CITY_LABEL[t.city] ?? t.city}
                  </span>
                </span>
                <span className="font-mono text-sm text-white/50">
                  {fmt(t.duration)}
                </span>
              </button>
              {isActive && (
                <div className="px-2 pb-5 text-sm text-white/50">
                  {t.preview_url
                    ? "30 sn önizleme çalıyor…"
                    : "Önizleme yakında — Spotify/Apple Music linkleri eklenince burada çalacak."}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
