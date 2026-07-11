"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "./scrollStore";
import { CHAPTERS } from "./chapters";

/**
 * Premium Siri/GQ-style conversation wave + journey scrubber.
 *
 * Multiple flowing strands rendered additively (so crossings bloom to a white
 * core) over a faint perspective grid, graded red→orange→white→blue. The strand
 * energy swells at the playhead (where the "conversation" is) and the portion up
 * to the scroll `progress` is vivid while the rest is a faint guide. Chapter
 * marks sit along the width. Swells harder while auto-playing.
 */

interface Strand {
  freqs: number[];
  amps: number[];
  speeds: number[];
  phase: number;
  slope: number; // diagonal tilt
  offset: number; // vertical offset
  width: number;
  hue: "warm" | "cool" | "core";
}

const STRANDS: Strand[] = [
  { freqs: [0.011, 0.027, 0.052], amps: [1, 0.45, 0.22], speeds: [1.3, 2.0, 3.1], phase: 0, slope: 0.10, offset: -3, width: 2.4, hue: "core" },
  { freqs: [0.009, 0.021, 0.041], amps: [1, 0.5, 0.25], speeds: [1.0, 1.7, 2.6], phase: 2.1, slope: -0.07, offset: 4, width: 1.6, hue: "warm" },
  { freqs: [0.013, 0.03, 0.06], amps: [0.9, 0.4, 0.2], speeds: [1.6, 2.4, 3.6], phase: 4.0, slope: 0.04, offset: 0, width: 1.6, hue: "cool" },
];

export default function SiriWave({ playing }: { playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const gradientFor = (s: Strand) => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      if (s.hue === "warm") {
        g.addColorStop(0.0, "#ff2d1a");
        g.addColorStop(0.3, "#ff7a1f");
        g.addColorStop(0.55, "#ffd9a0");
        g.addColorStop(0.8, "#6f86d8");
        g.addColorStop(1.0, "#2f5fd0");
      } else if (s.hue === "cool") {
        g.addColorStop(0.0, "#ff8a3a");
        g.addColorStop(0.4, "#c9b6e0");
        g.addColorStop(0.7, "#4f8ae0");
        g.addColorStop(1.0, "#2540c8");
      } else {
        g.addColorStop(0.0, "#ffb070");
        g.addColorStop(0.45, "#ffffff");
        g.addColorStop(0.7, "#cfe0ff");
        g.addColorStop(1.0, "#5f8ff0");
      }
      return g;
    };

    const drawGrid = (mid: number) => {
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(90,120,180,0.05)";
      const vp = w / 2;
      // receding verticals fanning from a vanishing point
      for (let i = -10; i <= 10; i++) {
        const x = vp + i * (w / 16);
        ctx.beginPath();
        ctx.moveTo(vp + i * 6, mid);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // horizontal depth lines
      for (let j = 1; j <= 4; j++) {
        const y = mid + (j * j) * (h - mid) / 20;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const yAt = (s: Strand, x: number, time: number, amp: number, mid: number, px: number) => {
      const dist = (x - px) / Math.max(1, w * 0.5);
      const env = 0.35 + Math.exp(-dist * dist * 6) * 1.15; // swell at playhead
      let y = mid + s.slope * (x - w / 2) + s.offset;
      for (let k = 0; k < s.freqs.length; k++) {
        y += s.amps[k] * amp * env * Math.sin(x * s.freqs[k] + time * s.speeds[k] + s.phase);
      }
      return y;
    };

    const strokeStrand = (
      s: Strand,
      time: number,
      amp: number,
      mid: number,
      px: number,
      from: number,
      to: number,
      alpha: number,
      glow: number
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(from, 0, to - from, h);
      ctx.clip();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = yAt(s, x, time, amp, mid, px);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = s.width;
      ctx.strokeStyle = gradientFor(s);
      ctx.lineCap = "round";
      ctx.shadowBlur = glow;
      ctx.shadowColor = s.hue === "warm" ? "#ff6a2a" : s.hue === "cool" ? "#3f7ad6" : "#ffffff";
      ctx.stroke();
      ctx.restore();
    };

    const start = performance.now();
    const loop = (now: number) => {
      const time = (now - start) / 1000;
      const progress = scrollStore.peek().progress;
      const mid = h * 0.5;
      const px = progress * w;
      const energy = (playingRef.current ? 11 : 7) + Math.sin(time * 0.9) * 2 + Math.sin(time * 2.3) * 1.2;

      ctx.clearRect(0, 0, w, h);
      drawGrid(mid);

      for (const s of STRANDS) {
        // faint guide beyond the playhead
        strokeStrand(s, time, energy, mid, px, px, w, 0.16, 5);
        // vivid filled portion up to the playhead
        strokeStrand(s, time, energy, mid, px, 0, px, 0.95, 16);
      }

      // playhead bloom
      ctx.globalCompositeOperation = "lighter";
      const bloom = ctx.createRadialGradient(px, mid, 0, px, mid, 46);
      bloom.addColorStop(0, "rgba(255,255,255,0.5)");
      bloom.addColorStop(0.4, "rgba(255,180,120,0.22)");
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(px - 46, mid - 46, 92, 92);

      // chapter marks
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < CHAPTERS.length; i++) {
        const cx = Math.min(Math.max((i / (CHAPTERS.length - 1)) * w, 4), w - 4);
        const reached = cx <= px + 2;
        ctx.beginPath();
        ctx.arc(cx, h - 6, reached ? 2.6 : 1.6, 0, Math.PI * 2);
        ctx.fillStyle = reached ? "rgba(255,210,150,0.95)" : "rgba(255,255,255,0.22)";
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-24 w-full" aria-hidden />;
}
