import { memo } from 'react';
import type { ActorKind } from '@content/types';
import { IsoBox, IsoCylinder, IsoLine, IsoPoly, OnPlane } from './primitives';

/** Wysokość urządzenia (jednostki siatki) — nad nią stoją żetony; screen — kotwica ekranu (x, y, z). */
export const DEVICE_META: Record<ActorKind, { top: number; screen?: [number, number, number] }> = {
  osoba: { top: 1.05 },
  laptop: { top: 0.78, screen: [0, -0.3, 0.72] },
  telefon: { top: 0.86, screen: [0, 0.04, 0.84] },
  serwer: { top: 1.16 },
  baza: { top: 0.92 },
  bts: { top: 1.5 },
  karta: { top: 0.2 },
  terminal: { top: 0.5, screen: [0, -0.1, 0.5] },
  bank: { top: 1.05 },
  klucz: { top: 0.2 },
  chmura: { top: 1.05 },
  centrala: { top: 0.55 },
  chip: { top: 0.25 },
};

function Laptop() {
  return (
    <g>
      <IsoBox x={-0.5} y={-0.3} w={1} d={0.66} h={0.05} />
      <OnPlane plane="xy" at={[-0.5, -0.3, 0.05]}>
        {Array.from({ length: 4 }, (_, r) => (
          <line key={r} className="detail" x1={10} x2={90} y1={14 + r * 7} y2={14 + r * 7} />
        ))}
        <rect className="detail" x={34} y={46} width={32} height={14} fill="none" />
      </OnPlane>
      <IsoBox x={-0.5} y={-0.34} z={0.05} w={1} d={0.04} h={0.66} />
      <OnPlane plane="xz" at={[-0.5, -0.3, 0.71]}>
        <rect className="screen" x={5} y={5} width={90} height={56} />
      </OnPlane>
    </g>
  );
}

function Phone() {
  return (
    <g>
      <IsoBox x={-0.22} y={-0.04} w={0.44} d={0.08} h={0.86} />
      <OnPlane plane="xz" at={[-0.22, 0.04, 0.86]}>
        <rect className="screen" x={4} y={6} width={36} height={72} rx={3} />
      </OnPlane>
    </g>
  );
}

function Server() {
  return (
    <g>
      <IsoBox x={-0.36} y={-0.36} w={0.72} d={0.72} h={1.16} />
      <OnPlane plane="xz" at={[-0.36, 0.36, 1.16]}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect className="detail" x={8} y={10 + i * 26} width={56} height={16} fill="none" />
            <circle className="led" cx={60} cy={18 + i * 26} r={2.4} />
          </g>
        ))}
      </OnPlane>
      <OnPlane plane="yz" at={[0.36, -0.36, 1.16]}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} className="detail" x1={10} x2={62} y1={14 + i * 11} y2={14 + i * 11} />
        ))}
      </OnPlane>
    </g>
  );
}

function Database() {
  return <IsoCylinder cx={0} cy={0} r={0.42} h={0.9} rings={2} />;
}

function Person() {
  // Postać jako bryła: walec tułowia i kula głowy (kula = koło, bez perspektywy).
  return (
    <g>
      <IsoCylinder cx={0} cy={0} r={0.2} h={0.62} />
      <circle className="f-top" cx={0} cy={-0.62 * 100 - 26} r={17} />
    </g>
  );
}

function Tower() {
  const H = 150;
  return (
    <g>
      <IsoBox x={-0.2} y={-0.2} w={0.4} d={0.4} h={0.06} />
      <path className="detail stroke-main" fill="none" d={`M-18 -6 L-4 -${H} M18 -6 L4 -${H} M-4 -${H} L4 -${H}`} />
      {[0.2, 0.42, 0.62, 0.8].map((k, i) => {
        const y1 = -6 - k * (H - 6);
        const w1 = 18 - k * 14;
        const y2 = -6 - (k + 0.18) * (H - 6);
        const w2 = 18 - (k + 0.18) * 14;
        return <path key={i} className="detail" fill="none" d={`M${-w1} ${y1} L${w2} ${y2} M${w1} ${y1} L${-w2} ${y2}`} />;
      })}
      {[1, 2].map((i) => (
        <g key={i} className="detail" fill="none">
          <path d={`M${-10 - i * 9} ${-H + 4 - i * 6} a${12 + i * 9} ${12 + i * 9} 0 0 1 0 ${20 + i * 12}`} transform={`translate(0 0)`} />
          <path d={`M${10 + i * 9} ${-H + 4 - i * 6} a${12 + i * 9} ${12 + i * 9} 0 0 0 0 ${20 + i * 12}`} />
        </g>
      ))}
    </g>
  );
}

