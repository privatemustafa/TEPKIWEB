"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Ambient ses kontrolü. Asset dosyası gerektirmemesi için Web Audio API ile
 * canlı, düşük seviye bir "underscore" drone üretir (albüm parçaları geldiğinde
 * buradaki oscillator'lar bir <audio> kaynağıyla değiştirilebilir).
 * Varsayılan: kapalı (kullanıcı etkileşimi olmadan ses çalınmaz).
 */
export default function AudioToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);

  const start = useCallback(() => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Hafif minör pad — siyah/beyaz şehir estetiğine uygun loş bir doku
    const freqs = [55, 82.4, 110, 164.8];
    const oscs = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.12 / freqs.length;
      // hafif chorus için detune
      osc.detune.value = (i - 1.5) * 6;
      osc.connect(g);
      g.connect(master);
      osc.start();
      return osc;
    });

    ctxRef.current = ctx;
    masterRef.current = master;
    nodesRef.current = oscs;

    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1.5);
  }, []);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    setTimeout(() => {
      nodesRef.current.forEach((o) => {
        try {
          o.stop();
        } catch {}
      });
      nodesRef.current = [];
      ctx.close();
      ctxRef.current = null;
      masterRef.current = null;
    }, 700);
  }, []);

  const toggle = () => {
    if (on) stop();
    else start();
    setOn((v) => !v);
  };

  useEffect(() => () => stop(), [stop]);

  return (
    <button
      onClick={toggle}
      aria-label={on ? "Sesi kapat" : "Sesi aç"}
      className="fixed right-6 top-4 z-[70] flex items-center gap-2 px-1 py-2 text-[11px] uppercase tracking-ultra text-chalk transition hover:text-gold"
    >
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[2px] bg-current transition-all duration-300 ${
              on ? "exp-eq" : ""
            }`}
            style={{
              height: on ? `${6 + ((i * 5) % 14)}px` : "4px",
              animationDelay: `${i * 120}ms`,
            }}
          />
        ))}
      </span>
      Sound
    </button>
  );
}
