/**
 * Tiny framework-agnostic external store that bridges the smooth-scroll engine
 * (Lenis) with both the React UI chrome and the imperative R3F render loop.
 *
 * - `peek()` returns the live, mutable values for zero-allocation reads inside
 *   `useFrame` (the 3D loop never triggers React re-renders).
 * - `useScrollSnapshot()` subscribes React components (chrome / progress) and
 *   only re-renders when a value meaningfully changes.
 */

export interface ScrollData {
  /** Overall page scroll progress, 0..1. */
  progress: number;
  /** Progress through the hero/3D chapters portion only, 0..1. */
  heroProgress: number;
  /** Active chapter index. */
  chapter: number;
  /** Total chapter count. */
  chapterCount: number;
}

const data: ScrollData = {
  progress: 0,
  heroProgress: 0,
  chapter: 0,
  chapterCount: 8,
};

let snapshot: ScrollData = { ...data };
const listeners = new Set<() => void>();

function emit() {
  snapshot = { ...data };
  listeners.forEach((fn) => fn());
}

export const scrollStore = {
  /** Live, mutable values for the render loop. Do not mutate from the outside. */
  peek(): Readonly<ScrollData> {
    return data;
  },
  setChapterCount(count: number) {
    if (data.chapterCount !== count) {
      data.chapterCount = count;
      emit();
    }
  },
  update(progress: number, heroProgress: number, chapter: number) {
    const progressChanged = Math.abs(progress - data.progress) > 0.0005;
    const heroChanged = Math.abs(heroProgress - data.heroProgress) > 0.0005;
    const chapterChanged = chapter !== data.chapter;
    if (!progressChanged && !heroChanged && !chapterChanged) return;
    data.progress = progress;
    data.heroProgress = heroProgress;
    data.chapter = chapter;
    emit();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  getSnapshot(): ScrollData {
    return snapshot;
  },
};
