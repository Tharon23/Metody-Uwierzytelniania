import type { Actor } from '@content/types';
import { seg, smoother } from '../engine/easing';
import { LEAD_SECONDS, type Cursor, type Timeline } from '../engine/timeline';
import { centroidOf, lanePath, PHASE, participantsOf, receiverOf, senderOf } from './choreo';
import { DEVICE_META } from './devices/Device';
import { fitAspect, iso, lerpBox, lerpCam, type Box, type P } from './iso';

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

/** Zbliżenie na nadawcę: nie ciaśniej niż ten ułamek planu ogólnego. */
const CLOSE_MIN = 0.5;
/** Kadr kroku (nadawca + odbiorca): nie ciaśniej niż ten ułamek planu ogólnego. */
const WIDE_MIN = 0.6;
/** Powrót do planu ogólnego po ostatnim kroku (s). */
const OUTRO_S = 2.0;

/** Prostokąt obejmujący punkty (np. tor strzałki z narożnikiem) z marginesem na grot. */
function pointsBox(pts: P[]): Box {
  const xs = pts.map((q) => q.x);
  const ys = pts.map((q) => q.y);
  const x0 = Math.min(...xs) - 40;
  const y0 = Math.min(...ys) - 70;
  return { x: x0, y: y0, w: Math.max(...xs) + 40 - x0, h: Math.max(...ys) + 40 - y0 };
}

function frameOf(tl: Timeline, ids: string[], aspect: number, all: Box, minK: number, extra: Box[] = []): Box {
  const set = new Set(ids);
  const focus = tl.actors.filter((a) => set.has(a.id));
  if (focus.length === 0) return all;
  const f = atLeast(fitAspect(pad(union([...focus.map(actorBox), ...extra]), 0.16), aspect), all.w * minK, aspect);
  // Nigdy szerzej niż plan ogólny (skrajni aktorzy z marginesem dawaliby zbędny odjazd).
  return f.w >= all.w ? all : f;
}

/** Zbliżenie na aktora, który w kroku i coś robi. */
function closeShot(tl: Timeline, i: number, aspect: number, all: Box): Box {
  const id = senderOf(tl.steps[i].step);
  return id ? frameOf(tl, [id], aspect, all, CLOSE_MIN) : all;
}

/** Kadr na końcu kroku i: wszyscy jego uczestnicy (dla -1 — plan ogólny). */
function endShot(tl: Timeline, i: number, aspect: number, all: Box): Box {
  if (i < 0) return all;
  const step = tl.steps[i].step;
  const ids = participantsOf(step);
  if (ids.length <= 1) return closeShot(tl, i, aspect, all);
  // Kadr końcowy obejmuje też cały tor strzałki (narożnik trasy bywa poza urządzeniami).
  const byId = Object.fromEntries(tl.actors.map((a) => [a.id, a]));
  const extra = step.from && step.to && byId[step.from] && byId[step.to] ? [pointsBox(lanePath(byId[step.from], byId[step.to], centroidOf(tl.actors)))] : [];
  return frameOf(tl, ids, aspect, all, WIDE_MIN, extra);
}

/** Największe oddalenie w połowie przelotu strzałki (ułamek szerokości kadru). */
const BREATH = 0.15;

/** Prostokąt przeskalowany wokół środka. */
function breathe(b: Box, k: number): Box {
  return { x: b.x - (b.w * (k - 1)) / 2, y: b.y - (b.h * (k - 1)) / 2, w: b.w * k, h: b.h * k };
}

/** Plan ogólny lekko oddalony — wejście na arkusz zaczyna się od delikatnego najazdu. */
function wider(b: Box, k: number): Box {
  return { x: b.x - (b.w * (k - 1)) / 2, y: b.y - (b.h * (k - 1)) / 2, w: b.w * k, h: b.h * k };
}

/**
 * Kadr kamery w chwili cur — czysta funkcja czasu (ta sama w aplikacji, pokazie i wideo).
 * Każdy odcinek ruchu to smootherstep (zerowa prędkość i przyspieszenie na końcach), więc na
 * granicach kroków i faz nie ma szarpnięć; zbliżenie zmienia się logarytmicznie.
 *
 * Krok z przelotem: kamera podjeżdża do nadawcy, a gdy strzałka rusza w drogę — odjeżdża tak,
 * żeby w kadr wszedł odbiorca. Obliczenie lokalne: zbliżenie na aktora.
 */
export function cameraAt(tl: Timeline, cur: Cursor, aspect: number, reduced = false): Box {
  const all = overview(tl.actors, aspect);
  // Ruch ograniczony: kamera stoi na planie ogólnym. Wcześniej kadr skakał tu do celu kroku
  // w jednej klatce (k = 1) — to był „teleport” między krokami.
  if (reduced) return all;
  if (cur.index < 0) return lerpCam(wider(all, 1.1), all, smoother(seg(cur.t, 0, LEAD_SECONDS - 0.2)));
  const end = endShot(tl, cur.index, aspect, all);
  if (cur.t > tl.stepsEnd) return lerpCam(end, all, smoother(seg(cur.t - tl.stepsEnd, 0, OUTRO_S)));
  const from = endShot(tl, cur.index - 1, aspect, all);
  const step = tl.steps[cur.index].step;
  if (!receiverOf(step)) return lerpCam(from, end, smoother(seg(cur.p, 0, 0.4)));
  const close = closeShot(tl, cur.index, aspect, all);
  // Odjazd liniowo między prostokątami: kadr to kombinacja wypukła zbliżenia (nadawca) i kadru
  // końcowego (cały tor), a grot z tym samym postępem leży w niej — strzałka nie ucieka z kadru.
  // Przy torze z narożnikiem grot w połowie drogi bywa w narożniku, więc w trakcie przelotu kadr
  // lekko „oddycha” (gładko, zero na końcach) — zapas na narożnik.
  const out = smoother(seg(cur.p, ...PHASE.pullOut));
  if (out > 0) return breathe(lerpBox(close, end, out), 1 + BREATH * 4 * out * (1 - out));
  return lerpCam(from, close, smoother(seg(cur.p, ...PHASE.closeIn)));
}
