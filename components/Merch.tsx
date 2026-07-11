"use client";

import { MerchItem } from "@/lib/types";

function price(p: number, c: string) {
  const sym = c === "TRY" ? "₺" : c === "USD" ? "$" : c === "EUR" ? "€" : "";
  return `${sym}${p.toLocaleString("tr-TR")}`;
}

export default function Merch({ items }: { items: MerchItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((m) => (
        <a
          key={m.id}
          href={m.buy_url ?? "#"}
          target={m.buy_url ? "_blank" : undefined}
          rel="noreferrer"
          className="group relative flex flex-col overflow-hidden border border-white/15 transition hover:border-gold"
        >
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/[0.06] to-transparent">
            {m.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.image_url}
                alt={m.name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-6xl text-white/10 transition group-hover:text-gold/30">
                  TEPKİ
                </span>
              </div>
            )}
            {m.sold_out && (
              <span className="absolute left-3 top-3 bg-ink/80 px-2 py-1 text-[10px] uppercase tracking-ultra text-gold">
                Tükendi
              </span>
            )}
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="font-display text-xl tracking-wide">{m.name}</span>
            <span className="text-sm text-white/60">
              {price(m.price, m.currency)}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
