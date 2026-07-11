/**
 * Tiny global for the phase-1 lock: once the studio beat is finished the whole
 * experience "locks" (frosted screen + ÇOK YAKINDA). Experience sets it; the
 * VideoWall reads it to stop its footage/audio.
 */
let locked = false;
const subs = new Set<() => void>();

export const phaseStore = {
  setLocked(v: boolean) {
    if (locked === v) return;
    locked = v;
    subs.forEach((f) => f());
  },
  get() {
    return locked;
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => subs.delete(f);
  },
};
