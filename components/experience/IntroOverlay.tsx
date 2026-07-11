"use client";

/**
 * Intro screen shown over the wireframe blueprint world after loading. Clicking
 * anywhere enables sound and starts the journey (GQ "click anywhere to enable
 * sound"). Fades out once started.
 */
export default function IntroOverlay({
  show,
  onEnable,
}: {
  show: boolean;
  onEnable: () => void;
}) {
  return (
    <button
      onClick={onEnable}
      aria-label="Sesi etkinleştir ve deneyimi başlat"
      tabIndex={show ? 0 : -1}
      className={`fixed inset-0 z-[80] flex cursor-pointer flex-col items-center justify-center text-center transition-opacity duration-700 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <p className="mb-5 text-xs uppercase tracking-ultra text-white/50">TEPKİ X EMERALD</p>
      <h1 className="font-display text-[17vw] leading-[0.82] tracking-tight text-chalk drop-shadow-[0_4px_60px_rgba(0,0,0,0.9)] sm:text-[12vw]">
        MMXVIII
      </h1>
      <p className="mt-6 max-w-xl px-6 text-[11px] uppercase tracking-ultra text-white/55 sm:text-xs">
        832 Yanyol&apos;dan Dünyaya — Bir Albüm Anı Defteri
      </p>

      <span className="mt-16 inline-flex items-center gap-3 border border-white/25 px-6 py-3 text-[11px] uppercase tracking-ultra text-chalk transition hover:border-gold hover:text-gold">
        Ses için herhangi bir yere tıkla
      </span>
      <svg
        className="mt-5 h-5 w-5 text-white/50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path
          d="M4 13v-1a8 8 0 0 1 16 0v1M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 0zm16 0v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
