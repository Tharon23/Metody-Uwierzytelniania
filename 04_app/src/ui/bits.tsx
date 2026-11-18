import type { Factor, Verdict } from '@content/types';

const FACTOR_DESC: Record<Factor, string> = {
  wiedza: 'coś, co wiesz',
  posiadanie: 'coś, co masz',
  cecha: 'coś, czym jesteś',
};

export function FactorList({ factors }: { factors: Factor[] }) {
  return (
    <ul className="factors" aria-label="Czynniki uwierzytelniania">
      {(['wiedza', 'posiadanie', 'cecha'] as Factor[]).map((f) => (
        <li key={f} className={factors.includes(f) ? 'is-on' : ''}>
          <span className="factor-name">{f}</span>
          <span className="factor-desc">{FACTOR_DESC[f]}</span>
        </li>
      ))}
    </ul>
  );
}

const OUTCOME: Record<Verdict['outcome'], string> = {
  udany: 'Atak udany',
  zablokowany: 'Atak zablokowany',
  czesciowo: 'Atak częściowo udany',
};

export function OutcomeBadge({ outcome }: { outcome: Verdict['outcome'] }) {
  return <span className={`outcome o-${outcome}`}>{OUTCOME[outcome]}</span>;
}
