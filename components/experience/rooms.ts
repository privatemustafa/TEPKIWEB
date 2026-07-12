/**
 * Spatial room model for the "Extraordinary Lab" journey.
 *
 * The three rooms are laid out as real, adjacent spaces along a corridor on the
 * -Z axis, separated by dark partition walls with an offset opening. A single
 * continuous camera PATH travels forward through the whole corridor, banking
 * past each partition edge so you physically leave one room and enter the next
 * (ref 02) — no fade-through-black. Colours/lights/fog change continuously as
 * you travel; the "different room" identity comes from geometry + camera, not
 * from snapping.
 *
 * heroProgress (0..1) parametrises the path. `sampleVec3(CAM_POS/CAM_LOOK, t)`
 * gives the camera; `roomPresence(room, t)` gives 0..1 gating so neighbouring
 * rooms both render during a pass.
 */

import { type Vec3Stop, type NumberStop, type ColorStop } from "./interp";

export interface RoomFeatures {
  videoWall: boolean;
  floatingScreens: boolean;
  bigScreen: boolean;
  monolith: boolean;
  table: boolean;
  vinyl: boolean;
  beams: boolean;
  dust: boolean;
}

export interface RoomOverlay {
  eyebrow: string;
  fallbackTitle: string;
  city: string;
  quote: string;
  align: "left" | "right" | "center";
  hotspot?: { label: string; x: number; y: number };
}

export interface Room {
  id: string;
  chapter: number;
  trackIndex: number;
  /** World anchor of the room's object station (table / monolith centre). */
  anchor: [number, number, number];
  /** Curved cyclorama wall behind the room. */
  wall: { pos: [number, number, number]; top: string; horizon: string; bottom: string };
  features: RoomFeatures;
  overlay?: RoomOverlay;
  /** heroProgress window the room's geometry is rendered (overlaps neighbours). */
  present: [number, number];
  /** heroProgress window the overlay text shows (inside the dwell). */
  dwell: [number, number];
}

const NO_FEATURES: RoomFeatures = {
  videoWall: false,
  floatingScreens: false,
  bigScreen: false,
  monolith: false,
  table: false,
  vinyl: false,
  beams: false,
  dust: false,
};

export const STUDIO: Room = {
  id: "studio",
  chapter: 1,
  trackIndex: 0,
  anchor: [0, 0, -3],
  wall: { pos: [0, 3.5, 8], top: "#161a2a", horizon: "#e6b98f", bottom: "#0a0906" },
  features: { ...NO_FEATURES, videoWall: true, table: true, vinyl: true, dust: true },
  present: [0.0, 0.45],
  dwell: [0.1, 0.3],
  overlay: {
    eyebrow: "",
    fallbackTitle: "BANDS ON BANDS",
    city: "",
    quote: "",
    align: "left",
    hotspot: { label: "Çıkış Tarihi", x: 52, y: 46 },
  },
};

export const MONOLITH: Room = {
  id: "monolith",
  chapter: 2,
  trackIndex: 1,
  anchor: [0, 0, -30],
  wall: { pos: [0, 4, -42], top: "#0b0a0c", horizon: "#caa07e", bottom: "#070606" },
  features: { ...NO_FEATURES, monolith: true, beams: true, dust: true },
  present: [0.36, 0.62],
  dwell: [0.46, 0.57],
  overlay: {
    eyebrow: "",
    fallbackTitle: "",
    city: "",
    quote: "",
    align: "right",
  },
};

export const LAB: Room = {
  id: "lab",
  chapter: 3,
  trackIndex: 2,
  anchor: [0, 0, -55],
  wall: { pos: [0, 4, -66], top: "#040814", horizon: "#3f78d8", bottom: "#04060f" },
  features: {
    ...NO_FEATURES,
    floatingScreens: true,
    bigScreen: true,
    table: true,
    dust: true,
  },
  present: [0.56, 1.01],
  dwell: [0.66, 0.9],
  overlay: {
    eyebrow: "",
    fallbackTitle: "",
    city: "",
    quote: "",
    align: "center",
  },
};

export const ROOMS: Room[] = [STUDIO, MONOLITH, LAB];

/**
 * PHASE 1 (teaser): only the studio room is unlocked. The journey is capped at
 * this heroProgress — the end of the table / top-down album beat — after which
 * the screen frosts over and a "ÇOK YAKINDA" lock appears. Rooms II & III open
 * later. Raise this (toward 1) to unlock the full journey.
 */
export const PHASE1_MAX = 0.32;

/**
 * Continuous camera path (world space). Weaves: studio wall → approach table →
 * TOP-DOWN over the album (reveal) → bank past partition 1 → orbit monolith →
 * bank past partition 2 → lab big screen → approach lab table → TOP-DOWN over
 * lab album → settle.
 */
export const CAM_POS: Vec3Stop[] = [
  { p: 0.0, v: [0, 2.6, 16] }, // intro (blueprint around origin)
  { p: 0.045, v: [0, 3.5, 11.5] }, // arrive facing the curved screen
  { p: 0.09, v: [0, 3.8, 8.3] }, // PUSH IN — focus on the video wall
  { p: 0.135, v: [0, 3.8, 8.0] }, // hold, let the footage read
  { p: 0.18, v: [0.4, 4.8, 3.4] }, // pull back & rise, room reveals
  { p: 0.22, v: [0.4, 5.4, 1.2] }, // move in over the table
  { p: 0.26, v: [0.15, 7.0, -2.2] }, // rise for top-down
  { p: 0.31, v: [0, 8.2, -3.0] }, // TOP-DOWN apex over the album
  { p: 0.37, v: [3.0, 3.6, -7] }, // descend, turn to the threshold
  { p: 0.42, v: [2.8, 2.8, -18] }, // pass partition 1 (right gap)
  { p: 0.5, v: [3.2, 2.3, -27] }, // monolith room, right side
  { p: 0.57, v: [-3.2, 2.4, -30] }, // sweep to the left of the monolith
  { p: 0.63, v: [-2.6, 2.8, -41] }, // pass partition 2 (left gap)
  { p: 0.71, v: [0, 3.6, -47] }, // lab — big screen returns
  { p: 0.8, v: [0.2, 5.4, -52] }, // approach lab table
  { p: 0.86, v: [0, 8.0, -55] }, // TOP-DOWN over lab album
  { p: 0.92, v: [0, 3.4, -50.5] }, // pull back
  { p: 1.0, v: [0, 2.8, -49.5] },
];

