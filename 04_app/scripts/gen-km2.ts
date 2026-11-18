// Generuje 03_content/output/KM2-matryca.md z danych (nie edytować wyniku ręcznie).
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mechanisms } from '../../03_content/data/index';
import { criteria, groupMean, profiles, scores, weighted } from '../../03_content/data/matrix';
import { sourceById, sources } from '../../03_content/data/sources';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../../03_content/output/KM2-matryca.md');
const fmt = (v: number) => v.toFixed(2).replace('.', ',');
const GROUPS = { A: 'Bezpieczeństwo', B: 'Uniwersalność i wdrażalność', C: 'Funkcjonalność (UX)', D: 'Zgodność i dopasowanie' } as const;

const used = new Set<string>();
for (const m of mechanisms) for (const c of criteria) scores[m.id][c.id].src.forEach((s) => used.add(s));

let md = `# KM2 — Analiza porównawcza i matryca zagrożeń

**Projekt:** Analiza porównawcza mechanizmów uwierzytelniania · **Przedmiot:** Bezpieczne Transakcje Elektroniczne
**Kamień milowy:** KM2 (13.12) · Dokument generowany z \`03_content/data/matrix.ts\` (\`npm --prefix 04_app run gen:km2\`).

## 1. Metodyka

Każdy z ${mechanisms.length} mechanizmów oceniono w skali **1–5** (5 = najkorzystniej dla bezpieczeństwa i użytkownika) w ${criteria.length} kryteriach z KM1 §8.2. Każda ocena ma jednozdaniowe uzasadnienie i co najmniej jedno źródło z bazy KM1 (identyfikatory N/S/P/A/R/W) albo źródło uzupełniające (X), sprawdzone przed użyciem. Kryteria D1–D3 mają oprócz oceny wartość opisową (np. „AAL2”, „tak”).

Wynik zbiorczy dla relacji B2B / B2C / C2C to średnia ważona średnich grup kryteriów. Wagi:

| Profil | Bezpieczeństwo (A) | Wdrażalność (B) | UX (C) | Zgodność (D) | Uzasadnienie |
|---|---|---|---|---|---|
${profiles.map((p) => `| ${p.name} | ${p.weights.A * 100}% | ${p.weights.B * 100}% | ${p.weights.C * 100}% | ${p.weights.D * 100}% | ${p.desc} |`).join('\n')}

BLIK nie występuje w KM1 §8.1 — dodano go jako rozszerzenie o polski kontekst płatności.

## 2. Kryteria

| Id | Grupa | Kryterium | Opis |
|---|---|---|---|
${criteria.map((c) => `| ${c.id} | ${GROUPS[c.group]} | ${c.name} | ${c.desc} |`).join('\n')}

## 3. Matryca (oceny 1–5)

| Mechanizm | ${criteria.map((c) => c.id).join(' | ')} | Ø A | Ø B | Ø C | Ø D |
|---|${criteria.map(() => ':-:').join('|')}|:-:|:-:|:-:|:-:|
${mechanisms
  .map((m) => `| ${m.name} | ${criteria.map((c) => scores[m.id][c.id].v).join(' | ')} | ${(['A', 'B', 'C', 'D'] as const).map((g) => fmt(groupMean(m.id, g))).join(' | ')} |`)
  .join('\n')}

## 4. Matryca zagrożeń (grupa A) — skrót

Oceny odporności na wektory ataków; 1 = atak zwykle się udaje, 5 = mechanizm go blokuje.

| Mechanizm | ${criteria.filter((c) => c.group === 'A').map((c) => `${c.id} ${c.name}`).join(' | ')} |
|---|${criteria.filter((c) => c.group === 'A').map(() => ':-:').join('|')}|
${mechanisms.map((m) => `| ${m.name} | ${criteria.filter((c) => c.group === 'A').map((c) => scores[m.id][c.id].v).join(' | ')} |`).join('\n')}

## 5. Ranking ważony

${profiles
  .map((p) => {
    const ranked = [...mechanisms].sort((a, b) => weighted(b.id, p) - weighted(a.id, p));
    return `### ${p.name}\n\n| # | Mechanizm | Wynik | Dopasowanie (D4) |\n|---|---|:-:|---|\n${ranked.map((m, i) => `| ${i + 1} | ${m.name} | ${fmt(weighted(m.id, p))} | ${scores[m.id].D4.label} |`).join('\n')}`;
  })
  .join('\n\n')}

Ranking to średnia ważona. Wysoka pozycja BLIK-u czy biometrii w profilu B2B nie oznacza, że służą do logowania pracowników — o zastosowaniu mówią kolumna D4 i rozdział 7.

## 6. Uzasadnienia ocen

${mechanisms
  .map(
    (m) => `### ${m.num}. ${m.name}${m.extension ? ' (rozszerzenie)' : ''}

${m.tagline}

| Kryterium | Ocena | Uzasadnienie | Źródła |
|---|:-:|---|---|
${criteria.map((c) => { const s = scores[m.id][c.id]; return `| ${c.id} ${c.name} | ${s.label ? `${s.label} (${s.v})` : s.v} | ${s.why} | ${s.src.join(', ')} |`; }).join('\n')}`,
  )
  .join('\n\n')}

## 7. Najefektywniejsze zastosowanie

| Mechanizm | Gdzie i po co | Główne słabości | Odporność na phishing |
|---|---|---|---|
${mechanisms.map((m) => `| ${m.name} | ${m.facts.najlepiej} | ${m.facts.slabosci} | ${m.facts.phishingResistant} |`).join('\n')}

## 8. Źródła użyte w matrycy

${sources.filter((s) => used.has(s.id)).map((s) => `- **${s.id}** — ${s.full} (${s.year}). ${s.url}`).join('\n')}
`;

// Sprawdzenie: wszystkie źródła istnieją
for (const id of used) if (!sourceById[id]) throw new Error(`Brak źródła ${id}`);
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, md, 'utf8');
console.log(`Zapisano ${path.relative(process.cwd(), out)} (${md.length} znaków)`);
