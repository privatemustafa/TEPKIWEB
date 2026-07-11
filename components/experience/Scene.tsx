"use client";

import Backdrop from "./Backdrop";
import Lights from "./Lights";
import Stage from "./Stage";
import Station from "./Station";
import Monolith from "./Monolith";
import Atmosphere from "./Atmosphere";
import StudioIntro from "./StudioIntro";
import VideoWall from "./VideoWall";
import FloatingScreens from "./FloatingScreens";
import RoomWall from "./RoomWall";
import Partitions from "./Partitions";
import AlbumTracker from "./AlbumTracker";
import Beetles from "./Beetles";
import TableProps from "./TableProps";
import Rig from "./Rig";
import Effects from "./Effects";
import { STUDIO, MONOLITH, LAB } from "./rooms";
import type { Track } from "@/lib/types";
import type { ExperienceAudio } from "./useExperienceAudio";

/**
 * The spatial "Extraordinary Lab": three rooms built as adjacent bays along a
 * -Z corridor, separated by dark partitions with offset openings. One camera
 * path travels continuously through them (see Rig), so you physically leave a
 * room and enter the next. Each room owns its wall + objects at its anchor:
 *   1. STUDIO   (z 0)   — curved video wall + glossy mirror table (track 1)
 *   2. MONOLITH (z -30) — screenless void, standing slab + god-rays (track 2)
 *   3. LAB      (z -55) — blue gradient wall + big screen + table (track 3)
 */
export default function Scene({
  lowPerf,
  audioOn,
  audio,
  firstTrack,
  started,
}: {
  lowPerf: boolean;
  audioOn: boolean;
  audio: ExperienceAudio;
  firstTrack: Track | null;
  started: boolean;
}) {
  return (
    <>
      <Backdrop />
      <Lights />
      <StudioIntro started={started} />

      <Stage lowPerf={lowPerf} />
      <Atmosphere lowPerf={lowPerf} />
      <Partitions />

      {/* per-room curved walls */}
      <RoomWall room={MONOLITH} />
      <RoomWall room={LAB} />

      {/* ROOM 1 — studio: big curved screen + mirror table */}
      <VideoWall audioOn={audioOn} lowPerf={lowPerf} />
      <Station room={STUDIO} lowPerf={lowPerf} withVinyl track={firstTrack} audio={audio} />
      <AlbumTracker />
      <TableProps />
      <Beetles />

      {/* ROOM 2 — monolith (screenless) */}
      <Monolith />

      {/* ROOM 3 — lab: big screen returns + floating panels + mirror table */}
      <FloatingScreens />
      <Station room={LAB} lowPerf={lowPerf} withVinyl={false} track={null} audio={audio} />

      <Rig lowPerf={lowPerf} />
      {!lowPerf && <Effects />}
    </>
  );
}
