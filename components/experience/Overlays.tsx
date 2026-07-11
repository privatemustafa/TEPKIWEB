"use client";

import { type RefObject } from "react";
import TrackList from "../TrackList";
import Merch from "../Merch";
import ShowDates from "../ShowDates";
import Newsletter from "../Newsletter";
import type { MerchItem, Show, Track } from "@/lib/types";

interface Props {
  heroRef: RefObject<HTMLDivElement>;
  tracks: Track[];
  shows: Show[];
  merch: MerchItem[];
}

/**
 * Scroll structure. The hero wrapper is six transparent full-height spacers
 * (data-chapter 0..5) that only provide scroll length + chapter detection — all
 * hero text is rendered by the fixed <HeroBeats> overlay so nothing bleeds into
 * the content sections, which start cleanly on a solid background.
 */
export default function Overlays({ heroRef, tracks, shows, merch }: Props) {
  return (
    <div className="relative z-10">
      {/* ============ HERO JOURNEY (transparent — 3D + HeroBeats show through) ==
          Taller room spacers give each world room to breathe and stretch the
          transition wipes across ~half a screen of scroll. */}
      <div ref={heroRef} className="pointer-events-none relative">
        <section
          data-chapter="0"
          className="flex h-screen items-end justify-center pb-[12vh]"
        >
          <div className="exp-scroll-hint flex flex-col items-center gap-2 text-[10px] uppercase tracking-ultra text-white/45">
            Stüdyoya gir
            <span className="block h-8 w-px bg-white/40" />
          </div>
        </section>
        {/* room 1 studio */}
        <section data-chapter="1" className="h-[180vh]" />
        {/* room 2 monolith */}
        <section data-chapter="2" className="h-[180vh]" />
        {/* room 3 lab */}
        <section data-chapter="3" className="h-[180vh]" />
      </div>

      {/* ===================== CONTENT (opaque, readable) ===================== */}
      <div className="relative bg-ink">
        <div className="pointer-events-none absolute -top-[35vh] left-0 h-[35vh] w-full bg-gradient-to-b from-transparent to-ink" />

        {/* Tracklist */}
        <section data-chapter="4" className="mx-auto max-w-6xl px-6 py-28">
          <div className="exp-reveal mb-14 text-center">
            <p className="mb-3 text-xs uppercase tracking-ultra text-gold">
              IV — Albüm
            </p>
            <h2 className="font-display text-6xl tracking-tight sm:text-7xl">
              Tracklist
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/50">
              Üç şehir, dokuz parça. Her şarkı bir durak — Sefaköy&apos;ün
              sokaklarından Buenos Aires&apos;in kaldırımlarına.
            </p>
          </div>
          <div className="exp-reveal">
            {tracks.length ? (
              <TrackList tracks={tracks} />
            ) : (
              <p className="text-center text-white/30">Yükleniyor…</p>
            )}
          </div>
        </section>

        {/* Vision / story */}
        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="space-y-28 text-center">
            {[
              { city: "Sefaköy'den", text: "E-5'in yanyolu, 832'nin gecesi. Başladığı yer." },
              { city: "Tiflis'e", text: "Kura'nın iki yakası, Narıkala'nın gölgesi. Yol ortası." },
              { city: "Buenos Aires'e", text: "Caminito'nun rengi, tango'nun nefesi. Dünyaya açılan kapı." },
            ].map((b) => (
              <div key={b.city} className="exp-reveal">
                <h3 className="font-display text-6xl tracking-tight text-chalk sm:text-8xl">
                  {b.city}
                </h3>
                <p className="mx-auto mt-4 max-w-md text-white/50">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Merch */}
        <section data-chapter="5" className="mx-auto max-w-6xl px-6 py-28">
          <div className="exp-reveal mb-14 text-center">
            <p className="mb-3 text-xs uppercase tracking-ultra text-gold">
              V — Merch
            </p>
            <h2 className="font-display text-6xl tracking-tight sm:text-7xl">
              Koleksiyon
            </h2>
          </div>
          <div className="exp-reveal">
            {merch.length ? (
              <Merch items={merch} />
            ) : (
              <p className="text-center text-white/30">Yükleniyor…</p>
            )}
          </div>
        </section>

        {/* Shows */}
        <section data-chapter="6" className="mx-auto max-w-6xl px-6 py-28">
          <div className="exp-reveal mb-14 text-center">
            <p className="mb-3 text-xs uppercase tracking-ultra text-gold">
              VI — Konser
            </p>
            <h2 className="font-display text-6xl tracking-tight sm:text-7xl">
              Turne
            </h2>
          </div>
          <div className="exp-reveal">
            <ShowDates shows={shows} />
          </div>
        </section>

        {/* Outro / footer */}
        <footer data-chapter="7" className="border-t border-white/10 px-6 py-24">
          <div className="exp-reveal mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs uppercase tracking-ultra text-gold">
              VII — Devam Et
            </p>
            <h4 className="font-display text-4xl tracking-tight sm:text-5xl">
              Yeni parçalardan ilk sen haberdar ol
            </h4>
            <p className="mb-8 mt-2 text-white/40">
              Newsletter — ses, tarih, drop. Spam yok.
            </p>
            <Newsletter />
            <div className="mt-16 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-ultra text-white/40">
              <a className="hover:text-gold" href="#">Spotify</a>
              <a className="hover:text-gold" href="#">Apple Music</a>
              <a className="hover:text-gold" href="#">YouTube</a>
              <a className="hover:text-gold" href="#">Instagram</a>
            </div>
            <p className="mt-10 text-[11px] uppercase tracking-ultra text-white/25">
              41.0° N, 28.8° E — 832 Yanyol, Sefaköy
            </p>
            <p className="mt-2 text-[11px] text-white/20">
              © {new Date().getFullYear()} TEPKİ — Kerem Gülsoy
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
