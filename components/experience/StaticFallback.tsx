"use client";

/* eslint-disable @next/next/no-img-element */
import Newsletter from "../Newsletter";

/**
 * Motion-free / no-WebGL layout. Shows the album cover as a static hero. Used
 * for `prefers-reduced-motion` and when WebGL is unavailable.
 */
export default function StaticFallback() {
  return (
    <main className="relative bg-ink">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <img
          src="/album-cover.png"
          alt="MMXVIII"
          className="w-full max-w-md border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
        />
        <p className="mt-10 text-xs uppercase tracking-ultra text-gold">
          TEPKİ X EMERALD
        </p>
        <h1 className="font-display text-7xl leading-none tracking-tight text-chalk sm:text-9xl">
          MMXVIII
        </h1>
        <p className="mt-3 font-display text-lg uppercase tracking-ultra text-chalk/80">
          BANDS ON BANDS
        </p>
      </section>

      <footer className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h4 className="font-display text-4xl tracking-tight sm:text-5xl">
            MMXVIII
          </h4>
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
            © {new Date().getFullYear()} TEPKİ X EMERALD — MMXVIII
          </p>
        </div>
      </footer>
    </main>
  );
}
