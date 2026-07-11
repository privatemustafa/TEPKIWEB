"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { sampleNumber, sampleColor } from "./interp";
import {
  KEY_INTENSITY,
  KEY_COLOR,
  RIM_COLOR,
  AMBIENT,
  FOG_COLOR,
  FOG_NEAR,
  FOG_FAR,
  activeRoom,
} from "./rooms";

/**
 * Global lighting + fog that blend CONTINUOUSLY as the camera travels the
 * corridor. The key/rim lights follow the active room's anchor so whatever
 * you're standing in front of is lit correctly.
 */
export default function Lights() {
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.SpotLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const fill = useRef<THREE.PointLight>(null);

  const { scene } = useThree();
  const fog = useMemo(() => new THREE.Fog("#060608", 12, 40), []);
  const cacheA = useMemo(() => new THREE.Color(), []);
  const cacheB = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    scene.fog = fog;
    const t = scrollStore.peek().heroProgress;
    const room = activeRoom(t);
    const [ax, , az] = room.anchor;

    if (key.current) {
      key.current.intensity = sampleNumber(KEY_INTENSITY, t);
      sampleColor(KEY_COLOR, t, key.current.color, cacheA, cacheB);
      key.current.position.set(ax + 4, 8, az + 6);
      key.current.target.position.set(ax, 1.5, az);
      key.current.target.updateMatrixWorld();
    }
    if (rim.current) {
      sampleColor(RIM_COLOR, t, rim.current.color, cacheA, cacheB);
      rim.current.position.set(ax - 6, 6, az - 5);
      rim.current.target.position.set(ax, 2, az);
      rim.current.target.updateMatrixWorld();
    }
    if (ambient.current) ambient.current.intensity = sampleNumber(AMBIENT, t);
    if (fill.current) fill.current.position.set(ax, 3, az + 3);

    sampleColor(FOG_COLOR, t, fog.color, cacheA, cacheB);
    fog.near = sampleNumber(FOG_NEAR, t);
    fog.far = sampleNumber(FOG_FAR, t);
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.16} />
      <hemisphereLight intensity={0.22} color="#9fb2d0" groundColor="#0a0a0a" />
      <directionalLight ref={key} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight ref={rim} angle={0.7} penumbra={0.9} intensity={180} distance={46} color="#c9a84c" />
      <pointLight ref={fill} intensity={5} color="#ffffff" distance={16} />
    </>
  );
}
