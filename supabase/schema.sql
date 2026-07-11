-- TEPKİ — Albüm tanıtım sitesi Supabase şeması
-- Supabase Dashboard > SQL Editor üzerinde çalıştırın.

-- ============ TRACKS ============
create table if not exists public.tracks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  duration    integer not null default 0,          -- saniye
  preview_url text,
  spotify_id  text,
  city        text not null default 'sefakoy',      -- sefakoy | tiflis | buenos_aires
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============ SHOWS ============
create table if not exists public.shows (
  id         uuid primary key default gen_random_uuid(),
  date       timestamptz not null,
  city       text not null,
  venue      text not null,
  ticket_url text,
  sold_out   boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============ MERCH ============
create table if not exists public.merch (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  price     numeric not null default 0,
  currency  text not null default 'TRY',
  image_url text,
  buy_url   text,
  sold_out  boolean not null default false,
  "order"   integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============ SUBSCRIBERS ============
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- ============ RLS ============
alter table public.tracks      enable row level security;
alter table public.shows       enable row level security;
alter table public.merch       enable row level security;
alter table public.subscribers enable row level security;

-- Herkes okuyabilsin (public read)
drop policy if exists "public read tracks" on public.tracks;
create policy "public read tracks" on public.tracks for select using (true);

drop policy if exists "public read shows" on public.shows;
create policy "public read shows" on public.shows for select using (true);

drop policy if exists "public read merch" on public.merch;
create policy "public read merch" on public.merch for select using (true);

-- Newsletter: herkes kayıt olabilsin (insert), kimse okuyamasın
drop policy if exists "public insert subscribers" on public.subscribers;
create policy "public insert subscribers" on public.subscribers for insert with check (true);

-- ============ SEED ============
insert into public.tracks (title, duration, city, "order") values
  ('832 Yanyol', 184, 'sefakoy', 1),
  ('Sefaköy Gece', 201, 'sefakoy', 2),
  ('E-5', 167, 'sefakoy', 3),
  ('Narıkala', 219, 'tiflis', 4),
  ('Kura Nehri', 195, 'tiflis', 5),
  ('Tiflis''e Mektup', 233, 'tiflis', 6),
  ('Caminito', 178, 'buenos_aires', 7),
  ('Obelisco', 188, 'buenos_aires', 8),
  ('San Telmo Tango', 246, 'buenos_aires', 9)
on conflict do nothing;
