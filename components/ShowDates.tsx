"use client";

import { Show } from "@/lib/types";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("tr-TR", { day: "2-digit" }),
    mon: d.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase(),
    year: d.getFullYear(),
  };
}

export default function ShowDates({ shows }: { shows: Show[] }) {
  if (!shows.length) {
    return (
      <p className="text-center text-white/40">Yakında yeni tarihler…</p>
    );
  }
  return (
    <div className="mx-auto w-full max-w-4xl divide-y divide-white/10 border-y border-white/10">
      {shows.map((s) => {
        const d = fmtDate(s.date);
        return (
          <div
            key={s.id}
            className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-8"
          >
            <div className="flex w-28 shrink-0 items-baseline gap-2">
              <span className="font-display text-4xl text-gold">{d.day}</span>
              <span className="text-sm uppercase tracking-ultra text-white/50">
                {d.mon}
                <br />
                {d.year}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-display text-2xl tracking-wide">{s.city}</div>
              <div className="text-sm text-white/50">{s.venue}</div>
            </div>
            <div className="shrink-0">
              {s.sold_out ? (
                <span className="inline-block border border-white/20 px-5 py-2 text-xs uppercase tracking-ultra text-white/40">
                  Tükendi
                </span>
              ) : (
                <a
                  href={s.ticket_url ?? "#"}
                  target={s.ticket_url ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-block border border-gold px-5 py-2 text-xs uppercase tracking-ultra text-gold transition hover:bg-gold hover:text-ink"
                >
                  Bilet
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
