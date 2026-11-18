import type { Actor, Mechanism, Screen, Step, Token, Variant } from '@content/types';

/** Długość kroku o wadze 1 (s). */
export const STEP_SECONDS = 2.8;
/** Wejście sceny: aktorzy się pojawiają, kamera pokazuje całość. */
export const LEAD_SECONDS = 1.4;
/** Zakończenie: werdykt / oddech po ostatnim kroku. */
export const TAIL_SECONDS = 1.6;

export interface TimedStep {
  step: Step;
  index: number;
  start: number;
  end: number;
}

export interface Timeline {
  mech: Mechanism;
  variant: Variant;
  actors: Actor[];
  steps: TimedStep[];
  /** Czas końca ostatniego kroku. */
  stepsEnd: number;
  total: number;
}

export function resolveActors(mech: Mechanism, variant: Variant): Actor[] {
  const hidden = new Set(variant.hide ?? []);
  const base = mech.actors
    .filter((a) => !hidden.has(a.id))
    .map((a) => (variant.move?.[a.id] ? { ...a, at: variant.move[a.id] } : a));
  return [...base, ...(variant.actors ?? [])];
}

export function buildTimeline(mech: Mechanism, variant: Variant, speed = 1): Timeline {
  let t = LEAD_SECONDS;
  const steps = variant.steps.map((step, index) => {
    const d = (STEP_SECONDS * (step.dur ?? 1)) / speed;
    const ts = { step, index, start: t, end: t + d };
    t += d;
    return ts;
  });
  return { mech, variant, actors: resolveActors(mech, variant), steps, stepsEnd: t, total: t + TAIL_SECONDS };
}

export interface Cursor {
  /** Indeks bieżącego kroku; -1 przed pierwszym. */
  index: number;
  /** Postęp bieżącego kroku 0–1. */
  p: number;
  /** Czas od początku osi. */
  t: number;
}

/** Krok zawiera chwile (start, end]; dzięki temu pauza na końcu kroku pokazuje jego stan końcowy. */
export function locate(tl: Timeline, t: number): Cursor {
  if (t <= LEAD_SECONDS || tl.steps.length === 0) return { index: -1, p: 0, t };
  for (const s of tl.steps) {
    if (t <= s.end) return { index: s.index, p: (t - s.start) / (s.end - s.start), t };
  }
  const last = tl.steps[tl.steps.length - 1];
  return { index: last.index, p: 1, t };
}

export interface SceneState {
  tokens: Token[];
  screens: Record<string, Screen>;
}

function apply(state: SceneState, step: Step) {
  for (const tk of step.takes ?? []) {
    state.tokens = state.tokens.filter((x) => !(x.at === tk.at && x.label === tk.label));
  }
  for (const tk of step.gives ?? []) {
    if (!state.tokens.some((x) => x.at === tk.at && x.label === tk.label)) state.tokens.push(tk);
  }
  for (const sc of step.shows ?? []) state.screens[sc.at] = sc;
}

/** Stan po zakończonych krokach (bez bieżącego). */
export function stateBefore(tl: Timeline, index: number): SceneState {
  const state: SceneState = {
    tokens: [...(tl.variant.initial?.tokens ?? [])],
    screens: Object.fromEntries((tl.variant.initial?.screens ?? []).map((s) => [s.at, s])),
  };
  for (let i = 0; i < index; i++) apply(state, tl.steps[i].step);
  return state;
}

/** Czas, w którym krok i jest zakończony (do skoków strzałkami). */
export const stepEndTime = (tl: Timeline, i: number) =>
  i < 0 ? LEAD_SECONDS : tl.steps[Math.min(i, tl.steps.length - 1)].end;

export function stepParticipants(step: Step): string[] {
  if (step.focus) return step.focus;
  return [step.from, step.to, step.at].filter(Boolean) as string[];
}
