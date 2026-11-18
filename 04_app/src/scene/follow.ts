import { useEffect, useReducer, useRef } from 'react';
import type { Box } from './iso';

/**
 * Kamera „na wózku”: w aplikacji kadr nie skacze do celu, tylko dojeżdża do niego sprężyną
 * krytycznie tłumioną (bez przestrzelenia). Cel to czysta funkcja czasu (camera.ts), więc przy
 * zwykłym odtwarzaniu sprężyna tylko lekko wygładza ruch; przy skoku na inny krok, przewijaniu
 * czy zmianie rozmiaru kamera płynie zamiast ciąć. W wideo (Remotion) wyłączone — tam klatka
 * musi zależeć wyłącznie od czasu.
 */
const OMEGA = 12;

interface State {
  cx: number;
  cy: number;
  lw: number;
  vx: number;
  vy: number;
  vw: number;
  last: number;
  key: unknown;
}

/** Dokładne rozwiązanie sprężyny krytycznie tłumionej po czasie dt. */
function spring1(x: number, v: number, target: number, dt: number): [number, number] {
  const d = x - target;
  const e = Math.exp(-OMEGA * dt);
  const c = v + OMEGA * d;
  return [target + (d + c * dt) * e, (v - OMEGA * c * dt) * e];
}

export function useFollowCamera(target: Box, enabled: boolean, resetKey: unknown): Box {
  const st = useRef<State | null>(null);
  const [, tick] = useReducer((n: number) => n + 1, 0);
  const now = performance.now();
  const tx = target.x + target.w / 2;
  const ty = target.y + target.h / 2;
  const tw = Math.log(target.w);
  const valid = Number.isFinite(tx) && Number.isFinite(ty) && Number.isFinite(tw);

  let s = st.current;
  if (!enabled || !valid || !s || s.key !== resetKey) {
    s = st.current = { cx: tx, cy: ty, lw: tw, vx: 0, vy: 0, vw: 0, last: now, key: resetKey };
  } else {
    // Po dłuższej przerwie (karta w tle) nie nadrabiamy fizyki skokiem.
    const dt = Math.min(0.05, Math.max(0, (now - s.last) / 1000));
    s.last = now;
    if (dt > 0) {
      [s.cx, s.vx] = spring1(s.cx, s.vx, tx, dt);
      [s.cy, s.vy] = spring1(s.cy, s.vy, ty, dt);
      [s.lw, s.vw] = spring1(s.lw, s.vw, tw, dt);
    }
  }

  const eps = target.w * 0.0015;
  const settled =
    !valid ||
    Math.abs(s.cx - tx) < eps && Math.abs(s.cy - ty) < eps && Math.abs(s.lw - tw) < 0.0008 &&
    Math.abs(s.vx) < eps * 4 && Math.abs(s.vy) < eps * 4 && Math.abs(s.vw) < 0.004;
  if (settled) {
    s.cx = tx;
    s.cy = ty;
    s.lw = tw;
    s.vx = s.vy = s.vw = 0;
  }

  // Gdy zegar stoi (pauza), sami napędzamy klatki — tylko do chwili, aż kamera dojedzie.
  useEffect(() => {
    if (!enabled || settled) return;
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  });

  const w = Math.exp(s.lw);
  const h = (w * target.h) / target.w;
  return { x: s.cx - w / 2, y: s.cy - h / 2, w, h };
}
