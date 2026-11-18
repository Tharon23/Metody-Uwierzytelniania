import { useEffect, useRef, useState } from 'react';

/** Elementy, nad którymi kłódka się otwiera (da się kliknąć). */
const HOT = 'a[href], button:not(:disabled), [role="button"], [role="tab"], [role="slider"], summary, label, select, .cell, [data-cursor="hot"]';
const TEXT = 'input, textarea, [contenteditable="true"]';

/**
 * Kursor-kłódka: czerwona, zamknięta; nad czymś klikalnym zielenieje i otwiera się.
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
      <svg viewBox="-16 -16 32 32">
        <circle r={13} className="lc-ring" />
        <g transform="translate(0 1.5)">
          <path d="M-3.6 -1.2 V-4.6 a3.6 3.6 0 0 1 7.2 0 V-1.2" className="lc-shackle" />
          <rect x={-5.6} y={-1.4} width={11.2} height={8.6} rx={1.8} className="lc-body" />
          <path d="M0 1.6 V3.8" className="lc-key" />
        </g>
      </svg>
    </div>
  );
}
