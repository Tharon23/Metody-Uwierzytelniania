import { useEffect, useMemo, useRef, useState } from 'react';
import { buildShow, segmentAt } from '../engine/show';
import { href, navigate } from '../router';
import { ShowFrame } from '../show/ShowFrame';
import { useReducedMotion, useSize } from '../ui/useSize';

/** Pokaz na osobny ekran: pętla wszystkich mechanizmów. ?kiosk — blokada wygaszania i ukryty kursor. */
export function Autoplay({ kiosk, startAt, frozen, onToggleTheme }: { kiosk: boolean; startAt?: number; frozen?: boolean; onToggleTheme: () => void }) {
  const show = useMemo(() => buildShow(), []);
  const [ref, size] = useSize<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [t, setT] = useState(startAt ?? 0);
  const tRef = useRef(startAt ?? 0);
  const [paused, setPaused] = useState(!!frozen);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tRef.current = (tRef.current + dt) % show.total;
      setT(tRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused, show.total]);

  // Pasek podpowiedzi znika po chwili bezczynności
  useEffect(() => {
    let timer = window.setTimeout(() => setHint(false), 3500);
    const wake = () => {
      setHint(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setHint(false), 3500);
    };
    window.addEventListener('pointermove', wake);
    window.addEventListener('keydown', wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);

  // Klawiatura: Esc wyjście, spacja pauza, strzałki skok między mechanizmami
  useEffect(() => {
    const jump = (dir: number) => {
      const starts = [0, ...show.mechStarts.map((m) => m.start)];
      const now = tRef.current;
      const i = starts.findIndex((s, k) => now >= s && (k === starts.length - 1 || now < starts[k + 1]));
      const next = starts[(i + dir + starts.length) % starts.length];
      tRef.current = next;
      setT(next);
    };
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate({ name: 'start' });
      else if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p); }
      else if (e.key === 'ArrowRight') jump(1);
      else if (e.key === 'ArrowLeft') jump(-1);
      else if (e.key === 't' || e.key === 'T') onToggleTheme();
      else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [show, onToggleTheme]);

  // Kiosk: nie wygaszaj ekranu (Screen Wake Lock), odnawiaj po powrocie karty
  useEffect(() => {
    if (!kiosk || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch {
        /* brak zgody przeglądarki — pokaz działa dalej */
      }
    };
    const onVis = () => document.visibilityState === 'visible' && acquire();
    acquire();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      lock?.release().catch(() => {});
    };
  }, [kiosk]);

  const { seg } = segmentAt(show, t);
  const mechLink = 'mech' in seg ? href({ name: 'explorer', mech: seg.mech.id }) : href({ name: 'start' });

  return (
    <div className={`autoplay ${kiosk && !hint ? 'hide-cursor' : ''}`} ref={ref}>
      <ShowFrame show={show} t={t} width={size.width} height={size.height} reduced={reduced} />
      {!kiosk && !frozen && (
        <div className="autoplay-hint" style={{ opacity: hint ? 1 : 0 }}>
          <span><kbd>Spacja</kbd> pauza</span>
          <span><kbd>← →</kbd> mechanizm</span>
          <span><kbd>F</kbd> pełny ekran</span>
          <a href={mechLink}>Otwórz ten arkusz</a>
          <a href={href({ name: 'start' })}>Wyjście <kbd>Esc</kbd></a>
        </div>
      )}
    </div>
  );
}
