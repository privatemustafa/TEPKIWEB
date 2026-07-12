"use client";

import { type RefObject } from "react";
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
      {/* Phase 1 is a single scrollable beat: the studio room. There is NO
          content page below — scrolling to the bottom simply reaches the lock.
          The whole document scroll maps to the studio beat (see
          useExperienceScroll), so there's nothing to scroll into past it. */}
      <div ref={heroRef} className="pointer-events-none relative">
        <section
          data-chapter="0"
          className="flex h-screen items-end justify-center pb-[12vh]"
        >
          <div className="exp-scroll-hint flex flex-col items-center gap-2 text-[10px] uppercase tracking-ultra text-white/45">
            <span className="block h-8 w-px bg-white/40" />
          </div>
        </section>
        {/* studio scroll length (only reachable room in phase 1) */}
        <section data-chapter="1" className="h-[140vh]" />
      </div>
    </div>
  );
}
