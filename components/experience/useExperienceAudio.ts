"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Central audio controller for the experience.
 *
 * - `enable()` must be called from a user gesture ("click to enable sound").
 *   It creates the AudioContext and starts a low ambient pad.
 * - `mute()/unmute()` ramp the master gain (chrome SOUND toggle).
 * - `playTrack(url)` plays a track preview (if a URL exists) and ducks the
 *   ambient pad; `stopTrack()` restores it. With no URL it falls back to a soft
 *   ambient swell so hovering the vinyl always gives audible feedback.
 *
 * Sound stays OFF until `enable()` is called.
 */
export interface ExperienceAudio {
  enable: () => void;
  mute: () => void;
  unmute: () => void;
  playTrack: (url: string | null) => void;
  stopTrack: () => void;
  isEnabled: () => boolean;
}

const AMBIENT_LEVEL = 0.16;
const DUCKED_LEVEL = 0.05;

export function useExperienceAudio(): ExperienceAudio {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);
  const enabledRef = useRef(false);
  const mutedRef = useRef(false);
  const trackRef = useRef<HTMLAudioElement | null>(null);
  const swellRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  const targetLevel = useCallback(
    () => (mutedRef.current ? 0 : AMBIENT_LEVEL),
    []
  );

  const enable = useCallback(() => {
    if (enabledRef.current) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // dim minor pad — the "lab" underscore
    const freqs = [55, 82.4, 110, 164.8];
    const oscs = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.12 / freqs.length;
      osc.detune.value = (i - 1.5) * 6;
      osc.connect(g);
      g.connect(master);
      osc.start();
      return osc;
    });

    ctxRef.current = ctx;
    masterRef.current = master;
    oscsRef.current = oscs;
    enabledRef.current = true;
    mutedRef.current = false;
    master.gain.linearRampToValueAtTime(AMBIENT_LEVEL, ctx.currentTime + 1.6);
  }, []);

  const mute = useCallback(() => {
    mutedRef.current = true;
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    }
    if (trackRef.current) trackRef.current.muted = true;
  }, []);

  const unmute = useCallback(() => {
    if (!enabledRef.current) {
      enable();
      return;
    }
    mutedRef.current = false;
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(AMBIENT_LEVEL, ctx.currentTime + 0.6);
    }
    if (trackRef.current) trackRef.current.muted = false;
  }, [enable]);

  const duck = useCallback((level: number) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || mutedRef.current) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(level, ctx.currentTime + 0.4);
  }, []);

  const softSwell = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || mutedRef.current) return;
    if (swellRef.current) return;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 220;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.6);
    swellRef.current = { osc, gain };
  }, []);

  const stopSwell = useCallback(() => {
    const ctx = ctxRef.current;
    const s = swellRef.current;
    if (!ctx || !s) return;
    s.gain.gain.cancelScheduledValues(ctx.currentTime);
    s.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    const osc = s.osc;
    setTimeout(() => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    }, 500);
    swellRef.current = null;
  }, []);

  const playTrack = useCallback(
    (url: string | null) => {
      if (!enabledRef.current) return;
      if (url) {
        let el = trackRef.current;
        if (!el) {
          el = new Audio();
          el.loop = false;
          trackRef.current = el;
        }
        el.src = url;
        el.muted = mutedRef.current;
        el.volume = 0.7;
        el.currentTime = 0;
        el.play().catch(() => {});
        duck(DUCKED_LEVEL);
      } else {
        softSwell();
      }
    },
    [duck, softSwell]
  );

  const stopTrack = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.pause();
    }
    stopSwell();
    duck(targetLevel());
  }, [duck, stopSwell, targetLevel]);

  useEffect(() => {
    return () => {
      try {
        oscsRef.current.forEach((o) => o.stop());
      } catch {
        /* noop */
      }
      trackRef.current?.pause();
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  return { enable, mute, unmute, playTrack, stopTrack, isEnabled: () => enabledRef.current };
}
