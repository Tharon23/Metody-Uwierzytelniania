import { describe, expect, it } from 'vitest';
import { mechanisms } from '@content/index';
import { buildTimeline, locate } from './engine/timeline';
import { cameraAt, overview } from './scene/camera';
import { actorVis, centroidOf, drawK, lanePath, PHASE } from './scene/choreo';
import { laneGrid, pointAt } from './scene/iso';

// Płynność kamery: próbkujemy kadr co 1/60 s i sprawdzamy, że nie ma skoków prędkości
// (stary ruch easeOutExpo ruszał z miejsca z pełną prędkością — „agresywne przeskoki”).
describe('kamera bez szarpnięć', () => {
  const aspect = 1.6;
  for (const m of mechanisms) {
    for (const v of m.variants) {
      it(`${m.id}/${v.id}`, () => {
        const tl = buildTimeline(m, v);
        const W = overview(tl.actors, aspect).w;
        const sample = (t: number) => {
          const b = cameraAt(tl, locate(tl, t), aspect);
          return [b.x + b.w / 2, b.y + b.h / 2, Math.log(b.w) * W];
        };
        let prev = sample(0);
        let vel = [0, 0, 0];
        let maxStep = 0;
        let maxAcc = 0;
        for (let t = 1 / 60; t <= tl.total; t += 1 / 60) {
          const cur = sample(t);
          const nv = cur.map((c, i) => c - prev[i]);
          maxStep = Math.max(maxStep, ...nv.map(Math.abs));
          maxAcc = Math.max(maxAcc, ...nv.map((x, i) => Math.abs(x - vel[i])));
          prev = cur;
          vel = nv;
        }
        // Kadr przesuwa się o mniej niż 1,5% planu na klatkę i nie zmienia nagle prędkości.
        expect(maxStep / W).toBeLessThan(0.015);
        expect(maxAcc / W).toBeLessThan(0.0015);
      });
    }
  }
});

// Regresja: przy „ruchu ograniczonym” kadr skakał do celu kroku w jednej klatce (teleport między
// krokami). Teraz w tym trybie kamera stoi na planie ogólnym przez cały przebieg.
describe('ruch ograniczony: kamera bez skoków', () => {
  for (const m of mechanisms) {
    const v = m.variants[m.variants.length - 1];
    it(`${m.id}/${v.id}`, () => {
      const tl = buildTimeline(m, v);
      const first = cameraAt(tl, locate(tl, 0), 1.6, true);
      for (let t = 0; t <= tl.total; t += 1 / 30) {
        expect(cameraAt(tl, locate(tl, t), 1.6, true)).toEqual(first);
      }
    });
  }
});

// Urządzenia spoza kroku rozpływają się, odbiorca wchodzi — zawsze płynnie, bez mignięć.
describe('widoczność aktorów bez skoków', () => {
  for (const m of mechanisms) {
    for (const v of m.variants) {
      it(`${m.id}/${v.id}`, () => {
        const tl = buildTimeline(m, v);
        let prev = tl.actors.map((a) => actorVis(tl, locate(tl, 0), a.id));
        let maxStep = 0;
        for (let t = 1 / 60; t <= tl.total; t += 1 / 60) {
          const cur = tl.actors.map((a) => actorVis(tl, locate(tl, t), a.id));
          cur.forEach((x, i) => (maxStep = Math.max(maxStep, Math.abs(x - prev[i]))));
          prev = cur;
        }
        expect(maxStep).toBeLessThan(0.06);
        // Na końcu kroku widać jego uczestników; po przebiegu — wszystkich.
        for (const s of tl.steps) {
          const end = locate(tl, s.end);
          for (const id of [s.step.from, s.step.to, s.step.at].filter(Boolean) as string[]) {
            expect(actorVis(tl, end, id)).toBeCloseTo(1, 5);
          }
        }
        for (const a of tl.actors) expect(actorVis(tl, locate(tl, tl.total), a.id)).toBeCloseTo(1, 3);
      });
    }
  }
});

describe('tory tam i z powrotem', () => {
  it('leżą po przeciwnych stronach trasy, w stałym odstępie', () => {
    const path: [number, number][] = [[0, 0], [4, 0], [4, 3]];
    const ab = laneGrid(path, 0.1, 0);
    const ba = laneGrid([...path].reverse(), 0.1, 0).reverse();
    expect(ab.length).toBe(3);
    ab.forEach((p, i) => {
      const d = Math.hypot(p[0] - ba[i][0], p[1] - ba[i][1]);
      // Na prostych odstęp 2·0,1; w narożniku przekątna 2·0,1·√2.
      expect(d).toBeCloseTo(i === 1 ? 0.2 * Math.SQRT2 : 0.2, 6);
    });
  });
  it('skrócenie zjada końce, nie środek', () => {
    const lane = laneGrid([[0, 0], [4, 0]], 0, 0.6);
    expect(lane[0][0]).toBeCloseTo(0.6, 6);
    expect(lane[lane.length - 1][0]).toBeCloseTo(3.4, 6);
  });
});

// Czubek strzałki (i etykieta nad nim) zostaje w kadrze przez cały przelot — kamera odjeżdża
// tą samą krzywą, którą rysuje się strzałka. Proporcje: laptop z panelami, szeroka scena, pokaz.
// (Przy scenie 1:1 tor z długim pierwszym odcinkiem — push: telefon → serwer — wychodzi o ~20 j.)
describe('czubek strzałki w kadrze', () => {
  for (const aspect of [1.4, 2.0, 2.67]) {
    for (const m of mechanisms) {
      for (const v of m.variants) {
        it(`${aspect} ${m.id}/${v.id}`, () => {
          const tl = buildTimeline(m, v);
          const byId = Object.fromEntries(tl.actors.map((a) => [a.id, a]));
          const c = centroidOf(tl.actors);
          for (const s of tl.steps) {
            const { from, to } = s.step;
            if (!from || !to) continue;
            const lane = lanePath(byId[from], byId[to], c);
            for (let k = 0; k <= 40; k++) {
              const p = PHASE.draw[0] + ((1 - PHASE.draw[0]) * k) / 40;
              const t = s.start + p * (s.end - s.start);
              const cam = cameraAt(tl, { index: s.index, p, t }, aspect);
              const tip = pointAt(lane, drawK(p));
              const mx = cam.w * 0.005;
              expect(tip.x, `${s.step.id} p=${p.toFixed(2)}`).toBeGreaterThan(cam.x + mx);
              expect(tip.x, `${s.step.id} p=${p.toFixed(2)}`).toBeLessThan(cam.x + cam.w - mx);
              // Etykieta wiadomości jedzie ~34 j. nad grotem i ma ~30 j. wysokości.
              expect(tip.y - 50, `${s.step.id} p=${p.toFixed(2)}`).toBeGreaterThan(cam.y);
              expect(tip.y, `${s.step.id} p=${p.toFixed(2)}`).toBeLessThan(cam.y + cam.h - mx);
            }
          }
        });
      }
    }
  }
});
