import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mechanisms, mechanismById } from '@content/index';
import type { Mechanism, Variant } from '@content/types';
import { buildTimeline, LEAD_SECONDS, locate, stepEndTime } from '../engine/timeline';
import { useClock, useClockValue, type Clock } from '../engine/clock';
import type { Timeline } from '../engine/timeline';
import { neighbor } from '../engine/order';
import { clamp, seg, smoother } from '../engine/easing';
import { useScramble } from '../ui/motion';
import type { Step } from '@content/types';
import { navigate } from '../router';
import { IsoStage, CHANNEL_LABEL } from '../scene/IsoStage';
import { SeqStage } from '../scene/SeqStage';
import { useReducedMotion, useSize, useUiScale } from '../ui/useSize';
import { useStoredFlag } from '../ui/prefs';
import { setReducedMotion, systemPrefersReduced, toggleReducedMotion } from '../ui/motionPref';
import { useSlider } from '../ui/useSlider';
import { TopBar } from '../ui/TopBar';
import { FactorList, OutcomeBadge } from '../ui/bits';

const FACTOR_SHEET = (m: Mechanism) => `${m.num}/${mechanisms.length}`;

/** Prędkości odtwarzania; 1× to tempo bazowe (PACE w timeline.ts). */
const SPEEDS = [0.5, 1, 1.5, 2] as const;
const SPEED_LABEL: Record<number, string> = { 0.5: '0,5×', 1: '1×', 1.5: '1,5×', 2: '2×' };

/** Autoodtwarzanie: ile czeka pytanie „Jak myślisz?” i ekran końca, zanim pokaz pójdzie dalej (s). */
const WAIT_BET_S = 30;
const WAIT_VERDICT_S = 20;
const WAIT_END_S = 10;

// Stan współdzielony między kolejnymi arkuszami w tej samej karcie (przeżywa zmianę wariantu).
/** Autoodtwarzanie włączone, dopóki ktoś nie zatrzyma (pauza, krok ręczny, przewijanie). */
let autoMode = true;
/** Gdzie ustawić nowy arkusz po nawigacji strzałkami: na początku czy po ostatnim kroku (cofanie). */
let pendingEntry: 'start' | 'end' = 'start';

