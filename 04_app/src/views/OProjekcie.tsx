import { sources } from '@content/sources';
import { href } from '../router';
import { TopBar } from '../ui/TopBar';
import { Creators } from '../ui/Creators';

const GROUPS: [string, string][] = [
  ['N', 'Normy i regulacje'],
  ['S', 'Specyfikacje'],
  ['P', 'Publikacje naukowe'],
  ['A', 'Ataki i studia przypadków'],
  ['R', 'Raporty branżowe'],
  ['W', 'Wizualizacje i repozytoria'],
  ['X', 'Źródła uzupełniające (zweryfikowane w trakcie prac)'],
];

export function OProjekcie({ onToggleTheme }: { onToggleTheme: () => void }) {
  return (
    <div className="page">
      <TopBar onToggleTheme={onToggleTheme} />
      <main className="about">
        <h1>O projekcie</h1>
        <section>
          <p className="lede">
            „Jak się logujemy?” to część projektu zespołowego na przedmiot Bezpieczne Transakcje Elektroniczne (AGH): analizy porównawczej mechanizmów uwierzytelniania. Aplikacja pokazuje przebieg każdego mechanizmu, ataki na niego i matrycę porównawczą z oceną wg kryteriów z bazy źródłowej KM1.
          </p>
          <dl className="about-facts">
            <div><dt>Kod źródłowy</dt><dd><a href="https://github.com/Tharon23/Metody-Uwierzytelniania" target="_blank" rel="noreferrer">github.com/Tharon23/Metody-Uwierzytelniania</a></dd></div>
          </dl>
        </section>

        <Creators id="tworcy-o" />

        <section className="credit">
          <h2>Inspiracja</h2>
          <p>
            Język wizualny — izometryczna kreska, rytm animacji, układ „lista kroków · diagram · szczegóły”, skróty klawiszowe — jest inspirowany projektem{' '}
            <a href="https://protocol-explorer-alpha.vercel.app" target="_blank" rel="noreferrer">Protocol Explorer</a> autorstwa{' '}
            <a href="https://x.com/DilumSanjaya" target="_blank" rel="noreferrer">Diluma Sanjayi</a>. Nie kopiujemy kodu ani grafik: rysunki, animacje, treść i kod powstały od podstaw.
          </p>
        </section>

        <section>
          <h2>Jak czytać arkusze</h2>
          <ul className="about-list">
            <li>Każdy mechanizm to arkusz z wariantem normalnym i wariantami ataków. Przed atakiem aplikacja pyta, jak myślisz, że się skończy.</li>
            <li>Kolory niosą znaczenie: zielony — weryfikacja udana, bursztynowy — sekret w ruchu albo ryzyko, czerwony — atakujący i udany atak.</li>
            <li>Dane w przykładach są fikcyjne: bank to bank.example, fałszywa strona to bank.examp1e (cyfra 1 zamiast litery l). Kod TOTP na arkuszu 3 jest policzony naprawdę (RFC 6238).</li>
            <li>Przebiegi są uproszczone tam, gdzie pełny protokół zaciemniłby sedno; uproszczenia są opisane w objaśnieniach kroków.</li>
          </ul>
        </section>

        <section>
          <h2>Tryby</h2>
          <ul className="about-list">
            <li><a href={href({ name: 'explorer', mech: 'haslo' })}>Arkusze</a> — przeklikiwanie myszą i klawiaturą (<kbd>?</kbd> pokazuje skróty).</li>
            <li><a href={href({ name: 'autoplay' })}>Pokaz</a> — pętla na osobny ekran; adres z dopiskiem <code>?kiosk</code> blokuje wygaszanie ekranu i ukrywa kursor.</li>
            <li>Arkusze z dopiskiem <code>?idle=60</code> wracają do pokazu po minucie bezczynności (stoisko).</li>
          </ul>
        </section>

        <section className="sources">
          <h2>Źródła</h2>
          {GROUPS.map(([prefix, name]) => (
            <div key={prefix}>
              <h3>{name}</h3>
              <ol>
                {sources.filter((s) => s.id.startsWith(prefix)).map((s) => (
                  <li key={s.id}>
                    <span className="src-id">{s.id}</span>
                    <span>
                      {s.full} ({s.year}).{' '}
                      <a href={s.url} target="_blank" rel="noreferrer">link</a>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
