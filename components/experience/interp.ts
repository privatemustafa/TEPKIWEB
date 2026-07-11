import * as THREE from "three";

export interface NumberStop {
  p: number;
  v: number;
}

/** Piecewise-linear interpolation of a scalar across sorted stops by t (0..1). */
export function sampleNumber(stops: NumberStop[], t: number): number {
  if (t <= stops[0].p) return stops[0].v;
  const last = stops[stops.length - 1];
  if (t >= last.p) return last.v;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.p && t <= b.p) {
      const k = (t - a.p) / (b.p - a.p || 1);
      return THREE.MathUtils.lerp(a.v, b.v, k);
    }
  }
  return last.v;
}

export interface Vec3Stop {
  p: number;
  v: [number, number, number];
}

/** Interpolate a vec3 across sorted stops by t, writing into `out`. */
export function sampleVec3(
  stops: Vec3Stop[],
  t: number,
  out: THREE.Vector3
): THREE.Vector3 {
  if (t <= stops[0].p) return out.set(...stops[0].v);
  const last = stops[stops.length - 1];
  if (t >= last.p) return out.set(...last.v);
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.p && t <= b.p) {
      const k = (t - a.p) / (b.p - a.p || 1);
      return out.set(
        THREE.MathUtils.lerp(a.v[0], b.v[0], k),
        THREE.MathUtils.lerp(a.v[1], b.v[1], k),
        THREE.MathUtils.lerp(a.v[2], b.v[2], k)
      );
    }
  }
  return out.set(...last.v);
}

export interface ColorStop {
  p: number;
  v: string;
}

/** Interpolate a color across sorted stops by t, writing into `out`. */
export function sampleColor(
  stops: ColorStop[],
  t: number,
  out: THREE.Color,
  cacheA: THREE.Color,
  cacheB: THREE.Color
): THREE.Color {
  if (t <= stops[0].p) return out.set(stops[0].v);
  const last = stops[stops.length - 1];
  if (t >= last.p) return out.set(last.v);
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.p && t <= b.p) {
      const k = (t - a.p) / (b.p - a.p || 1);
      cacheA.set(a.v);
      cacheB.set(b.v);
      return out.copy(cacheA).lerp(cacheB, k);
    }
  }
  return out.set(last.v);
}
