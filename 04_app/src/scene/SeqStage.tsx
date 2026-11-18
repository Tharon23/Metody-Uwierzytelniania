import type { Tone } from '@content/types';
import { clamp, easeInOutCubic, easeOutQuart, seg } from '../engine/easing';
import { locate, type Timeline } from '../engine/timeline';
import { CHANNEL_LABEL } from './IsoStage';

const toneClass = (t?: Tone) => `tone-${t ?? 'neutral'}`;

/** Diagram sekwencji: tory aktorów, wiadomości w kolejności kroków. Ten sam czas co scena izometryczna. */
export function SeqStage({ tl, t, width, height, insetTop = 0 }: { tl: Timeline; t: number; width: number; height: number; insetTop?: number }) {
  const cur = locate(tl, t);
  // Tory w kolejności osi x siatki — tak jak aktorzy stoją na scenie (sortowanie stabilne).
  const actors = [...tl.actors].sort((a, b) => a.at[0] - b.at[0]);
  const n = actors.length;
  const marginX = Math.max(70, width * 0.06);
  const laneGap = (width - marginX * 2) / Math.max(1, n - 1);
  const laneX = (i: number) => (n === 1 ? width / 2 : marginX + laneGap * i);
  const lane = Object.fromEntries(actors.map((a, i) => [a.id, i]));
  const headerH = 96 + insetTop;
  const rowH = Math.max(58, Math.min(84, (height - headerH - 40) / Math.max(1, tl.steps.length)));
  const contentH = headerH + rowH * tl.steps.length + 50;
  const progress = cur.index < 0 ? -1 : cur.index + easeInOutCubic(seg(cur.p, 0, 0.3));
  const rowY = (i: number) => headerH + rowH * (i + 0.6);
  const maxOff = Math.max(0, contentH - height);
  const off = clamp(rowY(progress) - height * 0.55, 0, maxOff);

  return (
    <svg className="stage-svg seq" viewBox={`0 ${off} ${width} ${height}`} width={width} height={height} role="img" aria-label={`Diagram sekwencji: ${tl.mech.name}`}>
      {actors.map((a, i) => (
        <g key={a.id} className={`seq-lane ${a.hostile ? 'hostile' : ''}`}>
          <line x1={laneX(i)} x2={laneX(i)} y1={headerH - 8} y2={contentH} className="lifeline" />
          <g transform={`translate(${laneX(i)} ${Math.max(off, 0) + insetTop + 34})`}>
            <rect x={-Math.min(laneGap * 0.46, 120)} y={-24} width={Math.min(laneGap * 0.92, 240)} height={a.note ? 58 : 44} rx={4} className="seq-head" />
            <text textAnchor="middle" y={a.note ? 0 : 4} className="seq-head-name">{a.label}</text>
            {a.note && <text textAnchor="middle" y={21} className="seq-head-note">{a.note}</text>}
          </g>
        </g>
      ))}
      {tl.steps.map(({ step, index }) => {
        const y = rowY(index);
        const state = index < cur.index || (index === cur.index && cur.p >= 0.999) ? 'done' : index === cur.index ? 'now' : 'next';
        const k = state === 'done' ? 1 : state === 'now' ? cur.p : 0;
        const opacity = state === 'next' ? 0.16 : 1;
        const tone = step.result === 'breach' ? 'attack' : step.msg?.tone;
        const num = (
          <text x={18} y={y + 5} className={`seq-num is-${state}`}>
            {index + 1}
          </text>
        );
        if (step.from && step.to && lane[step.from] !== undefined && lane[step.to] !== undefined) {
          const x1 = laneX(lane[step.from]);
          const x2 = laneX(lane[step.to]);
          const dir = Math.sign(x2 - x1) || 1;
          const draw = state === 'next' ? 1 : easeOutQuart(seg(k, 0.05, 0.75));
          const xe = x1 + (x2 - x1) * draw;
          const label = step.msg ? `${step.msg.label}` : step.title;
          const mid = (x1 + x2) / 2;
          return (
            <g key={step.id} className={`seq-msg is-${state} ${toneClass(tone)}`} opacity={opacity}>
              {num}
              <line x1={x1} x2={xe} y1={y} y2={y} className="seq-arrow" />
              {draw > 0.98 && <path d={`M${x2 - dir * 12} ${y - 6} L${x2} ${y} L${x2 - dir * 12} ${y + 6}`} className="seq-arrow-head" />}
              {state === 'now' && k < 0.8 && <circle cx={xe} cy={y} r={5.5} className="packet-dot" />}
              <text x={mid} y={y - 12} textAnchor="middle" className="seq-label" opacity={state === 'next' ? 1 : clamp(seg(k, 0.1, 0.4) * 1.2)}>
                {label}
                {step.msg && <tspan className="seq-channel" dx={8}>{CHANNEL_LABEL[step.msg.channel]}</tspan>}
              </text>
              {step.result && state !== 'next' && k > 0.8 && <ResultGlyph x={x2 + dir * 22} y={y} kind={step.result} />}
            </g>
          );
        }
        const at = step.at ?? step.to;
        if (!at || lane[at] === undefined) return null;
        const x = laneX(lane[at]);
        const text = step.calc ?? step.title;
        const w = Math.min(text.length * 8.6 + 26, laneGap * 1.6 + 60);
        return (
          <g key={step.id} className={`seq-calc is-${state} ${toneClass(step.result === 'blocked' || step.result === 'breach' ? 'attack' : step.result === 'ok' ? 'ok' : step.result === 'warn' ? 'warn' : 'neutral')}`} opacity={opacity}>
            {num}
            <rect x={x - w / 2} y={y - 17} width={w} height={34} rx={4} className="seq-calc-box" opacity={state === 'now' ? clamp(k * 4) : 1} />
            <text x={x} y={y + 5} textAnchor="middle" className="seq-calc-text">{text}</text>
            {step.result && state !== 'next' && k > 0.7 && <ResultGlyph x={x + w / 2 + 22} y={y} kind={step.result} />}
          </g>
        );
      })}
    </svg>
  );
}

function ResultGlyph({ x, y, kind }: { x: number; y: number; kind: 'ok' | 'warn' | 'blocked' | 'breach' }) {
  const d =
    kind === 'ok' ? 'M-6 0 L-2 4 L6 -4' : kind === 'warn' ? 'M0 -6 V2 M0 5.5 V6' : kind === 'blocked' ? 'M-5 -5 L5 5 M5 -5 L-5 5' : 'M-6 -3 L0 3 L6 -3';
  const cls = kind === 'ok' ? 'tone-ok' : kind === 'warn' ? 'tone-warn' : 'tone-attack';
  return (
    <g transform={`translate(${x} ${y})`} className={`result ${cls}`}>
      <circle r={12} className="result-bg" />
      <circle r={12} className="result-ring" />
      <path d={d} className="result-glyph" />
    </g>
  );
}
