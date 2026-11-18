import { useLayoutEffect, useRef } from 'react';

const SELECTED = '[aria-selected="true"], [aria-checked="true"], .is-current';

/**
 * Przesuwany wskaźnik wybranej opcji: mierzy zaznaczony element i ustawia zmienne CSS
 * (--ix, --iy, --iw, --ih) na kontenerze z klasą `has-ind`. Animację robi CSS.
 */
export function useSlider<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const sel = el.querySelector<HTMLElement>(SELECTED);
      if (!sel) {
        el.classList.remove('ind-ready');
        return;
      }
      el.style.setProperty('--ix', `${sel.offsetLeft}px`);
      el.style.setProperty('--iy', `${sel.offsetTop}px`);
      el.style.setProperty('--iw', `${sel.offsetWidth}px`);
      el.style.setProperty('--ih', `${sel.offsetHeight}px`);
      // Pierwszy pomiar bez animacji, kolejne płynnie.
      requestAnimationFrame(() => el.classList.add('ind-ready'));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dep]);
  return ref;
}
