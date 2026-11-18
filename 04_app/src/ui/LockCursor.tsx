import { useEffect, useRef, useState } from 'react';

/** Elementy klikalne — nad nimi wskaźnik zielenieje. */
const HOT = 'a[href], button:not(:disabled), [role="button"], [role="tab"], [role="slider"], summary, label, select, .cell, [data-cursor="hot"]';
const TEXT = 'input, textarea, [contenteditable="true"]';

/**
 * Kursor-wskaźnik: smukła strzałka w kolorze tuszu; nad czymś klikalnym zielenieje i lekko
 * się pochyla (wskazuje), przy kliknięciu przysiada.
 * Pozycja ustawiana bezpośrednio w pointermove (bez wygładzania i bez renderów Reacta) —
 * żadnego opóźnienia względem ruchu myszy. Tylko dla myszy/rysika z najechaniem; na polach
 * tekstowych wraca zwykły kursor tekstowy, w trybie kiosku znika razem z systemowym.
 */
export function LockCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const root = document.documentElement;
    root.classList.add('has-lock-cursor');
    let shown = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!shown) {
        shown = true;
        el.classList.add('is-shown');
      }
    };
    const over = (e: PointerEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      const text = !!t?.closest(TEXT);
      el.classList.toggle('is-text', text);
      el.classList.toggle('is-hot', !text && !!t?.closest(HOT));
    };
    const hide = () => {
      shown = false;
      el.classList.remove('is-shown', 'is-down');
    };
    const down = () => el.classList.add('is-down');
    const up = () => el.classList.remove('is-down');
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    root.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    return () => {
      root.classList.remove('has-lock-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      root.removeEventListener('mouseleave', hide);
      window.removeEventListener('blur', hide);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ref} className="lock-cursor" aria-hidden>
      {/* Smukła strzałka; czubek w (1,5; 1,5) = punkt kliknięcia (svg przesunięte o −1,5 px). */}
      <svg viewBox="0 0 20 22" width={20} height={22}>
        <path d="M1.5 1.5 L1.5 17.2 L5.7 13.1 L12.9 12.7 Z" className="lc-arrow" />
      </svg>
    </div>
  );
}
