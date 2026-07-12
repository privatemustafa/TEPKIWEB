"use client";

import { type RefObject } from "react";
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
export default function Overlays({ heroRef }: Props) {
  return (
    <div className="relative z-10">
      {/* ============ HERO JOURNEY (transparent — 3D + HeroBeats show through) == */}
      <div ref={heroRef} className="pointer-events-none relative">
        <section
          data-chapter="0"
          className="flex h-screen items-end justify-center pb-[12vh]"
        >
          <div className="exp-scroll-hint flex flex-col items-center gap-2 text-[10px] uppercase tracking-ultra text-white/45">
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

      {/* ===================== CONTENT (opaque) ===================== */}
      <div className="relative bg-ink">
        <div className="pointer-events-none absolute -top-[35vh] left-0 h-[35vh] w-full bg-gradient-to-b from-transparent to-ink" />

        <footer data-chapter="7" className="border-t border-white/10 px-6 py-24">
          <div className="exp-reveal mx-auto max-w-3xl text-center">
            <h4 className="font-display text-5xl tracking-tight sm:text-6xl">
              MMXVIII
            </h4>
            <Newsletter />
            <div className="mt-16 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-ultra text-white/40">
              <a className="hover:text-gold" href="#">Spotify</a>
              <a className="hover:text-gold" href="#">Apple Music</a>
              <a className="hover:text-gold" href="#">YouTube</a>
              <a className="hover:text-gold" href="#">Instagram</a>
            </div>
            <p className="mt-10 text-[11px] uppercase tracking-ultra text-white/25">
              © {new Date().getFullYear()} TEPKİ X EMERALD — MMXVIII
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
