// Pomiar re-renderu klienta (React + DOM w jsdom): tyle kosztuje jedna klatka animacji w Explorerze.
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><div id="r"></div>');
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = false;

const { createElement } = await import('react');
const { createRoot } = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const { mechanismById } = await import('../../03_content/data/index');
const { buildTimeline } = await import('../src/engine/timeline');
const { IsoStage } = await import('../src/scene/IsoStage');

for (const [m, v] of [['karta', 'normalny'], ['blik', 'oszustwo'], ['passkey', 'normalny']] as const) {
  const mech = mechanismById[m];
  const tl = buildTimeline(mech, mech.variants.find((x) => x.id === v)!);
  const root = createRoot(document.getElementById('r')!);
  const frame = (t: number) => flushSync(() => root.render(createElement(IsoStage, { tl, t, width: 1280, height: 860 })));
  for (let i = 0; i < 60; i++) frame((i / 60) * tl.total);
  const N = 600;
  const t0 = performance.now();
  for (let i = 0; i < N; i++) frame((i / N) * tl.total);
  console.log(`${m}/${v}: ${((performance.now() - t0) / N).toFixed(2)} ms/klatkę (React + DOM, jsdom)`);
  root.unmount();
}
