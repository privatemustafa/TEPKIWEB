"use client";

/* eslint-disable @next/next/no-img-element */
import TrackList from "../TrackList";
import Merch from "../Merch";
import ShowDates from "../ShowDates";
import Newsletter from "../Newsletter";
import type { MerchItem, Show, Track } from "@/lib/types";

/**
 * Motion-free / no-WebGL layout. Shows the album cover as a static hero and
 * keeps every section fully accessible. Used for `prefers-reduced-motion` and
 * when WebGL is unavailable.
 */
export default function StaticFallback({
  tracks,
  shows,
  merch,
}: {
  tracks: Track[];
  shows: Show[];
  merch: MerchItem[];
}) {
  return (
    <main className="relative bg-ink">
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
        <img
          src="/album-cover.png"
          alt="TEPKİ — MMXVIII albüm kapağı"
          className="w-full max-w-md border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        />
        <p className="mt-10 text-xs uppercase tracking-ultra text-gold">
          Yeni Albüm
        </p>
        <h1 className="font-display text-7xl leading-none tracking-tight text-chalk sm:text-9xl">
          MMXVIII
        </h1>
        <p className="mt-3 font-display text-lg uppercase tracking-ultra text-chalk/80">
          TEPKİ — 832 Yanyol&apos;dan Dünyaya
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center font-display text-6xl tracking-tight sm:text-7xl">
          Tracklist
        </h2>
        {tracks.length ? (
          <TrackList tracks={tracks} />
        ) : (
          <p className="text-center text-white/30">Yükleniyor…</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center font-display text-6xl tracking-tight sm:text-7xl">
          Koleksiyon
        </h2>
        {merch.length ? (
          <Merch items={merch} />
        ) : (
          <p className="text-center text-white/30">Yükleniyor…</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center font-display text-6xl tracking-tight sm:text-7xl">
          Turne
        </h2>
        <ShowDates shows={shows} />
      </section>

      <footer className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h4 className="font-display text-4xl tracking-tight sm:text-5xl">
            Yeni parçalardan ilk sen haberdar ol
          </h4>
          <p className="mb-8 mt-2 text-white/40">
            Newsletter — ses, tarih, drop. Spam yok.
          </p>
          <Newsletter />
          <div className="mt-16 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-ultra text-white/40">
            <a className="hover:text-gold" href="#">
              Spotify
            </a>
            <a className="hover:text-gold" href="#">
              Apple Music
            </a>
            <a className="hover:text-gold" href="#">
              YouTube
            </a>
            <a className="hover:text-gold" href="#">
              Instagram
            </a>
          </div>
          <p className="mt-10 text-[11px] uppercase tracking-ultra text-white/25">
            41.0° N, 28.8° E — 832 Yanyol, Sefaköy
          </p>
          <p className="mt-2 text-[11px] text-white/20">
            © {new Date().getFullYear()} TEPKİ — Kerem Gülsoy
          </p>
        </div>
      </footer>
    </main>
  );
}
