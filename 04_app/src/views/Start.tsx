import { useEffect, useMemo, useRef, useState } from 'react';
import { mechanisms, mechanismById } from '@content/index';
import { buildTimeline } from '../engine/timeline';
import { href } from '../router';
import { IsoStage } from '../scene/IsoStage';
import { TopBar } from '../ui/TopBar';
import { Creators } from '../ui/Creators';
import { useReducedMotion, useSize } from '../ui/useSize';

const PR_LABEL = { tak: 'odporny', nie: 'podatny', częściowo: 'częściowo' } as const;

export function Start({ onToggleTheme }: { onToggleTheme: () => void }) {
  const hero = useMemo(() => {
    const m = mechanismById['haslo'];
    return buildTimeline(m, m.variants.find((v) => v.id === 'phishing')!);
  }, []);
  const [ref, size] = useSize<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [t, setT] = useState(reduced ? hero.total - 1.5 : 0);
  const tRef = useRef(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tRef.current = (tRef.current + dt) % (hero.total + 2);
      setT(Math.min(tRef.current, hero.total));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hero, reduced]);

  return (
    <div className="page">
      <TopBar onToggleTheme={onToggleTheme} />
      <main className="start">
        <section className="start-hero">
          <div className="start-copy">
            <h1>Jak się logujemy?</h1>
            <p className="lede">
              Dziesięć sposobów, żeby udowodnić bankowi, sklepowi albo firmie, że to Ty. Każdy rozrysowany krok po kroku — razem z atakiem, który go łamie albo się od niego odbija.
            </p>
            <div className="start-actions">
              <a className="btn btn-primary" href={href({ name: 'explorer', mech: 'haslo' })}>Zacznij od hasła</a>
              <a className="btn" href={href({ name: 'autoplay' })}>Pokaz na ekran</a>
              <a className="btn" href={href({ name: 'porownanie' })}>Porównanie metod</a>
            </div>
          </div>
          <figure className="start-stage" ref={ref} aria-label="Podgląd: phishing przechwytuje hasło">
            <IsoStage tl={hero} t={t} width={size.width} height={size.height} reduced={reduced} live />
            <figcaption>Arkusz 1, wariant „Phishing AitM”: fałszywa strona przechwytuje hasło i sesję.</figcaption>
          </figure>
        </section>

        <section className="register" aria-labelledby="spis">
          <h2 id="spis">Spis arkuszy</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Nr</th>
                <th scope="col">Mechanizm</th>
                <th scope="col">Czynniki</th>
                <th scope="col">Phishing</th>
                <th scope="col">Warianty</th>
              </tr>
            </thead>
            <tbody>
              {mechanisms.map((m) => (
                <tr key={m.id}>
                  <td className="reg-num">{String(m.num).padStart(2, '0')}</td>
                  <td>
                    <a href={href({ name: 'explorer', mech: m.id })} className="reg-name">{m.name}</a>
                    <span className="reg-tag">{m.tagline}</span>
                  </td>
                  <td className="reg-factors">{m.factors.join(' + ')}</td>
                  <td className={`reg-pr pr-${m.facts.phishingResistant}`}>{PR_LABEL[m.facts.phishingResistant]}</td>
                  <td className="reg-variants">
                    {m.variants.map((v) => (
                      <a key={v.id} href={href({ name: 'explorer', mech: m.id, variant: v.id })} className={v.kind === 'atak' ? 'is-attack' : ''}>
                        {v.name}
                      </a>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <Creators />

        <footer className="page-foot">
          <p>
            Projekt na przedmiot Bezpieczne Transakcje Elektroniczne (AGH). Inspirowane{' '}
            <a href="https://protocol-explorer-alpha.vercel.app" target="_blank" rel="noreferrer">Protocol Explorer</a> Diluma Sanjayi.{' '}
            <a href={href({ name: 'o-projekcie' })}>O projekcie i źródła</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
