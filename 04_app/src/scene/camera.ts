import type { Actor } from '@content/types';
import { easeOutExpo, seg } from '../engine/easing';
import { stepParticipants, type Cursor, type Timeline } from '../engine/timeline';
import { DEVICE_META } from './devices/Device';
import { fitAspect, iso, lerpBox, type Box } from './iso';

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

export function overview(actors: Actor[], aspect: number): Box {
  return fitAspect(pad(union(actors.map(actorBox)), 0.03), aspect);
}

function stepTarget(tl: Timeline, i: number, aspect: number, all: Box): Box {
  if (i < 0) return all;
  const ids = new Set(stepParticipants(tl.steps[i].step));
  const focus = tl.actors.filter((a) => ids.has(a.id));
  if (focus.length === 0) return all;
  const f = fitAspect(pad(union(focus.map(actorBox)), 0.18), aspect);
  // Kamera zbliża się, ale zostawia kontekst: nie mniej niż 72% szerokości planu ogólnego.
  const minW = all.w * 0.72;
  const z = f.w < minW ? fitAspect({ x: f.x + f.w / 2 - minW / 2, y: f.y + f.h / 2 - minW / aspect / 2, w: minW, h: minW / aspect }, aspect) : f;
  return lerpBox(all, z, 0.6);
}

/** Kadr kamery w chwili cur. Dojazd w pierwszych 30% kroku; po ostatnim kroku powrót do planu ogólnego. */
export function cameraAt(tl: Timeline, cur: Cursor, aspect: number, reduced = false): Box {
  const all = overview(tl.actors, aspect);
  if (cur.index < 0) return all;
  const target = stepTarget(tl, cur.index, aspect, all);
  if (cur.t > tl.stepsEnd) {
    const k = easeOutExpo(seg(cur.t - tl.stepsEnd, 0, 1.4));
    return lerpBox(target, all, k);
  }
  const prev = stepTarget(tl, cur.index - 1, aspect, all);
  const k = reduced ? 1 : easeOutExpo(seg(cur.p, 0, 0.42));
  return lerpBox(prev, target, k);
}
