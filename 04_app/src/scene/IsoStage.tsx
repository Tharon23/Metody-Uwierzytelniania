import { memo, useMemo } from 'react';
import type { Actor, Channel, Step, Token, Tone } from '@content/types';
import { clamp, decayShake, easeOutCubic, easeOutQuart, seg, spring } from '../engine/easing';
import { locate, stateBefore, STEP_SECONDS, type Timeline } from '../engine/timeline';
import { cameraAt } from './camera';
import { actorVis, appearAt, centroidOf, drawK, laneIntro, lanePath, PHASE } from './choreo';
import { useFollowCamera } from './follow';
import { Device, DEVICE_META } from './devices/Device';
import { iso, partial, pathD, pointAt, tipAngle, type P } from './iso';

export const CHANNEL_LABEL: Record<Channel, string> = {
  tls: 'TLS',
  sms: 'SMS',
  nfc: 'NFC',
  usb: 'USB',
  push: 'push',
  czlowiek: 'człowiek',
  wewn: 'lokalnie',
  siec: 'sieć',
  pasek: 'pasek',
};

const toneClass = (t?: Tone) => `tone-${t ?? 'neutral'}`;
const MONO_W = 8.7; // przybliżona szerokość znaku Plex Mono 15px

interface Props {
  tl: Timeline;
  t: number;
  width: number;
  height: number;
  reduced?: boolean;
  /** Skala tekstu (autoplay/TV większa). */
  textScale?: number;
  /** Pas u góry (px) zajęty przez interfejs — kamera kadruje poniżej. */
  insetTop?: number;
  /** Pas u dołu (px), np. pod napisy w autoplay. */
  insetBottom?: number;
  /**
   * Na żywo w przeglądarce: kamera dojeżdża do kadru sprężyną (płynie przy skokach i przewijaniu).
   * Wyłączone w wideo, gdzie klatka musi być czystą funkcją czasu.
   */
  live?: boolean;
  /** Krok wskazany na liście: jego uczestnicy zostają wyraźni, reszta przygasa, trasa w podglądzie. */
  spot?: Step | null;
}

/** Grot strzałki: czubek w (0, 0), skierowany wzdłuż osi x. */
function Head({ at, angle, scale = 1, className }: { at: P; angle: number; scale?: number; className: string }) {
  if (scale <= 0.01) return null;
  return (
    <path
      d="M-9 -5.2 L0 0 L-9 5.2"
      className={className}
      transform={`translate(${at.x.toFixed(2)} ${at.y.toFixed(2)}) rotate(${angle.toFixed(2)}) scale(${scale.toFixed(3)})`}
    />
  );
}

/** Przerywany tor w tle; wysuwa się od nadawcy (f: 0–1), grot pojawia się na końcu. */
function Lane({ pts, f }: { pts: P[]; f: number }) {
  const end = pts[pts.length - 1];
  return (
    <>
      <path d={pathD(partial(pts, f))} className="lane" />
      <Head at={end} angle={tipAngle(pts)} scale={clamp((f - 0.9) * 10)} className="lane-head" />
    </>
  );
}

/** Pary aktorów połączone w tym wariancie (do rysowania tras w tle). */
function usedLinks(tl: Timeline): [string, string][] {
  const seen = new Set<string>();
  const out: [string, string][] = [];
  for (const { step } of tl.steps) {
    if (!step.from || !step.to) continue;
    const key = [step.from, step.to].sort().join('|');
    if (!seen.has(key)) {
      seen.add(key);
      out.push([step.from, step.to]);
    }
  }
  return out;
}

const LabelText = memo(function LabelText({ label, note, fs }: { label: string; note?: string; fs: number }) {
  return (
    <>
      <text textAnchor="middle" className="label-name" style={{ fontSize: 21 * fs }}>{label}</text>
      {note && (
        <text textAnchor="middle" y={22 * fs} className="label-note" style={{ fontSize: 15 * fs }}>{note}</text>
      )}
    </>
  );
});