function Card() {
  return (
    <g>
      <IsoBox x={-0.45} y={-0.28} w={0.9} d={0.56} h={0.03} />
      <OnPlane plane="xy" at={[-0.45, -0.28, 0.03]}>
        <rect className="chip-face" x={12} y={18} width={16} height={13} rx={2} />
        <line className="detail" x1={12} x2={70} y1={44} y2={44} />
        <line className="detail" x1={12} x2={48} y1={50} y2={50} />
      </OnPlane>
    </g>
  );
}

function Terminal() {
  return (
    <g>
      <IsoBox x={-0.3} y={-0.4} w={0.6} d={0.8} h={0.42} />
      <OnPlane plane="xy" at={[-0.3, -0.4, 0.42]}>
        <rect className="screen" x={8} y={6} width={44} height={22} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} className="detail" x={10 + (i % 3) * 14} y={36 + Math.floor(i / 3) * 10} width={10} height={6} fill="none" />
        ))}
      </OnPlane>
    </g>
  );
}

function Bank() {
  return (
    <g>
      <IsoBox x={-0.6} y={-0.5} w={1.2} d={1} h={0.12} />
      {[-0.48, -0.18, 0.12, 0.42].map((x) => (
        <IsoBox key={x} x={x} y={0.32} z={0.12} w={0.08} d={0.08} h={0.6} />
      ))}
      <IsoBox x={-0.5} y={-0.4} z={0.12} w={1} d={0.68} h={0.6} />
      <IsoBox x={-0.62} y={-0.52} z={0.72} w={1.24} d={1.02} h={0.08} />
      <IsoPoly className="f-left" points={[[-0.62, 0.5, 0.8], [0.62, 0.5, 0.8], [0, 0.5, 1.05]]} />
      <IsoPoly className="f-top" points={[[-0.62, 0.5, 0.8], [0, 0.5, 1.05], [0, -0.52, 1.05], [-0.62, -0.52, 0.8]]} />
      <IsoPoly className="f-right" points={[[0.62, 0.5, 0.8], [0, 0.5, 1.05], [0, -0.52, 1.05], [0.62, -0.52, 0.8]]} />
    </g>
  );
}

function SecurityKey() {
  return (
    <g>
      <IsoBox x={-0.38} y={-0.12} w={0.76} d={0.24} h={0.07} />
      <OnPlane plane="xy" at={[-0.38, -0.12, 0.07]}>
        <circle className="chip-face" cx={42} cy={12} r={6.5} />
        <circle className="detail" cx={66} cy={12} r={4} fill="none" />
      </OnPlane>
      <IsoBox x={-0.6} y={-0.07} w={0.22} d={0.14} h={0.04} />
    </g>
  );
}

function Cloud() {
  return (
    <g transform="translate(0 -62)">
      <path
        className="f-top"
        d="M-52 18 C-74 18 -74 -10 -52 -10 C-50 -34 -16 -40 -4 -20 C6 -38 40 -34 40 -8 C62 -8 64 18 44 18 Z"
      />
      <path className="detail" fill="none" d="M-30 6 H24 M-20 -2 H10" />
    </g>
  );
}

function Switch() {
  return (
    <g>
      <IsoBox x={-0.55} y={-0.4} w={1.1} d={0.8} h={0.5} />
      <OnPlane plane="xz" at={[-0.55, 0.4, 0.5]}>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} className="detail" x={10 + i * 12} y={16} width={8} height={7} fill="none" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} className="led" cx={14 + i * 12} cy={34} r={1.8} />
        ))}
      </OnPlane>
    </g>
  );
}

function Chip() {
  return (
    <g>
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <IsoLine a={[-0.22 + i * 0.11, 0.3, 0.04]} b={[-0.22 + i * 0.11, 0.4, 0.0]} className="detail" />
          <IsoLine a={[0.3, -0.22 + i * 0.11, 0.04]} b={[0.4, -0.22 + i * 0.11, 0.0]} className="detail" />
        </g>
      ))}
      <IsoBox x={-0.3} y={-0.3} w={0.6} d={0.6} h={0.14} />
      <OnPlane plane="xy" at={[-0.3, -0.3, 0.14]}>
        <rect className="chip-face" x={18} y={18} width={24} height={24} />
      </OnPlane>
    </g>
  );
}

const DRAW: Record<ActorKind, () => React.ReactElement> = {
  osoba: Person,
  laptop: Laptop,
  telefon: Phone,
  serwer: Server,
  baza: Database,
  bts: Tower,
  karta: Card,
  terminal: Terminal,
  bank: Bank,
  klucz: SecurityKey,
  chmura: Cloud,
  centrala: Switch,
  chip: Chip,
};

/** Rysunek urządzenia nie zależy od czasu — memo, żeby nie przeliczać go co klatkę. */
export const Device = memo(function Device({ kind }: { kind: ActorKind }) {
  const D = DRAW[kind];
  return <D />;
});
