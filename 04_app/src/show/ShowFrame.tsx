import { mechanisms } from '@content/index';
import { profiles, weighted } from '@content/matrix';
import type { Mechanism } from '@content/types';
import { clamp, easeInOutCubic, easeOutCubic, easeOutQuart, seg as segP, spring } from '../engine/easing';
import { flowTime, segmentAt, type Segment, type Show } from '../engine/show';
import { buildTimeline, LEAD_SECONDS, locate } from '../engine/timeline';
import { IsoStage } from '../scene/IsoStage';
import { Mark } from '../ui/Mark';
import { TEAM } from '../content/team';

const FADE = 0.5;

function fade(local: number, dur: number) {
  return clamp(Math.min(local / FADE, (dur - local) / FADE));
}

const FACTOR: Record<string, string> = { wiedza: 'coś, co wiesz', posiadanie: 'coś, co masz', cecha: 'coś, czym jesteś' };

/** Jedna klatka pokazu: czysta funkcja (t, rozmiar). Używana przez autoplay i Remotion. */
export function ShowFrame({ show, t, width, height, reduced = false }: { show: Show; t: number; width: number; height: number; reduced?: boolean }) {
  const { seg, local } = segmentAt(show, t);
  const dur = seg.end - seg.start;
  const u = height / 1080;
  const op = reduced ? 1 : fade(local, dur);
  return (
    <div className="show" style={{ width, height, fontSize: 16 * u }}>
      <div className="show-layer" style={{ opacity: op }}>
        {seg.kind === 'intro' && <Intro local={local} />}
        {seg.kind === 'card' && <Card mech={seg.mech} local={local} width={width} height={height} />}
        {seg.kind === 'flow' && <Flow seg={seg} local={local} width={width} height={height} reduced={reduced} />}
        {seg.kind === 'finale' && <Finale local={local} />}
        {seg.kind === 'credits' && <Credits local={local} />}
      </div>
      {seg.kind !== 'intro' && seg.kind !== 'credits' && <Progress current={'mech' in seg ? seg.mech.id : null} />}
    </div>
  );
}

function Progress({ current }: { current: string | null }) {
  return (
    <ol className="show-progress" aria-hidden>
      {mechanisms.map((m) => (
        <li key={m.id} className={m.id === current ? 'is-now' : ''}>
          <span>{m.short}</span>
        </li>
      ))}
    </ol>
  );
}

function rise(local: number, delay: number) {
  const k = spring(local - delay, 9, 0.85);
  return { opacity: clamp(k * 1.2), transform: `translateY(${(1 - k) * 0.9}em)` };
}

function Intro({ local }: { local: number }) {
  const draw = easeOutQuart(segP(local, 0.2, 2.2));
  return (
    <div className="show-intro">
      <svg className="intro-mark" viewBox="0 0 32 32" aria-hidden>
        <path d="M6 19.5 16 25l10-5.5L16 14z" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        <path d="M6 12.5 16 18l10-5.5L16 7z" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - easeOutQuart(segP(local, 0.5, 2.5))} />
      </svg>
      <h1 style={rise(local, 0.6)}>Jak się logujemy?</h1>
      <p style={rise(local, 1.2)}>Dziesięć sposobów, żeby udowodnić, że to Ty, i ataki, które je łamią albo się od nich odbijają.</p>
      <p className="intro-meta" style={rise(local, 1.9)}>Bezpieczne Transakcje Elektroniczne · AGH</p>
    </div>
  );
}

const previewCache = new Map<string, ReturnType<typeof buildTimeline>>();
function preview(mech: Mechanism) {
  if (!previewCache.has(mech.id)) previewCache.set(mech.id, buildTimeline(mech, mech.variants[0]));
  return previewCache.get(mech.id)!;
}

function Card({ mech, local, width, height }: { mech: Mechanism; local: number; width: number; height: number }) {
  const pw = width * 0.46;
  const ph = height * 0.7;
  return (
    <div className="show-card">
      <div className="card-preview" style={{ width: pw, height: ph, opacity: 0.9 * clamp(local / 1.2) }} aria-hidden>
        <IsoStage tl={preview(mech)} t={Math.min(LEAD_SECONDS, local)} width={pw} height={ph} textScale={1.2} />
      </div>
      <div className="card-sheet" style={rise(local, 0.1)}>
        Arkusz {String(mech.num).padStart(2, '0')} z {mechanisms.length}
        {mech.extension && <span className="card-ext">rozszerzenie: polski kontekst</span>}
      </div>
      <h1 style={rise(local, 0.25)}>{mech.name}</h1>
      <p className="card-tagline" style={rise(local, 0.5)}>{mech.tagline}</p>
      <ul className="card-factors" style={rise(local, 0.75)}>
        {(['wiedza', 'posiadanie', 'cecha'] as const).map((f) => (
          <li key={f} className={mech.factors.includes(f) ? 'is-on' : ''}>
            <b>{f}</b> {FACTOR[f]}
          </li>
        ))}
      </ul>
      <p className="card-analogy" style={rise(local, 1.1)}>{mech.analogy}</p>
    </div>
  );
}

