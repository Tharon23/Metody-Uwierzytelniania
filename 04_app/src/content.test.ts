import { describe, expect, it } from 'vitest';
import { mechanisms } from '@content/index';
import { sourceById } from '@content/sources';
import { resolveActors } from './engine/timeline';
import { ascii, hotp, totp } from '@content/lib/totp';

describe('dane mechanizmów', () => {
  it('ma 10 mechanizmów z unikalnymi id i numerami 1–10', () => {
    expect(mechanisms.map((m) => m.num)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(mechanisms.map((m) => m.id)).size).toBe(10);
  });

  for (const m of mechanisms) {
    describe(m.id, () => {
      it('źródła istnieją', () => {
        for (const s of m.sources) expect(sourceById[s], `${m.id}: ${s}`).toBeDefined();
      });
      for (const v of m.variants) {
        it(`${v.id}: kroki odwołują się do widocznych aktorów`, () => {
          const ids = new Set(resolveActors(m, v).map((a) => a.id));
          const refs = [
            ...(v.initial?.tokens ?? []).map((t) => t.at),
            ...(v.initial?.screens ?? []).map((t) => t.at),
          ];
          for (const s of v.steps) {
            refs.push(...([s.from, s.to, s.at].filter(Boolean) as string[]));
            refs.push(...(s.focus ?? []), ...(s.gives ?? []).map((g) => g.at), ...(s.shows ?? []).map((g) => g.at));
            expect(!!(s.from && s.to) || !!s.at, `${v.id}/${s.id}: brak from/to albo at`).toBe(true);
          }
          for (const r of refs) expect(ids.has(r), `${m.id}/${v.id}: nieznany aktor ${r}`).toBe(true);
        });
        it(`${v.id}: podpisy i etykiety mieszczą się w limitach`, () => {
          for (const s of v.steps) {
            expect(s.caption.length, `${v.id}/${s.id} podpis`).toBeLessThanOrEqual(100);
            expect(s.title.length, `${v.id}/${s.id} tytuł`).toBeLessThanOrEqual(42);
            if (s.msg) expect(s.msg.label.length, `${v.id}/${s.id} etykieta`).toBeLessThanOrEqual(28);
          }
        });
        it(`${v.id}: warianty ataku mają werdykt i pytanie`, () => {
          if (v.kind === 'atak') {
            expect(v.verdict).toBeDefined();
            expect(v.bet).toBeDefined();
          }
        });
      }
    });
  }
});

describe('TOTP (RFC 4226 / 6238)', () => {
  const key = ascii('12345678901234567890');
  it('HOTP — wektory testowe RFC 4226', () => {
    const expected = ['755224', '287082', '359152', '969429', '338314', '254676', '287922', '162583', '399871', '520489'];
    expected.forEach((code, c) => expect(hotp(key, c).code).toBe(code));
  });
  it('TOTP SHA-1 — wektory testowe RFC 6238 (8 cyfr)', () => {
    const cases: [number, string][] = [
      [59, '94287082'],
      [1111111109, '07081804'],
      [1111111111, '14050471'],
      [1234567890, '89005924'],
      [2000000000, '69279037'],
      [20000000000, '65353130'],
    ];
    for (const [t, code] of cases) expect(totp(key, t, 30, 8).code).toBe(code);
  });
});

import { criteria, profiles, scores, weighted } from '@content/matrix';

describe('matryca KM2', () => {
  it('każdy mechanizm ma ocenę w każdym kryterium, ze źródłem z listy', () => {
    for (const m of mechanisms) {
      for (const c of criteria) {
        const sc = scores[m.id]?.[c.id];
        expect(sc, `${m.id}/${c.id}`).toBeDefined();
        expect(sc.v).toBeGreaterThanOrEqual(1);
        expect(sc.v).toBeLessThanOrEqual(5);
        expect(sc.src.length, `${m.id}/${c.id} bez źródła`).toBeGreaterThan(0);
        for (const s of sc.src) expect(sourceById[s], `${m.id}/${c.id}: ${s}`).toBeDefined();
        expect(sc.why.length).toBeGreaterThan(3);
      }
    }
  });
  it('kryteria D mają etykiety opisowe', () => {
    for (const m of mechanisms) for (const c of criteria.filter((x) => x.group === 'D')) expect(scores[m.id][c.id].label).toBeTruthy();
  });
  it('D1 i D2 zgadzają się z regułami przeliczenia etykiet', () => {
    const d1: Record<string, number> = { AAL3: 5, 'AAL2/AAL3': 4, 'AAL2–AAL3': 4, AAL2: 3, 'AAL2 (restricted)': 2, AAL1: 2, 'n/d samodzielnie': 2, 'n/d': 3 };
    for (const m of mechanisms) {
      const a = scores[m.id].D1;
      expect(d1[a.label!], `${m.id} D1 ${a.label}`).toBe(a.v);
      const b = scores[m.id].D2;
      const want = b.label === 'tak' ? 5 : b.label!.startsWith('tak (') ? 4 : b.label === 'częściowo' ? 3 : 1;
      expect(b.v, `${m.id} D2 ${b.label}`).toBe(want);
    }
  });
  it('D3 zgadza się z faktami mechanizmu', () => {
    const map = { tak: 5, częściowo: 3, nie: 1 } as const;
    for (const m of mechanisms) expect(scores[m.id].D3.v, m.id).toBe(map[m.facts.phishingResistant]);
  });
  it('wagi profili sumują się do 1, wyniki w zakresie 1–5', () => {
    for (const p of profiles) {
      const sum = Object.values(p.weights).reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
      for (const m of mechanisms) {
        const w = weighted(m.id, p);
        expect(w).toBeGreaterThanOrEqual(1);
        expect(w).toBeLessThanOrEqual(5);
      }
    }
  });
});
