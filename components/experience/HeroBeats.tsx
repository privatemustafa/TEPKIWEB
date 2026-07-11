"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { scrollStore } from "./scrollStore";
import { trackerStore } from "./trackerStore";
import { ROOMS, dwellOpacity, type Room } from "./rooms";
import type { Track } from "@/lib/types";

/**
 * Fixed, cross-fading overlay for the room reveals. Each room's text is gated to
 * its hold window (which sits inside the transition-free part of the room), so a
 * giant title can never bleed into the content sections or the next room.
 */

function useScroll() {
  return useSyncExternalStore(
    scrollStore.subscribe,
    scrollStore.getSnapshot,
    scrollStore.getSnapshot
  );
}

const ALIGN: Record<string, string> = {
  left: "left-6 sm:left-14 bottom-[20vh] items-start text-left",
  right: "right-6 sm:right-14 top-1/2 -translate-y-1/2 items-end text-right",
  center: "left-1/2 -translate-x-1/2 bottom-[22vh] items-center text-center",
};

export default function HeroBeats({
  tracks,
  onInteract,
}: {
  tracks: Track[];
  onInteract: () => void;
}) {
  const { heroProgress } = useScroll();
  const [detail, setDetail] = useState<Room | null>(null);

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {ROOMS.map((room) => {
        if (!room.overlay) return null;
        const op = dwellOpacity(room, heroProgress);
        if (op <= 0.001) return null;
        const track = tracks[room.trackIndex];
        const title = track?.title ?? room.overlay.fallbackTitle;
        return (
          <div
            key={room.id}
            className={`absolute flex max-w-md flex-col gap-3 px-2 ${ALIGN[room.overlay.align]}`}
            style={{ opacity: op }}
          >
            {room.overlay.eyebrow && (
              <p className="text-xs uppercase tracking-ultra text-gold">
                {room.overlay.eyebrow}
              </p>
            )}
            {room.overlay.city && (
              <p className="text-[11px] uppercase tracking-ultra text-white/45">
                {room.overlay.city}
              </p>
            )}
            <h2 className="font-display text-6xl leading-[0.9] tracking-tight text-chalk drop-shadow-[0_4px_40px_rgba(0,0,0,0.85)] sm:text-7xl">
              {title}
            </h2>
            {room.overlay.quote && (
              <p className="max-w-sm font-serif text-lg italic text-white/70">
                &ldquo;{room.overlay.quote}&rdquo;
              </p>
            )}
          </div>
        );
      })}

      {/* studio hotspot — magnetically rides on top of the album (3D-projected) */}
      {ROOMS.filter((r) => r.id === "studio" && r.overlay?.hotspot).map((room) => (
        <MagnetHotspot
          key={`hs-${room.id}`}
          room={room}
          label={room.overlay!.hotspot!.label}
          onOpen={() => {
            onInteract();
            setDetail(room);
          }}
        />
      ))}

      {/* other hotspots (fixed leader line + crosshair) */}
      {ROOMS.filter((r) => r.id !== "studio" && r.overlay?.hotspot).map((room) => {
        const hs = room.overlay!.hotspot!;
        const op = dwellOpacity(room, heroProgress);
        if (op <= 0.02) return null;
        return (
          <div
            key={`hs-${room.id}`}
            className="pointer-events-none absolute flex items-center gap-3"
            style={{ left: `${hs.x}%`, top: `${hs.y}%`, opacity: op }}
          >
            <button
              onClick={() => {
                onInteract();
                setDetail(room);
              }}
              aria-label={hs.label}
              className="exp-hotspot-pulse pointer-events-auto flex h-8 w-8 items-center justify-center border border-white/60 text-chalk transition hover:border-gold hover:text-gold"
            >
              +
            </button>
            <span className="h-px w-16 bg-white/40" />
            <span className="text-[10px] uppercase tracking-ultra text-white/70">
              {hs.label}
            </span>
          </div>
        );
      })}

      {detail && detail.id === "studio" && (
        <ReleaseCard onClose={() => setDetail(null)} />
      )}
      {detail && detail.id !== "studio" && (
        <DetailCard
          room={detail}
          track={tracks[detail.trackIndex]}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

/**
 * A hotspot that follows the 3D album in screen space every frame (via
 * trackerStore, published by <AlbumTracker> inside the Canvas). Positioned +
 * faded in a rAF loop to avoid re-rendering React every frame.
 */
function MagnetHotspot({
  room,
  label,
  onOpen,
}: {
  room: Room;
  label: string;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const t = trackerStore.peek();
        const op = dwellOpacity(room, scrollStore.peek().heroProgress);
        if (op <= 0.02 || !t.visible) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        } else {
          el.style.opacity = String(op);
          el.style.pointerEvents = "auto";
          el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [room]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-0 flex items-center gap-3 will-change-transform"
      style={{ opacity: 0 }}
    >
      <button
        onClick={onOpen}
        aria-label={label}
        className="exp-hotspot-pulse pointer-events-auto -ml-4 -mt-4 flex h-8 w-8 items-center justify-center border border-white/70 bg-black/20 text-chalk backdrop-blur-sm transition hover:border-gold hover:text-gold"
      >
        +
      </button>
      <span className="h-px w-14 bg-white/45" />
      <span className="whitespace-nowrap text-[10px] uppercase tracking-ultra text-white/75">
        {label}
      </span>
    </div>
  );
}

/**
 * Release-date tracker for the album. Intentionally reveals NO date — the album
 * has no announced release yet, so it leans into an unknown / "coming" vibe with
 * a redacted date.
 */
function ReleaseCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative mx-6 w-full max-w-xl border border-white/12 bg-ink/90 p-10 text-center">
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 text-white/50 transition hover:text-gold"
        >
          ✕
        </button>
        <p className="text-[11px] uppercase tracking-ultra text-gold">
          MMXVIII — Çıkış Tarihi
        </p>

        <div className="my-10 flex items-center justify-center gap-4 sm:gap-6">
          {["--", "--", "----"].map((seg, i) => (
            <div key={i} className="flex items-center gap-4 sm:gap-6">
              <span className="exp-redacted font-display text-6xl tracking-widest text-chalk/85 sm:text-8xl">
                {seg}
              </span>
              {i < 2 && (
                <span className="font-display text-5xl text-white/25 sm:text-7xl">
                  /
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="text-sm uppercase tracking-ultra text-white/60">
          Tarih henüz açıklanmadı
        </p>
        <p className="mx-auto mt-4 max-w-sm font-serif text-lg italic text-white/55">
          &ldquo;Zamanı geldiğinde bileceksin.&rdquo;
        </p>
      </div>
    </div>
  );
}

function DetailCard({
  room,
  track,
  onClose,
}: {
  room: Room;
  track: Track | undefined;
  onClose: () => void;
}) {
  const title = track?.title ?? room.overlay!.fallbackTitle;
  return (
    <div className="pointer-events-auto fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-6 w-full max-w-lg border border-white/15 bg-ink/90 p-8">
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 text-white/50 transition hover:text-gold"
        >
          ✕
        </button>
        <div className="flex gap-6">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden border border-white/10">
            <Image src="/album-cover.png" alt={title} fill className="object-cover" sizes="112px" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-ultra text-gold">
              {room.overlay!.eyebrow}
            </p>
            <h3 className="mt-1 font-display text-4xl tracking-tight text-chalk">{title}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-ultra text-white/45">
              {room.overlay!.city}
            </p>
          </div>
        </div>
        <p className="mt-6 font-serif text-lg italic text-white/75">
          &ldquo;{room.overlay!.quote}&rdquo;
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/50">
          Bu parça albümün {room.overlay!.eyebrow.toLowerCase()} bölümünün
          kalbinde — {room.overlay!.city} dokusunu taşıyan bir an. Gerçek görsel
          ve sözler buraya eklenecek.
        </p>
        {track?.preview_url && (
          <audio controls src={track.preview_url} className="mt-6 w-full">
            <track kind="captions" />
          </audio>
        )}
      </div>
    </div>
  );
}
