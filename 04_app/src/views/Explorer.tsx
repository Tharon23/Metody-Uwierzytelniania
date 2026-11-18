import { useCallback, useEffect, useMemo, useState } from 'react';
import { mechanisms, mechanismById } from '@content/index';
import type { Mechanism, Variant } from '@content/types';
import { buildTimeline, LEAD_SECONDS, locate, stepEndTime } from '../engine/timeline';
import { useClock, useClockValue, type Clock } from '../engine/clock';
import type { Timeline } from '../engine/timeline';
import { navigate } from '../router';
import { IsoStage, CHANNEL_LABEL } from '../scene/IsoStage';
import { SeqStage } from '../scene/SeqStage';
import { useReducedMotion, useSize } from '../ui/useSize';
import { useStoredFlag } from '../ui/prefs';
import { useSlider } from '../ui/useSlider';
import { TopBar } from '../ui/TopBar';
import { FactorList, OutcomeBadge } from '../ui/bits';

const FACTOR_SHEET = (m: Mechanism) => `${m.num}/${mechanisms.length}`;

export function Explorer({
  mechId, variantId, onToggleTheme, idleSeconds, initialT, initialView,
}: { mechId: string; variantId?: string; onToggleTheme: () => void; idleSeconds?: number; initialT?: number; initialView?: 'scena' | 'sekwencja' }) {
  const mech = mechanismById[mechId] ?? mechanisms[0];
  const variant: Variant = mech.variants.find((v) => v.id === variantId) ?? mech.variants[0];
  const [speed, setSpeed] = useState(1);
  const tl = useMemo(() => buildTimeline(mech, variant), [mech, variant]);
  const clock = useClock(tl.total, speed, `${mech.id}/${variant.id}`, initialT);
  // Panele subskrybują tylko wartości zmieniające się rzadko — co klatkę renderuje się wyłącznie scena.
  const curIndex = useClockValue(clock, (c) => locate(tl, c.t).index);
  const stepDone = useClockValue(clock, (c) => locate(tl, c.t).p >= 0.999);
  const playing = useClockValue(clock, (c) => c.playing);
  const atLead = useClockValue(clock, (c) => c.t < LEAD_SECONDS + 0.01);
  const finished = useClockValue(clock, (c) => c.t >= tl.stepsEnd + 0.2);
  const [jumping, setJumping] = useState(false);
  const [stageRef, size] = useSize<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [showList, setShowList] = useStoredFlag('jsl-list', true);
  const [diagramOnly, setDiagramOnly] = useState(false);
  const [view, setView] = useState<'scena' | 'sekwencja'>(initialView ?? 'scena');
  const [bets, setBets] = useState<Record<string, number>>({});
  const [help, setHelp] = useState(false);
  const betKey = `${mech.id}/${variant.id}`;
  const variantInd = useSlider<HTMLDivElement>(`${betKey}/${showList}`);
  const viewInd = useSlider<HTMLDivElement>(view);
  const betAnswer = bets[betKey];
  const needsBet = !!variant.bet && betAnswer === undefined && atLead && !playing;

  const go = useCallback((m: Mechanism, v?: Variant) => navigate({ name: 'explorer', mech: m.id, variant: v?.id }, undefined, true), []);

  const nextStep = useCallback(() => {
    if (needsBet) return;
    const cur = locate(tl, clock.t);
    const target = cur.index < 0 ? 0 : cur.p >= 0.999 ? cur.index + 1 : cur.index;
    if (target >= tl.steps.length) clock.playTo(tl.total);
    else clock.playTo(stepEndTime(tl, target));
  }, [clock, needsBet, tl]);

  // Krok wstecz: płynne przewinięcie (scena cofa się przez stany pośrednie), nie cięcie.
  const prevStep = useCallback(() => {
    const cur = locate(tl, clock.t);
    const target = clock.t > tl.stepsEnd + 1e-3 ? tl.stepsEnd : stepEndTime(tl, cur.index - 1);
    if (reduced) clock.seek(target);
    else clock.glideTo(target, 560);
  }, [clock, reduced, tl]);

  // Skok do dowolnego kroku: sąsiedni gra normalnie, dalszy przenika (scena gaśnie na 140 ms).
  const jumpTo = useCallback(
    (i: number) => {
      const cur = locate(tl, clock.t);
      const doneIndex = cur.p >= 0.999 ? cur.index : cur.index - 1;
      const s = tl.steps[i];
      if (i === doneIndex + 1) {
        clock.playTo(s.end);
        return;
      }
      if (i === cur.index && !(cur.p >= 0.999)) {
        clock.playTo(s.end);
        return;
      }
      if (i === doneIndex && i >= 0) {
        clock.glideTo(stepEndTime(tl, i - 1), 420);
        return;
      }
      if (reduced) {
        clock.seek(s.start + 0.001);
        clock.playTo(s.end);
        return;
      }
      setJumping(true);
      clock.pause();
      window.setTimeout(() => {
        clock.seek(s.start + 0.001);
        setJumping(false);
        clock.playTo(s.end);
      }, 150);
    },
    [clock, reduced, tl],
  );

  const cycleVariant = useCallback(
    (dir = 1) => {
      const i = mech.variants.indexOf(variant);
      go(mech, mech.variants[(i + dir + mech.variants.length) % mech.variants.length]);
    },
    [go, mech, variant],
  );

  const answer = (i: number) => {
    setBets((b) => ({ ...b, [betKey]: i }));
    clock.play();
  };

  // Klawiatura
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowRight') { e.preventDefault(); nextStep(); }
      else if (k === 'ArrowLeft') { e.preventDefault(); prevStep(); }
      else if (k === ' ') { e.preventDefault(); if (needsBet) return; clock.toggle(); }
      else if (k === 'Home') { clock.glideTo(0, 480); }
      else if (k === 'End') { clock.pause(); clock.seek(tl.total); }
      else if (k === 'v' || k === 'V') setView((v) => (v === 'scena' ? 'sekwencja' : 'scena'));
      else if (k === 'a' || k === 'A') cycleVariant(e.shiftKey ? -1 : 1);
      else if (k === 'l' || k === 'L') setShowList((s) => !s);
      else if (k === 'd' || k === 'D') setDiagramOnly((s) => !s);
      else if (k === 'f' || k === 'F') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.().catch(() => {});
      } else if (k === 't' || k === 'T') onToggleTheme();
      else if (k === '?') setHelp((h) => !h);
      else if (k === 'Escape') { setHelp(false); setDiagramOnly(false); }
      else if ((k === '1' || k === '2') && needsBet) answer(Number(k) - 1);
      else if (/^[0-9]$/.test(k)) {
        const n = k === '0' ? 10 : Number(k);
        const m = mechanisms.find((x) => x.num === n);
        if (m) go(m);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  // Powrót do autoplay po bezczynności (tryb wystawowy)
  useEffect(() => {
    if (!idleSeconds) return;
    let timer = window.setTimeout(() => navigate({ name: 'autoplay' }), idleSeconds * 1000);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => navigate({ name: 'autoplay' }), idleSeconds * 1000);
    };
    const evs = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const;
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      evs.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [idleSeconds]);

  const step = curIndex >= 0 ? tl.steps[curIndex].step : null;
  const layoutClass = ['explorer', diagramOnly ? 'is-diagram' : '', showList ? '' : 'no-list'].join(' ');

  return (
    <div className={layoutClass}>
      {!diagramOnly && <TopBar current={mech} onToggleTheme={onToggleTheme} onHelp={() => setHelp(true)} />}

      {!diagramOnly && showList && (
        <aside className="steps-panel" aria-label="Kroki">
          <div className="variant-tabs has-ind" role="tablist" aria-label="Warianty" ref={variantInd}>
            {mech.variants.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={v.id === variant.id}
                className={`variant-tab ${v.kind === 'atak' ? 'is-attack' : ''}`}
                onClick={() => go(mech, v)}
              >
                {v.name}
              </button>
            ))}
          </div>
          <p className="variant-summary">{variant.summary}</p>
          <ol className="step-list">
            {tl.steps.map((s) => {
              const state = s.index < curIndex || (s.index === curIndex && stepDone) ? 'done' : s.index === curIndex ? 'now' : 'next';
              return (
                <li key={s.step.id} className={`step-item is-${state}`}>
                  <button onClick={() => !needsBet && jumpTo(s.index)}>
                    <span className="step-num">{s.index + 1}</span>
                    <span className="step-title">{s.step.title}</span>
                    {s.step.result && <span className={`step-dot r-${s.step.result}`} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      )}

      <main className="stage-wrap">
        {!diagramOnly && (
          <div className="view-switch has-ind" role="tablist" aria-label="Widok" ref={viewInd}>
            <button role="tab" aria-selected={view === 'scena'} onClick={() => setView('scena')}>Scena</button>
            <button role="tab" aria-selected={view === 'sekwencja'} onClick={() => setView('sekwencja')}>Sekwencja</button>
          </div>
        )}
        <div className={`stage ${jumping ? 'is-jumping' : ''}`} ref={stageRef}>
          <LiveStage clock={clock} tl={tl} view={view} width={size.width} height={size.height} reduced={reduced} diagramOnly={diagramOnly} />
        </div>

        <div className="title-block" aria-hidden>
          <div className="tb-name">{mech.name}</div>
          <div className="tb-row"><span>Arkusz</span><b>{FACTOR_SHEET(mech)}</b></div>
          <div className="tb-row"><span>Wariant</span><b>{variant.name}</b></div>
        </div>

        {needsBet && variant.bet && (
          <div className="bet" role="dialog" aria-label="Jak myślisz?">
            <p className="bet-kicker">Jak myślisz?</p>
            <p className="bet-q">{variant.bet.question}</p>
            <div className="bet-options">
              {variant.bet.options.map((o, i) => (
                <button key={o} onClick={() => answer(i)}>
                  <kbd>{i + 1}</kbd> {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {finished && variant.verdict && (
          <div className={`verdict v-${variant.verdict.outcome}`} role="status">
            <OutcomeBadge outcome={variant.verdict.outcome} />
            <p>{variant.verdict.text}</p>
            {betAnswer !== undefined && variant.bet && (
              <p className="verdict-bet">
                {betAnswer === variant.bet.correct ? 'Dobrze obstawione.' : `Prawidłowa odpowiedź: „${variant.bet.options[variant.bet.correct]}”.`}
              </p>
            )}
            <div className="verdict-actions">
              <button onClick={() => { clock.seek(0); clock.play(); }}>Powtórz</button>
              <button onClick={() => cycleVariant(1)}>Następny wariant <kbd>A</kbd></button>
            </div>
          </div>
        )}
      </main>

      {!diagramOnly && (
        <aside className="info-panel" aria-label="Szczegóły">
          <section className="info-step" key={step ? step.id : `wariant-${variant.id}`}>
            <h2>{step ? step.title : variant.name}</h2>
            <p>{step ? step.detail : variant.summary}</p>
            {step?.msg && (
              <div className="msg">
                <div className="msg-head">
                  <span className="msg-label">{step.msg.label}</span>
                  <span className="msg-channel">{CHANNEL_LABEL[step.msg.channel]}</span>
                </div>
                {step.msg.fields && (
                  <dl className="msg-fields">
                    {step.msg.fields.map((f) => (
                      <div key={f.k} className={`field ${f.secret ? 'is-secret' : ''} tone-${f.tone ?? 'neutral'}`}>
                        <dt>{f.k}</dt>
                        <dd>{f.v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}
            {step?.calc && <p className="calc">{step.calc}</p>}
          </section>
          <section className="info-mech">
            <h3>O metodzie</h3>
            <p className="tagline">{mech.tagline}</p>
            <FactorList factors={mech.factors} />
            <dl className="facts">
              <div><dt>Odporność na phishing</dt><dd className={`pr-${mech.facts.phishingResistant}`}>{mech.facts.phishingResistant}</dd></div>
              <div><dt>NIST</dt><dd>{mech.facts.aal}</dd></div>
              <div><dt>PSD2</dt><dd>{mech.facts.psd2}</dd></div>
            </dl>
            <p className="analogy">{mech.analogy}</p>
          </section>
        </aside>
      )}

      {!diagramOnly && (
        <footer className="transport">
          <button className="t-btn" onClick={prevStep} aria-label="Poprzedni krok (←)">
            <svg viewBox="0 0 20 20"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg>
          </button>
          <button className="t-btn t-play" onClick={() => !needsBet && clock.toggle()} aria-label={playing ? 'Pauza (spacja)' : 'Odtwarzaj (spacja)'}>
            {playing ? (
              <svg viewBox="0 0 20 20"><path d="M7 4.5v11M13 4.5v11" /></svg>
            ) : (
              <svg viewBox="0 0 20 20"><path d="M7 4.5 15 10l-8 5.5z" /></svg>
            )}
          </button>
          <button className="t-btn" onClick={nextStep} aria-label="Następny krok (→)">
            <svg viewBox="0 0 20 20"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>
          </button>
          <Scrubber clock={clock} tl={tl} />
          <span className="t-count">
            {curIndex < 0 ? '—' : curIndex + 1}/{tl.steps.length}
          </span>
          <button className="t-speed" onClick={() => setSpeed((s) => (s === 1 ? 0.5 : s === 0.5 ? 1.5 : 1))} aria-label="Prędkość">
            {speed === 1 ? '1×' : speed === 0.5 ? '0,5×' : '1,5×'}
          </button>
        </footer>
      )}

      {help && <HelpOverlay onClose={() => setHelp(false)} />}
    </div>
  );
}

/** Scena subskrybuje czas co klatkę; reszta Explorera nie renderuje się przy każdej klatce. */
function LiveStage({
  clock, tl, view, width, height, reduced, diagramOnly,
}: { clock: Clock; tl: Timeline; view: 'scena' | 'sekwencja'; width: number; height: number; reduced: boolean; diagramOnly: boolean }) {
  const t = useClockValue(clock, (c) => c.t);
  return view === 'scena' ? (
    <IsoStage tl={tl} t={t} width={width} height={height} reduced={reduced} insetTop={diagramOnly ? 130 : 116} gpu />
  ) : (
    <SeqStage tl={tl} t={t} width={width} height={height} insetTop={diagramOnly ? 120 : 108} />
  );
}

function Scrubber({ clock, tl }: { clock: Clock; tl: Timeline }) {
  const t = useClockValue(clock, (c) => c.t);
  const frac = t / tl.total;
  const fromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    clock.seek(((e.clientX - r.left) / r.width) * tl.total);
  };
  return (
    <div
      className="scrubber"
      role="slider"
      aria-label="Oś czasu"
      aria-valuemin={0}
      aria-valuemax={Math.round(tl.total)}
      aria-valuenow={Math.round(t)}
      tabIndex={-1}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromEvent(e); }}
      onPointerMove={(e) => { if (e.buttons & 1) fromEvent(e); }}
    >
      <div className="scrub-track" />
      <div className="scrub-fill" style={{ transform: `scaleX(${frac})` }} />
      {tl.steps.map((s) => (
        <div key={s.step.id} className={`scrub-tick r-${s.step.result ?? 'none'}`} style={{ left: `${(s.end / tl.total) * 100}%` }} />
      ))}
      <div className="scrub-head-track" style={{ transform: `translateX(${frac * 100}%)` }}>
        <div className="scrub-head" />
      </div>
    </div>
  );
}

const KEYS: [string, string][] = [
  ['← →', 'poprzedni / następny krok'],
  ['Spacja', 'odtwarzaj / pauza'],
  ['A', 'następny wariant (Shift+A: poprzedni)'],
  ['V', 'scena / sekwencja'],
  ['1 – 0', 'wybór mechanizmu'],
  ['L', 'lista kroków'],
  ['D', 'sam arkusz'],
  ['F', 'pełny ekran'],
  ['T', 'motyw jasny / ciemny'],
  ['Ctrl+K', 'szukaj'],
  ['Esc', 'zamknij'],
];

function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="overlay" role="dialog" aria-label="Skróty klawiszowe" onClick={onClose}>
      <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
        <h2>Skróty klawiszowe</h2>
        <dl className="keys">
          {KEYS.map(([k, v]) => (
            <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>
          ))}
        </dl>
        <button className="overlay-close" onClick={onClose}>Zamknij</button>
      </div>
    </div>
  );
}
