import { useEffect, useRef, useState } from 'react';
import { easeOutCubic } from '../engine/easing';
import { isReducedMotion as reducedMotion } from './motionPref';

/** Liczba, która przy zmianie dojeżdża do nowej wartości (licznik jak w przyrządzie pomiarowym). */
export function useTweened(value: number, ms = 480): number {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reducedMotion()) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const v = a + (value - a) * easeOutCubic(k);
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

const GLYPHS = 'ABCDEFGHIJKLMNOPRSTUWYZ0123456789#/+=';

/**
 * Nazwa „odszyfrowuje się” przy zmianie: znaki przewijają się przez losowe symbole
 * i ustalają od lewej (≈ 18 ms na znak). Tylko dla nagłówków; tekst docelowy w aria-label.
 */
export function useScramble(text: string): string {
  const [shown, setShown] = useState(text);
  const first = useRef(true);
  useEffect(() => {
    if (first.current || reducedMotion()) {
      first.current = false;
      setShown(text);
      return;
    }
    const start = performance.now();
    const dur = 260 + text.length * 18;
    let raf = 0;
    let seed = text.length * 7919;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const fixed = Math.floor(k * text.length);
      let out = text.slice(0, fixed);
      for (let i = fixed; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[Math.floor(rnd() * GLYPHS.length)];
      setShown(out);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return shown;
}
