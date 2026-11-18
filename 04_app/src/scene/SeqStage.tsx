import type { Actor, Step, Tone } from '@content/types';
import { clamp, easeInOutCubic, easeOutCubic, seg, smoother, spring } from '../engine/easing';
import { locate, type Timeline } from '../engine/timeline';
import { CHANNEL_LABEL } from './IsoStage';

const toneClass = (t?: Tone) => `tone-${t ?? 'neutral'}`;

/** Przybliżone szerokości znaku (em): Plex Sans Condensed 600 i Plex Mono. */
const COND_W = 0.52;
const MONO_W = 0.6;

/** Dopasowanie tekstu do szerokości: jedna linia, a gdy za ciasno — dwie (podział na spacji najbliżej środka). */
function fitText(text: string, maxW: number, maxFs: number, minFs: number, charW: number): { lines: string[]; fs: number } {
  const one = Math.min(maxFs, maxW / (text.length * charW));
  if (one >= minFs || !text.includes(' ')) return { lines: [text], fs: Math.max(minFs, one) };
  const mid = text.length / 2;
  let cut = -1;
  for (let i = 0; i < text.length; i++) if (text[i] === ' ' && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i;
  const lines = [text.slice(0, cut), text.slice(cut + 1)];
  const longest = Math.max(...lines.map((l) => l.length));
  return { lines, fs: Math.max(minFs, Math.min(maxFs, maxW / (longest * charW))) };
}

interface Props {
  tl: Timeline;
  t: number;
  width: number;
  height: number;
  /** Pas u góry zajęty przez interfejs (przełącznik widoku, tabliczka). */
  insetTop?: number;
  /** Pas u dołu (np. werdykt) — treść przewija się nad nim. */
  insetBottom?: number;
  reduced?: boolean;
  /** Skala interfejsu (rem/16): diagram rysujemy w jednostkach projektu i skalujemy viewBoxem. */
  unit?: number;
  /** Wiersz wskazany na liście kroków (podświetlenie, jeśli już widoczny). */
  spotRow?: number | null;
}

/**
 * Diagram sekwencji: tory aktorów, a w nich wiadomości w kolejności kroków — ten sam czas co scena.
 * Wiadomości opadają w czasie (zapytanie w prawo-w dół, odpowiedź w lewo-w dół), więc przebieg
 * układa się w zygzak jak w podręcznikowym diagramie. Pokazujemy tylko kroki, które już się
 * zaczęły; nagłówek torów jest nieprzezroczysty, a treść chowa się pod nim z wygaszeniem.
 */
export function SeqStage({ tl, t, width: pxW, height: pxH, insetTop: pxTop = 0, insetBottom: pxBottom = 0, reduced = false, unit = 1, spotRow = null }: Props) {
  const cur = locate(tl, t);
  const width = pxW / unit;
  const height = pxH / unit;
  const insetTop = pxTop / unit;
  const insetBottom = pxBottom / unit;
  const actors = [...tl.actors].sort((a, b) => a.at[0] - b.at[0]);
  const n = actors.length;
  const gutter = 44;
  const padX = 10;
  const laneGap = (width - gutter - padX * 2) / Math.max(1, n);
  const laneX = (i: number) => gutter + padX + laneGap * (i + 0.5);
  const lane = Object.fromEntries(actors.map((a, i) => [a.id, i]));

  // Nagłówki: równe kolumny, tekst dopasowany do kolumny (bez nachodzenia na sąsiadów).
  // Ramka zawsze węższa niż kolumna; na wąskich ekranach dopuszczamy mniejszy tekst.
  const boxW = Math.max(laneGap * 0.8, laneGap - 12);
  const minName = clamp(laneGap / 9, 8, 12);
  const heads = actors.map((a) => ({
    a,
    name: fitText(a.label, boxW - 10, 17, minName, COND_W),
    note: a.note ? fitText(a.note, boxW - 8, 13.5, Math.min(10.5, minName), COND_W) : null,
  }));
  const headH = Math.max(...heads.map((h) => 18 + h.name.lines.length * h.name.fs * 1.15 + (h.note ? h.note.lines.length * h.note.fs * 1.2 + 4 : 0)));
  const headTop = insetTop + 8;
  const headBottom = headTop + headH;

  // Wiersze kroków.
  const bodyTop = headBottom + 34;
  // Po ostatnim kroku wiersze ściskają się, żeby nad werdyktem zmieścił się cały przebieg
  // (jak kamera sceny, która wraca do planu ogólnego).
  const endK = reduced ? (t > tl.stepsEnd ? 1 : 0) : smoother(seg(t - tl.stepsEnd, 0.15, 1.1));
  const nSteps = Math.max(1, tl.steps.length);
  const avail = Math.max(160, height - bodyTop - insetBottom - 32);
  const fitRows = Math.min(nSteps, 6.2) + (nSteps - Math.min(nSteps, 6.2)) * endK;
  const rowH = clamp(avail / fitRows, 66 - 24 * endK, 96);
  const slope = Math.min(34, rowH * 0.38);
  const labelSpace = Math.min(26, rowH * 0.36);
  const rowY = (i: number) => bodyTop + rowH * i;

  // Postęp ciągły (do przewijania i linii życia).
  const p = cur.p;
  const progress = cur.index < 0 ? -1 + smoother(seg(t, 0.4, 2.4)) * 0.4 : cur.index + easeInOutCubic(seg(p, 0, 0.35));
  // W trakcie rezerwujemy miejsce na następny wiersz; po ostatnim kroku już nie (cały przebieg nad werdyktem).
  const contentBottom = rowY(Math.max(0, progress + 1 - endK)) + 8;
  const viewBottom = height - insetBottom - 24;
  const off = Math.max(0, contentBottom - viewBottom);
  const lifeEnd = cur.index < 0 ? headBottom + 30 * smoother(seg(t, 0.6, 2.2)) : rowY(progress + 1 - endK) - rowH * 0.15 * (1 - endK);

  const visible = tl.steps.filter((s) => s.index <= cur.index);

  return (
    <svg className="stage-svg seq" viewBox={`0 0 ${width.toFixed(2)} ${height.toFixed(2)}`} width={pxW} height={pxH} role="img" aria-label={`Diagram sekwencji: ${tl.mech.name}`}>
      <defs>
        <linearGradient id="seq-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" className="seq-fade-stop" stopOpacity="1" />
          <stop offset="1" className="seq-fade-stop" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={`translate(0 ${(-off).toFixed(2)})`}>
        {/* Linie życia rosną razem z przebiegiem */}
        {actors.map((a, i) => (
          <line key={a.id} x1={laneX(i)} x2={laneX(i)} y1={headBottom} y2={lifeEnd} className={`lifeline ${a.hostile ? 'hostile' : ''}`} />
        ))}
        {spotRow !== null && spotRow <= cur.index && (
          <rect x={6} y={rowY(spotRow) - 4} width={width - 12} height={rowH - 6} rx={6} className="seq-spot-band" />
        )}
        {/* Pasek bieżącego kroku */}
        {cur.index >= 0 && !(t > tl.stepsEnd) && (
          <rect x={6} y={rowY(cur.index) - 4} width={width - 12} height={rowH - 6} rx={6} className="seq-now-band" opacity={clamp(seg(p, 0, 0.12))} />
        )}
        {visible.map(({ step, index }) => (
          <Row
            key={step.id}
            step={step}
            index={index}
            k={index < cur.index ? 1 : p}
            now={index === cur.index && t <= tl.stepsEnd}
            y={rowY(index)}
            slope={slope}
            labelSpace={labelSpace}
            lane={lane}
            laneX={laneX}
            laneGap={laneGap}
            width={width}
            reduced={reduced}
          />
        ))}
      </g>

      {/* Nagłówek torów: nieprzezroczysty, treść chowa się pod nim z wygaszeniem */}
      <rect x={0} y={0} width={width} height={headBottom + 6} className="seq-mask" />
      <rect x={0} y={headBottom + 6} width={width} height={30} fill="url(#seq-fade)" />
      {heads.map((h, i) => (
        <Head key={h.a.id} a={h.a} x={laneX(i)} y={headTop} w={boxW} h={headH} name={h.name} note={h.note} k={reduced ? 1 : spring(t - 0.15 - i * 0.09, 12, 0.8)} />
      ))}
    </svg>
  );
}

function Head({ a, x, y, w, h, name, note, k }: { a: Actor; x: number; y: number; w: number; h: number; name: { lines: string[]; fs: number }; note: { lines: string[]; fs: number } | null; k: number }) {
  const nameH = name.lines.length * name.fs * 1.15;
  const noteH = note ? note.lines.length * note.fs * 1.2 + 4 : 0;
  const top = y + (h - nameH - noteH) / 2;
  return (
    <g className={`seq-lane ${a.hostile ? 'hostile' : ''}`} opacity={clamp(k * 1.3)} transform={`translate(0 ${((1 - clamp(k)) * 10).toFixed(2)})`}>
      <rect x={x - w / 2} y={y} width={w} height={h} rx={5} className="seq-head" />
      {name.lines.map((l, i) => (
        <text key={i} x={x} y={top + name.fs * (0.9 + i * 1.15)} textAnchor="middle" className="seq-head-name" style={{ fontSize: name.fs }}>
          {l}
        </text>
      ))}
      {note?.lines.map((l, i) => (
        <text key={`n${i}`} x={x} y={top + nameH + 4 + note.fs * (0.9 + i * 1.2)} textAnchor="middle" className="seq-head-note" style={{ fontSize: note.fs }}>
          {l}
        </text>
      ))}
    </g>
  );
}

interface RowProps {
  step: Step;
  index: number;
  /** Postęp kroku 0–1 (1 dla kroków zakończonych). */
  k: number;
  now: boolean;
  y: number;
  slope: number;
  labelSpace: number;
  lane: Record<string, number>;
  laneX: (i: number) => number;
  laneGap: number;
  width: number;
  reduced: boolean;
}

function Row({ step, index, k, now, y, slope, labelSpace, lane, laneX, laneGap, width, reduced }: RowProps) {
  const enter = reduced ? 1 : easeOutCubic(seg(k, 0, 0.14));
  const tone = step.result === 'breach' ? 'attack' : step.msg?.tone;
  const y0 = y + labelSpace;
  const num = (
    <text x={14} y={y0 + slope / 2 + 5} className={`seq-num ${now ? 'is-now' : ''}`}>
      {index + 1}
    </text>
  );

  if (step.from && step.to && lane[step.from] !== undefined && lane[step.to] !== undefined) {
    const x1 = laneX(lane[step.from]);
    const x2 = laneX(lane[step.to]);
    const dir = Math.sign(x2 - x1) || 1;
    const dx = x2 - x1;
    const draw = reduced ? 1 : easeInOutCubic(seg(k, 0.1, 0.62));
    const tip = { x: x1 + dx * draw, y: y0 + slope * draw };
    const ang = Math.atan2(slope, dx);
    const headK = reduced ? 1 : spring((k - 0.6) * 4, 14, 0.55);
    const label = step.msg ? step.msg.label : step.title;
    const chan = step.msg ? CHANNEL_LABEL[step.msg.channel] : '';
    const maxW = Math.max(Math.abs(dx) * 1.5, laneGap * 1.2);
    const fs = clamp(maxW / ((label.length + chan.length + 1) * MONO_W), 12, 15);
    const textW = (label.length + chan.length + 1) * MONO_W * fs;
    const mid = clamp((x1 + x2) / 2, 44 + textW / 2, width - 8 - textW / 2);
    const labelK = reduced ? 1 : easeOutCubic(seg(k, 0.04, 0.32));
    const resultK = reduced ? (k > 0.8 ? 1 : 0) : spring((k - 0.74) * 4, 15, 0.6);
    return (
      <g className={`seq-msg ${now ? 'is-now' : 'is-done'} ${toneClass(tone)}`} opacity={enter} transform={`translate(0 ${((1 - enter) * 8).toFixed(2)})`}>
        {num}
        <circle cx={x1} cy={y0} r={3.5} className="seq-origin" />
        <line x1={x1} y1={y0} x2={tip.x} y2={tip.y} className="seq-arrow" />
        {draw > 0.02 && draw < 0.98 && <circle cx={tip.x} cy={tip.y} r={5.5} className="packet-dot" />}
        {headK > 0.01 && (
          <path
            d="M-12 -6 L0 0 L-12 6"
            className="seq-arrow-head"
            transform={`translate(${x2} ${y0 + slope}) rotate(${((ang * 180) / Math.PI).toFixed(2)}) scale(${clamp(headK, 0, 1.2).toFixed(3)})`}
          />
        )}
        <text x={mid} y={y0 - 9} textAnchor="middle" className="seq-label" style={{ fontSize: fs }} opacity={labelK} transform={`translate(0 ${((1 - labelK) * 5).toFixed(2)})`}>
          {label}
          {chan && <tspan className="seq-channel" dx={fs * 0.6}>{chan}</tspan>}
        </text>
        {step.result && resultK > 0.01 && <ResultGlyph x={x2 + dir * 24} y={y0 + slope} kind={step.result} k={resultK} />}
      </g>
    );
  }

  // Obliczenie lokalne: aktywacja na linii życia + opis obok (pisany znak po znaku).
  const at = step.at ?? step.to;
  if (!at || lane[at] === undefined) return null;
  const x = laneX(lane[at]);
  const text = step.calc ?? step.title;
  const fs = clamp((laneGap * 2.2) / (text.length * MONO_W), 12, 14);
  const w = text.length * MONO_W * fs + 24;
  const right = x + 16 + w < width - 8;
  const bx = right ? x + 16 : Math.max(46, x - 16 - w);
  const bar = reduced ? 1 : easeOutCubic(seg(k, 0.04, 0.4));
  const shown = reduced ? text.length : Math.round(text.length * clamp(seg(k, 0.15, 0.6)));
  const calcTone = step.result === 'blocked' || step.result === 'breach' ? 'attack' : step.result === 'ok' ? 'ok' : step.result === 'warn' ? 'warn' : 'neutral';
  const resultK = reduced ? (k > 0.7 ? 1 : 0) : spring((k - 0.66) * 4, 15, 0.6);
  return (
    <g className={`seq-calc ${now ? 'is-now' : 'is-done'} ${toneClass(calcTone)}`} opacity={enter}>
      {num}
      <rect x={x - 6} y={y0 - 8} width={12} height={(slope + 16) * bar} rx={3} className="seq-activation" />
      <g opacity={clamp(bar * 2)}>
        <rect x={bx} y={y0 + slope / 2 - 16} width={w} height={32} rx={4} className="seq-calc-box" />
        <text x={bx + 12} y={y0 + slope / 2 + 5} className="seq-calc-text" style={{ fontSize: fs }}>
          {text.slice(0, shown)}
        </text>
      </g>
      {step.result && resultK > 0.01 && <ResultGlyph x={right ? bx + w + 22 : bx - 22} y={y0 + slope / 2} kind={step.result} k={resultK} />}
    </g>
  );
}

function ResultGlyph({ x, y, kind, k }: { x: number; y: number; kind: 'ok' | 'warn' | 'blocked' | 'breach'; k: number }) {
  const d =
    kind === 'ok' ? 'M-6 0 L-2 4 L6 -4' : kind === 'warn' ? 'M0 -6 V2 M0 5.5 V6' : kind === 'blocked' ? 'M-5 -5 L5 5 M5 -5 L-5 5' : 'M-6 -3 L0 3 L6 -3';
  const cls = kind === 'ok' ? 'tone-ok' : kind === 'warn' ? 'tone-warn' : 'tone-attack';
  return (
    <g transform={`translate(${x} ${y}) scale(${(0.5 + 0.5 * k).toFixed(3)})`} className={`result ${cls}`} opacity={clamp(k * 2)}>
      <circle r={12} className="result-bg" />
      <circle r={12} className="result-ring" />
      <path d={d} className="result-glyph" />
    </g>
  );
}