export const CAM_LOOK: Vec3Stop[] = [
  { p: 0.0, v: [0, 2.8, -4] },
  { p: 0.045, v: [0, 3.6, -14] }, // turn toward the screen
  { p: 0.09, v: [0, 3.8, -16] }, // locked on the screen
  { p: 0.135, v: [0, 3.8, -16] }, // hold focus on screen
  { p: 0.18, v: [0, 3.2, -3] }, // ease down toward the table
  { p: 0.22, v: [0, 2.6, -3] },
  { p: 0.26, v: [0, 1.7, -3] },
  { p: 0.31, v: [0, 1.45, -3] }, // straight down at the raised album
  { p: 0.37, v: [1.2, 2.4, -12] },
  { p: 0.42, v: [1.5, 2.4, -28] },
  { p: 0.5, v: [0, 2.2, -30] },
  { p: 0.57, v: [0, 2.4, -31] },
  { p: 0.63, v: [-1, 2.4, -50] },
  { p: 0.71, v: [0, 2.6, -55] },
  { p: 0.8, v: [0, 2.2, -55.3] },
  { p: 0.86, v: [0, 1.45, -55.3] }, // straight down at the raised lab album
  { p: 0.92, v: [0, 2.4, -55] },
  { p: 1.0, v: [0, 2.1, -55] },
];

/** Continuous lighting / fog, blended across the whole travel. */
export const KEY_INTENSITY: NumberStop[] = [
  { p: 0.0, v: 0.9 },
  { p: 0.16, v: 2.1 },
  { p: 0.29, v: 2.6 }, // bright for the top-down reveal
  { p: 0.45, v: 1.6 },
  { p: 0.5, v: 1.5 },
  { p: 0.66, v: 1.6 },
  { p: 0.86, v: 2.3 }, // bright for the lab reveal
  { p: 1.0, v: 1.7 },
];

export const KEY_COLOR: ColorStop[] = [
  { p: 0.0, v: "#cdd4e2" },
  { p: 0.2, v: "#ffe0c0" }, // warm studio
  { p: 0.45, v: "#ffd6ac" },
  { p: 0.55, v: "#ffcfa0" }, // monolith warm
  { p: 0.66, v: "#cfe0ff" },
  { p: 0.8, v: "#bcd4ff" }, // cool lab
  { p: 1.0, v: "#bcd4ff" },
];

export const RIM_COLOR: ColorStop[] = [
  { p: 0.0, v: "#3a4663" },
  { p: 0.2, v: "#c9a84c" }, // gold studio
  { p: 0.5, v: "#e0904a" }, // orange monolith
  { p: 0.66, v: "#4f8ae0" }, // blue lab
  { p: 1.0, v: "#5f8fe0" },
];

export const AMBIENT: NumberStop[] = [
  { p: 0.0, v: 0.16 },
  { p: 0.2, v: 0.34 },
  { p: 0.5, v: 0.16 }, // moody monolith
  { p: 0.72, v: 0.3 },
  { p: 1.0, v: 0.32 },
];

export const FOG_COLOR: ColorStop[] = [
  { p: 0.0, v: "#060608" },
  { p: 0.2, v: "#0b0a08" },
  { p: 0.5, v: "#0a0808" },
  { p: 0.72, v: "#050a16" },
  { p: 1.0, v: "#050a16" },
];

export const FOG_NEAR: NumberStop[] = [
  { p: 0.0, v: 14 },
  { p: 0.5, v: 7 },
  { p: 0.72, v: 10 },
  { p: 1.0, v: 12 },
];

export const FOG_FAR: NumberStop[] = [
  { p: 0.0, v: 42 },
  { p: 0.5, v: 30 },
  { p: 0.72, v: 40 },
  { p: 1.0, v: 44 },
];

function clamp(x: number, a: number, b: number) {
  return Math.min(Math.max(x, a), b);
}

/** 0..1 gating for a room's geometry; overlaps at the boundaries. */
export function roomPresence(room: Room, t: number, fade = 0.05): number {
  const [from, to] = room.present;
  const a = clamp((t - from) / fade, 0, 1);
  const b = clamp((to - t) / fade, 0, 1);
  const w = Math.min(a, b);
  return w * w * (3 - 2 * w);
}

/** 0..1 overlay text window inside a room's dwell. */
export function dwellOpacity(room: Room, t: number): number {
  const [from, to] = room.dwell;
  const fade = (to - from) * 0.28;
  const a = clamp((t - from) / fade, 0, 1);
  const b = clamp((to - t) / fade, 0, 1);
  return Math.min(a, b);
}

/** Active chapter for chrome label / audio (0 = intro blueprint). */
export function activeChapter(t: number): number {
  if (t < 0.06) return 0;
  if (t < 0.4) return 1;
  if (t < 0.63) return 2;
  return 3;
}

export function activeRoom(t: number): Room {
  const c = activeChapter(t);
  return ROOMS.find((r) => r.chapter === c) ?? STUDIO;
}
