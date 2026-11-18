import { memo, useMemo } from 'react';
import type { Actor, Channel, Step, Token, Tone } from '@content/types';
import { clamp, decayShake, easeInOutCubic, easeOutCubic, easeOutQuart, seg, spring } from '../engine/easing';
import { locate, stateBefore, STEP_SECONDS, type Timeline } from '../engine/timeline';
import { cameraAt, overview } from './camera';
import { Device, DEVICE_META } from './devices/Device';
import { iso, pathD, pointAt, polyLength, route, type Grid, type P } from './iso';

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
   * Kamera jako warstwa kompozytora (transform + will-change w trakcie jazdy): płynniej w przeglądarce.
   * Wyłączone w wideo, gdzie liczy się ostrość każdej klatki, nie koszt rysowania.
   */
  gpu?: boolean;
}

function centroid(actors: Actor[]): Grid {
  const n = actors.length || 1;
  return [actors.reduce((s, a) => s + a.at[0], 0) / n, actors.reduce((s, a) => s + a.at[1], 0) / n];
}

function routePoints(a: Actor, b: Actor, c: Grid): P[] {
  return route(a.at, b.at, c).map(([x, y]) => iso(x, y));
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

function TokenStack({ actor, tokens, enter, lift = 0 }: { actor: Actor; tokens: Token[]; enter: Map<string, number>; lift?: number }) {
  const g0 = iso(actor.at[0], actor.at[1], DEVICE_META[actor.kind].top);
  const g = { x: g0.x, y: g0.y - lift };
  return (
    <g>
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

export function IsoStage({ tl, t, width, height, reduced = false, textScale = 1, insetTop = 0, insetBottom = 0, gpu = false }: Props) {
  const cur = locate(tl, t);
  const innerH = Math.max(1, height - insetTop - insetBottom);
  const camInner = cameraAt(tl, cur, width / innerH, reduced);
  const k = camInner.h / innerH;
  const cam = { x: camInner.x, y: camInner.y - insetTop * k, w: camInner.w, h: camInner.h + (insetTop + insetBottom) * k };
  // Stały kadr bazowy (plan ogólny) — viewBox się nie zmienia, kamerę realizuje transformacja warstwy.
  const base = useMemo(() => {
    const o = overview(tl.actors, width / innerH);
    const ko = o.h / innerH;
    return { x: o.x, y: o.y - insetTop * ko, w: o.w, h: o.h + (insetTop + insetBottom) * ko };
  }, [tl, width, innerH, insetTop, insetBottom]);
  const zoom = base.w / cam.w;
  const s0 = width / base.w;
  const tx = -(cam.x - base.x) * s0 * zoom;
  const ty = -(cam.y - base.y) * s0 * zoom;
  const camMoving = gpu && !reduced && ((cur.index >= 0 && cur.p < 0.46) || (cur.t > tl.stepsEnd && cur.t < tl.stepsEnd + 1.5));
  const byId = useMemo(() => Object.fromEntries(tl.actors.map((a) => [a.id, a])), [tl]);
  const c = useMemo(() => centroid(tl.actors), [tl]);
  const links = useMemo(() => usedLinks(tl), [tl]);
  const order = useMemo(() => [...tl.actors].sort((a, b) => a.at[0] + a.at[1] - (b.at[0] + b.at[1])), [tl]);
  const routesLayer = useMemo(
    () => (
      <g className="routes">
        {links.map(([a, b]) => {
          if (!byId[a] || !byId[b]) return null;
          const hostile = byId[a].hostile || byId[b].hostile;
          return <path key={`${a}-${b}`} d={pathD(routePoints(byId[a], byId[b], c))} className={`route ${hostile ? 'route-hostile' : ''}`} />;
        })}
      </g>
    ),
    [links, byId, c],
  );

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

  const appear = (i: number) => (reduced ? clamp(t / 0.3) : spring(t - 0.15 - i * 0.07, 12, 0.75));

  // Bieżąca trasa
  let active: { pts: P[]; len: number } | null = null;
  if (step?.from && step.to && byId[step.from] && byId[step.to]) {
    const ptsL = routePoints(byId[step.from], byId[step.to], c);
    active = { pts: ptsL, len: polyLength(ptsL) };
  }

  // Poprzedni krok gaśnie płynnie na początku bieżącego (zamiast znikać skokowo).
  const prev = idx > 0 ? tl.steps[idx - 1].step : null;
  const fadeOut = reduced ? 0 : 1 - easeOutCubic(seg(p, 0, 0.22));
  let prevRoute: P[] | null = null;
  if (prev?.from && prev.to && byId[prev.from] && byId[prev.to] && fadeOut > 0) prevRoute = routePoints(byId[prev.from], byId[prev.to], c);
  // Miękki podskok odbiorcy przy przyjęciu wiadomości (lub aktora przy obliczeniu).
  const hopId = step ? (step.to ?? step.at) : undefined;
  const hop = !step || reduced ? 0 : Math.sin(Math.PI * (step.at ? seg(p, 0.6, 0.78) : seg(p, 0.74, 0.92))) * 7;

  const fs = textScale;
  const viewBox = `${base.x} ${base.y} ${base.w} ${base.h}`;

  return (
    <div className="stage-cam" style={{ width, height }}>
    <svg
      className="stage-svg"
      viewBox={viewBox}
      width={width}
      height={height}
      role="img"
      aria-label={`${tl.mech.name}: ${tl.variant.name}`}
      style={{
        transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${zoom.toFixed(5)})`,
        transformOrigin: '0 0',
        willChange: camMoving ? 'transform' : 'auto',
      }}
    >
      <Grid_ />
      {/* Trasy w tle */}
      {routesLayer}
      {/* Poprzednia trasa (wygaszanie) */}
      {prevRoute && prev && (
        <g className={`route-active ${toneClass(prev.msg?.tone)}`} opacity={fadeOut}>
          <path d={pathD(prevRoute)} className="route-draw" />
        </g>
      )}
      {/* Aktywna trasa */}
      {active && step && (
        <g className={`route-active ${toneClass(step.msg?.tone)}`}>
          <path
            d={pathD(active.pts)}
            className="route-draw"
            strokeDasharray={`${active.len} ${active.len}`}
            strokeDashoffset={active.len * (1 - easeOutQuart(seg(p, 0.06, 0.34)))}
          />
          <path d={pathD(active.pts)} className="route-flow" strokeDashoffset={-t * 60} opacity={seg(p, 0.25, 0.4) * (1 - seg(p, 0.85, 1))} />
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
          const i = tl.actors.indexOf(a);
          const k = appear(i);
          const g = iso(a.at[0], a.at[1]);
          const involved = step ? [step.from, step.to, step.at].includes(a.id) : false;
          return (
            <g
              key={a.id}
              transform={`translate(${g.x} ${g.y + (1 - k) * 26 - (a.id === hopId ? hop : 0)})`}
              opacity={clamp(k * 1.3)}
              className={`dev ${a.hostile ? 'hostile' : ''} ${involved ? 'is-involved' : ''}`}
            >
              <Device kind={a.kind} />
            </g>
          );
        })}
      </g>
      {/* Etykiety */}
      <g className="labels">
        {tl.actors.map((a, i) => {
          const g = iso(a.at[0], a.at[1]);
          const k = clamp(appear(i) * 1.2);
          return (
            <g key={a.id} transform={`translate(${g.x} ${g.y + 64})`} opacity={k} className={`label ${a.hostile ? 'hostile' : ''}`}>
              <LabelText label={a.label} note={a.note} fs={fs} />
            </g>
          );
        })}
      </g>
      {/* Ekrany (adres strony itp.) */}
      {tl.actors.map((a) => {
        const sc = screens[a.id];
        return sc ? <ScreenTag key={a.id} actor={a} text={sc.text} tone={sc.tone} k={clamp(appear(0) * 1.2)} /> : null;
      })}
      {/* Żetony */}
      {tl.actors.map((a) => (
        <TokenStack
          key={a.id}
          actor={a}
          tokens={tokens.filter((x) => x.at === a.id)}
          enter={enter.get(a.id) ?? new Map()}
          lift={screens[a.id] && DEVICE_META[a.kind].screen ? 46 : 0}
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
      {/* Pakiet */}
      {active && step?.msg && (() => {
        const travel = easeInOutCubic(seg(p, 0.3, 0.76));
        const pos = pointAt(active.pts, travel);
        const show = seg(p, 0.26, 0.34) * (1 - seg(p, 0.86, 0.98));
        if (show <= 0) return null;
        const trail = [0.035, 0.07, 0.105].map((d, i) => ({ q: pointAt(active!.pts, Math.max(0, easeInOutCubic(seg(p - d * 0.46, 0.3, 0.76)))), r: 4.6 - i * 1.1, o: 0.45 - i * 0.13 }));
        return (
          <g>
            {travel > 0.02 && travel < 0.98 &&
              trail.map((tr, i) => (
                <circle key={i} cx={tr.q.x} cy={tr.q.y} r={tr.r} className={`packet-dot ${toneClass(step.msg!.tone)}`} opacity={show * tr.o} />
              ))}
            <circle cx={pos.x} cy={pos.y} r={6} className={`packet-dot ${toneClass(step.msg.tone)}`} opacity={show} />
            <Pill x={pos.x} y={pos.y - 34} text={step.msg.label} tone={step.msg.tone} badge={CHANNEL_LABEL[step.msg.channel]} opacity={show} scale={fs} />
          </g>
        );
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