/** Odliczanie w sekundach; wstrzymane, gdy `held` (np. kursor nad oknem). Po zerze — onDone raz. */
function useCountdown(active: boolean, seconds: number, held: boolean, onDone: () => void): number {
  const [left, setLeft] = useState(seconds);
  const done = useRef(onDone);
  done.current = onDone;
  const heldRef = useRef(held);
  heldRef.current = held;
  useEffect(() => {
    setLeft(seconds);
    if (!active) return;
    let remaining = seconds;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      if (!heldRef.current) remaining -= (now - last) / 1000;
      last = now;
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        window.clearInterval(id);
        done.current();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [active, seconds]);
  return left;
}

function Countdown({ left, total, label }: { left: number; total: number; label: string }) {
  return (
    <div className="countdown" aria-live="off">
      <span className="countdown-label">{label}</span>
      <span className="countdown-num">{Math.ceil(left)} s</span>
      <span className="countdown-bar" aria-hidden>
        <span style={{ transform: `scaleX(${left / total})` }} />
      </span>
    </div>
  );
}

export function Explorer({
  mechId, variantId, onToggleTheme, idleSeconds, initialT, initialView,
}: { mechId: string; variantId?: string; onToggleTheme: () => void; idleSeconds?: number; initialT?: number; initialView?: 'scena' | 'sekwencja' }) {
  const mech = mechanismById[mechId] ?? mechanisms[0];
  const variant: Variant = mech.variants.find((v) => v.id === variantId) ?? mech.variants[0];
  const [speed, setSpeed] = useState(1);
  const tl = useMemo(() => buildTimeline(mech, variant), [mech, variant]);
  const betKey = `${mech.id}/${variant.id}`;
  // Wejście „od końca” (cofanie strzałką z początku następnego arkusza) — ustalone raz na arkusz.
  const entry = useRef<{ key: string; at: 'start' | 'end' } | null>(null);
  if (entry.current?.key !== betKey) entry.current = { key: betKey, at: pendingEntry };
  const fromEnd = entry.current.at === 'end';
  const clock = useClock(tl.total, speed, betKey, initialT ?? (fromEnd ? tl.stepsEnd : undefined));
  const [auto, setAutoState] = useState(autoMode);
  const setAuto = useCallback((v: boolean) => {
    autoMode = v;
    setAutoState(v);
  }, []);
  // Panele subskrybują tylko wartości zmieniające się rzadko — co klatkę renderuje się wyłącznie scena.
  const curIndex = useClockValue(clock, (c) => locate(tl, c.t).index);
  const stepDone = useClockValue(clock, (c) => locate(tl, c.t).p >= 0.999);
  const playing = useClockValue(clock, (c) => c.playing);
  const atLead = useClockValue(clock, (c) => c.t < LEAD_SECONDS + 0.01);
  const finished = useClockValue(clock, (c) => c.t >= tl.stepsEnd + 0.2);
  const [stageRef, size] = useSize<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [showList, setShowList] = useStoredFlag('jsl-list', true);
  const [diagramOnly, setDiagramOnly] = useState(false);
  const [view, setView] = useState<'scena' | 'sekwencja'>(initialView ?? 'scena');
  const [bets, setBets] = useState<Record<string, number>>({});
  const [help, setHelp] = useState(false);
  /** Krok wskazany na liście: jego uczestnicy podświetlają się na scenie i w sekwencji. */
  const [spot, setSpot] = useState<number | null>(null);
  const tbName = useScramble(mech.name);
  const variantInd = useSlider<HTMLDivElement>(`${betKey}/${showList}`);
  const viewInd = useSlider<HTMLDivElement>(view);
  const betAnswer = bets[betKey];
  const needsBet = !!variant.bet && betAnswer === undefined && atLead && !playing;

  // Zmiana arkusza zachowuje ?idle (tryb wystawowy), żeby autoodtwarzanie nie gubiło powrotu do pokazu.
  const go = useCallback(
    (m: Mechanism, v?: Variant) => navigate({ name: 'explorer', mech: m.id, variant: v?.id }, idleSeconds ? { idle: String(idleSeconds) } : undefined, true),
    [idleSeconds],
  );
  const next = neighbor(mech, variant, 1);
  /** Następny / poprzedni arkusz w kolejności całej aplikacji (przez granice mechanizmów). */
  const goItem = useCallback(
    (dir: 1 | -1, at: 'start' | 'end') => {
      const n = neighbor(mech, variant, dir);
      pendingEntry = at;
      go(n.m, n.v);
    },
    [go, mech, variant],
  );
  useEffect(() => {
    pendingEntry = 'start';
  }, [betKey]);

  // Wejście na arkusz: ujęcie otwierające gra zawsze; dalej — tylko przy autoodtwarzaniu
  // i gdy nie czeka pytanie „Jak myślisz?”. ?t= (zrzuty) i wejście od końca zostają nieruchome.
  useEffect(() => {
    if (initialT !== undefined || fromEnd) return;
    if (autoMode && !(variant.bet && bets[betKey] === undefined)) clock.play();
    else clock.playTo(LEAD_SECONDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betKey]);

  const nextStep = useCallback(() => {
    if (needsBet) return;
    setAuto(false);
    // Po zakończonym przebiegu strzałka prowadzi dalej: następny wariant albo mechanizm.
    if (clock.t >= tl.stepsEnd + 0.05) {
      goItem(1, 'start');
      return;
    }
    const cur = locate(tl, clock.t);
    const target = cur.index < 0 ? 0 : cur.p >= 0.999 ? cur.index + 1 : cur.index;
    if (target >= tl.steps.length) clock.playTo(tl.total);
    else clock.playTo(stepEndTime(tl, target));
  }, [clock, goItem, needsBet, setAuto, tl]);

  // Krok wstecz: płynne przewinięcie (scena cofa się przez stany pośrednie), nie cięcie.
  // Z ujęcia otwierającego („krok 0”) — do poprzedniego arkusza, ustawionego po ostatnim kroku.
  const prevStep = useCallback(() => {
    setAuto(false);
    const cur = locate(tl, clock.t);
    if (cur.index < 0) {
      goItem(-1, 'end');
      return;
    }
    const target = clock.t > tl.stepsEnd + 1e-3 ? tl.stepsEnd : stepEndTime(tl, cur.index - 1);
    if (reduced) clock.seek(target);
    else clock.glideTo(target, 640);
  }, [clock, goItem, reduced, setAuto, tl]);

  const togglePlay = useCallback(() => {
    if (needsBet) return;
    if (clock.playing) {
      clock.pause();
      setAuto(false);
      return;
    }
    setAuto(true);
    if (clock.t >= tl.total - 1e-3) goItem(1, 'start');
    else clock.play();
  }, [clock, goItem, needsBet, setAuto, tl]);

  // Skok do dowolnego kroku: sąsiedni gra normalnie, dalszy — szybkie przewinięcie przez stany
  // pośrednie (kamera płynie), potem krok gra od początku.
  const jumpTo = useCallback(
    (i: number) => {
      setAuto(false);
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
        clock.glideTo(stepEndTime(tl, i - 1), 480);
        return;
      }
      if (reduced) {
        clock.seek(s.start + 0.001);
        clock.playTo(s.end);
        return;
      }
      const dist = Math.abs(i - Math.max(0, cur.index));
      clock.glideTo(s.start + 0.001, Math.min(1100, 420 + dist * 130), s.end);
    },
    [clock, reduced, setAuto, tl],
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

  // Autoodtwarzanie: pytanie i ekran końca czekają ograniczony czas, potem pokaz idzie dalej.
  const [hold, setHold] = useState(false);
  // ?t= to zamrożony kadr (zrzuty do raportu): bez odliczania i bez przechodzenia dalej.
  const frozen = initialT !== undefined;
  const betLeft = useCountdown(auto && !frozen && needsBet, WAIT_BET_S, hold, () => answer(-1));
  const endWait = variant.verdict ? WAIT_VERDICT_S : WAIT_END_S;
  const endLeft = useCountdown(auto && !frozen && finished && !playing, endWait, hold, () => goItem(1, 'start'));
  useEffect(() => setHold(false), [betKey, needsBet, finished]);

  // Klawiatura
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowRight') { e.preventDefault(); nextStep(); }
      else if (k === 'ArrowLeft') { e.preventDefault(); prevStep(); }
      else if (k === ' ') { e.preventDefault(); togglePlay(); }
      else if (k === 'Home') { setAuto(false); clock.glideTo(0, 520, LEAD_SECONDS); }
      else if (k === 'End') { setAuto(false); clock.pause(); clock.seek(tl.total); }
      else if (k === 'v' || k === 'V') setView((v) => (v === 'scena' ? 'sekwencja' : 'scena'));
      else if (k === 'a' || k === 'A') cycleVariant(e.shiftKey ? -1 : 1);
      else if (k === 'l' || k === 'L') setShowList((s) => !s);
      else if ((k === 'r' || k === 'R') && !e.repeat) toggleReducedMotion();
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
                  <button
                    onClick={() => !needsBet && jumpTo(s.index)}
                    onPointerEnter={() => setSpot(s.index)}
                    onPointerLeave={() => setSpot(null)}
                    onFocus={() => setSpot(s.index)}
                    onBlur={() => setSpot(null)}
                  >
                    <StepMark state={state} index={s.index} clock={clock} tl={tl} />
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
        <div className="stage" ref={stageRef}>
          <LiveStage
            clock={clock}
            tl={tl}
            view={view}
            width={size.width}
            height={size.height}
            reduced={reduced}
            diagramOnly={diagramOnly}
            spot={spot !== null ? (tl.steps[spot]?.step ?? null) : null}
            spotIndex={spot}
          />
        </div>

        <div className="title-block" aria-hidden>
          <div className="tb-name">{tbName}</div>
          <div className="tb-row"><span>Arkusz</span><b>{FACTOR_SHEET(mech)}</b></div>
          <div className="tb-row"><span>Wariant</span><b>{variant.name}</b></div>
        </div>

        {needsBet && variant.bet && (
          <div className="bet" role="dialog" aria-label="Jak myślisz?" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)}>
            <p className="bet-kicker">Jak myślisz?</p>
            <p className="bet-q">{variant.bet.question}</p>
            <div className="bet-options">
              {variant.bet.options.map((o, i) => (
                <button key={o} onClick={() => answer(i)}>
                  <kbd>{i + 1}</kbd> {o}
                </button>
              ))}
            </div>
            {auto && !frozen && <Countdown left={betLeft} total={WAIT_BET_S} label={hold ? 'Czekam na odpowiedź' : 'Bez odpowiedzi pokaz ruszy za'} />}
          </div>
        )}

        {finished && (
          <div
            className={`verdict ${variant.verdict ? `v-${variant.verdict.outcome}` : 'v-end'}`}
            role="status"
            key={betKey}
            onPointerEnter={() => setHold(true)}
            onPointerLeave={() => setHold(false)}
          >
            {variant.verdict ? (
              <>
                <OutcomeBadge outcome={variant.verdict.outcome} />
                <p>{variant.verdict.text}</p>
                {betAnswer !== undefined && variant.bet && (
                  <p className="verdict-bet">
                    {betAnswer === variant.bet.correct ? 'Dobrze obstawione.' : `Prawidłowa odpowiedź: „${variant.bet.options[variant.bet.correct]}”.`}
                  </p>
                )}
              </>
            ) : (
              <p className="verdict-end">Koniec przebiegu „{variant.name}”.</p>
            )}
            <div className="verdict-actions">
              <button onClick={() => { setAuto(false); clock.seek(0); clock.play(); }}>Powtórz</button>
              <button onClick={() => goItem(1, 'start')}>
                {next.m.id === mech.id ? `Dalej: ${next.v.name}` : `Dalej: ${next.m.name}`} <kbd>→</kbd>
              </button>
            </div>
            {auto && !frozen && !playing && <Countdown left={endLeft} total={endWait} label={hold ? 'Wstrzymane' : 'Następny arkusz za'} />}
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
          <button className={`t-btn t-play ${auto ? 'is-auto' : ''}`} onClick={togglePlay} aria-label={playing ? 'Pauza (spacja)' : 'Odtwarzaj (spacja)'} title={auto ? 'Autoodtwarzanie włączone — pauza zatrzymuje' : 'Odtwarzaj z autoodtwarzaniem'}>
            {playing ? (
              <svg viewBox="0 0 20 20"><path d="M7 4.5v11M13 4.5v11" /></svg>
            ) : (
              <svg viewBox="0 0 20 20"><path d="M7 4.5 15 10l-8 5.5z" /></svg>
            )}
          </button>
          <button className="t-btn" onClick={nextStep} aria-label="Następny krok (→)">
            <svg viewBox="0 0 20 20"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>
          </button>
          <Scrubber clock={clock} tl={tl} onUser={() => setAuto(false)} />
          <span className="t-count">
            {curIndex < 0 ? '—' : curIndex + 1}/{tl.steps.length}
          </span>
          <button
            className="t-speed"
            onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s as (typeof SPEEDS)[number]) + 1) % SPEEDS.length])}
            aria-label={`Prędkość ${SPEED_LABEL[speed]}`}
            title="Prędkość odtwarzania"
          >
            {SPEED_LABEL[speed]}
          </button>
        </footer>
      )}

      {help && <HelpOverlay onClose={() => setHelp(false)} />}
    </div>
  );
}

