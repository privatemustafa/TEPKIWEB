"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "./scrollStore";
import { roomPresence, STUDIO } from "./rooms";

/**
 * Curved studio video wall (GQ "video wall" beat). Plays the recording of the
 * studio session, gaussian-blurred with a vignette, behind a thin bezel. If
 * `/recording.mp4` is missing it falls back to a procedural blurred-gradient +
 * film-grain "footage" texture, so real footage can be dropped in later.
 *
 * Audio comes from the <video> element and is unmuted only once the user
 * enables sound.
 */

const RADIUS = 20;
const HEIGHT = 8;
const ARC = 1.05; // radians (~60°) — bounded screen with dark sides

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const blurFragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uTexel;
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // Heavy frosted-glass diffusion: wide multi-tap blur with jittered offsets.
  vec3 frostedSample(vec2 uv) {
    vec3 sum = vec3(0.0);
    float total = 0.0;
    for (int x = -4; x <= 4; x++) {
      for (int y = -4; y <= 4; y++) {
        float fx = float(x);
        float fy = float(y);
        float w = 1.0 - (abs(fx) + abs(fy)) * 0.08;
        if (w <= 0.0) continue;
        // per-tap jitter to break up banding (frosted grain)
        vec2 j = (vec2(hash(uv * 91.7 + vec2(fx, fy)), hash(uv * 47.3 - vec2(fy, fx))) - 0.5) * 1.5;
        vec2 off = (vec2(fx, fy) + j) * uTexel * 7.0;
        sum += texture2D(uTex, uv + off).rgb * w;
        total += w;
      }
    }
    return sum / total;
  }

  void main() {
    vec3 col = frostedSample(vUv);

    // milky frosted veil — lifts blacks, softens contrast like etched glass
    vec3 milk = vec3(0.72, 0.77, 0.86);
    col = mix(col, (col + milk) * 0.5, 0.34);
    col = pow(col, vec3(0.92)); // gentle lift

    // slight desaturation
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(l), col, 0.82);

    // cool grade
    col = mix(col, col * vec3(0.86, 0.93, 1.06), 0.45);

    // fine frost grain
    col += (hash(vUv * 1024.0 + uTime) - 0.5) * 0.02;

    // soft vignette so it reads as a framed, glowing panel
    float vig = smoothstep(1.05, 0.3, distance(vUv, vec2(0.5)) * 1.4);
    col *= mix(0.4, 1.06, vig);

    gl_FragColor = vec4(max(col, 0.0), uOpacity);
  }
`;

const fallbackFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }

  void main() {
    vec2 uv = vUv;
    // two soft blurred "figures" sitting and talking under a warm key light
    float t = uTime * 0.25;
    vec2 p1 = vec2(0.40 + sin(t)*0.012, 0.50);
    vec2 p2 = vec2(0.60 + sin(t*1.1+1.0)*0.012, 0.51);
    float f1 = smoothstep(0.16, 0.0, distance(uv, p1));
    float f2 = smoothstep(0.15, 0.0, distance(uv, p2));
    // warm sunset-graded studio footage (bright enough to read as a big screen)
    vec3 sky = mix(vec3(0.16, 0.20, 0.30), vec3(0.55, 0.34, 0.20), smoothstep(0.35, 0.85, uv.y));
    vec3 glow = mix(vec3(0.95, 0.62, 0.34), sky, smoothstep(0.0, 0.5, uv.y));
    vec3 col = glow;
    // warm key-light pool over the two figures
    float pool = smoothstep(0.5, 0.0, distance(uv, vec2(0.5, 0.5)));
    col += vec3(0.25, 0.16, 0.09) * pool;
    col = mix(col, vec3(0.14, 0.11, 0.10), (f1 + f2) * 0.6);
    // soft moving light blobs (blurred bokeh)
    col += vec3(0.10, 0.07, 0.045) * noise(uv * 4.0 + t);
    // film grain
    col += (hash(uv * 800.0 + uTime) - 0.5) * 0.04;
    // gentle cinematic vignette so it reads as a framed screen
    float vig = smoothstep(1.05, 0.30, distance(uv, vec2(0.5)) * 1.4);
    col *= mix(0.35, 1.0, vig);
    gl_FragColor = vec4(max(col, 0.0), uOpacity);
  }
`;