function Flow({ seg, local, width, height, reduced }: { seg: Extract<Segment, { kind: 'flow' }>; local: number; width: number; height: number; reduced: boolean }) {
  const { tl, variant, mech } = seg;
  const tt = flowTime(seg, local);
  const cur = locate(tl, tt);
  const step = cur.index >= 0 ? tl.steps[cur.index].step : null;
  const u = height / 1080;
  const attack = variant.kind === 'atak';
  const asking = attack && variant.bet && local < seg.pre;
  const verdictK = variant.verdict ? easeOutCubic(segP(tt - tl.stepsEnd, 0.2, 0.9)) : 0;
  const captionKey = step ? step.id : 'lead';
  const capK = step ? easeOutCubic(segP(cur.p, 0.0, 0.18)) : 1;
  return (
    <div className="show-flow">
      <IsoStage tl={tl} t={tt} width={width} height={height} reduced={reduced} textScale={1.3} insetTop={150 * u} insetBottom={210 * u} />
      <header className="flow-head">
        <div className="flow-title">
          <span className="flow-sheet">{String(mech.num).padStart(2, '0')}</span>
          <span className="flow-name">{mech.name}</span>
        </div>
        <span className={`flow-variant ${attack ? 'is-attack' : ''}`}>{attack ? `Atak: ${variant.name}` : 'Jak to działa'}</span>
      </header>
      {asking ? (
        <div className="flow-question" style={rise(local, 0.2)}>
          <span>Jak myślisz?</span>
          <p>{variant.bet!.question}</p>
        </div>
      ) : verdictK > 0 && variant.verdict ? (
        <div className={`flow-verdict v-${variant.verdict.outcome}`} style={{ opacity: verdictK, transform: `translateY(${(1 - verdictK) * 1}em)` }}>
          <span className="verdict-tag">
            {variant.verdict.outcome === 'udany' ? 'Atak udany' : variant.verdict.outcome === 'zablokowany' ? 'Atak zablokowany' : 'Atak częściowo udany'}
          </span>
          <p>{variant.verdict.text}</p>
        </div>
      ) : (
        <div className="flow-caption" key={captionKey}>
          {step && (
            <span className="cap-step">
              Krok {cur.index + 1} z {tl.steps.length}
            </span>
          )}
          <p style={{ opacity: capK, transform: `translateY(${(1 - capK) * 0.4}em)` }}>{step ? step.caption : variant.summary}</p>
        </div>
      )}
    </div>
  );
}

function Finale({ local }: { local: number }) {
  // Trzy profile po kolei; słupki płynnie przechodzą między profilami.
  const per = 4.2;
  const pos = clamp((local - 1) / per, 0, profiles.length - 1);
  const i0 = Math.floor(pos);
  const i1 = Math.min(profiles.length - 1, i0 + 1);
  const k = easeInOutCubic(clamp((pos - i0 - 0.7) / 0.3));
  const value = (id: string) => weighted(id, profiles[i0]) * (1 - k) + weighted(id, profiles[i1]) * k;
  const profile = k < 0.5 ? profiles[i0] : profiles[i1];
  const rankIn = (pi: number) => [...mechanisms].sort((a, b) => weighted(b.id, profiles[pi]) - weighted(a.id, profiles[pi]));
  const r0 = rankIn(i0);
  const r1 = rankIn(i1);
  const grow = easeOutQuart(segP(local, 0.3, 1.6));
  return (
    <div className="show-finale">
      <h2 style={rise(local, 0)}>Który sposób jest najlepszy?</h2>
      <p className="finale-sub" style={rise(local, 0.2)}>
        Zależy, kogo chronisz. Wynik ważony matrycy (1–5): <b>{profile.name}</b>
      </p>
      <div className="finale-bars">
        {mechanisms.map((m) => {
          const rank = r0.indexOf(m) * (1 - k) + r1.indexOf(m) * k;
          const v = value(m.id);
          return (
            <div key={m.id} className="fbar" style={{ transform: `translateY(${rank * 100}%)` }}>
              <span className="fbar-name">{m.name}</span>
              <span className="fbar-track">
                <span className="fbar-fill" style={{ width: `${((v - 1) / 4) * 100 * grow}%` }} />
              </span>
              <span className="fbar-val">{v.toFixed(2).replace('.', ',')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Credits({ local }: { local: number }) {
  return (
    <div className="show-credits">
      <Mark />
      <h2 style={rise(local, 0.1)}>Jak się logujemy?</h2>
      <p style={rise(local, 0.3)}>Projekt zespołowy, Bezpieczne Transakcje Elektroniczne, AGH, 2026</p>
      <p style={rise(local, 0.5)}>Twórcy: {TEAM.map((p) => p.name).join(' · ')}</p>
      <p className="credits-pe" style={rise(local, 0.8)}>
        Inspirowane Protocol Explorer autorstwa Diluma Sanjayi.
      </p>
      <p className="credits-src" style={rise(local, 1.0)}>Źródła i matryca porównawcza: aplikacja, zakładka „O projekcie”.</p>
    </div>
  );
}
