import { mechanisms } from '@content/index';
import type { Mechanism, Variant } from '@content/types';
import { buildTimeline, LEAD_SECONDS, PACE, type Timeline } from './timeline';

// Scenariusz pokazu (autoplay / wideo): czysta funkcja czasu → segment.

/** Atak pokazywany w pokazie dla każdego mechanizmu (najbardziej pouczający). */
export const FEATURED_ATTACK: Record<string, string> = {
  haslo: 'phishing',
  sms: 'simswap',
  totp: 'phishing',
  push: 'bombing',
  fido2: 'phishing',
  passkey: 'phishing',
  biometria: 'prezentacja',
  karta: 'relay',
  mfa: 'fallback',
  blik: 'oszustwo',
};

// Pokaz (autoplay): tempo do czytania z odległości. Każdy krok trwa co najmniej tyle,
// ile trzeba na przeczytanie podpisu (readingSeconds), karty i werdykty stoją dłużej.
export const INTRO_S = 9;
export const CARD_S = 10;
export const VERDICT_HOLD_S = 8;
export const FINALE_S = 20;
export const CREDITS_S = 9;
const FLOW_SPEED = 1.12;
/** Pytanie „jak myślisz?” przed atakiem w pokazie. */
export const QUESTION_S = 7;

// Zwiastun (~1,5 min) zachowuje dawne, szybsze tempo.
const TEASER = { intro: 7, card: 6, verdict: 4.5, finale: 14, credits: 7, question: 4, speed: FLOW_SPEED / PACE };

export type Segment =
  | { kind: 'intro'; start: number; end: number }
  | { kind: 'card'; start: number; end: number; mech: Mechanism }
  | { kind: 'flow'; start: number; end: number; mech: Mechanism; variant: Variant; tl: Timeline; pre: number }
  | { kind: 'finale'; start: number; end: number }
  | { kind: 'credits'; start: number; end: number };

export interface Show {
  segments: Segment[];
  total: number;
  /** Początek karty tytułowej każdego mechanizmu (do skoków). */
  mechStarts: { id: string; start: number }[];
}

export function buildShow(only?: string[]): Show {
  const segments: Segment[] = [];
  const mechStarts: Show['mechStarts'] = [];
  let t = 0;
  const push = (seg: Segment) => {
    segments.push(seg);
    t = seg.end;
  };
  push({ kind: 'intro', start: 0, end: INTRO_S });
  for (const mech of mechanisms.filter((m) => !only || only.includes(m.id))) {
    mechStarts.push({ id: mech.id, start: t });
    push({ kind: 'card', start: t, end: t + CARD_S, mech });
    const normal = mech.variants[0];
    const tlN = buildTimeline(mech, normal, FLOW_SPEED, { reading: true });
    push({ kind: 'flow', start: t, end: t + tlN.total, mech, variant: normal, tl: tlN, pre: LEAD_SECONDS });
    const attack = mech.variants.find((v) => v.id === FEATURED_ATTACK[mech.id]);
    if (attack) {
      const tlA = buildTimeline(mech, attack, FLOW_SPEED, { reading: true });
      const pre = attack.bet ? Math.max(QUESTION_S, LEAD_SECONDS) : LEAD_SECONDS;
      push({ kind: 'flow', start: t, end: t + pre + (tlA.total - LEAD_SECONDS) + VERDICT_HOLD_S, mech, variant: attack, tl: tlA, pre });
    }
  }
  if (!only) {
    push({ kind: 'finale', start: t, end: t + FINALE_S });
    push({ kind: 'credits', start: t, end: t + CREDITS_S });
  }
  return { segments, total: t, mechStarts };
}

/** Zwiastun (~90 s): wstęp, phishing na hasło i na passkey, finał, podziękowania. */
export function buildTeaser(): Show {
  const segments: Segment[] = [];
  const mechStarts: Show['mechStarts'] = [];
  let t = 0;
  const push = (seg: Segment) => {
    segments.push(seg);
    t = seg.end;
  };
  push({ kind: 'intro', start: 0, end: TEASER.intro });
  for (const id of ['haslo', 'passkey']) {
    const mech = mechanisms.find((m) => m.id === id)!;
    mechStarts.push({ id, start: t });
    push({ kind: 'card', start: t, end: t + TEASER.card, mech });
    const attack = mech.variants.find((v) => v.id === 'phishing')!;
    const tlA = buildTimeline(mech, attack, TEASER.speed);
    const pre = attack.bet ? Math.max(TEASER.question, LEAD_SECONDS) : LEAD_SECONDS;
    push({ kind: 'flow', start: t, end: t + pre + (tlA.total - LEAD_SECONDS) + TEASER.verdict, mech, variant: attack, tl: tlA, pre });
  }
  push({ kind: 'finale', start: t, end: t + TEASER.finale });
  push({ kind: 'credits', start: t, end: t + TEASER.credits });
  return { segments, total: t, mechStarts };
}

export function segmentAt(show: Show, t: number): { seg: Segment; local: number; index: number } {
  const tt = ((t % show.total) + show.total) % show.total;
  let index = show.segments.findIndex((s) => tt < s.end);
  if (index < 0) index = show.segments.length - 1;
  const seg = show.segments[index];
  return { seg, local: tt - seg.start, index };
}

/** Czas osi wariantu dla czasu lokalnego segmentu (z wydłużonym wstępem na pytanie). */
export function flowTime(seg: Extract<Segment, { kind: 'flow' }>, local: number): number {
  return local < seg.pre ? Math.min(local, LEAD_SECONDS) : LEAD_SECONDS + (local - seg.pre);
}
