# TEPKİ — İmmersif Albüm Deneyimi

Tepki (Kerem Gülsoy) yeni albüm tanıtım sitesi. GQ "The Extraordinary Lab"
tarzı, scroll'a bağlı sinematik bir line-art deneyimi: **Sefaköy → Tiflis →
Buenos Aires**.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — UI katmanı
- **GSAP + ScrollTrigger** — scroll-scrubbing line-drawing animasyonları
- **Web Audio API** — ambient ses kontrolü (asset gerektirmez)
- **Supabase** (PostgreSQL) — tracks / shows / merch / subscribers

## Hızlı Başlangıç

```bash
npm install
npm run dev
# http://localhost:3000
```

> Supabase **olmadan** çalışır: env değişkenleri boşsa API route'ları
> `lib/mock-data.ts` içindeki örnek veriyi döner. Yani klonla-çalıştır,
> hemen izlenebilir.

## Supabase Bağlama (opsiyonel)

1. Supabase'de proje aç.
2. `supabase/schema.sql` dosyasını SQL Editor'de çalıştır (tablolar + RLS + seed).
3. `.env.example` → `.env.local` kopyala ve doldur:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Admin için başlangıçta Supabase Dashboard yeterli (tracks/shows/merch satırları
oradan eklenir).

## API Routes

| Route            | Method | Açıklama                            |
| ---------------- | ------ | ----------------------------------- |
| `/api/tracks`    | GET    | Şarkı listesi (city ile gruplanır)  |
| `/api/shows`     | GET    | Konser tarihleri                    |
| `/api/merch`     | GET    | Merch koleksiyonu                   |
| `/api/subscribe` | POST   | Newsletter kaydı `{ email }`        |

Her GET yanıtı `{ source: "mock" | "supabase", data: [...] }` döner.

## Klasör Yapısı

```
app/
  page.tsx              # Experience'i render eder
  layout.tsx           # fontlar + metadata
  api/{tracks,shows,merch,subscribe}/route.ts
components/
  Experience.tsx       # GSAP scroll orkestrasyon + sayfa kompozisyonu
  cities.tsx           # Sefaköy / Tiflis / Buenos Aires line-art SVG'leri
  TrackList.tsx  Merch.tsx  ShowDates.tsx  Newsletter.tsx  AudioToggle.tsx
lib/
  supabase.ts  types.ts  mock-data.ts
supabase/
  schema.sql
```

## Erişilebilirlik / Performans

- `prefers-reduced-motion` desteklenir (çizim animasyonları kapanır).
- Ses varsayılan kapalı, kullanıcı etkileşimiyle açılır.
