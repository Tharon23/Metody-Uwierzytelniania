import { describe, expect, it } from 'vitest';
import { mechanisms } from '@content/index';
import { buildTimeline, locate } from './engine/timeline';
import { cameraAt, overview } from './scene/camera';

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
