// Generuje tabele LaTeX i bibliografię raportu z danych 03_content (nie edytować wyników ręcznie).
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mechanisms } from '../../03_content/data/index';
import { criteria, groupMean, profiles, scores, weighted } from '../../03_content/data/matrix';
import { sources } from '../../03_content/data/sources';
import type { Actor, Mechanism, Step } from '../../03_content/data/types';
import { resolveActors } from '../src/engine/timeline';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../06_report');
const gen = path.join(root, 'generated');
mkdirSync(gen, { recursive: true });

const esc = (s: string) =>
  s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
const num = (v: number) => v.toFixed(2).replace('.', ',');
const cite = (ids: string[]) => `\\cite{${ids.join(',')}}`;
const write = (name: string, body: string) => {
  writeFileSync(path.join(gen, name), `% Plik generowany: npm --prefix 04_app run gen:report — nie edytować ręcznie.\n${body}\n`, 'utf8');
  console.log(`generated/${name}`);
};
const groups = ['A', 'B', 'C', 'D'] as const;

// 1. Matryca ocen (mapa ciepła)
write(
  'matryca.tex',
  `\\begin{table}[p]
\\centering
\\caption{Matryca porównawcza KM2: oceny 1--5 (5 = najkorzystniej). Kolumny Ø to średnie grup kryteriów.}
\\label{tab:matryca}
\\scriptsize
\\setlength{\\tabcolsep}{2.6pt}
\\renewcommand{\\arraystretch}{1.35}
\\begin{tabular}{l${criteria.map(() => 'c').join('')}|cccc}
\\toprule
 & \\multicolumn{7}{c}{Bezpieczeństwo} & \\multicolumn{3}{c}{Wdrażalność} & \\multicolumn{4}{c}{UX} & \\multicolumn{4}{c|}{Zgodność} & \\multicolumn{4}{c}{Ø} \\\\
Mechanizm & ${criteria.map((c) => c.id).join(' & ')} & A & B & C & D \\\\
\\midrule
${mechanisms
  .map(
    (m) =>
      `${esc(m.name)} & ${criteria.map((c) => `\\sc${'abcde'[scores[m.id][c.id].v - 1]}{${scores[m.id][c.id].v}}`).join(' & ')} & ${groups.map((g) => num(groupMean(m.id, g))).join(' & ')} \\\\`,
  )
  .join('\n')}
\\bottomrule
\\end{tabular}

\\vspace{4pt}
\\begin{minipage}{0.92\\linewidth}\\scriptsize
${criteria.map((c) => `\\textbf{${c.id}} ${esc(c.name)}`).join('; ')}.
\\end{minipage}
\\end{table}`,
);

// 2. Ranking ważony
write(
  'ranking.tex',
  `\\begin{table}[ht]
\\centering
\\caption{Ranking ważony dla trzech profili relacji (średnia ważona średnich grup).}
\\label{tab:ranking}
\\small
\\begin{tabular}{r${profiles.map(() => 'lc').join('')}}
\\toprule
 & ${profiles.map((p) => `\\multicolumn{2}{c}{${esc(p.name)}}`).join(' & ')} \\\\
\\midrule
${mechanisms
  .map((_, i) =>
    `${i + 1} & ${profiles
      .map((p) => {
        const m = [...mechanisms].sort((a, b) => weighted(b.id, p) - weighted(a.id, p))[i];
        return `${esc(m.name)} & ${num(weighted(m.id, p))}`;
      })
      .join(' & ')} \\\\`,
  )
  .join('\n')}
\\midrule
Wagi A/B/C/D & ${profiles.map((p) => `\\multicolumn{2}{c}{${groups.map((g) => Math.round(p.weights[g] * 100)).join('/')}}`).join(' & ')} \\\\
\\bottomrule
\\end{tabular}
\\end{table}`,
);