export default function VideoWall({
  audioOn,
  lowPerf,
}: {
  audioOn: boolean;
  lowPerf: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const blurMat = useRef<THREE.ShaderMaterial>(null);
  const fallbackMat = useRef<THREE.ShaderMaterial>(null);
  const bezelMat = useRef<THREE.MeshBasicMaterial>(null);
  // default to the bright procedural fallback; only switch to real footage once
  // /recording.mp4 is genuinely playable (placeholder 404s → stays on fallback)
  const [useFallback, setUseFallback] = useState(true);

  const video = useMemo(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("video");
    el.src = "/recording.mp4";
    el.loop = true;
    el.muted = true;
    el.playsInline = true;
    el.crossOrigin = "anonymous";
    el.preload = "auto";
    return el;
  }, []);

  const videoTexture = useMemo(() => {
    if (!video) return null;
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [video]);

  useEffect(() => {
    if (!video) return;
    const onError = () => setUseFallback(true);
    const onCanPlay = () => {
      if (video.readyState >= 3 && video.videoWidth > 0) {
        setUseFallback(false);
        video.play().catch(() => {});
      }
    };
    video.addEventListener("error", onError);
    video.addEventListener("canplaythrough", onCanPlay);
    video.load();
    return () => {
      video.removeEventListener("error", onError);
      video.removeEventListener("canplaythrough", onCanPlay);
      video.pause();
    };
  }, [video]);

  // WebAudio reverb graph so the studio footage sounds atmospheric / echoey
  const audioGraph = useRef<{
    ctx: AudioContext;
    dry: GainNode;
    wet: GainNode;
  } | null>(null);

  const buildReverb = useMemo(
    () => () => {
      if (audioGraph.current || !video) return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      let src: MediaElementAudioSourceNode;
      const ctx = new AudioCtx();
      try {
        src = ctx.createMediaElementSource(video);
      } catch {
        ctx.close().catch(() => {});
        return;
      }

      // procedural impulse response (decaying noise) for a hall-like reverb
      const seconds = 2.6;
      const len = Math.floor(ctx.sampleRate * seconds);
      const ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = ir.getChannelData(ch);
        for (let i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
        }
      }
      const convolver = ctx.createConvolver();
      convolver.buffer = ir;

      const dry = ctx.createGain();
      const wet = ctx.createGain();
      dry.gain.value = 0.55;
      wet.gain.value = 0.5; // generous echo tail
      const preWet = ctx.createGain();
      preWet.gain.value = 1;

      src.connect(dry);
      src.connect(preWet);
      preWet.connect(convolver);
      convolver.connect(wet);
      dry.connect(ctx.destination);
      wet.connect(ctx.destination);

      audioGraph.current = { ctx, dry, wet };
    },
    [video]
  );

  useEffect(() => {
    if (!video) return;
    if (audioOn) {
      buildReverb();
      audioGraph.current?.ctx.resume().catch(() => {});
      // when routed through WebAudio the element must stay unmuted; the graph
      // controls the level. (No source graph yet → element output is used.)
      video.muted = false;
      video.volume = 1;
      video.play().catch(() => {});
    } else {
      video.muted = true;
    }
  }, [audioOn, video, buildReverb]);

  useEffect(() => {
    return () => {
      audioGraph.current?.ctx.close().catch(() => {});
      audioGraph.current = null;
    };
  }, []);

  const blurUniforms = useMemo(
    () => ({
      uTex: { value: videoTexture },
      uTexel: { value: new THREE.Vector2(1 / 1280, 1 / 720) },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    }),
    [videoTexture]
  );
  const fallbackUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }),
    []
  );

  useFrame((state) => {
    // the studio's own back screen — present with the studio room
    const opacity = roomPresence(STUDIO, scrollStore.peek().heroProgress);
    if (groupRef.current) groupRef.current.visible = opacity > 0.001;
    if (blurMat.current) {
      blurMat.current.uniforms.uOpacity.value = opacity;
      blurMat.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (fallbackMat.current) {
      fallbackMat.current.uniforms.uOpacity.value = opacity;
      fallbackMat.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (bezelMat.current) bezelMat.current.opacity = opacity;
  });

  const showFallback = useFallback || lowPerf || !videoTexture;

  return (
    <group ref={groupRef} position={[0, 3.5, 12]} visible={false}>
      {/* dark bezel frame, slightly larger arc behind the screen */}
      <mesh position={[0, 0, 0]} renderOrder={-1}>
        <cylinderGeometry
          args={[RADIUS + 0.4, RADIUS + 0.4, HEIGHT + 1.1, 64, 1, true, Math.PI - (ARC + 0.12) / 2, ARC + 0.12]}
        />
        <meshBasicMaterial
          ref={bezelMat}
          color="#070709"
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* the screen */}
      <mesh>
        <cylinderGeometry
          args={[RADIUS, RADIUS, HEIGHT, 64, 1, true, Math.PI - ARC / 2, ARC]}
        />
        {showFallback ? (
          <shaderMaterial
            ref={fallbackMat}
            uniforms={fallbackUniforms}
            vertexShader={vertexShader}
            fragmentShader={fallbackFragment}
            side={THREE.DoubleSide}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        ) : (
          <shaderMaterial
            ref={blurMat}
            uniforms={blurUniforms}
            vertexShader={vertexShader}
            fragmentShader={blurFragment}
            side={THREE.DoubleSide}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        )}
      </mesh>
    </group>
  );
}
