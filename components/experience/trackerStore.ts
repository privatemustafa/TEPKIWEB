/**
 * Screen-space position of the studio album, projected from 3D each frame by
 * <AlbumTracker> (inside the Canvas) and read by the DOM hotspot in HeroBeats so
 * the "Çıkış Tarihi" marker magnetically follows the album as the camera moves.
 */
export interface TrackerScreen {
  x: number;
  y: number;
  visible: boolean;
}

let state: TrackerScreen = { x: 0, y: 0, visible: false };

export const trackerStore = {
  set(next: TrackerScreen) {
    state = next;
  },
  peek(): TrackerScreen {
    return state;
  },
};