const Grid_ = memo(function GridLayer() {
  const lines: React.ReactElement[] = [];
  for (let i = -14; i <= 22; i++) {
    const a = iso(i, -14);
    const b = iso(i, 22);
    const c = iso(-14, i);
    const d = iso(22, i);
    lines.push(<line key={`a${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />);
    lines.push(<line key={`b${i}`} x1={c.x} y1={c.y} x2={d.x} y2={d.y} />);
  }
  return <g className="iso-grid">{lines}</g>;
});

function Pill({ x, y, text, tone, badge, scale = 1, opacity = 1 }: { x: number; y: number; text: string; tone?: Tone; badge?: string; scale?: number; opacity?: number }) {
  const bw = badge ? badge.length * 8.4 + 14 : 0;
  const w = text.length * MONO_W + 24 + bw;
  const h = 30;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} className={`pill ${toneClass(tone)}`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} className="pill-bg" />
      {badge && (
        <>
          <text x={-w / 2 + 12} y={5} className="pill-badge">{badge}</text>
          <line x1={-w / 2 + bw + 4} x2={-w / 2 + bw + 4} y1={-8} y2={8} className="pill-sep" />
        </>
      )}
      <text x={-w / 2 + bw + 12} y={5} className="pill-text">{text}</text>
    </g>
  );
}

function TokenStack({ actor, tokens, enter, lift = 0, k: shown = 1 }: { actor: Actor; tokens: Token[]; enter: Map<string, number>; lift?: number; k?: number }) {
  if (shown <= 0.001) return null;
  const g0 = iso(actor.at[0], actor.at[1], DEVICE_META[actor.kind].top);
  const g = { x: g0.x, y: g0.y - lift };
  return (
    <g opacity={shown}>
      {tokens.map((tk, i) => {
        const k = enter.get(tk.label) ?? 1;
        const w = tk.label.length * 8.4 + 22;
        const y = g.y - 26 - i * 30;
        return (
          <g key={tk.label} transform={`translate(${g.x} ${y + (1 - k) * 14})`} opacity={clamp(k * 1.4)} className={`token ${toneClass(tk.tone)}`}>
            <rect x={-w / 2} y={-12} width={w} height={24} rx={4} className="token-bg" />
            <text y={4.5} textAnchor="middle" className="token-text">{tk.label}</text>
          </g>
        );
      })}
    </g>
  );
}

function Lock({ open }: { open?: boolean }) {
  return (
    <g className="lock" fill="none">
      <rect x={-6} y={-2} width={12} height={9} rx={1.5} />
      <path d={open ? 'M-3.5 -2 V-5 a3.5 3.5 0 0 1 7 0' : 'M-3.5 -2 V-4.5 a3.5 3.5 0 0 1 7 0 V-2'} />
    </g>
  );
}

function ScreenTag({ actor, text, tone, k }: { actor: Actor; text: string; tone?: Tone; k: number }) {
  const meta = DEVICE_META[actor.kind];
  if (!meta.screen) return null;
  const s = iso(actor.at[0] + meta.screen[0], actor.at[1] + meta.screen[1], meta.screen[2]);
  const isDomain = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(text);
  const w = text.length * 10 + (isDomain ? 46 : 28);
  return (
    <g transform={`translate(${s.x} ${s.y - 34})`} opacity={k} className={`screen-tag ${toneClass(tone)}`}>
      <line x1={0} y1={14} x2={0} y2={30} className="leader" />
      <rect x={-w / 2} y={-16} width={w} height={30} rx={6} className="screen-tag-bg" />
      {isDomain && (
        <g transform={`translate(${-w / 2 + 18} -1)`}>
          <Lock />
        </g>
      )}
      <text x={-w / 2 + (isDomain ? 32 : 14)} y={5} className="screen-tag-text">{text}</text>
    </g>
  );
}

function ResultMark({ at, kind, k, tSince }: { at: P; kind: NonNullable<Step['result']>; k: number; tSince: number }) {
  if (k <= 0) return null;
  const r = 17;
  const cls = kind === 'ok' ? 'tone-ok' : kind === 'warn' ? 'tone-warn' : kind === 'blocked' ? 'tone-attack' : 'tone-attack';
  const draw = easeOutQuart(k);
  const shake = kind === 'blocked' ? decayShake(tSince, 5) : 0;
  const glyph =
    kind === 'ok'
      ? 'M-7 0.5 L-2 5.5 L7.5 -5'
      : kind === 'warn'
        ? 'M0 -7 V2 M0 6.5 V7'
        : kind === 'blocked'
          ? 'M-6 -6 L6 6 M6 -6 L-6 6'
          : 'M-7 -3 L0 4 L7 -3 M0 4 V-8';
  return (
    <g transform={`translate(${at.x + shake} ${at.y}) scale(${0.6 + 0.4 * spring(tSince, 16, 0.6)})`} className={`result ${cls}`}>
      <circle r={r} className="result-bg" />
      <circle r={r} className="result-ring" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
      <path d={glyph} className="result-glyph" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - easeOutCubic(seg(k, 0.3, 1))} />
    </g>
  );
}

function Callout({ at, text, k, active }: { at: P; text: string; k: number; active: boolean }) {
  if (k <= 0) return null;
  const w = text.length * MONO_W + 30;
  const x = at.x - w / 2;
  const y = at.y - 58;
  const shown = Math.round(text.length * clamp(k * 1.25));
  return (
    <g className={`callout ${active ? 'is-active' : ''}`} opacity={clamp(k * 3)}>
      <line x1={at.x} y1={at.y - 4} x2={at.x} y2={y + 30} className="leader" />
      <rect x={x} y={y - 2} width={w} height={32} rx={3} className="callout-bg" />
      <text x={x + 15} y={y + 19} className="callout-text">{text.slice(0, shown)}</text>
    </g>
  );
}

export function IsoStage({ tl, t, width, height, reduced = false, textScale = 1, insetTop = 0, insetBottom = 0, live = false, spot = null }: Props) {
  const spotIds = spot ? new Set([spot.from, spot.to, spot.at, ...(spot.focus ?? [])].filter(Boolean) as string[]) : null;
  const dimmed = (id: string) => (spotIds && !spotIds.has(id) ? 'spot is-dim' : 'spot');
  const cur = locate(tl, t);
  const innerH = Math.max(1, height - insetTop - insetBottom);
  const camInner = useFollowCamera(cameraAt(tl, cur, width / innerH, reduced), live && !reduced, tl);
  const k = camInner.h / innerH;
  // Kamera = viewBox: wektor rysowany na nowo w każdej klatce, zawsze ostry (bez rastrowania warstwy).
  const cam = { x: camInner.x, y: camInner.y - insetTop * k, w: camInner.w, h: camInner.h + (insetTop + insetBottom) * k };
  const byId = useMemo(() => Object.fromEntries(tl.actors.map((a) => [a.id, a])), [tl]);
  const c = useMemo(() => centroidOf(tl.actors), [tl]);
  const order = useMemo(() => [...tl.actors].sort((a, b) => a.at[0] + a.at[1] - (b.at[0] + b.at[1])), [tl]);
  // Każda para połączonych aktorów ma dwa tory: tam (a → b) i z powrotem (b → a).
  const lanes = useMemo(
    () =>
      usedLinks(tl)
        .filter(([a, b]) => byId[a] && byId[b])
        .map(([a, b]) => ({ a, b, ab: lanePath(byId[a], byId[b], c), ba: lanePath(byId[b], byId[a], c), hostile: !!(byId[a].hostile || byId[b].hostile) })),
    [tl, byId, c],
  );
  const laneFor = (from: string, to: string): P[] => {
    const l = lanes.find((x) => (x.a === from && x.b === to) || (x.a === to && x.b === from));
    return l ? (l.a === from ? l.ab : l.ba) : lanePath(byId[from], byId[to], c);
  };
  const appearTimes = useMemo(() => Object.fromEntries(tl.actors.map((a) => [a.id, appearAt(tl, a)])), [tl]);
  // Aktor pojawia się, gdy kamera odsłania go w ujęciu otwierającym (sprężyna: lekkie wyjście w górę).
  const appearK = (id: string) => (reduced ? clamp(t / 0.3) : spring(t - (appearTimes[id] ?? 0), 12, 0.75));
  // Aktorzy spoza bieżącego kroku rozpływają się; odbiorca wchodzi, gdy strzałka rusza w drogę.
  const vis: Record<string, number> = Object.fromEntries(tl.actors.map((a) => [a.id, actorVis(tl, cur, a.id)]));
  const shown = (id: string) => clamp(appearK(id) * 1.2) * (vis[id] ?? 1);

  const idx = cur.index;
  const state = stateBefore(tl, Math.max(0, idx));
  const ts = idx >= 0 ? tl.steps[idx] : null;
  const step = ts?.step;
  const p = cur.p;
  const secondsIn = ts ? p * (ts.end - ts.start) : 0;
  const stepLen = ts ? ts.end - ts.start : STEP_SECONDS;

  // Żetony i ekrany z bieżącego kroku pojawiają się na jego końcu.
  const enter = new Map<string, Map<string, number>>();
  const tokens = [...state.tokens];
  const screens = { ...state.screens };
  if (step) {
    const kEnd = reduced ? (p >= 0.8 ? 1 : 0) : spring(Math.max(0, secondsIn - stepLen * 0.78), 13, 0.7);
    for (const tk of step.gives ?? []) {
      if (secondsIn > stepLen * 0.78) {
        tokens.push(tk);
        if (!enter.has(tk.at)) enter.set(tk.at, new Map());
        enter.get(tk.at)!.set(tk.label, kEnd);
      }
    }
    for (const sc of step.shows ?? []) if (p > 0.78) screens[sc.at] = sc;
  }


  // Bieżąca strzałka: rysuje się torem swojego kierunku, grot prowadzi linię.
  let active: P[] | null = null;
  if (step?.from && step.to && byId[step.from] && byId[step.to]) active = laneFor(step.from, step.to);
  const travel = active ? drawK(p) : 0;

  // Poprzedni krok gaśnie płynnie na początku bieżącego (zamiast znikać skokowo).
  const prev = idx > 0 ? tl.steps[idx - 1].step : null;
  const fadeOut = 1 - easeOutCubic(seg(p, 0, 0.22));
  let prevRoute: P[] | null = null;
  if (prev?.from && prev.to && byId[prev.from] && byId[prev.to] && fadeOut > 0) prevRoute = laneFor(prev.from, prev.to);
  // Miękki podskok odbiorcy przy przyjęciu wiadomości (lub aktora przy obliczeniu).
  const hopId = step ? (step.to ?? step.at) : undefined;
  const hop = !step || reduced ? 0 : Math.sin(Math.PI * (step.at ? seg(p, 0.6, 0.78) : seg(p, 0.74, 0.92))) * 7;

  const fs = textScale;
  const viewBox = `${cam.x.toFixed(2)} ${cam.y.toFixed(2)} ${cam.w.toFixed(2)} ${cam.h.toFixed(2)}`;

  return (
    <div className="stage-cam" style={{ width, height }}>
    <svg
      className="stage-svg"
      viewBox={viewBox}
      width={width}
      height={height}
      role="img"
      aria-label={`${tl.mech.name}: ${tl.variant.name}`}
    >
      <Grid_ />
      {/* Tory w tle: po dwa na parę (tam i z powrotem), wysuwają się po wejściu obu końców */}
      <g className="lanes">
        {lanes.map((l) => {
          const k = Math.min(vis[l.a] ?? 1, vis[l.b] ?? 1);
          const f = laneIntro(tl, byId[l.a], byId[l.b], t, reduced);
          if (k <= 0.01 || f <= 0.001) return null;
          return (
            <g key={`${l.a}-${l.b}`} className={`lane-pair ${l.hostile ? 'is-hostile' : ''}`} opacity={k}>
              <Lane pts={l.ab} f={f} />
              <Lane pts={l.ba} f={f} />
            </g>
          );
        })}
      </g>
      {/* Podgląd trasy kroku wskazanego na liście */}
      {spot?.from && spot.to && byId[spot.from] && byId[spot.to] && (vis[spot.from] ?? 0) > 0.5 && (vis[spot.to] ?? 0) > 0.5 && (
        <path d={pathD(laneFor(spot.from, spot.to))} className={`route-preview ${toneClass(spot.msg?.tone)}`} />
      )}
      {/* Poprzednia strzałka (wygaszanie) */}
      {prevRoute && prev && (
        <g className={`route-active ${toneClass(prev.msg?.tone)}`} opacity={fadeOut}>
          <path d={pathD(prevRoute)} className="route-draw" />
          <Head at={prevRoute[prevRoute.length - 1]} angle={tipAngle(prevRoute)} className="route-head" />
        </g>
      )}
      {/* Bieżąca strzałka: linia rysuje się za grotem */}
      {active && step && travel > 0 && (
        <g className={`route-active ${toneClass(step.msg?.tone)}`}>
          <path d={pathD(partial(active, travel))} className="route-draw" />
          <Head
            at={pointAt(active, travel)}
            angle={tipAngle(partial(active, Math.max(travel, 0.002)))}
            scale={clamp(travel * 12)}
            className="route-head"
          />
        </g>
      )}
      {/* Pierścień przyjęcia (pod urządzeniem) */}
      {step && p > 0.72 && (() => {
        const target = byId[step.to ?? step.at ?? ''];
        if (!target) return null;
        const g = iso(target.at[0], target.at[1]);
        const k = seg(p, 0.72, 1);
        return (
          <ellipse
            cx={g.x}
            cy={g.y}
            rx={40 + 70 * easeOutCubic(k)}
            ry={(40 + 70 * easeOutCubic(k)) * 0.577}
            className={`arrive ${toneClass(step.result === 'breach' || step.result === 'blocked' ? 'attack' : step.msg?.tone)}`}
            opacity={(1 - k) * 0.9}
          />
        );
      })()}
      {/* Urządzenia */}
      <g className="devices">
        {order.map((a) => {
          const k = appearK(a.id);
          const v = vis[a.id] ?? 1;
          if (v <= 0.002) return null;
          const g = iso(a.at[0], a.at[1]);
          const involved = step ? [step.from, step.to, step.at].includes(a.id) : false;
          return (
            <g
              key={a.id}
              transform={`translate(${g.x} ${(g.y + (1 - k) * 26 + (1 - v) * 16 - (a.id === hopId ? hop : 0)).toFixed(2)})`}
              opacity={clamp(k * 1.3) * v}
              className={`dev ${a.hostile ? 'hostile' : ''} ${involved ? 'is-involved' : ''}`}
            >
              <g className={dimmed(a.id)}>
                <Device kind={a.kind} />
              </g>
            </g>
          );
        })}
      </g>
      {/* Etykiety */}
      <g className="labels">
        {tl.actors.map((a) => {
          const g = iso(a.at[0], a.at[1]);
          const k = shown(a.id);
          if (k <= 0.002) return null;
          return (
            <g key={a.id} transform={`translate(${g.x} ${g.y + 64})`} opacity={k} className={`label ${a.hostile ? 'hostile' : ''}`}>
              <g className={dimmed(a.id)}>
                <LabelText label={a.label} note={a.note} fs={fs} />
              </g>
            </g>
          );
        })}
      </g>
      {/* Ekrany (adres strony itp.) */}
      {tl.actors.map((a) => {
        const sc = screens[a.id];
        return sc && shown(a.id) > 0.002 ? <ScreenTag key={a.id} actor={a} text={sc.text} tone={sc.tone} k={shown(a.id)} /> : null;
      })}
      {/* Żetony */}
      {tl.actors.map((a) => (
        <TokenStack
          key={a.id}
          actor={a}
          tokens={tokens.filter((x) => x.at === a.id)}
          enter={enter.get(a.id) ?? new Map()}
          lift={screens[a.id] && DEVICE_META[a.kind].screen ? 46 : 0}
          k={shown(a.id)}
        />
      ))}
      {/* Obliczenie poprzedniego kroku (wygaszanie) */}
      {prev?.calc && fadeOut > 0 && (() => {
        const host = byId[prev.at ?? prev.to ?? ''];
        if (!host) return null;
        const top = iso(host.at[0], host.at[1], DEVICE_META[host.kind].top);
        const stack = state.tokens.filter((x) => x.at === host.id).length;
        const lift = screens[host.id] && DEVICE_META[host.kind].screen ? 46 : 0;
        return (
          <g opacity={fadeOut}>
            <Callout at={{ x: top.x, y: top.y - 10 - stack * 30 - lift }} text={prev.calc} k={1} active={false} />
          </g>
        );
      })()}
      {/* Obliczenie lokalne */}
      {step?.calc && (() => {
        const host = byId[step.at ?? step.to ?? ''];
        if (!host) return null;
        const top = iso(host.at[0], host.at[1], DEVICE_META[host.kind].top);
        const stack = tokens.filter((x) => x.at === host.id).length;
        const lift = screens[host.id] && DEVICE_META[host.kind].screen ? 46 : 0;
        const g = { x: top.x, y: top.y - 10 - stack * 30 - lift };
        const k = step.at ? seg(p, 0.12, 0.7) : seg(p, 0.75, 1);
        return <Callout at={g} text={step.calc} k={k} active />;
      })()}
      {/* Etykieta wiadomości jedzie nad grotem strzałki */}
      {active && step?.msg && (() => {
        const pos = pointAt(active, travel);
        const show = easeOutCubic(seg(p, PHASE.draw[0] - 0.04, PHASE.draw[0] + 0.05)) * (1 - seg(p, 0.86, 0.98));
        if (show <= 0) return null;
        return <Pill x={pos.x} y={pos.y - 34 - (1 - show) * 8} text={step.msg.label} tone={step.msg.tone} badge={CHANNEL_LABEL[step.msg.channel]} opacity={show} scale={fs} />;
      })()}
      {/* Wynik poprzedniego kroku (wygaszanie) */}
      {prev?.result && fadeOut > 0 && (() => {
        const host = byId[prev.to ?? prev.at ?? ''];
        if (!host) return null;
        const g = iso(host.at[0], host.at[1], DEVICE_META[host.kind].top * 0.5);
        return (
          <g opacity={fadeOut}>
            <ResultMark at={{ x: g.x + 66, y: g.y }} kind={prev.result} k={1} tSince={5} />
          </g>
        );
      })()}
      {/* Wynik kroku */}
      {step?.result && (() => {
        const host = byId[step.to ?? step.at ?? ''];
        if (!host) return null;
        const g = iso(host.at[0], host.at[1], DEVICE_META[host.kind].top * 0.5);
        const start = step.at ? 0.62 : 0.8;
        const k = seg(p, start, Math.min(1, start + 0.18));
        return <ResultMark at={{ x: g.x + 66, y: g.y }} kind={step.result} k={k} tSince={secondsIn - start * stepLen} />;
      })()}
    </svg>
    </div>
  );
}
