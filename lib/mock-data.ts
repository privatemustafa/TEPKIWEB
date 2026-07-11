import { MerchItem, Show, Track } from "./types";

/**
 * Local fallback content. Used when Supabase is not configured so the
 * experience is fully viewable offline. Mirrors the Supabase schema.
 */

export const mockTracks: Track[] = [
  {
    id: "t1",
    title: "BANDS ON BANDS",
    duration: 184,
    preview_url: null,
    spotify_id: null,
    city: "sefakoy",
    order: 1,
  },
  {
    id: "t2",
    title: "Sefaköy Gece",
    duration: 201,
    preview_url: null,
    spotify_id: null,
    city: "sefakoy",
    order: 2,
  },
  {
    id: "t3",
    title: "E-5",
    duration: 167,
    preview_url: null,
    spotify_id: null,
    city: "sefakoy",
    order: 3,
  },
  {
    id: "t4",
    title: "Narıkala",
    duration: 219,
    preview_url: null,
    spotify_id: null,
    city: "tiflis",
    order: 4,
  },
  {
    id: "t5",
    title: "Kura Nehri",
    duration: 195,
    preview_url: null,
    spotify_id: null,
    city: "tiflis",
    order: 5,
  },
  {
    id: "t6",
    title: "Tiflis'e Mektup",
    duration: 233,
    preview_url: null,
    spotify_id: null,
    city: "tiflis",
    order: 6,
  },
  {
    id: "t7",
    title: "Caminito",
    duration: 178,
    preview_url: null,
    spotify_id: null,
    city: "buenos_aires",
    order: 7,
  },
  {
    id: "t8",
    title: "Obelisco",
    duration: 188,
    preview_url: null,
    spotify_id: null,
    city: "buenos_aires",
    order: 8,
  },
  {
    id: "t9",
    title: "San Telmo Tango",
    duration: 246,
    preview_url: null,
    spotify_id: null,
    city: "buenos_aires",
    order: 9,
  },
];

export const mockShows: Show[] = [
  {
    id: "s1",
    date: "2026-07-18T21:00:00+03:00",
    city: "İstanbul",
    venue: "KüçükÇiftlik Park",
    ticket_url: "https://example.com/istanbul",
    sold_out: false,
  },
  {
    id: "s2",
    date: "2026-08-02T21:00:00+04:00",
    city: "Tbilisi",
    venue: "Black Box",
    ticket_url: "https://example.com/tbilisi",
    sold_out: false,
  },
  {
    id: "s3",
    date: "2026-09-14T21:00:00-03:00",
    city: "Buenos Aires",
    venue: "Niceto Club",
    ticket_url: null,
    sold_out: true,
  },
  {
    id: "s4",
    date: "2026-10-05T20:00:00+02:00",
    city: "Berlin",
    venue: "Säälchen",
    ticket_url: "https://example.com/berlin",
    sold_out: false,
  },
];

export const mockMerch: MerchItem[] = [
  {
    id: "m1",
    name: "832 Yanyol Tişört",
    price: 650,
    currency: "TRY",
    image_url: null,
    buy_url: "https://example.com/merch/tshirt",
    sold_out: false,
  },
  {
    id: "m2",
    name: "Üç Şehir Hoodie",
    price: 1450,
    currency: "TRY",
    image_url: null,
    buy_url: "https://example.com/merch/hoodie",
    sold_out: false,
  },
  {
    id: "m3",
    name: "Albüm Vinyl (Limited)",
    price: 950,
    currency: "TRY",
    image_url: null,
    buy_url: "https://example.com/merch/vinyl",
    sold_out: true,
  },
  {
    id: "m4",
    name: "Sefaköy Beanie",
    price: 420,
    currency: "TRY",
    image_url: null,
    buy_url: "https://example.com/merch/beanie",
    sold_out: false,
  },
];
