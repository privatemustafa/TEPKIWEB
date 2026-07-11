"use client";

import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/**
 * Cinematic post: bloom for the rim/screens, a deep vignette to frame each room
 * and a faint film grain for a mastered, filmic feel.
 */
export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.6}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.22} darkness={0.92} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.35} />
    </EffectComposer>
  );
}
