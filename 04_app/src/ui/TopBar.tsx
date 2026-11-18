import { useEffect, useRef, useState } from 'react';
import { mechanisms } from '@content/index';
import type { Mechanism } from '@content/types';
import { href, navigate } from '../router';
import { Mark } from './Mark';
import { useSlider } from './useSlider';

export function TopBar({ current, onToggleTheme, onHelp }: { current?: Mechanism; onToggleTheme: () => void; onHelp?: () => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navInd = useSlider<HTMLElement>(current?.id ?? '');

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);
  useEffect(() => {
    if (open) {
      setQ('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const results = mechanisms.flatMap((m) =>
    m.variants.map((v) => ({ m, v, text: `${m.name} ${v.name} ${m.tagline}`.toLowerCase() })),
  ).filter((r) => !q || q.toLowerCase().split(/\s+/).every((w) => r.text.includes(w)));

  return (
    <header className="topbar">
      <a className="brand" href={href({ name: 'start' })}>
        <Mark />
        <span>Jak się logujemy?</span>
      </a>
      <nav className="mech-nav has-ind" aria-label="Mechanizmy" ref={navInd}>
        {mechanisms.map((m) => (
          <a
            key={m.id}
            href={href({ name: 'explorer', mech: m.id })}
            className={m.id === current?.id ? 'is-current' : ''}
            aria-current={m.id === current?.id ? 'page' : undefined}
            title={`${m.name} (${m.num % 10})`}
          >
            <span className="mn">{m.num}</span>
            {m.short}
          </a>
        ))}
      </nav>
      <div className="top-actions">
        <a href={href({ name: 'porownanie' })}>Porównanie</a>
        <a href={href({ name: 'autoplay' })}>Pokaz</a>
        <button onClick={() => setOpen(true)} aria-label="Szukaj (Ctrl+K)"><kbd>Ctrl K</kbd></button>
        {onHelp && <button onClick={onHelp} aria-label="Skróty klawiszowe">?</button>}
        <button onClick={onToggleTheme} aria-label="Motyw jasny / ciemny (T)">
          <svg viewBox="0 0 20 20" className="icon"><circle cx="10" cy="10" r="6" /><path d="M10 4a6 6 0 0 1 0 12z" className="fill" /></svg>
        </button>
      </div>
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="palette" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Szukaj">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mechanizm albo atak, np. „phishing”"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) {
                  navigate({ name: 'explorer', mech: results[0].m.id, variant: results[0].v.id });
                  setOpen(false);
                }
              }}
            />
            <ul>
              {results.slice(0, 9).map((r) => (
                <li key={`${r.m.id}/${r.v.id}`}>
                  <a href={href({ name: 'explorer', mech: r.m.id, variant: r.v.id })} onClick={() => setOpen(false)}>
                    <span className="pal-m">{r.m.name}</span>
                    <span className={`pal-v ${r.v.kind === 'atak' ? 'is-attack' : ''}`}>{r.v.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
