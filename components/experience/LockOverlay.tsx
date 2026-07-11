"use client";

import { useEffect, useState } from "react";

/**
 * Phase-1 lock. When the studio beat finishes, the whole view slowly frosts
 * over like etched glass and a "ÇOK YAKINDA" plate with a lock appears — rooms
 * II & III arrive later. Shown once `show` is true; the frost/opacity eases in.
 */
export default function LockOverlay({ show }: { show: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // next frame → trigger the CSS transition (slow frost)
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
  }, [show]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{
        pointerEvents: visible ? "auto" : "none",
        opacity: visible ? 1 : 0,
        backdropFilter: visible ? "blur(22px) saturate(115%)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(22px) saturate(115%)" : "blur(0px)",
        backgroundColor: visible ? "rgba(9,10,13,0.55)" : "rgba(9,10,13,0)",
        transition:
          "opacity 1600ms ease, backdrop-filter 1600ms ease, background-color 1600ms ease",
      }}
    >
      {/* frosted milky veil */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(226,231,240,0.14), rgba(226,231,240,0.04) 40%, transparent 70%)",
        }}
      />

      <div
        className="relative flex flex-col items-center px-8 text-center"
        style={{
          transform: visible ? "translateY(0)" : "translateY(14px)",
          opacity: visible ? 1 : 0,
          transition: "transform 1400ms ease 300ms, opacity 1400ms ease 300ms",
        }}
      >
        {/* lock icon */}
        <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/5">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="text-chalk"
          >
            <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
        </div>

        <p className="text-[11px] uppercase tracking-ultra text-gold">
          TEPKİ X EMERALD — MMXVIII
        </p>
        <h2 className="mt-3 font-display text-[15vw] leading-[0.9] tracking-tight text-chalk drop-shadow-[0_4px_40px_rgba(0,0,0,0.7)] sm:text-8xl">
          İKİNCİ ODA
        </h2>
        <p className="mt-4 text-xs uppercase tracking-ultra text-white/55 sm:text-sm">
          Çok Yakında
        </p>
      </div>
    </div>
  );
}