/**
 * Znacznik kroku na liście: zakończony — ptaszek, następny — numer, bieżący — numer w pierścieniu,
 * który wypełnia się z postępem kroku (widać, który krok właśnie się odtwarza i ile mu zostało).
 */
function StepMark({ state, index, clock, tl }: { state: 'done' | 'now' | 'next'; index: number; clock: Clock; tl: Timeline }) {
  return (
    <svg className="step-mark" viewBox="0 0 24 24" aria-hidden>
      <circle cx={12} cy={12} r={10.5} className="sm-track" />
      {state === 'done' ? (
        <path d="M7.4 12.4l3.1 3.1 6.2-6.6" className="sm-check" />
      ) : (
        <>
          {state === 'now' && <StepRing index={index} clock={clock} tl={tl} />}
          <text x={12} y={12.4} className="sm-num">{index + 1}</text>
        </>
      )}
    </svg>
  );
}

/** Pierścień postępu bieżącego kroku — jedyny element listy odświeżany w trakcie kroku. */
function StepRing({ index, clock, tl }: { index: number; clock: Clock; tl: Timeline }) {
  const p = useClockValue(clock, (c) => {
    const cur = locate(tl, c.t);
    return cur.index === index ? Math.round(cur.p * 150) / 150 : cur.index > index ? 1 : 0;
  });
  return (
    <circle
      cx={12}
      cy={12}
      r={10.5}
      className="sm-prog"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
      transform="rotate(-90 12 12)"
    />
  );
}

