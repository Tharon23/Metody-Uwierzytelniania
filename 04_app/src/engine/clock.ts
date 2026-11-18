import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { easeMove } from './easing';

/**
 * Zegar Explorera jako zewnętrzny magazyn stanu. Komponenty subskrybują tylko to, czego potrzebują:
 * scena — czas co klatkę, panele — indeks kroku (zmienia się rzadko). Dzięki temu klatka animacji
 * przelicza samą scenę, a nie cały widok.
 */
export class Clock {
  t = 0;
  playing = false;
  total = 1;
  speed = 1;
  private stopAt: number | null = null;
  private tween: { from: number; to: number; start: number; dur: number; after?: number } | null = null;
  private raf = 0;
  private last = 0;
  private listeners = new Set<() => void>();

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.tween) {
      const k = Math.min(1, (now - this.tween.start) / this.tween.dur);
      this.t = this.tween.from + (this.tween.to - this.tween.from) * easeMove(k);
      if (k >= 1) {
        const after = this.tween.after;
        this.tween = null;
        if (after === undefined || after <= this.t + 1e-3) {
          this.playing = false;
          this.emit();
          return;
        }
        // Po przewinięciu: dalej normalne odtwarzanie do zadanej chwili.
        this.stopAt = after;
      }
    } else if (this.playing) {
      let n = this.t + dt * this.speed;
      const limit = this.stopAt ?? this.total;
      if (n >= limit) {
        n = limit;
        this.stopAt = null;
        this.t = n;
        this.playing = false;
        this.emit();
        return;
      }
      this.t = n;
    }
    this.emit();
    this.raf = requestAnimationFrame(this.loop);
  };

  private run() {
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.tween = null;
    this.playing = false;
  }

  reset(total: number) {
    this.stop();
    this.total = total;
    this.t = 0;
    this.stopAt = null;
    this.emit();
  }

  seek(v: number) {
    this.stop();
    this.stopAt = null;
    this.t = Math.max(0, Math.min(this.total, v));
    this.emit();
  }

  play() {
    this.tween = null;
    if (this.t >= this.total - 1e-3) this.t = 0;
    this.stopAt = null;
    this.playing = true;
    this.run();
    this.emit();
  }

  pause() {
    this.stop();
    this.stopAt = null;
    this.emit();
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  /** Odtwarzaj normalnie do celu i zatrzymaj się (krok naprzód). */
  playTo(target: number) {
    this.tween = null;
    if (target <= this.t + 1e-3) {
      this.seek(target);
      return;
    }
    this.stopAt = target;
    this.playing = true;
    this.run();
    this.emit();
  }

  /**
   * Płynne przewinięcie czasu do celu (krok wstecz, skok na dalszy krok): scena przechodzi przez
   * stany pośrednie zamiast ciąć. Z `after` — po dojechaniu gra dalej normalnie do tej chwili.
   */
  glideTo(target: number, durMs = 520, after?: number) {
    this.stopAt = null;
    this.playing = true;
    this.tween = { from: this.t, to: Math.max(0, Math.min(this.total, target)), start: performance.now(), dur: durMs, after };
    this.run();
    this.emit();
  }
}

export function useClock(total: number, speed: number, resetKey: unknown, initialT?: number): Clock {
  const clock = useMemo(() => new Clock(), []);
  // Zmiana wariantu: reset przed pierwszym renderem nowej osi (bez klatki ze starym czasem).
  const [key, setKey] = useState<unknown>(undefined);
  if (key !== resetKey) {
    setKey(resetKey);
    clock.stop();
    clock.total = total;
    clock.t = initialT !== undefined ? Math.min(initialT, total) : 0;
  }
  clock.total = total;
  clock.speed = speed;
  useEffect(() => () => clock.stop(), [clock]);
  return clock;
}

/** Subskrypcja wartości pochodnej zegara; komponent renderuje się tylko, gdy wartość się zmieni. */
export function useClockValue<T>(clock: Clock, select: (c: Clock) => T): T {
  return useSyncExternalStore(clock.subscribe, () => select(clock));
}
