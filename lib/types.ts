export interface Track {
  id: string;
  title: string;
  duration: number; // seconds
  preview_url: string | null;
  spotify_id: string | null;
  city: "sefakoy" | "tiflis" | "buenos_aires" | string;
  order: number;
}

export interface Show {
  id: string;
  date: string; // ISO
  city: string;
  venue: string;
  ticket_url: string | null;
  sold_out: boolean;
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  image_url: string | null;
  buy_url: string | null;
  sold_out: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}
