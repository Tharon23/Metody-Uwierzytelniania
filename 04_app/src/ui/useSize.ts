import { useEffect, useRef, useState } from 'react';

export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 1280, height: 720 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      setSize({ width: Math.max(1, Math.round(r.width)), height: Math.max(1, Math.round(r.height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/** Skala interfejsu względem projektu (rem / 16 px) — rośnie i maleje z autoskalowaniem w CSS. */
export function useUiScale(): number {
  const read = () => parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
  const [s, setS] = useState(read);
  useEffect(() => {
    const on = () => setS(read());
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return s;
}

/** Preferencja ruchu z ustawienia aplikacji (nie z systemu) — patrz motionPref.ts. */
export { useReducedMotion } from './motionPref';
