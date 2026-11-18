import type { Actor, Mechanism, Screen, Step, Token, Variant } from '@content/types';

/** Tempo bazowe względem pierwszej wersji (2,8 s na krok): 0,6 — tak, żeby dało się wszystko przeczytać. */
export const PACE = 0.6;
/** Długość kroku o wadze 1 (s). */
export const STEP_SECONDS = 2.8 / PACE;
/**
 * Wejście na arkusz: plan ogólny, urządzenia pojawiają się po kolei, potem wysuwają się tory
 * połączeń (choreo.ts).
 */
export const LEAD_SECONDS = 3.4;
/** Zakończenie: werdykt / oddech po ostatnim kroku. */
export const TAIL_SECONDS = 2.4;

/** Minimalny czas kroku w pokazie, żeby podpis dało się przeczytać na ekranie (s). */
export function readingSeconds(text: string): number {
  return 1.6 + text.length / 14;
}

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

export function buildTimeline(mech: Mechanism, variant: Variant, speed = 1, opts: { reading?: boolean } = {}): Timeline {
  let t = LEAD_SECONDS;
  const steps = variant.steps.map((step, index) => {
    const base = (STEP_SECONDS * (step.dur ?? 1)) / speed;
    const d = opts.reading ? Math.max(base, readingSeconds(step.caption)) : base;
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
