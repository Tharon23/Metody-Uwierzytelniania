import { useMemo, useState } from 'react';
import { mechanisms } from '@content/index';
import { criteria, groupMean, profiles, scores, weighted } from '@content/matrix';
import { sourceById } from '@content/sources';
import type { CriterionGroup, Profile } from '@content/types';
import { href } from '../router';
import { TopBar } from '../ui/TopBar';
import { useSlider } from '../ui/useSlider';
import { useTweened } from '../ui/motion';

const GROUP_NAME: Record<CriterionGroup, string> = {
  A: 'Bezpieczeństwo',
  B: 'Wdrażalność',
  C: 'Wygoda (UX)',
  D: 'Zgodność',
};

const fmt = (v: number) => v.toFixed(2).replace('.', ',');

/** Wynik, który przy zmianie profilu wag dojeżdża do nowej wartości (jak licznik przyrządu). */
function TweenVal({ v }: { v: number }) {
  return <span className="bar-val">{fmt(useTweened(v))}</span>;
}

interface Tip {
  x: number;
  y: number;
  mech: string;
  crit: string;
}

export function Porownanie({ onToggleTheme }: { onToggleTheme: () => void }) {
  const [profile, setProfile] = useState<Profile>(profiles[1]);
  const [tip, setTip] = useState<Tip | null>(null);
  const [table, setTable] = useState(false);
  const segInd = useSlider<HTMLDivElement>(profile.id);
  const ranked = useMemo(() => [...mechanisms].sort((a, b) => weighted(b.id, profile) - weighted(a.id, profile)), [profile]);
  const groups: CriterionGroup[] = ['A', 'B', 'C', 'D'];

  const tipScore = tip ? scores[tip.mech][tip.crit] : null;
  const tipCrit = tip ? criteria.find((c) => c.id === tip.crit)! : null;
  const tipMech = tip ? mechanisms.find((m) => m.id === tip.mech)! : null;

  return (
    <div className="page">
      <TopBar onToggleTheme={onToggleTheme} />
      <main className="compare">
        <header className="compare-head">
          <h1>Porównanie metod</h1>
          <p className="lede">
            Matryca KM2: dziesięć mechanizmów, osiemnaście kryteriów, skala 1–5 (5 = najlepiej). Każda ocena ma uzasadnienie i źródło — najedź na komórkę.
          </p>
        </header>

        <section className="ranking" aria-labelledby="ranking-h">
          <div className="ranking-head">
            <h2 id="ranking-h">Ranking ważony</h2>
            <div className="seg has-ind" role="radiogroup" aria-label="Profil wag" ref={segInd}>
              {profiles.map((p) => (
                <button key={p.id} role="radio" aria-checked={p.id === profile.id} onClick={() => setProfile(p)}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <p className="ranking-desc">
            {profile.desc} Wagi grup: bezpieczeństwo {Math.round(profile.weights.A * 100)}%, wdrażalność {Math.round(profile.weights.B * 100)}%, wygoda{' '}
            {Math.round(profile.weights.C * 100)}%, zgodność {Math.round(profile.weights.D * 100)}%.
          </p>
          <ol className="bars" style={{ height: `${mechanisms.length * 2.6}rem` }}>
            {mechanisms.map((m) => {
              const v = weighted(m.id, profile);
              const rank = ranked.indexOf(m);
              return (
                <li key={m.id} className="bar-row" style={{ transform: `translateY(${rank * 2.6}rem)` }}>
                  <a className="bar-name" href={href({ name: 'explorer', mech: m.id })}>{m.name}</a>
                  <span className="bar-track" title={groups.map((g) => `${GROUP_NAME[g]}: ${fmt(groupMean(m.id, g))}`).join(' · ')}>
                    <span className="bar-fill" style={{ width: `${((v - 1) / 4) * 100}%` }} />
                  </span>
                  <TweenVal v={v} />
                  <span className="bar-fit">{scores[m.id].D4.label}</span>
                </li>
              );
            })}
          </ol>
          <p className="note">
            Ranking to średnia ważona grup kryteriów. O tym, gdzie metodę stosować, mówi kolumna po prawej (D4) — np. BLIK to płatności w Polsce, a nie logowanie pracowników.
          </p>
        </section>

        <section className="matrix-sec" aria-labelledby="matrix-h">
          <div className="ranking-head">
            <h2 id="matrix-h">Matryca</h2>
            <button className="btn btn-small" onClick={() => setTable((x) => !x)}>{table ? 'Pokaż mapę' : 'Pokaż jako tabelę z uzasadnieniami'}</button>
          </div>
          {!table ? (
            <div className="matrix-wrap">
              <table className="heat" onMouseLeave={() => setTip(null)}>
                <thead>
                  <tr>
                    <th />
                    {groups.map((g) => (
                      <th key={g} colSpan={criteria.filter((c) => c.group === g).length} className="heat-group">
                        {GROUP_NAME[g]}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th />
                    {criteria.map((c) => (
                      <th key={c.id} className={`heat-crit g-${c.group}`} title={c.desc}>
                        <span className="crit-rot">
                          <span className="crit-id">{c.id}</span>
                          <span className="crit-name">{c.name}</span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mechanisms.map((m) => (
                    <tr key={m.id}>
                      <th scope="row" className="heat-mech">
                        <a href={href({ name: 'explorer', mech: m.id })}>{m.name}</a>
                      </th>
                      {criteria.map((c) => {
                        const sc = scores[m.id][c.id];
                        return (
                          <td
                            key={c.id}
                            className={`cell s${sc.v} g-${c.group} ${tip && tip.mech === m.id && tip.crit === c.id ? 'is-hover' : ''}`}
                            onMouseEnter={(e) => {
                              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setTip({ x: r.left + r.width / 2, y: r.top, mech: m.id, crit: c.id });
                            }}
                            tabIndex={0}
                            onFocus={(e) => {
                              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setTip({ x: r.left + r.width / 2, y: r.top, mech: m.id, crit: c.id });
                            }}
                            aria-label={`${m.name}, ${c.name}: ${sc.v}. ${sc.why}`}
                          >
                            {sc.v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="legend" aria-hidden>
                <span>1 — najsłabiej</span>
                {[1, 2, 3, 4, 5].map((v) => (
                  <i key={v} className={`cell s${v}`}>{v}</i>
                ))}
                <span>5 — najlepiej</span>
              </div>
            </div>
          ) : (
            <div className="matrix-table">
              {mechanisms.map((m) => (
                <details key={m.id}>
                  <summary>
                    <span className="mt-num">{String(m.num).padStart(2, '0')}</span> {m.name}
                  </summary>
                  <table>
                    <tbody>
                      {criteria.map((c) => {
                        const sc = scores[m.id][c.id];
                        return (
                          <tr key={c.id}>
                            <th scope="row">{c.id} {c.name}</th>
                            <td className="mt-v">{sc.label ?? sc.v}{sc.label ? ` (${sc.v})` : ''}</td>
                            <td>{sc.why}</td>
                            <td className="mt-src">{sc.src.join(', ')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </details>
              ))}
            </div>
          )}
        </section>

        {tip && tipScore && tipCrit && tipMech && !table && (
          <div className="tooltip" role="tooltip" style={{ left: tip.x, top: tip.y }}>
            <div className="tt-head">
              <b>{tipMech.name}</b> · {tipCrit.id} {tipCrit.name}
            </div>
            <div className="tt-score">
              Ocena <b>{tipScore.v}</b>/5{tipScore.label ? ` · ${tipScore.label}` : ''}
            </div>
            <p>{tipScore.why}</p>
            <div className="tt-src">{tipScore.src.map((s) => `${s} ${sourceById[s].short}`).join(' · ')}</div>
          </div>
        )}
      </main>
    </div>
  );
}
