// Projekcja izometryczna 30° i geometria tras. Jednostka siatki = CELL px świata.

export const CELL = 100;
const C30 = Math.cos(Math.PI / 6); // 0.866
const S30 = 0.5;

export interface P {
  x: number;
  y: number;
}

/** Siatka (x, y, z) → punkt ekranu świata. z w jednostkach siatki (w górę). */
export const iso = (gx: number, gy: number, gz = 0): P => ({
  x: (gx - gy) * C30 * CELL,
  y: (gx + gy) * S30 * CELL - gz * CELL,
});

export const pts = (list: P[]) => list.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

/** Macierze SVG do pisania/rysowania na płaszczyznach izometrycznych (jednostka lokalna = 1 px świata). */
export const PLANE = {
  /** Płaszczyzna x–z (ściana od frontu, widoczna z lewej-dołu). */
  xz: (o: P) => `matrix(${C30} ${S30} 0 1 ${o.x} ${o.y})`,
  /** Płaszczyzna y–z (ściana boczna, widoczna z prawej-dołu). */
  yz: (o: P) => `matrix(${-C30} ${S30} 0 1 ${o.x} ${o.y})`,
  /** Płaszczyzna x–y (blat). */
  xy: (o: P) => `matrix(${C30} ${S30} ${-C30} ${S30} ${o.x} ${o.y})`,
};

export type Grid = [number, number];

/** Trasa łamana wzdłuż osi siatki: przez róg dalszy od środka ciężkości aktorów. */
export function route(a: Grid, b: Grid, centroid: Grid): Grid[] {
  if (a[0] === b[0] || a[1] === b[1]) return [a, b];
  const c1: Grid = [b[0], a[1]];
  const c2: Grid = [a[0], b[1]];
  const d = (c: Grid) => (c[0] - centroid[0]) ** 2 + (c[1] - centroid[1]) ** 2;
  return [a, d(c1) >= d(c2) ? c1 : c2, b];
}

export function polyLength(p: P[]): number {
  let L = 0;
  for (let i = 1; i < p.length; i++) L += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
  return L;
}

/** Punkt na łamanej w ułamku długości f ∈ [0, 1]. */
export function pointAt(p: P[], f: number): P {
  const L = polyLength(p);
  let target = Math.max(0, Math.min(1, f)) * L;
  for (let i = 1; i < p.length; i++) {
    const s = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
    if (target <= s || i === p.length - 1) {
      const k = s === 0 ? 0 : Math.min(1, target / s);
      return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * k, y: p[i - 1].y + (p[i].y - p[i - 1].y) * k };
    }
    target -= s;
  }
  return p[p.length - 1];
}

export const pathD = (p: P[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(2)} ${q.y.toFixed(2)}`).join(' ');

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Przejście kadru ze stałym odczuciem zbliżenia: środek liniowo, szerokość logarytmicznie
 * (przy liniowej szerokości odjazd wydaje się na początku szybszy niż przy końcu).
 */
export function lerpCam(a: Box, b: Box, k: number): Box {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const cx = a.x + a.w / 2 + (b.x + b.w / 2 - a.x - a.w / 2) * k;
  const cy = a.y + a.h / 2 + (b.y + b.h / 2 - a.y - a.h / 2) * k;
  const w = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * k);
  const h = Math.exp(Math.log(a.h) + (Math.log(b.h) - Math.log(a.h)) * k);
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

export const lerpBox = (a: Box, b: Box, k: number): Box => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
  w: a.w + (b.w - a.w) * k,
  h: a.h + (b.h - a.h) * k,
});

/** Dopasowanie prostokąta do proporcji ekranu (rozszerza krótszy bok). */
export function fitAspect(b: Box, aspect: number): Box {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  let w = b.w;
  let h = b.h;
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
