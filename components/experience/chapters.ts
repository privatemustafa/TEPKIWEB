/** Chapter metadata shared by the chrome (label + progress dots) and overlays. */
export interface Chapter {
  id: string;
  index: number;
  /** Short uppercase label shown in the chrome. */
  label: string;
  /** Roman-numeral / ordinal eyebrow. */
  ordinal: string;
}

export const CHAPTERS: Chapter[] = [
  { id: "intro", index: 0, label: "MMXVIII", ordinal: "00" },
  { id: "studio", index: 1, label: "BANDS ON BANDS", ordinal: "I" },
  { id: "monolith", index: 2, label: "MMXVIII", ordinal: "II" },
  { id: "lab", index: 3, label: "MMXVIII", ordinal: "III" },
  { id: "tracklist", index: 4, label: "MMXVIII", ordinal: "IV" },
  { id: "merch", index: 5, label: "MMXVIII", ordinal: "V" },
  { id: "shows", index: 6, label: "MMXVIII", ordinal: "VI" },
  { id: "outro", index: 7, label: "MMXVIII", ordinal: "VII" },
];

export const CHAPTER_COUNT = CHAPTERS.length;

/** Number of hero chapters the 3D camera timeline spans (intro + 3 rooms). */
export const HERO_CHAPTERS = 4;
