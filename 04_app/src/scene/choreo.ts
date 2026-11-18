import type { Actor, Step } from '@content/types';
import { clamp, easeInOutSine, seg, smoother } from '../engine/easing';
import { LEAD_SECONDS, stepParticipants, type Cursor, type Timeline } from '../engine/timeline';
import { iso, laneGrid, route, type Grid, type P } from './iso';

/**
 * Choreografia sceny — czyste funkcje czasu (te same w aplikacji, pokazie i wideo).
 *
 * Wejście na arkusz: urządzenia pojawiają się po kolei (w kolejności, w jakiej biorą udział
 * w przebiegu), potem z każdej pary wysuwają się dwa przerywane tory (tam i z powrotem).
 * Krok: urządzenia spoza kroku rozpływają się, kamera podjeżdża do nadawcy, strzałka rysuje
 * się torem swojego kierunku, kamera odjeżdża i do kadru wchodzi odbiorca. Po ostatnim kroku
 * wszyscy wracają, kamera wraca do planu ogólnego.
 */

/** Nadawca kroku (albo aktor obliczenia lokalnego). */
export function senderOf(step: Step): string | undefined {
  return step.from ?? step.at ?? step.focus?.[0] ?? step.to;
}

/** Odbiorca wiadomości (tylko kroki z przelotem). */
export function receiverOf(step: Step): string | undefined {
  return step.from && step.to ? step.to : undefined;
}

/** Kolejność wejścia aktorów: najpierw ci, którzy wcześniej biorą udział w przebiegu. */
function entryOrder(tl: Timeline): Actor[] {
  const first = new Map<string, number>();
  tl.steps.forEach(({ step }, i) => {
    for (const id of [step.from, step.at, step.to, ...(step.focus ?? [])]) if (id && !first.has(id)) first.set(id, i);
  });
  return [...tl.actors].sort((a, b) => (first.get(a.id) ?? 1e9) - (first.get(b.id) ?? 1e9) || a.at[0] + a.at[1] - (b.at[0] + b.at[1]));
}

/** Odstęp wejść kolejnych urządzeń (s). */
function entryGap(n: number) {
  return Math.min(0.32, 1.35 / Math.max(1, n - 1));
}

/** Chwila (s od początku osi), w której aktor zaczyna wchodzić na scenę. */
export function appearAt(tl: Timeline, actor: Actor): number {
  const order = entryOrder(tl);
  const i = Math.max(0, order.findIndex((a) => a.id === actor.id));
  return 0.15 + i * entryGap(order.length);
}

/** Tor zaczyna się wysuwać, gdy oba końce już stoją; rysowanie trwa LANE_DRAW s. */
const LANE_DRAW = 0.75;
export function laneIntro(tl: Timeline, a: Actor, b: Actor, t: number, reduced = false): number {
  if (reduced) return clamp(t / 0.3);
  const start = Math.max(appearAt(tl, a), appearAt(tl, b)) + 0.4;
  return easeInOutSine(seg(t, start, Math.min(start + LANE_DRAW, LEAD_SECONDS - 0.15)));
}

const DISSOLVE = 0.22;
const ENTER_RX: [number, number] = [0.28, 0.5];

/**
 * Uczestnicy kroku: aktorzy z `focus`, nadawca, odbiorca, miejsce obliczenia oraz każdy, komu krok
 * daje lub zabiera żeton albo zmienia ekran — zmiana stanu musi być widoczna w chwili, gdy zachodzi.
 */
export function participantsOf(step: Step): string[] {
  const touched = [...(step.gives ?? []), ...(step.takes ?? []), ...(step.shows ?? [])].map((x) => x.at);
  return [...new Set([...stepParticipants(step), step.from, step.to, step.at, ...touched].filter(Boolean) as string[])];
}

/** Uczestnicy kroku i (dla -1: wszyscy — plan ogólny po wejściu). */
function setOf(tl: Timeline, i: number): Set<string> {
  if (i < 0) return new Set(tl.actors.map((a) => a.id));
  return new Set(participantsOf(tl.steps[i].step));
}

/**
 * Widoczność aktora 0–1 w chwili cur (bez wejścia z ujęcia otwierającego — to osobno, appearK).
 * Ciągła na granicach kroków: na końcu kroku i widać dokładnie jego uczestników.
 */
export function actorVis(tl: Timeline, cur: Cursor, id: string): number {
  if (cur.index < 0) return 1;
  const prevSet = setOf(tl, cur.index - 1);
  const nowSet = setOf(tl, cur.index);
  const step = tl.steps[cur.index].step;
  const p = cur.p;
  const inPrev = prevSet.has(id);
  const inNow = nowSet.has(id);
  let v: number;
  if (inPrev && inNow) v = 1;
  else if (inPrev) v = 1 - smoother(seg(p, 0, DISSOLVE));
  else if (inNow) v = id === receiverOf(step) && id !== senderOf(step) ? smoother(seg(p, ...ENTER_RX)) : smoother(seg(p, 0, DISSOLVE));
  else v = 0;
  // Po ostatnim kroku wszyscy wracają razem z kamerą.
  if (cur.t > tl.stepsEnd) v = v + (1 - v) * smoother(seg(cur.t - tl.stepsEnd, 0.1, 1.0));
  return v;
}

/**
 * Fazy kroku z przelotem (ułamki p): kamera do nadawcy, potem strzałka rysuje się, a kamera
 * odjeżdża tą samą krzywą w tym samym czasie — czubek strzałki nie wyprzedza kadru.
 */
export const PHASE = {
  /** Kamera dojeżdża do nadawcy. */
  closeIn: [0, 0.36] as [number, number],
  /** Strzałka rysuje się z grotem na czubku. */
  draw: [0.36, 0.82] as [number, number],
  /** Kamera odjeżdża (lekko przed grotem), w kadr wchodzi odbiorca. */
  pullOut: [0.36, 0.78] as [number, number],
};

/** Postęp rysowania strzałki 0–1 (ta sama krzywa co odjazd kamery). */
export const drawK = (p: number) => smoother(seg(p, ...PHASE.draw));

/** Odsunięcie toru od osi trasy i skrócenie przy urządzeniach (jednostki siatki). */
const LANE_OFFSET = 0.1;
const LANE_TRIM = 0.62;

export function centroidOf(actors: Actor[]): Grid {
  const n = actors.length || 1;
  return [actors.reduce((s, a) => s + a.at[0], 0) / n, actors.reduce((s, a) => s + a.at[1], 0) / n];
}

/**
 * Tor kierunku from → to. Trasę liczymy raz dla pary (w stałej kolejności), a tor powrotny to ta
 * sama trasa odwrócona — oba tory zawsze biegną obok siebie, nawet przy remisie wyboru narożnika.
 */
export function lanePath(from: Actor, to: Actor, c: Grid): P[] {
  const flip = from.id > to.id;
  const path = flip ? route(to.at, from.at, c).reverse() : route(from.at, to.at, c);
  return laneGrid(path, LANE_OFFSET, LANE_TRIM).map(([x, y]) => iso(x, y));
}
