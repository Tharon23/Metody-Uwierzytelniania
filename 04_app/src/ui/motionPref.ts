import { useSyncExternalStore } from 'react';

/**
 * Jedno źródło preferencji ruchu dla całej aplikacji.
 *
 * Domyślnie ruch jest pełny, niezależnie od `prefers-reduced-motion` w systemie: animacja jest
 * tu treścią (pokazuje, kto komu co wysyła), a Windows z wyłączonymi „Efektami animacji” zgłasza
 * przeglądarce „reduce” — wtedy kamera przeskakiwała między krokami, a strzałki pojawiały się
 * od razu. Kto chce mniej ruchu, włącza go w aplikacji (klawisz R albo okno skrótów); wybór
 * zapamiętujemy. W trybie ograniczonym kamera stoi na planie ogólnym (żadnych skoków ani
 * przejazdów), a interfejs nie animuje przejść.
 */
const KEY = 'jsl-ruch';
const listeners = new Set<() => void>();

function readStored(): boolean {
  try {
    return localStorage.getItem(KEY) === 'ograniczony';
  } catch {
    return false;
  }
}

let reduced = typeof window !== 'undefined' ? readStored() : false;

function applyRoot() {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('reduce-motion', reduced);
}
applyRoot();

/** Czy system prosi o mniej ruchu (tylko informacyjnie — nie zmienia ustawienia). */
export function systemPrefersReduced(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function isReducedMotion(): boolean {
  return reduced;
}

export function setReducedMotion(v: boolean) {
  if (v === reduced) return;
  reduced = v;
  try {
    localStorage.setItem(KEY, v ? 'ograniczony' : 'pelny');
  } catch {
    /* tryb prywatny — ustawienie tylko na tę sesję */
  }
  applyRoot();
  listeners.forEach((fn) => fn());
}

export function toggleReducedMotion() {
  setReducedMotion(!reduced);
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, isReducedMotion, () => false);
}
