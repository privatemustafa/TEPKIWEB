import { MerchItem, Show, Track } from "./types";

/**
 * Local fallback content. Used when Supabase is not configured so the
 * experience is fully viewable offline. Mirrors the Supabase schema.
 */

export const mockTracks: Track[] = [
  {
    id: "t1",
    title: "BANDS ON BANDS",
    duration: 0,
    preview_url: null,
    spotify_id: null,
    city: "",
    order: 1,
  },
];

export const mockShows: Show[] = [];

export const mockMerch: MerchItem[] = [];
