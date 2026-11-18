// Krzywe ruchu: czyste funkcje, bez zegara. Wejście p ∈ [0, 1].

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Postęp odcinka [a, b] w ramach p, przycięty do [0, 1]. */
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

export const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
export const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4);
export const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;
/** Smootherstep (Perlin): zerowa prędkość i przyspieszenie na obu końcach — ruch kamery bez szarpnięć. */
export const smoother = (p: number) => {
  const x = clamp(p);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const easeOutBack = (p: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

/**
 * Sprężyna jako funkcja czasu (s): odpowiedź skokowa oscylatora tłumionego.
 * zeta < 1 daje lekkie przestrzelenie, zeta = 1 krytyczne tłumienie.
 */
export function spring(tSec: number, omega = 14, zeta = 0.72): number {
  if (tSec <= 0) return 0;
  if (zeta >= 1) return 1 - (1 + omega * tSec) * Math.exp(-omega * tSec);
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const e = Math.exp(-zeta * omega * tSec);
  return 1 - e * (Math.cos(wd * tSec) + ((zeta * omega) / wd) * Math.sin(wd * tSec));
}

/** Wygaszane drżenie (np. przy blokadzie). Częstotliwość ≤ 2 Hz w odbiorze, amplituda maleje. */
export const decayShake = (tSec: number, amp = 1) =>
  tSec <= 0 ? 0 : amp * Math.sin(tSec * Math.PI * 2 * 3) * Math.exp(-tSec * 6);

/** Krzywa Béziera jak w CSS cubic-bezier(x1, y1, x2, y2), liczona deterministycznie (Newton + bisekcja). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let t = p;
    for (let i = 0; i < 6; i++) {
      const err = sx(t) - p;
      const d = dx(t);
      if (Math.abs(err) < 1e-6) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0, hi = 1;
    t = p;
    for (let i = 0; i < 30; i++) {
      const v = sx(t);
      if (Math.abs(v - p) < 1e-6) break;
      if (v < p) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}

/** Wspólna krzywa ruchu aplikacji i sceny (jak --ease-out w CSS): szybki start, długie wyhamowanie. */
export const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);
/** Ruch „z miejsca na miejsce” (jak --ease-move). */
export const easeMove = cubicBezier(0.4, 0, 0.2, 1);
