import type { Actor } from '@content/types';
import { seg, smoother } from '../engine/easing';
import { openingActor, stepParticipants, type Cursor, type Timeline } from '../engine/timeline';
import { DEVICE_META } from './devices/Device';
import { fitAspect, iso, lerpBox, lerpCam, type Box } from './iso';

/** Prostokąt obejmujący urządzenie, etykietę i żetony. */
function actorBox(a: Actor): Box {
  const g = iso(a.at[0], a.at[1]);
  const top = DEVICE_META[a.kind].top * 100;
  return { x: g.x - 110, y: g.y - top - 120, w: 220, h: top + 120 + 110 };
}

function union(boxes: Box[]): Box {
  const x0 = Math.min(...boxes.map((b) => b.x));
  const y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w));
  const y1 = Math.max(...boxes.map((b) => b.y + b.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function pad(b: Box, k: number): Box {
  return { x: b.x - b.w * k, y: b.y - b.h * k, w: b.w * (1 + 2 * k), h: b.h * (1 + 2 * k) };
}

/** Kadr o szerokości co najmniej minW, wyśrodkowany na b. */
function atLeast(b: Box, minW: number, aspect: number): Box {
  if (b.w >= minW) return b;
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  return fitAspect({ x: cx - minW / 2, y: cy - minW / aspect / 2, w: minW, h: minW / aspect }, aspect);
}

export function overview(actors: Actor[], aspect: number): Box {
  return fitAspect(pad(union(actors.map(actorBox)), 0.03), aspect);
}

/** Ujęcie otwierające: zbliżenie na pierwsze urządzenie (około trzykrotne). */
export function openingShot(tl: Timeline, aspect: number): Box {
  const all = overview(tl.actors, aspect);
  return atLeast(fitAspect(pad(actorBox(openingActor(tl)), 0.12), aspect), all.w * 0.34, aspect);
}

function stepTarget(tl: Timeline, i: number, aspect: number, all: Box): Box {
  if (i < 0) return all;
  const ids = new Set(stepParticipants(tl.steps[i].step));
  const focus = tl.actors.filter((a) => ids.has(a.id));
  if (focus.length === 0) return all;
  const f = fitAspect(pad(union(focus.map(actorBox)), 0.18), aspect);
  // Kamera zbliża się, ale zostawia kontekst: nie mniej niż 72% szerokości planu ogólnego.
  return lerpBox(all, atLeast(f, all.w * 0.72, aspect), 0.6);
}

/** Odjazd z ujęcia otwierającego: trzymamy zbliżenie, potem płynnie odsłaniamy cały plan. */
export const OPENING_HOLD = 0.7;
export const OPENING_END = 3.0;
/** Udział kroku, w którym kamera przejeżdża do nowego kadru. */
const MOVE_SHARE = 0.5;
/** Powrót do planu ogólnego po ostatnim kroku (s). */
const OUTRO_S = 2.0;

/**
 * Kadr kamery w chwili cur — czysta funkcja czasu (ta sama w aplikacji, pokazie i wideo).
 * Każdy przejazd zaczyna się i kończy z zerową prędkością (smootherstep), więc na granicach
 * kroków nie ma szarpnięć; zbliżenie zmienia się logarytmicznie (stałe odczucie tempa).
 */
export function cameraAt(tl: Timeline, cur: Cursor, aspect: number, reduced = false): Box {
  const all = overview(tl.actors, aspect);
  if (cur.index < 0) {
    if (reduced) return all;
    return lerpCam(openingShot(tl, aspect), all, smoother(seg(cur.t, OPENING_HOLD, OPENING_END)));
  }
  const target = stepTarget(tl, cur.index, aspect, all);
  if (cur.t > tl.stepsEnd) {
    return reduced ? all : lerpCam(target, all, smoother(seg(cur.t - tl.stepsEnd, 0, OUTRO_S)));
  }
  const prev = stepTarget(tl, cur.index - 1, aspect, all);
  return lerpCam(prev, target, reduced ? 1 : smoother(seg(cur.p, 0, MOVE_SHARE)));
}