// 3. Uzasadnienia ocen (longtable na mechanizm)
write(
  'uzasadnienia.tex',
  mechanisms
    .map(
      (m) => `\\subsection*{${m.num}. ${esc(m.name)}}
\\begingroup\\small
\\begin{longtable}{@{}p{0.2\\linewidth}c p{0.56\\linewidth}l@{}}
\\toprule
Kryterium & Ocena & Uzasadnienie & Źródła \\\\
\\midrule
\\endhead
${criteria
  .map((c) => {
    const s = scores[m.id][c.id];
    return `${c.id} ${esc(c.name)} & ${s.label ? `${esc(s.label)} (${s.v})` : s.v} & ${esc(s.why)} & ${cite(s.src)} \\\\`;
  })
  .join('\n')}
\\bottomrule
\\end{longtable}
\\endgroup`,
    )
    .join('\n\n'),
);

// 4. Przebiegi mechanizmów i ataków
const actorName = (actors: Actor[], id?: string) => esc(actors.find((a) => a.id === id)?.label ?? id ?? '');
const stepRow = (actors: Actor[], s: Step, i: number) => {
  const who = s.from && s.to ? `${actorName(actors, s.from)} $\\rightarrow$ ${actorName(actors, s.to)}` : actorName(actors, s.at);
  const what = s.msg ? `\\texttt{${esc(s.msg.label)}}` : s.calc ? `\\texttt{${esc(s.calc)}}` : '';
  return `${i + 1} & ${who} & ${what} & ${esc(s.caption)} \\\\`;
};
const flowTable = (m: Mechanism, variantIndex: number) => {
  const v = m.variants[variantIndex];
  const actors = resolveActors(m, v);
  return `\\begingroup\\footnotesize
\\begin{longtable}{@{}r p{0.2\\linewidth} p{0.24\\linewidth} p{0.46\\linewidth}@{}}
\\toprule
Nr & Kto $\\rightarrow$ do kogo & Wiadomość / obliczenie & Co się dzieje \\\\
\\midrule
\\endhead
${v.steps.map((s, i) => stepRow(actors, s, i)).join('\n')}
\\bottomrule
\\end{longtable}
\\endgroup`;
};
write(
  'przeplywy.tex',
  mechanisms
    .map((m) => {
      const attacks = m.variants.filter((v) => v.kind === 'atak');
      return `\\subsection{${esc(m.name)}${m.extension ? ' (rozszerzenie: kontekst polski)' : ''}}
\\label{sec:mech-${m.id}}
${esc(m.tagline)} Czynniki: ${m.factors.join(' + ')}. ${cite(m.sources)}

\\paragraph{Analogia.} ${esc(m.analogy)}

\\paragraph{Przebieg: ${esc(m.variants[0].name.toLowerCase())}.} ${esc(m.variants[0].summary)}
${flowTable(m, 0)}

\\paragraph{Warianty ataków.}
\\begin{description}
${attacks
  .map(
    (v) =>
      `\\item[${esc(v.name)}] ${esc(v.summary)} \\emph{Wynik: ${v.verdict ? esc(v.verdict.text) : ''}}`,
  )
  .join('\n')}
\\end{description}`;
    })
    .join('\n\n'),
);

// 5. Zastosowanie (rekomendacje)
write(
  'zastosowanie.tex',
  `\\begingroup\\small
\\begin{longtable}{@{}p{0.16\\linewidth} p{0.4\\linewidth} p{0.36\\linewidth}@{}}
\\caption{Najefektywniejsze zastosowanie i główne słabości mechanizmów.}\\label{tab:zastosowanie}\\\\
\\toprule
Mechanizm & Gdzie i po co & Główne słabości \\\\
\\midrule
\\endhead
${mechanisms.map((m) => `${esc(m.name)} & ${esc(m.facts.najlepiej)} & ${esc(m.facts.slabosci)} \\\\`).join('\n')}
\\bottomrule
\\end{longtable}
\\endgroup`,
);

// 6. Bibliografia
const bib = sources
  .map(
    (s) => `@online{${s.id},
  title = {${s.full.replace(/([&%#_])/g, '\\$1')}},
  url = {${s.url}},
  year = {${s.year}},
  urldate = {2026-11-18},
  note = {${s.type}; id ${s.id}},
}`,
  )
  .join('\n\n');
writeFileSync(path.join(root, 'zrodla.bib'), `% Plik generowany z 03_content/data/sources.ts\n${bib}\n`, 'utf8');
console.log('zrodla.bib');