/** Scena subskrybuje czas co klatkę; reszta Explorera nie renderuje się przy każdej klatce. */
function LiveStage({
  clock, tl, view, width, height, reduced, diagramOnly, spot, spotIndex,
}: { clock: Clock; tl: Timeline; view: 'scena' | 'sekwencja'; width: number; height: number; reduced: boolean; diagramOnly: boolean; spot: Step | null; spotIndex: number | null }) {
  const t = useClockValue(clock, (c) => c.t);
  const ui = useUiScale();
  // Werdykt zasłania dół sceny: po ostatnim kroku kadr i diagram unoszą się nad nim.
  const bottom = smoother(seg(t - tl.stepsEnd, 0.15, 1.1)) * Math.min(190 * ui, height * 0.3);
  return view === 'scena' ? (
    <IsoStage tl={tl} t={t} width={width} height={height} reduced={reduced} insetTop={(diagramOnly ? 130 : 116) * ui} insetBottom={bottom} live spot={spot} />
  ) : (
    <SeqStage tl={tl} t={t} width={width} height={height} insetTop={(diagramOnly ? 120 : 108) * ui} insetBottom={bottom} reduced={reduced} unit={ui} spotRow={spotIndex} />
  );
}

function Scrubber({ clock, tl, onUser }: { clock: Clock; tl: Timeline; onUser: () => void }) {
  const t = useClockValue(clock, (c) => c.t);
  const frac = t / tl.total;
  // Podpowiedź nad osią: który krok jest w miejscu kursora.
  const [hover, setHover] = useState<number | null>(null);
  const tip = (() => {
    if (hover === null) return null;
    const c = locate(tl, hover * tl.total);
    return c.index < 0 ? 'Ujęcie otwierające' : `${c.index + 1}. ${tl.steps[c.index].step.title}`;
  })();
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
      onPointerDown={(e) => { onUser(); e.currentTarget.setPointerCapture(e.pointerId); fromEvent(e); }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setHover(clamp((e.clientX - r.left) / r.width));
        if (e.buttons & 1) fromEvent(e);
      }}
      onPointerLeave={() => setHover(null)}
    >
      {tip && hover !== null && (
        <div className="scrub-tip" style={{ left: `${hover * 100}%`, translate: `${-50 - (hover - 0.5) * 70}% 0` }}>
          {tip}
        </div>
      )}
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
  ['R', 'ruch pełny / ograniczony'],
  ['Ctrl+K', 'szukaj'],
  ['Esc', 'zamknij'],
];

function HelpOverlay({ onClose }: { onClose: () => void }) {
  const reduced = useReducedMotion();
  return (
    <div className="overlay" role="dialog" aria-label="Skróty klawiszowe" onClick={onClose}>
      <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
        <h2>Skróty klawiszowe</h2>
        <dl className="keys">
          {KEYS.map(([k, v]) => (
            <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>
          ))}
        </dl>
        <div className="motion-pref">
          <span>Ruch</span>
          <div className="seg" role="radiogroup" aria-label="Ruch">
            <button role="radio" aria-checked={!reduced} onClick={() => setReducedMotion(false)}>Pełny</button>
            <button role="radio" aria-checked={reduced} onClick={() => setReducedMotion(true)}>Ograniczony</button>
          </div>
          {systemPrefersReduced() && !reduced && (
            <p className="motion-note">System prosi o mniej ruchu. Aplikacja domyślnie gra pełne animacje, bo to one pokazują przebieg; tryb ograniczony zatrzymuje kamerę.</p>
          )}
        </div>
        <button className="overlay-close" onClick={onClose}>Zamknij</button>
      </div>
    </div>
  );
}
